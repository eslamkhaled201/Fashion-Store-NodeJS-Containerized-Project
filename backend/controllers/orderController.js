const { pool } = require('../config/db');

const generateOrderNumber = () => 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

exports.createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { shipping_address, coupon_code, notes } = req.body;

    // Get cart items
    const [items] = await conn.query(
      `SELECT ci.*, p.name, p.price, p.stock, pv.size, pv.color, pv.price_modifier
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    if (!items.length) return res.status(400).json({ message: 'Cart is empty' });

    // Check stock
    for (const item of items) {
      if (item.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ message: `${item.name} is out of stock` });
      }
    }

    let subtotal = items.reduce((s, i) => s + (parseFloat(i.price) + parseFloat(i.price_modifier || 0)) * i.quantity, 0);
    const shipping_cost = subtotal >= 150 ? 0 : 9.99;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping_cost + tax;

    const orderNumber = generateOrderNumber();
    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, tax, total, shipping_address, notes)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?)`,
      [orderNumber, req.user.id, subtotal.toFixed(2), shipping_cost.toFixed(2), tax.toFixed(2), total.toFixed(2), JSON.stringify(shipping_address), notes]
    );
    const orderId = orderResult.insertId;

    // Insert order items & update stock
    for (const item of items) {
      const unitPrice = parseFloat(item.price) + parseFloat(item.price_modifier || 0);
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_info, price, quantity) VALUES (?,?,?,?,?,?,?)',
        [orderId, item.product_id, item.variant_id, item.name, `${item.size || ''} ${item.color || ''}`.trim(), unitPrice.toFixed(2), item.quantity]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    await conn.commit();

    res.status(201).json({ orderId, orderNumber, total: total.toFixed(2), message: 'Order created' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    conn.release();
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, COUNT(oi.id) as item_count FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ? GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!orders.length) return res.status(404).json({ message: 'Order not found' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...orders[0], items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
