"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCurrency, getDiscountPercent } from "@/lib/utils";

function Stars({ count }) {
  return (
    <div className="flex gap-px">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`material-symbols-outlined text-xs ${i <= Math.round(count) ? "text-nectarine-dark" : "text-onyx/15"}`}
          style={{
            fontVariationSettings:
              i <= Math.round(count) ? "'FILL' 1" : "'FILL' 0",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Load wishlist from DB ─────────────────────────────────
  const loadWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // ── Remove from DB ────────────────────────────────────────
  async function remove(product_id) {
    setRemoving(product_id);
    try {
      await fetch(`/api/wishlist?product_id=${product_id}`, {
        method: "DELETE",
      });
      setItems((prev) => prev.filter((i) => i.product_id !== product_id));
    } catch {}
    setRemoving(null);
  }

  // ── Add to cart via DB ────────────────────────────────────
  async function addToCart(item) {
    setAdding(item.product_id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: item.product_id, quantity: 1 }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("cart:updated"));
      }
    } catch {}
    setAdding(null);
  }

  async function addAllToCart() {
    for (const item of items.filter((i) => i.in_stock !== false)) {
      await addToCart(item);
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined text-4xl text-onyx/20 animate-spin">
          progress_activity
        </span>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-black text-onyx tracking-tight"
            style={{
              fontFamily: '"Roboto Slab",sans-serif',
              letterSpacing: "-0.025em",
            }}
          >
            Wishlist
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            {items.length} saved item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={addAllToCart}
            className="btn-secondary text-sm h-9 px-4 gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">
              add_shopping_cart
            </span>
            Add All to Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div
          className="bg-white rounded-3xl py-24 text-center"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
          }}
        >
          <div
            className="w-20 h-20 rounded-3xl bg-wheat flex items-center justify-center mx-auto mb-5"
            style={{ border: "1px solid #EDE3D2" }}
          >
            <span className="material-symbols-outlined text-4xl text-onyx/20">
              favorite
            </span>
          </div>
          <h3
            className="font-bold text-onyx/40 text-lg mb-1"
            style={{ fontFamily: '"Roboto Slab",sans-serif' }}
          >
            Your wishlist is empty
          </h3>
          <p className="text-sm text-onyx/30 mb-6">
            Tap the ♡ heart icon on any product in the shop to save it here
          </p>
          <Link href="/shop" className="btn-primary text-sm">
            <span className="material-symbols-outlined text-[18px]">
              storefront
            </span>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const price = item.sale_price || item.price;
            const discount = item.sale_price
              ? getDiscountPercent(item.price, item.sale_price)
              : 0;
            const isAdding = adding === item.product_id;
            const isRemove = removing === item.product_id;
            const inStock = item.in_stock !== false;

            return (
              <div
                key={item.product_id}
                className="bg-white rounded-2xl overflow-hidden flex gap-4 p-4 group transition-all duration-200"
                style={{
                  border: "1px solid #EDE3D2",
                  boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
                  opacity: isRemove ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 28px rgba(10,23,29,0.10)";
                  e.currentTarget.style.borderColor = "#C8B89A";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(10,23,29,0.05)";
                  e.currentTarget.style.borderColor = "#EDE3D2";
                }}
              >
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden shrink-0"
                  style={{ border: "1px solid #EDE3D2" }}
                >
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-wheat flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-onyx/15">
                        image
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    {item.category && (
                      <p className="text-[10px] font-bold text-oceanic/60 uppercase tracking-[0.08em] mb-0.5">
                        {item.category}
                      </p>
                    )}
                    <Link
                      href={`/products/${item.product_id}`}
                      className="font-semibold text-onyx text-sm leading-snug line-clamp-2 hover:text-oceanic transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.rating && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Stars count={item.rating} />
                        <span className="text-[11px] text-onyx/35">
                          {item.rating}
                        </span>
                        {item.reviews > 0 && (
                          <span className="text-[11px] text-onyx/25">
                            ({item.reviews.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-oceanic tabular-nums">
                        {formatCurrency(price)}
                      </span>
                      {item.sale_price && (
                        <span className="text-xs text-onyx/30 line-through">
                          {formatCurrency(item.price)}
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-red-100 text-red-600">
                          -{discount}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!inStock || isAdding}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                        style={{
                          background: !inStock
                            ? "#F5EBD8"
                            : isAdding
                              ? "#dcfce7"
                              : "#003F47",
                          color: !inStock
                            ? "#9AAAB5"
                            : isAdding
                              ? "#16a34a"
                              : "#FFF6E9",
                          cursor: !inStock ? "not-allowed" : "pointer",
                        }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isAdding
                            ? "check"
                            : !inStock
                              ? "block"
                              : "add_shopping_cart"}
                        </span>
                        {isAdding ? "Added" : !inStock ? "Out of Stock" : "Add"}
                      </button>
                      <button
                        onClick={() => remove(item.product_id)}
                        disabled={isRemove}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-onyx/25 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
