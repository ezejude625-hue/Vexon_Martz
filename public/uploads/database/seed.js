// ============================================================
// DATABASE SEED — database/seed.js
// ============================================================
// Populates the DB with realistic sample data for development.
// Run with:  node database/seed.js
//
// Prerequisites:
//   1. MySQL running and vexonmart DB created
//   2. Schema applied: mysql -u root -p < database/schema.sql
//   3. .env.local populated with DB credentials
// ============================================================

require("dotenv").config({ path: ".env.local" });

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// ─── Connection ─────────────────────────────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vexonmart",
});

// ─── Helpers ────────────────────────────────────────────────

// Hash a password with bcrypt (12 rounds)
async function hash(plain) {
  return bcrypt.hash(plain, 12);
}

// Execute a query with bound params
async function run(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

// ─── Seed Functions ──────────────────────────────────────────

async function seedUsers() {
  console.log("  → Seeding users…");

  const users = [
    // password: admin123
    {
      role_id: 1,
      first: "",
      last: "Admin",
      email: "admin@vexonmart.com",
      pwd: await hash("admin123"),
    },
    // password: vendor123
    {
      role_id: 3,
      first: "Tech",
      last: "Zone",
      email: "vendor@techzone.io",
      pwd: await hash("vendor123"),
    },
    {
      role_id: 3,
      first: "Style",
      last: "Hub",
      email: "vendor@stylehub.co",
      pwd: await hash("vendor123"),
    },
    // password: customer123
    {
      role_id: 2,
      first: "Matthew",
      last: "Maguire",
      email: "matthew@example.com",
      pwd: await hash("customer123"),
    },
    {
      role_id: 2,
      first: "Lucas",
      last: "Ferreira",
      email: "lucas@example.com",
      pwd: await hash("customer123"),
    },
    {
      role_id: 2,
      first: "Priya",
      last: "Mehta",
      email: "priya@example.com",
      pwd: await hash("customer123"),
    },
    // password: support123
    {
      role_id: 4,
      first: "Support",
      last: "Agent",
      email: "support@vexonmart.com",
      pwd: await hash("support123"),
    },
  ];

  for (const u of users) {
    await run(
      `INSERT IGNORE INTO users (role_id, first_name, last_name, email, password_hash, email_verified, is_active)
       VALUES (?, ?, ?, ?, ?, 1, 1)`,
      [u.role_id, u.first, u.last, u.email, u.pwd],
    );
  }
  console.log(`     ✓ ${users.length} users seeded`);
}

async function seedProducts() {
  console.log("  → Seeding products…");

  // Get vendor IDs
  const [techZone] = await run(
    "SELECT id FROM users WHERE email = 'vendor@techzone.io' LIMIT 1",
  );
  const [styleHub] = await run(
    "SELECT id FROM users WHERE email = 'vendor@stylehub.co' LIMIT 1",
  );
  const vendorId1 = techZone?.id || 2;
  const vendorId2 = styleHub?.id || 3;

  const products = [
    {
      seller_id: vendorId1,
      category_id: 1,
      name: "Sony WH-1000XM5 Wireless Headphones",
      slug: "sony-wh-1000xm5-wireless-headphones",
      short_desc: "Industry-leading noise cancellation with 30-hour battery.",
      description:
        "Experience unparalleled audio with the Sony WH-1000XM5. Features industry-leading noise cancellation powered by two processors, 30-hour battery life, and multipoint Bluetooth connection to two devices simultaneously.",
      price: 349.99,
      sale_price: 279.99,
      thumbnail_url:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      product_type: "physical",
      stock: 48,
      sku: "SONY-WH1000XM5-BLK",
      status: "active",
      is_featured: 1,
      avg_rating: 4.8,
      review_count: 1204,
      total_sales: 820,
      tags: JSON.stringify([
        "headphones",
        "wireless",
        "sony",
        "noise-cancelling",
        "bluetooth",
      ]),
    },
    {
      seller_id: vendorId1,
      category_id: 1,
      name: "Apple AirPods Pro (2nd Generation)",
      slug: "apple-airpods-pro-2nd-generation",
      short_desc: "Active noise cancellation and adaptive audio.",
      description:
        "AirPods Pro (2nd generation) feature the Apple H2 chip, delivering up to 2x more Active Noise Cancellation than the previous generation. With Adaptive Audio, AirPods Pro dynamically blend Transparency mode and Active Noise Cancellation.",
      price: 249.0,
      sale_price: null,
      thumbnail_url:
        "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=600&q=80",
      product_type: "physical",
      stock: 62,
      sku: "APPLE-AIRPODS-PRO2",
      status: "active",
      is_featured: 1,
      avg_rating: 4.7,
      review_count: 3812,
      total_sales: 1540,
      tags: JSON.stringify([
        "airpods",
        "apple",
        "earbuds",
        "wireless",
        "noise-cancelling",
      ]),
    },
    {
      seller_id: vendorId2,
      category_id: 2,
      name: "Premium Leather High-Top Sneakers",
      slug: "premium-leather-high-top-sneakers",
      short_desc: "Handcrafted Italian leather — timeless style.",
      description:
        "Crafted from full-grain Italian leather, these high-top sneakers blend classic craftsmanship with modern comfort. Padded collar and insole for all-day wear. Available in black, white, and tan.",
      price: 189.99,
      sale_price: 149.99,
      thumbnail_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      product_type: "physical",
      stock: 85,
      sku: "SNKR-LEATHER-HI-BLK",
      status: "active",
      is_featured: 1,
      avg_rating: 4.6,
      review_count: 830,
      total_sales: 410,
      tags: JSON.stringify([
        "sneakers",
        "leather",
        "shoes",
        "fashion",
        "high-top",
      ]),
    },
    {
      seller_id: vendorId2,
      category_id: 2,
      name: "Oversized Merino Wool Hoodie",
      slug: "oversized-merino-wool-hoodie",
      short_desc: "Luxuriously soft 100% merino wool. Unisex.",
      description:
        "100% extra-fine merino wool. Naturally breathable, temperature-regulating, and odour-resistant. Relaxed oversized fit. Ribbed cuffs and hem. Machine washable.",
      price: 129.0,
      sale_price: null,
      thumbnail_url:
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
      product_type: "physical",
      stock: 120,
      sku: "HOOD-MERINO-GRY-M",
      status: "active",
      is_featured: 0,
      avg_rating: 4.9,
      review_count: 244,
      total_sales: 188,
      tags: JSON.stringify(["hoodie", "merino", "wool", "fashion", "unisex"]),
    },
    {
      seller_id: vendorId1,
      category_id: 3,
      name: "Minimalist Arc Desk Lamp",
      slug: "minimalist-arc-desk-lamp",
      short_desc: "Adjustable LED desk lamp — 3 colour temperatures.",
      description:
        "Sleek, adjustable LED desk lamp with 3 colour temperature modes (warm/neutral/cool) and 5 brightness levels. USB-C charging port built into base. Touch-sensitive controls. Perfect for reading, working, or studying.",
      price: 89.99,
      sale_price: null,
      thumbnail_url:
        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
      product_type: "physical",
      stock: 33,
      sku: "LAMP-LED-ARC-WHT",
      status: "active",
      is_featured: 0,
      avg_rating: 4.7,
      review_count: 412,
      total_sales: 260,
      tags: JSON.stringify(["lamp", "desk", "led", "home", "lighting"]),
    },
    {
      seller_id: vendorId1,
      category_id: 4,
      name: "Yoga Mat Pro — Non-Slip 6mm",
      slug: "yoga-mat-pro-non-slip-6mm",
      short_desc: "Premium non-slip yoga mat. Extra thick 6mm.",
      description:
        "Professional-grade yoga mat made from eco-friendly natural rubber. 6mm thick for joint protection. Non-slip texture on both sides. Includes carrying strap and alignment lines. Available in 5 colours.",
      price: 64.99,
      sale_price: 49.99,
      thumbnail_url:
        "https://images.unsplash.com/photo-1601925228270-3f3958f70bfd?w=600&q=80",
      product_type: "physical",
      stock: 210,
      sku: "YOGA-MAT-6MM-PRP",
      status: "active",
      is_featured: 1,
      avg_rating: 4.9,
      review_count: 2100,
      total_sales: 1820,
      tags: JSON.stringify(["yoga", "fitness", "mat", "sports", "exercise"]),
    },
    {
      seller_id: vendorId1,
      category_id: 8,
      name: "React 19 Mastery — Full-Stack Video Course",
      slug: "react-19-mastery-full-stack-video-course",
      short_desc: "Master React 19, Next.js 14, and TypeScript from scratch.",
      description:
        "78 hours of HD video content covering React 19 features, Next.js 14 App Router, Server Components, TypeScript, Prisma ORM, and production deployment. Includes source code, exercises, and lifetime updates.",
      price: 149.0,
      sale_price: 49.0,
      thumbnail_url:
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80",
      product_type: "digital",
      stock: -1,
      sku: "COURSE-REACT19-V1",
      status: "active",
      is_featured: 1,
      avg_rating: 4.9,
      review_count: 3280,
      total_sales: 4120,
      tags: JSON.stringify([
        "react",
        "nextjs",
        "typescript",
        "course",
        "programming",
        "frontend",
      ]),
    },
    {
      seller_id: vendorId1,
      category_id: 8,
      name: "Next.js 14 Fullstack SaaS Boilerplate",
      slug: "nextjs-14-fullstack-saas-boilerplate",
      short_desc:
        "Production-ready SaaS starter with auth, billing, and admin.",
      description:
        "Launch your SaaS in days, not months. Includes Next.js 14 App Router, Stripe billing, NextAuth, Prisma + PostgreSQL, admin dashboard, email templates, and comprehensive documentation.",
      price: 299.0,
      sale_price: 199.0,
      thumbnail_url:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80",
      product_type: "digital",
      stock: -1,
      sku: "BOILERPLATE-NEXTJS14",
      status: "active",
      is_featured: 1,
      avg_rating: 4.8,
      review_count: 680,
      total_sales: 342,
      tags: JSON.stringify([
        "nextjs",
        "saas",
        "boilerplate",
        "starter",
        "template",
        "typescript",
      ]),
    },
  ];

  for (const p of products) {
    await run(
      `INSERT IGNORE INTO products
         (seller_id, category_id, name, slug, short_desc, description, price, sale_price,
          thumbnail_url, product_type, stock, sku, status, is_featured,
          avg_rating, review_count, total_sales, tags)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        p.seller_id,
        p.category_id,
        p.name,
        p.slug,
        p.short_desc,
        p.description,
        p.price,
        p.sale_price,
        p.thumbnail_url,
        p.product_type,
        p.stock,
        p.sku,
        p.status,
        p.is_featured,
        p.avg_rating,
        p.review_count,
        p.total_sales,
        p.tags,
      ],
    );
  }
  console.log(`     ✓ ${products.length} products seeded`);
}

async function seedCoupons() {
  console.log("  → Seeding coupons…");

  const coupons = [
    {
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      min: 0,
      max: 50,
      limit: 1000,
      desc: "10% off your first order",
    },
    {
      code: "SAVE20",
      type: "percentage",
      value: 20,
      min: 100,
      max: 100,
      limit: 500,
      desc: "20% off orders over $100",
    },
    {
      code: "FLAT15",
      type: "fixed",
      value: 15,
      min: 50,
      max: null,
      limit: 200,
      desc: "$15 off orders over $50",
    },
    {
      code: "VIP50",
      type: "fixed",
      value: 50,
      min: 200,
      max: null,
      limit: 50,
      desc: "$50 off for VIP customers",
    },
  ];

  for (const c of coupons) {
    await run(
      `INSERT IGNORE INTO coupons
         (code, description, discount_type, discount_value, min_order_amount, max_discount, usage_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [c.code, c.desc, c.type, c.value, c.min, c.max, c.limit],
    );
  }
  console.log(`     ✓ ${coupons.length} coupons seeded`);
}

async function seedOrders() {
  console.log("  → Seeding sample orders…");

  // Get IDs
  const [Matthew] = await run(
    "SELECT id FROM users WHERE email = 'matthew@example.com' LIMIT 1",
  );
  const [lucas] = await run(
    "SELECT id FROM users WHERE email = 'lucas@example.com' LIMIT 1",
  );
  const [prod1] = await run(
    "SELECT id FROM products WHERE slug = 'sony-wh-1000xm5-wireless-headphones' LIMIT 1",
  );
  const [prod7] = await run(
    "SELECT id FROM products WHERE slug = 'react-19-mastery-full-stack-video-course' LIMIT 1",
  );

  if (!Matthew || !prod1) {
    console.log("     ⚠ Skipping orders — users or products not found");
    return;
  }

  // Create Matthew's order
  const orderNum = "VXM-20240301-A3K9";
  const existing = await run(
    "SELECT id FROM orders WHERE order_number = ? LIMIT 1",
    [orderNum],
  );
  if (!existing.length) {
    const orderResult = await run(
      `INSERT INTO orders (order_number, user_id, subtotal, discount_amount, tax_amount, shipping_amount, total_amount, status, payment_status, payment_method, payment_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'delivered', 'paid', 'Stripe', 'pi_3N1abc123')`,
      [orderNum, Matthew.id, 279.99, 0, 21.0, 0, 300.99],
    );
    await run(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
       VALUES (?, ?, 'Sony WH-1000XM5 Wireless Headphones', 1, 279.99, 279.99)`,
      [orderResult.insertId, prod1.id],
    );
  }

  // Create Lucas's digital order (if course exists)
  if (lucas && prod7) {
    const orderNum2 = "VXM-20240228-B7F2";
    const existing2 = await run(
      "SELECT id FROM orders WHERE order_number = ? LIMIT 1",
      [orderNum2],
    );
    if (!existing2.length) {
      const orderResult2 = await run(
        `INSERT INTO orders (order_number, user_id, subtotal, discount_amount, tax_amount, shipping_amount, total_amount, status, payment_status, payment_method, payment_ref)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'delivered', 'paid', 'PayPal', 'PAYID-M9xyz456')`,
        [orderNum2, lucas.id, 49.0, 0, 3.68, 0, 52.68],
      );
      await run(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price)
         VALUES (?, ?, 'React 19 Mastery — Full-Stack Video Course', 1, 49.00, 49.00)`,
        [orderResult2.insertId, prod7.id],
      );
      // Grant download access to the digital course
      await run(
        `INSERT IGNORE INTO downloads (user_id, product_id, order_item_id)
         VALUES (?, ?, LAST_INSERT_ID())`,
        [lucas.id, prod7.id],
      );
    }
  }

  console.log("     ✓ Sample orders seeded");
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱  VexonMart database seeder starting…\n");
  try {
    await seedUsers();
    await seedProducts();
    await seedCoupons();
    await seedOrders();
    console.log("\n✅  Seed complete!\n");
    console.log("  Test accounts:");
    console.log("  ┌──────────────────────────────────────────────────┐");
    console.log("  │  Admin    admin@vexonmart.com   / admin123        │");
    console.log("  │  Vendor   vendor@techzone.io    / vendor123       │");
    console.log("  │  Customer matthew@example.com     / customer123     │");
    console.log("  │  Support  support@vexonmart.com / support123      │");
    console.log("  └──────────────────────────────────────────────────┘\n");
  } catch (err) {
    console.error("\n❌  Seed failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
