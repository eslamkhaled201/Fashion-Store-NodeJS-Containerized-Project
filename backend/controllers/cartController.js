const { pool } = require('../config/db');

exports.getCart = async (req, res) => {
  try {
    const [items] = await pool.query(
      `SELECT ci.id, ci.quantity, ci.variant_id,
       p.id as product_id, p.name, p.slug, p.price,
       pv.size, pv.color, pv.color_hex, pv.price_modifier,
       pi.url as image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    const total = items.reduce((sum, i) => sum + (parseFloat(i.price) + parseFloat(i.price_modifier || 0)) * i.quantity, 0);
    res.json({ items, total: total.toFixed(2), count: items.reduce((s, i) => s + i.quantity, 0) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [req.user.id, product_id, variant_id || null, quantity, quantity]
    );
    res.json({ message: 'Added to cart' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity < 1) {
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      return res.json({ message: 'Item removed' });
    }
    await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?', [quantity, req.params.id, req.user.id]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
