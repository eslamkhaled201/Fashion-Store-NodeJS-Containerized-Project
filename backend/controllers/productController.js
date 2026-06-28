const { pool } = require('../config/db');

const buildProductQuery = (filters) => {
  let where = ['p.is_active = TRUE'];
  let params = [];

  if (filters.category) {
    where.push('c.slug = ?');
    params.push(filters.category);
  }
  if (filters.search) {
    where.push('MATCH(p.name, p.description, p.brand) AGAINST(? IN BOOLEAN MODE)');
    params.push(`${filters.search}*`);
  }
  if (filters.minPrice) { where.push('p.price >= ?'); params.push(filters.minPrice); }
  if (filters.maxPrice) { where.push('p.price <= ?'); params.push(filters.maxPrice); }
  if (filters.brand) { where.push('p.brand = ?'); params.push(filters.brand); }
  if (filters.featured) { where.push('p.is_featured = TRUE'); }

  return { where: where.join(' AND '), params };
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, brand, featured, sort = 'created_at', order = 'DESC', page = 1, limit = 12 } = req.query;
    const { where, params } = buildProductQuery({ category, search, minPrice, maxPrice, brand, featured });

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const sortMap = { price_asc: 'p.price ASC', price_desc: 'p.price DESC', newest: 'p.created_at DESC', name: 'p.name ASC' };
    const sortClause = sortMap[sort] || 'p.created_at DESC';

    const [products] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
       (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image,
       (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
       (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE ${where} ORDER BY ${sortClause} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE ${where}`,
      params
    );

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found' });

    const product = rows[0];
    const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, sort_order', [product.id]);
    const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 10`,
      [product.id]
    );

    res.json({ ...product, images, variants, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeatured = async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.*, (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p WHERE p.is_featured = TRUE AND p.is_active = TRUE LIMIT 8`
    );
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin CRUD
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, compare_price, sku, stock, category_id, brand, is_featured, images, variants } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    const [result] = await pool.query(
      'INSERT INTO products (name, slug, description, price, compare_price, sku, stock, category_id, brand, is_featured) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [name, slug, description, parseFloat(price), compare_price && compare_price !== '' ? parseFloat(compare_price) : null, sku || null, stock, category_id || null, brand || null, is_featured || false]
    );
    const productId = result.insertId;

    if (images?.length) {
      await pool.query(
        'INSERT INTO product_images (product_id, url, alt, is_primary, sort_order) VALUES ?',
        [images.map((img, i) => [productId, img.url, img.alt || name, i === 0, i])]
      );
    }
    if (variants?.length) {
      await pool.query(
        'INSERT INTO product_variants (product_id, size, color, color_hex, stock) VALUES ?',
        [variants.map(v => [productId, v.size, v.color, v.color_hex, v.stock || 0])]
      );
    }
    res.status(201).json({ id: productId, slug, message: 'Product created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, compare_price, sku, stock, category_id, brand, is_featured, is_active } = req.body;
    await pool.query(
      'UPDATE products SET name=?, description=?, price=?, compare_price=?, sku=?, stock=?, category_id=?, brand=?, is_featured=?, is_active=? WHERE id=?',
      [name, description, parseFloat(price), compare_price && compare_price !== '' ? parseFloat(compare_price) : null, sku || null, stock, category_id || null, brand || null, is_featured, is_active, req.params.id]
    );
    res.json({ message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
