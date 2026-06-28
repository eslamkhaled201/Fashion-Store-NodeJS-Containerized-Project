const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

exports.getDashboard = async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(total),0) as totalRevenue FROM orders WHERE payment_status='paid'");
    const [[{ totalOrders }]] = await pool.query("SELECT COUNT(*) as totalOrders FROM orders");
    const [[{ totalProducts }]] = await pool.query("SELECT COUNT(*) as totalProducts FROM products WHERE is_active=TRUE");
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users WHERE role='customer'");
    const [recentOrders] = await pool.query(
      "SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id=u.id ORDER BY o.created_at DESC LIMIT 5"
    );
    const [topProducts] = await pool.query(
      `SELECT p.name, SUM(oi.quantity) as sold, SUM(oi.price*oi.quantity) as revenue
       FROM order_items oi JOIN products p ON oi.product_id=p.id
       JOIN orders o ON oi.order_id=o.id WHERE o.payment_status='paid'
       GROUP BY p.id ORDER BY sold DESC LIMIT 5`
    );
    res.json({ totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders, topProducts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND o.status = ?'; params.push(status); }
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const [orders] = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email FROM orders o
       JOIN users u ON o.user_id=u.id ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${where}`, params);
    res.json({ orders, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role, created_at, (SELECT COUNT(*) FROM orders WHERE user_id=u.id) as order_count FROM users u ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { id: result.insertId, name, email, role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
