// ============================================================
// UTILITIES — src/lib/utils.js
// ============================================================
// Shared helpers. VexonMart is US-headquartered, ships worldwide.
// All monetary values stored in USD; display currency is configurable.
// ============================================================

/* ─── cn() ───────────────────────────────────────────────── */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ─── formatCurrency() ───────────────────────────────────── */
// Format a number as currency. Defaults to USD (en-US locale).
// formatCurrency(1999.5)         → "$1,999.50"
// formatCurrency(1999.5, 'EUR')  → "€1,999.50"
export function formatCurrency(amount, currency = "USD", locale = "en-US") {
  const n = parseFloat(amount);
  if (isNaN(n)) return "$0.00";
  return new Intl.NumberFormat(locale, {
    style:                 "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/* ─── formatDate() ───────────────────────────────────────── */
// Format a date for display. Falls back gracefully on bad input.
// formatDate('2024-01-15')                          → "Jan 15, 2024"
// formatDate('2024-01-15', { dateStyle: 'full' })  → "Monday, January 15, 2024"
export function formatDate(date, options = { month: "short", day: "numeric", year: "numeric" }) {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", options).format(new Date(date));
  } catch {
    return String(date);
  }
}

/* ─── formatDatetime() ───────────────────────────────────── */
// Full timestamp with time — used in admin logs, order history.
export function formatDatetime(date, timezone = "America/New_York") {
  if (!date) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone:    timezone,
      month:       "short",
      day:         "numeric",
      year:        "numeric",
      hour:        "2-digit",
      minute:      "2-digit",
    }).format(new Date(date));
  } catch {
    return formatDate(date);
  }
}

/* ─── timeAgo() ──────────────────────────────────────────── */
// Human-friendly relative time ("2 hours ago", "3 days ago")
export function timeAgo(date) {
  if (!date) return "—";
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secs < 60)   return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400)return `${Math.floor(secs / 3600)}h ago`;
  if (secs < 2592000) return `${Math.floor(secs / 86400)}d ago`;
  return formatDate(date);
}

/* ─── slugify() ──────────────────────────────────────────── */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .normalize("NFD")               // handle accented chars (worldwide names)
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ─── truncate() ─────────────────────────────────────────── */
export function truncate(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}…`;
}

/* ─── capitalize() ───────────────────────────────────────── */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─── generateOrderNumber() ──────────────────────────────── */
// Format: VXM-YYYYMMDD-XXXX  (always UTC so it's unambiguous worldwide)
export function generateOrderNumber() {
  const d      = new Date();
  const date   = [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, "0"),
    String(d.getUTCDate()).padStart(2, "0"),
  ].join("");
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `VXM-${date}-${suffix}`;
}

/* ─── buildPagination() ──────────────────────────────────── */
export function buildPagination(total, page, limit) {
  const total_pages = Math.ceil(total / limit);
  return {
    page, limit, total, total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}

/* ─── isValidEmail() ─────────────────────────────────────── */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ─── isStrongPassword() ─────────────────────────────────── */
export function isStrongPassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

/* ─── applyCoupon() ──────────────────────────────────────── */
export function applyCoupon(subtotal, discountType, discountValue, maxDiscount) {
  let discount = 0;
  if (discountType === "percentage") {
    discount = (subtotal * discountValue) / 100;
    if (maxDiscount) discount = Math.min(discount, maxDiscount);
  } else {
    discount = Math.min(discountValue, subtotal);
  }
  return {
    discount:   Math.round(discount * 100) / 100,
    finalPrice: Math.max(0, subtotal - discount),
  };
}

/* ─── getEffectivePrice() ────────────────────────────────── */
export function getEffectivePrice(price, salePrice) {
  return salePrice && salePrice < price ? salePrice : price;
}

/* ─── getDiscountPercent() ───────────────────────────────── */
export function getDiscountPercent(price, salePrice) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/* ─── formatPhoneNumber() ────────────────────────────────── */
// Lightweight display formatter — handles US (+1) and international
export function formatPhoneNumber(phone) {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  // US 10-digit
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  // US with country code
  if (digits.length === 11 && digits[0] === "1") return `+1 (${digits.slice(1,4)}) ${digits.slice(4,7)}-${digits.slice(7)}`;
  // International — just add + if missing
  return phone.startsWith("+") ? phone : `+${digits}`;
}

/* ─── countryName() ──────────────────────────────────────── */
// Convert ISO-3166 country code to readable name (uses browser API)
export function countryName(code) {
  if (!code) return "—";
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return names.of(code.toUpperCase()) || code;
  } catch {
    return code;
  }
}
