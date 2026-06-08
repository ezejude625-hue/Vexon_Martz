"use client";
// ============================================================
// FOOTER — src/components/layout/Footer.js
// ============================================================
// Newsletter · 5-column grid · trust bar · social icons
// ============================================================

import Link from "next/link";

const LINKS = {
  Shop: [
    { l: "All Products", h: "/shop" },
    { l: "Deals & Sales", h: "/shop?filter=sale" },
    { l: "New Arrivals", h: "/shop?filter=new" },
    { l: "Best Sellers", h: "/shop?filter=popular" },
    { l: "Digital Goods", h: "/shop?category=digital-goods" },
  ],
  Company: [
    { l: "About Us", h: "/about" },
    { l: "Careers", h: "/careers" },
    { l: "Blog", h: "/blog" },
    { l: "Press", h: "/press" },
  ],
  Help: [
    { l: "Help Centre", h: "/help" },
    { l: "Contact Us", h: "/contact" },
    { l: "Track Order", h: "/dashboard/orders" },
    { l: "Returns", h: "/returns" },
  ],
  Legal: [
    { l: "Privacy Policy", h: "/privacy" },
    { l: "Terms of Service", h: "/terms" },
    { l: "Cookie Policy", h: "/cookies" },
  ],
};

const TRUST = [
  { icon: "verified_user", label: "Secure Payments" },
  { icon: "local_shipping", label: "Fast Delivery" },
  { icon: "replay", label: "Easy Returns" },
  { icon: "support_agent", label: "24/7 Support" },
  { icon: "star", label: "4.9★ Rating" },
];

const SOCIALS = [
  {
    label: "X / Twitter",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.737-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  },
  {
    label: "LinkedIn",
    path: "M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 6 7.78 5.22 6.88 5.22A1.68 1.68 0 0 0 5.2 6.88C5.2 7.78 6 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z",
  },
  {
    label: "Facebook",
    path: "M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z",
  },
  {
    label: "Instagram",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
];

export default function Footer() {
  return (
    <footer className="bg-onyx text-wheat/55 mt-auto">
      {/* ── Trust strip ────────────────────────────────── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-7 lg:px-8 py-4">
          <div className="flex items-center justify-between overflow-x-auto gap-6 scroll-x">
            {TRUST.map((t) => (
              <div key={t.label} className="flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-nectarine text-[18px]">
                  {t.icon}
                </span>
                <span className="text-[12.5px] font-semibold text-wheat/65 whitespace-nowrap">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Newsletter ─────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg,#002E35 0%,#003F47 50%,#004D5A 100%)",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-5 sm:px-7 lg:px-8 py-14">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-nectarine/12 border border-nectarine/20 rounded-full px-4 py-1.5 mb-4">
                <span className="material-symbols-outlined text-nectarine text-[16px]">
                  mail
                </span>
                <span className="text-nectarine text-[12px] font-semibold tracking-wider uppercase">
                  Newsletter
                </span>
              </div>
              <h3
                className="text-3xl font-black text-wheat tracking-tight mb-2"
                style={{ fontFamily: "'Roboto Slab',sans-serif" }}
              >
                Get the best deals first
              </h3>
              <p className="text-wheat/55 max-w-md">
                Subscribe and save up to{" "}
                <strong className="text-nectarine">30%</strong> on your first
                order. No spam, unsubscribe anytime.
              </p>
            </div>
            <form
              className="flex gap-2.5 w-full max-w-md"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-12 px-5 rounded-[13px] bg-white/[0.09] border border-white/[0.14] text-wheat text-sm placeholder:text-wheat/35 focus:outline-none focus:border-nectarine/60 focus:bg-white/[0.13] transition-all"
              />
              <button
                type="submit"
                className="btn-primary h-12 px-7 whitespace-nowrap shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Main footer grid ───────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-5 sm:px-7 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2.5 mb-5 group w-fit"
            >
              <div className="w-9 h-9 rounded-[10px] bg-nectarine flex items-center justify-center shadow-nectarine group-hover:scale-105 transition-transform">
                <span
                  className="material-symbols-outlined text-onyx text-[18px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  storefront
                </span>
              </div>
              <span
                className="text-wheat font-black text-[17px] tracking-tight"
                style={{ fontFamily: "'Roboto Slab',sans-serif" }}
              >
                Vexon<span className="text-nectarine">Mart</span>
              </span>
            </Link>
            <p className="text-[13px] text-wheat/45 leading-relaxed max-w-[200px] mb-5">
              Shop Smarter. Live Better. Your world-class online shopping
              destination.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-[8px] bg-white/[0.07] border border-white/[0.10] flex items-center justify-center text-wheat/40 hover:bg-nectarine/15 hover:text-nectarine hover:border-nectarine/30 transition-all duration-150"
                >
                  <svg
                    className="w-[14px] h-[14px]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="text-wheat font-bold text-[13.5px] mb-5 tracking-wide">
                {heading}
              </h4>
              <ul className="space-y-3">
                {items.map(({ l, h }) => (
                  <li key={h}>
                    <Link
                      href={h}
                      className="text-[13px] text-wheat/45 hover:text-nectarine transition-colors duration-150 hover-underline"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ─────────────────────────────────── */}
        <div className="mt-14 pt-8 border-t border-white/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12.5px] text-wheat/28 font-medium">
            © {new Date().getFullYear()} VexonMart. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-wheat/25 text-[12px]">
            <span className="material-symbols-outlined text-[14px] text-wheat/20">
              credit_card
            </span>
            <span className="font-medium">
              Visa · Mastercard · PayPal · Stripe
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/2348000000000"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] hover:bg-[#20C35A] rounded-full flex items-center justify-center text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] hover:shadow-[0_12px_36px_rgba(37,211,102,0.60)] hover:-translate-y-1 transition-all duration-200 z-40"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    </footer>
  );
}
