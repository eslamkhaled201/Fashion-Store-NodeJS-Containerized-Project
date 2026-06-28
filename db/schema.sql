-- ============================================================
-- Fashion Store Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS fashion_store;
USE fashion_store;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') DEFAULT 'customer',
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  image VARCHAR(255),
  parent_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  sku VARCHAR(100) UNIQUE,
  stock INT DEFAULT 0,
  category_id INT,
  brand VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FULLTEXT INDEX ft_search (name, description, brand)
);

-- Product Images
CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  alt VARCHAR(200),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Variants (size, color)
CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  size VARCHAR(20),
  color VARCHAR(50),
  color_hex VARCHAR(7),
  stock INT DEFAULT 0,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) DEFAULT 'Home',
  full_name VARCHAR(100),
  phone VARCHAR(30),
  line1 VARCHAR(255),
  line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  zip VARCHAR(20),
  country VARCHAR(80) DEFAULT 'US',
  is_default BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cart
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id, variant_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address JSON,
  payment_method VARCHAR(50),
  payment_intent_id VARCHAR(200),
  payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  product_name VARCHAR(200),
  variant_info VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('percentage','fixed') NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  min_order DECIMAL(10,2) DEFAULT 0,
  max_uses INT,
  uses INT DEFAULT 0,
  expires_at DATE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(150),
  body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY one_review_per_user (product_id, user_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA
-- ============================================================
-- =========================
-- USERS
-- =========================
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User', 'admin@fashionstore.com', '$2a$12$dUP9QhMHeZdyHSGY99U2WeVUBccgfockrE4dZvl3JDhDiNK0Hmife', 'admin'),
('Jane Doe', 'jane@example.com', '$2a$12$REPLACE_WITH_HASHED_USER_PASS', 'customer');

-- =========================
-- CATEGORIES
-- =========================
INSERT IGNORE INTO categories (name, slug, description) VALUES
('Women', 'women', 'Womens clothing collection'),
('Men', 'men', 'Mens clothing collection'),
('Accessories', 'accessories', 'Bags, belts, and more'),
('New Arrivals', 'new-arrivals', 'Latest styles');

-- =========================
-- PRODUCTS (linked to Women category)
-- =========================
-- Get Women category ID
SELECT id INTO @womenId FROM categories WHERE slug='women';

-- Insert products
INSERT IGNORE INTO products
(name, slug, description, price, compare_price, sku, stock, category_id, brand, is_featured) VALUES
('Silk Wrap Dress', 'silk-wrap-dress', 'Elegant silk wrap dress', 189.00, 250.00, 'SKU-001', 45, @womenId, 'Maison Mode', TRUE),
('Linen Blazer', 'linen-blazer', 'Relaxed linen blazer', 145.00, NULL, 'SKU-002', 30, @womenId, 'Maison Mode', TRUE),
('High-Rise Trousers', 'high-rise-trousers', 'Tailored high-rise trousers', 98.00, 130.00, 'SKU-003', 60, @womenId, 'Atelier Soft', FALSE),
('Cashmere Turtleneck', 'cashmere-turtleneck', 'Pure cashmere turtleneck', 220.00, NULL, 'SKU-004', 25, @womenId, 'Atelier Soft', TRUE);

-- =========================
-- PRODUCT IMAGES + VARIANTS
-- =========================
-- For each product, insert image + variants
-- Example for Silk Wrap Dress
SELECT id INTO @p1 FROM products WHERE slug='silk-wrap-dress';
INSERT INTO product_images (product_id, url, alt, is_primary)
VALUES (@p1, CONCAT('https://picsum.photos/seed/', @p1, '/600/800'), 'Silk Wrap Dress', TRUE);

INSERT INTO product_variants (product_id, size, color, color_hex, stock) VALUES
(@p1, 'XS', 'Black', '#000000', 10),
(@p1, 'S', 'Black', '#000000', 10),
(@p1, 'M', 'Black', '#000000', 10),
(@p1, 'L', 'Black', '#000000', 10),
(@p1, 'XL', 'Black', '#000000', 10);

-- Repeat for other products
SELECT id INTO @p2 FROM products WHERE slug='linen-blazer';
INSERT INTO product_images (product_id, url, alt, is_primary)
VALUES (@p2, CONCAT('https://picsum.photos/seed/', @p2, '/600/800'), 'Linen Blazer', TRUE);
INSERT INTO product_variants (product_id, size, color, color_hex, stock) VALUES
(@p2, 'XS', 'Black', '#000000', 10),
(@p2, 'S', 'Black', '#000000', 10),
(@p2, 'M', 'Black', '#000000', 10),
(@p2, 'L', 'Black', '#000000', 10),
(@p2, 'XL', 'Black', '#000000', 10);

SELECT id INTO @p3 FROM products WHERE slug='high-rise-trousers';
INSERT INTO product_images (product_id, url, alt, is_primary)
VALUES (@p3, CONCAT('https://picsum.photos/seed/', @p3, '/600/800'), 'High-Rise Trousers', TRUE);
INSERT INTO product_variants (product_id, size, color, color_hex, stock) VALUES
(@p3, 'XS', 'Black', '#000000', 10),
(@p3, 'S', 'Black', '#000000', 10),
(@p3, 'M', 'Black', '#000000', 10),
(@p3, 'L', 'Black', '#000000', 10),
(@p3, 'XL', 'Black', '#000000', 10);

SELECT id INTO @p4 FROM products WHERE slug='cashmere-turtleneck';
INSERT INTO product_images (product_id, url, alt, is_primary)
VALUES (@p4, CONCAT('https://picsum.photos/seed/', @p4, '/600/800'), 'Cashmere Turtleneck', TRUE);
INSERT INTO product_variants (product_id, size, color, color_hex, stock) VALUES
(@p4, 'XS', 'Black', '#000000', 10),
(@p4, 'S', 'Black', '#000000', 10),
(@p4, 'M', 'Black', '#000000', 10),
(@p4, 'L', 'Black', '#000000', 10),
(@p4, 'XL', 'Black', '#000000', 10);
