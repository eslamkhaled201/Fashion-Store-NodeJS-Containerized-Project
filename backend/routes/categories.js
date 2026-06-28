const router = require('express').Router();
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const [cats] = await pool.query('SELECT * FROM categories ORDER BY name');
  res.json(cats);
});
router.post('/', protect, adminOnly, async (req, res) => {
  const { name, description, image, parent_id } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const [r] = await pool.query('INSERT INTO categories (name, slug, description, image, parent_id) VALUES (?,?,?,?,?)', [name, slug, description, image, parent_id || null]);
  res.status(201).json({ id: r.insertId, slug });
});
router.put('/:id', protect, adminOnly, async (req, res) => {
  const { name, description, image } = req.body;
  await pool.query('UPDATE categories SET name=?, description=?, image=? WHERE id=?', [name, description, image, req.params.id]);
  res.json({ message: 'Updated' });
});

module.exports = router;
