"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

const Fld = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  req = false,
  placeholder = "",
}) => (
  <div>
    <label className="label">
      {label}
      {req && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={req}
      className="input-field"
      style={{ height: "44px" }}
    />
  </div>
);

export default function CreateProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [cats, setCats] = useState([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    short_desc: "",
    price: "",
    sale_price: "",
    sku: "",
    stock: "1",
    category_id: "",
    product_type: "physical",
    status: "draft",
    is_featured: false,
    thumbnail_url: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCats(d.data || []);
      })
      .catch(() => {
        setCats([
          { id: 1, name: "Electronics" },
          { id: 2, name: "Fashion" },
          { id: 3, name: "Home & Living" },
          { id: 4, name: "Sports" },
          { id: 5, name: "Books" },
          { id: 6, name: "Beauty" },
          { id: 7, name: "Toys & Kids" },
          { id: 8, name: "Digital Goods" },
        ]);
      });
  }, []);

  function handleName(v) {
    setForm((p) => ({ ...p, name: v, slug: slugify(v) }));
  }

  function handleTagKey(e) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (!tags.includes(t)) setTags((ts) => [...ts, t]);
      setTagInput("");
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      // ── POST to /api/admin/products with camelCase fields ──
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug || undefined,
          description: form.description || null,
          shortDesc: form.short_desc || null,
          price: parseFloat(form.price),
          salePrice: form.sale_price ? parseFloat(form.sale_price) : null,
          thumbnailUrl: form.thumbnail_url || null,
          categoryId: form.category_id ? parseInt(form.category_id) : null,
          productType: form.product_type,
          stock: parseInt(form.stock),
          sku: form.sku || null,
          status: form.status,
          isFeatured: form.is_featured,
          tags,
        }),
      });
      const data = await res.json();
      if (res.ok) router.push("/admin/products");
      else setError(data.message || "Failed to create product");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-[1100px]">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-onyx/50 hover:text-onyx hover:bg-wheat-dark transition-all"
          style={{ border: "1.5px solid #E2D5C0" }}
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
        </Link>
        <div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{
              fontFamily: '"Roboto Slab",sans-serif',
              letterSpacing: "-0.025em",
            }}
          >
            Create Product
          </h1>
          <p className="text-onyx/45 text-sm">
            Add a new product to the marketplace
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href="/admin/products" className="btn-ghost text-sm h-10">
            Discard
          </Link>
          <button
            form="pform"
            type="submit"
            disabled={saving}
            className="btn-primary text-sm gap-2 h-10"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-[15px] animate-spin-smooth">
                  progress_activity
                </span>
                Saving…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[15px]">
                  publish
                </span>
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline error — replaces alert() */}
      {error && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-700"
          style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}
        >
          <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">
            error
          </span>
          {error}
        </div>
      )}

      <form
        id="pform"
        onSubmit={submit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        <div className="lg:col-span-2 space-y-4">
          {/* Basic info */}
          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            <h2
              className="font-bold text-onyx flex items-center gap-2"
              style={{ fontFamily: '"Roboto Slab",sans-serif' }}
            >
              <span className="material-symbols-outlined text-oceanic text-[17px]">
                inventory_2
              </span>
              Basic Info
            </h2>
            <Fld
              label="Product Name"
              name="name"
              value={form.name}
              onChange={(e) => handleName(e.target.value)}
              req
              placeholder="e.g. Sony WH-1000XM5 Headphones"
            />
            <div>
              <label className="label">URL Slug</label>
              <div className="flex">
                <span
                  className="flex items-center px-3 rounded-l-xl border border-r-0 border-[#E2D5C0] bg-wheat text-xs text-onyx/40 whitespace-nowrap"
                  style={{ height: "44px" }}
                >
                  /products/
                </span>
                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, slug: e.target.value }))
                  }
                  className="input-field rounded-l-none flex-1"
                  style={{ height: "44px", borderRadius: "0 12px 12px 0" }}
                />
              </div>
            </div>
            <Fld
              label="Short Description"
              name="short_desc"
              value={form.short_desc}
              onChange={(e) =>
                setForm((p) => ({ ...p, short_desc: e.target.value }))
              }
              placeholder="One-line summary for listings"
            />
            <div>
              <label className="label">Full Description</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Detailed description, specs, and features…"
                className="input-field resize-none py-3"
                style={{ height: "auto" }}
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div
            className="bg-white rounded-2xl p-6 space-y-3"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            <h2
              className="font-bold text-onyx flex items-center gap-2"
              style={{ fontFamily: '"Roboto Slab",sans-serif' }}
            >
              <span className="material-symbols-outlined text-oceanic text-[17px]">
                image
              </span>
              Media
            </h2>
            <div>
              <label className="label">Thumbnail Image URL</label>
              <input
                type="url"
                value={form.thumbnail_url}
                onChange={(e) =>
                  setForm((p) => ({ ...p, thumbnail_url: e.target.value }))
                }
                placeholder="https://example.com/product-image.jpg"
                className="input-field"
                style={{ height: "44px" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#003F47";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E2D5C0";
                  e.target.style.boxShadow = "none";
                }}
              />
              <p className="text-[11px] text-onyx/35 mt-1">
                Paste a direct image URL (Unsplash, your CDN, etc.)
              </p>
            </div>
            {form.thumbnail_url && (
              <div>
                <p className="text-[11px] font-semibold text-onyx/40 mb-2">
                  Preview
                </p>
                <div
                  className="w-32 h-32 rounded-2xl overflow-hidden"
                  style={{ border: "1px solid #EDE3D2" }}
                >
                  <img
                    src={form.thumbnail_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
              </div>
            )}
            <label
              className="flex flex-col items-center justify-center h-24 rounded-2xl cursor-pointer transition-all duration-200 mt-2"
              style={{ border: "2px dashed #E2D5C0" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#003F47";
                e.currentTarget.style.background = "rgba(0,63,71,0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2D5C0";
                e.currentTarget.style.background = "";
              }}
            >
              <span className="material-symbols-outlined text-3xl text-onyx/20 mb-1">
                cloud_upload
              </span>
              <p className="text-xs text-onyx/40">
                Or drop image here · PNG, JPG, WebP · Max 5MB
              </p>
              <input type="file" className="sr-only" accept="image/*" />
            </label>
          </div>

          {/* Tags */}
          <div
            className="bg-white rounded-2xl p-6 space-y-3"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            <h2
              className="font-bold text-onyx flex items-center gap-2"
              style={{ fontFamily: '"Roboto Slab",sans-serif' }}
            >
              <span className="material-symbols-outlined text-oceanic text-[17px]">
                sell
              </span>
              Tags / Features
            </h2>
            <p className="text-[11px] text-onyx/40">
              Tags also appear as product features on the detail page. Press
              Enter or comma to add.
            </p>
            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(0,63,71,0.08)", color: "#003F47" }}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      setTags((ts) => ts.filter((_, j) => j !== i))
                    }
                    className="hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      close
                    </span>
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="Type a tag and press Enter…"
              className="input-field text-sm"
              style={{ height: "40px" }}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div
            className="bg-white rounded-2xl p-5 space-y-3"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            <h2
              className="font-bold text-onyx text-sm"
              style={{ fontFamily: '"Roboto Slab",sans-serif' }}
            >
              Status
            </h2>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
              className="input-field"
              style={{ height: "40px" }}
            >
              <option value="draft">Draft (not visible in shop)</option>
              <option value="active">Active (visible in shop)</option>
              <option value="paused">Paused</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_featured: e.target.checked }))
                }
                className="w-4 h-4 rounded accent-oceanic"
              />
              <span className="text-sm font-medium text-onyx">
                Featured product
              </span>
            </label>
            {form.status === "active" && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <span className="material-symbols-outlined text-emerald-500 text-[14px] material-symbols-filled">
                  check_circle
                </span>
                <span className="text-emerald-700 font-medium">
                  Will appear in marketplace immediately
                </span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div
            className="bg-white rounded-2xl p-5 space-y-3"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            <h2
              className="font-bold text-onyx text-sm flex items-center gap-2"
              style={{ fontFamily: '"Roboto Slab",sans-serif' }}
            >
              <span className="material-symbols-outlined text-oceanic text-[16px]">
                sell
              </span>
              Pricing
            </h2>
            <Fld
              label="Regular Price ($)"
              name="price"
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((p) => ({ ...p, price: e.target.value }))
              }
              req
              placeholder="0.00"
            />
            <Fld
              label="Sale Price ($)"
              name="sale_price"
              type="number"
              value={form.sale_price}
              onChange={(e) =>
                setForm((p) => ({ ...p, sale_price: e.target.value }))
              }
              placeholder="Optional"
            />
          </div>

          {/* Inventory */}
          <div
            className="bg-white rounded-2xl p-5 space-y-3"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            <h2
              className="font-bold text-onyx text-sm flex items-center gap-2"
              style={{ fontFamily: '"Roboto Slab",sans-serif' }}
            >
              <span className="material-symbols-outlined text-oceanic text-[16px]">
                inventory
              </span>
              Inventory
            </h2>
            <Fld
              label="SKU"
              name="sku"
              value={form.sku}
              onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
              placeholder="SKU-001"
            />
            <div>
              <Fld
                label="Stock Quantity"
                name="stock"
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm((p) => ({ ...p, stock: e.target.value }))
                }
              />
              <p className="text-[11px] text-onyx/35 mt-1">
                Set -1 for unlimited digital stock
              </p>
            </div>
          </div>

          {/* Organisation */}
          <div
            className="bg-white rounded-2xl p-5 space-y-3"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            <h2
              className="font-bold text-onyx text-sm flex items-center gap-2"
              style={{ fontFamily: '"Roboto Slab",sans-serif' }}
            >
              <span className="material-symbols-outlined text-oceanic text-[16px]">
                folder
              </span>
              Organisation
            </h2>
            <div>
              <label className="label">Category</label>
              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category_id: e.target.value }))
                }
                className="input-field"
                style={{ height: "40px" }}
              >
                <option value="">— Select category —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Product Type</label>
              <select
                value={form.product_type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, product_type: e.target.value }))
                }
                className="input-field"
                style={{ height: "40px" }}
              >
                <option value="physical">Physical</option>
                <option value="digital">Digital / Downloadable</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
