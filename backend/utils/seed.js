require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  console.log('Seeding database...');
  const adminPass = await bcrypt.hash('admin123', 12);
  const userPass = await bcrypt.hash('user1234', 12);

  await pool.query("INSERT IGNORE INTO users (name, email, password, role) VALUES (?,?,?,?)",
    ['Admin User', 'admin@fashionstore.com', adminPass, 'admin']);
  await pool.query("INSERT IGNORE INTO users (name, email, password, role) VALUES (?,?,?,?)",
    ['Jane Doe', 'jane@example.com', userPass, 'customer']);

  const cats = [
    ['Women', 'women', 'Womens clothing collection'],
    ['Men', 'men', 'Mens clothing collection'],
    ['Accessories', 'accessories', 'Bags, belts, and more'],
    ['New Arrivals', 'new-arrivals', 'Latest styles'],
  ];
  for (const [name, slug, desc] of cats) {
    await pool.query("INSERT IGNORE INTO categories (name, slug, description) VALUES (?,?,?)", [name, slug, desc]);
  }

  const [[{ id: womenId }]] = await pool.query("SELECT id FROM categories WHERE slug='women'");
  const products = [
    ['Silk Wrap Dress', 'silk-wrap-dress', 'Elegant silk wrap dress', 189.00, 250.00, 'SKU-001', 45, womenId, 'Maison Mode', true],
    ['Linen Blazer', 'linen-blazer', 'Relaxed linen blazer', 145.00, null, 'SKU-002', 30, womenId, 'Maison Mode', true],
    ['High-Rise Trousers', 'high-rise-trousers', 'Tailored high-rise trousers', 98.00, 130.00, 'SKU-003', 60, womenId, 'Atelier Soft', false],
    ['Cashmere Turtleneck', 'cashmere-turtleneck', 'Pure cashmere turtleneck', 220.00, null, 'SKU-004', 25, womenId, 'Atelier Soft', true],
  ];
  for (const p of products) {
    const [r] = await pool.query(
      "INSERT IGNORE INTO products (name, slug, description, price, compare_price, sku, stock, category_id, brand, is_featured) VALUES (?,?,?,?,?,?,?,?,?,?)",
      p
    );
    if (r.insertId) {
      await pool.query("INSERT INTO product_images (product_id, url, alt, is_primary) VALUES (?,?,?,?)",
        [r.insertId, `https://picsum.photos/seed/${r.insertId}/600/800`, p[0], true]);
      const sizes = ['XS','S','M','L','XL'];
      for (const size of sizes) {
        await pool.query("INSERT INTO product_variants (product_id, size, color, color_hex, stock) VALUES (?,?,?,?,?)",
          [r.insertId, size, 'Black', '#000000', 10]);
      }
    }
  }
  console.log('Seed complete!');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
