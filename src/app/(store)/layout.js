// ============================================================
// STORE LAYOUT — src/app/(store)/layout.js
// ============================================================
// Wraps all public storefront pages with Navbar + Footer.
// ============================================================

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ── Page ─────────────────────────────────────────────────────

export const metadata = {
  title: "VexonMart — Shop Smarter. Live Better.",
  description:
    "Discover premium products across electronics, fashion, gadgets, digital goods, and more with fast delivery and secure shopping on VexonMart.",
  keywords: [
    "VexonMart",
    "online shopping",
    "electronics",
    "fashion",
    "digital products",
    "gadgets",
    "ecommerce",
  ],
  metadataBase: new URL("https://vexon-martz.vercel.app"),
  openGraph: {
    title: "VexonMart — Shop Smarter. Live Better.",
    description:
      "Discover premium products across electronics, fashion, gadgets, digital goods, and more.",
    url: "https://vexon-martz.vercel.app",
    siteName: "VexonMart",
    images: [
      {
        url: "/preview.jpg",
        width: 1200,
        height: 630,
        alt: "VexonMart Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VexonMart — Shop Smarter. Live Better.",
    description:
      "Discover premium products across electronics, fashion, gadgets, digital goods, and more.",
    images: ["/preview.jpg"],
  },
};

export default function StoreLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 page-enter">{children}</main>
      <Footer />
    </>
  );
}
