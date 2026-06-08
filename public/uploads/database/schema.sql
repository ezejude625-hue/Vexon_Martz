-- ============================================================
-- VEXONMART DATABASE SCHEMA
-- MySQL 8.0+
-- ============================================================
-- Run this file to create all tables:
--   mysql -u root -p vexonmart < database/schema.sql
-- ============================================================

-- Create the database (skip if already exists)
CREATE DATABASE IF NOT EXISTS vexonmart
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE vexonmart;

-- ─────────────────────────────────────────────────────────────
-- TABLE: roles
-- Stores user roles (admin, customer, vendor, etc.)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50)  NOT NULL UNIQUE,  -- e.g. 'admin', 'customer'
  description TEXT,
  permissions JSON,                           -- JSON array of permission strings
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: users
-- Stores all users: customers, admins, vendors
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id         INT UNSIGNED    NOT NULL DEFAULT 2,       -- Default: customer
  first_name      VARCHAR(100)    NOT NULL,
  last_name       VARCHAR(100)    NOT NULL,
  email           VARCHAR(255)    NOT NULL UNIQUE,
  phone           VARCHAR(20),
  password_hash   VARCHAR(255)    NOT NULL,
  avatar_url      VARCHAR(500),
  email_verified  BOOLEAN         DEFAULT FALSE,
  is_active       BOOLEAN         DEFAULT TRUE,
  reset_token     VARCHAR(255),                              -- For password reset
  reset_expires   TIMESTAMP,
  last_login      TIMESTAMP NULL,
  created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_email (email),
  INDEX idx_role (role_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: addresses
-- User delivery/billing addresses (multiple per user)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  label       VARCHAR(50)  DEFAULT 'Home',    -- e.g. 'Home', 'Work'
  full_name   VARCHAR(200) NOT NULL,
  phone       VARCHAR(20),
  street      TEXT         NOT NULL,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100),
  country     VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  is_default  BOOLEAN      DEFAULT FALSE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: categories
-- Product categories (supports parent/subcategory nesting)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  parent_id   INT UNSIGNED,                        -- NULL = top-level category
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(100),                         -- Material Symbol icon name
  image_url   VARCHAR(500),
  sort_order  INT          DEFAULT 0,
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_parent (parent_id),
  INDEX idx_slug (slug)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: products
-- All marketplace products listed by vendors/admins
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id       INT UNSIGNED    NOT NULL,               -- The user who listed it
  category_id     INT UNSIGNED,
  name            VARCHAR(300)    NOT NULL,
  slug            VARCHAR(300)    NOT NULL UNIQUE,
  description     TEXT,
  short_desc      VARCHAR(500),
  price           DECIMAL(10,2)   NOT NULL,               -- Base price
  sale_price      DECIMAL(10,2),                          -- If on sale
  thumbnail_url   VARCHAR(500),
  images          JSON,                                   -- Array of image URLs
  tags            TEXT,                                   -- Array of tag strings
  product_type    ENUM('physical','digital') DEFAULT 'digital',
  stock           INT             DEFAULT 1,              -- -1 = unlimited
  sku             VARCHAR(100),
  status          ENUM('draft','active','paused','archived') DEFAULT 'draft',
  is_featured     BOOLEAN         DEFAULT FALSE,
  total_sales     INT UNSIGNED    DEFAULT 0,
  avg_rating      DECIMAL(3,2)    DEFAULT 0.00,
  review_count    INT UNSIGNED    DEFAULT 0,
  meta_title      VARCHAR(300),                           -- SEO
  meta_desc       VARCHAR(500),                           -- SEO
  created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_seller (seller_id),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  FULLTEXT INDEX idx_search (name, description, tags)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: product_files
-- Downloadable files attached to digital products
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_files (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  filename    VARCHAR(300) NOT NULL,
  file_url    VARCHAR(500) NOT NULL,
  file_size   BIGINT,                     -- in bytes
  mime_type   VARCHAR(100),
  version     VARCHAR(50)  DEFAULT '1.0',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: coupons
-- Discount coupons / promo codes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(50)   NOT NULL UNIQUE,
  description     TEXT,
  discount_type   ENUM('percentage','fixed') NOT NULL,
  discount_value  DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount    DECIMAL(10,2),          -- Cap on percentage discounts
  usage_limit     INT,                    -- NULL = unlimited
  used_count      INT           DEFAULT 0,
  starts_at       TIMESTAMP,
  expires_at      TIMESTAMP NULL,
  is_active       BOOLEAN       DEFAULT TRUE,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: orders
-- Customer orders — the core transaction record
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(30)   NOT NULL UNIQUE,          -- e.g. VXM-20240101-0001
  user_id         INT UNSIGNED  NOT NULL,
  coupon_id       INT UNSIGNED,
  address_id      INT UNSIGNED,                           -- Shipping address
  subtotal        DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  tax_amount      DECIMAL(10,2) DEFAULT 0.00,
  shipping_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount    DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(3)    DEFAULT 'USD',
  status          ENUM('pending','processing','shipped','delivered','cancelled','refunded')
                                DEFAULT 'pending',
  payment_status  ENUM('unpaid','paid','refunded','partially_refunded')
                                DEFAULT 'unpaid',
  payment_method  VARCHAR(50),                            -- e.g. 'stripe', 'paypal'
  payment_ref     VARCHAR(255),                           -- Transaction ID
  notes           TEXT,
  shipped_at      TIMESTAMP,
  delivered_at    TIMESTAMP NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)    REFERENCES users(id)   ON DELETE RESTRICT,
  FOREIGN KEY (coupon_id)  REFERENCES coupons(id) ON DELETE SET NULL,
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_payment (payment_status),
  INDEX idx_order_number (order_number)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: order_items
-- Individual line items within an order
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        INT UNSIGNED  NOT NULL,
  product_id      INT UNSIGNED  NOT NULL,
  product_name    VARCHAR(300)  NOT NULL,       -- Snapshot at time of purchase
  product_image   VARCHAR(500),
  quantity        INT UNSIGNED  NOT NULL DEFAULT 1,
  unit_price      DECIMAL(10,2) NOT NULL,       -- Price at time of purchase
  total_price     DECIMAL(10,2) NOT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: downloads
-- Tracks which users can download which digital products
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS downloads (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  product_id      INT UNSIGNED NOT NULL,
  order_item_id   INT UNSIGNED,
  download_count  INT UNSIGNED DEFAULT 0,
  last_downloaded TIMESTAMP,
  expires_at      TIMESTAMP NULL,                -- NULL = never expires
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id)       REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (product_id)    REFERENCES products(id)     ON DELETE CASCADE,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)  ON DELETE SET NULL,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: cart
-- Persistent shopping cart (one per user)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,    -- One cart per user
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: cart_items
-- Individual items in a user's cart
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT UNSIGNED NOT NULL DEFAULT 1,
  added_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_cart_product (cart_id, product_id),
  FOREIGN KEY (cart_id)    REFERENCES cart(id)     ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: wishlist
-- Products saved/favourited by users
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  added_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: reviews
-- Product ratings and reviews from verified buyers
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  order_id    INT UNSIGNED,
  rating      TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(200),
  body        TEXT,
  is_verified BOOLEAN      DEFAULT FALSE,      -- Verified purchase
  is_approved BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_user_product_review (user_id, product_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE SET NULL,
  INDEX idx_product (product_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: messages
-- User-to-support or user-to-vendor messaging
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sender_id   INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  subject     VARCHAR(255),
  body        TEXT         NOT NULL,
  is_read     BOOLEAN      DEFAULT FALSE,
  parent_id   INT UNSIGNED,                    -- Thread reply
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id)   REFERENCES messages(id) ON DELETE SET NULL,
  INDEX idx_receiver (receiver_id),
  INDEX idx_sender (sender_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: support_tickets
-- Customer support tickets
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  order_id    INT UNSIGNED,
  subject     VARCHAR(300) NOT NULL,
  status      ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
  priority    ENUM('low','medium','high','urgent') DEFAULT 'medium',
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id)  ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: ticket_messages
-- Messages within a support ticket thread
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id  INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  body       TEXT         NOT NULL,
  is_staff   BOOLEAN      DEFAULT FALSE,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket (ticket_id)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- TABLE: expenses
-- Admin expense tracking
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category    VARCHAR(100) NOT NULL,
  description TEXT,
  amount      DECIMAL(10,2) NOT NULL,
  currency    VARCHAR(3)    DEFAULT 'USD',
  date        DATE          NOT NULL,
  receipt_url VARCHAR(500),
  created_by  INT UNSIGNED  NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_date (date),
  INDEX idx_category (category)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────────────────────────
-- SEED: Default roles
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO roles (id, name, description, permissions) VALUES
  (1, 'admin',    'Full system access',            JSON_ARRAY('all')),
  (2, 'customer', 'Standard buyer account',         JSON_ARRAY('shop','order','review')),
  (3, 'vendor',   'Can list and sell products',     JSON_ARRAY('shop','order','review','sell')),
  (4, 'support',  'Customer support staff access',  JSON_ARRAY('tickets','orders_read','customers_read'));

-- ─────────────────────────────────────────────────────────────
-- SEED: Default admin user
-- Password: admin123 (CHANGE THIS IN PRODUCTION)
-- Hash generated via bcrypt rounds=12
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO users (id, role_id, first_name, last_name, email, password_hash, email_verified, is_active) VALUES
  (1, 1, 'Super', 'Admin', 'admin@vexonmart.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeAK4G8uCCp7nxL8.', -- admin123
   TRUE, TRUE);

-- ─────────────────────────────────────────────────────────────
-- SEED: Sample categories
-- ─────────────────────────────────────────────────────────────
INSERT IGNORE INTO categories (id, parent_id, name, slug, icon, sort_order) VALUES
  (1, NULL, 'Electronics',     'electronics',    'devices',       1),
  (2, NULL, 'Fashion',         'fashion',        'checkroom',     2),
  (3, NULL, 'Home & Living',   'home-living',    'chair',         3),
  (4, NULL, 'Sports',          'sports',         'sports',        4),
  (5, NULL, 'Books',           'books',          'menu_book',     5),
  (6, NULL, 'Beauty',          'beauty',         'spa',           6),
  (7, NULL, 'Toys & Kids',     'toys-kids',      'toys',          7),
  (8, NULL, 'Digital Goods',   'digital-goods',  'download',      8);
