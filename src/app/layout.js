// ============================================================
// ROOT LAYOUT — src/app/layout.js
// ============================================================
// Wraps every page. Loads Roboto + Material Symbols.
// ============================================================

import "./globals.css";

export const metadata = {
  title: {
    default: "VexonMart — Shop Smarter. Live Better.",
    template: "%s | VexonMart",
  },
  description: "VexonMart — your world-class shopping destination.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Roboto font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;500;700;900&display=swap"
          rel="stylesheet"
        />
        {/* Material Symbols icon font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-wheat text-onyx antialiased">
        <div className="flex flex-col min-h-screen">{children}</div>
      </body>
    </html>
  );
}
