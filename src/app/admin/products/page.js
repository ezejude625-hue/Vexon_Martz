"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

const STATUS_BADGE = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-gray-100 text-gray-600",
  paused: "bg-amber-100 text-amber-700",
  archived: "bg-red-100 text-red-700",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  shortDesc: "",
  price: "",
  salePrice: "",
  thumbnailUrl: "",
  categoryId: "",
  productType: "physical",
  stock: "1",
  sku: "",
  status: "draft",
  isFeatured: false,
  tags: [], // ← was missing entirely
};

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  as = "input",
  children,
}) {
  const shared = {
    value,
    onChange: (e) => onChange(e.target.value),
    placeholder,
    className: "input-field",
    onFocus: (e) => {
      e.target.style.borderColor = "#003F47";
      e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
    },
    onBlur: (e) => {
      e.target.style.borderColor = "#E2D5C0";
      e.target.style.boxShadow = "none";
    },
  };
  return (
    <div>
      <label className="label">{label}</label>
      {as === "textarea" ? (
        <textarea
          {...shared}
          rows={3}
          style={{ height: "auto" }}
          className="input-field resize-none"
        />
      ) : as === "select" ? (
        <select {...shared} className="input-field">
          {children}
        </select>
      ) : (
        <input {...shared} type={type} />
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [tagInput, setTagInput] = useState(""); // ← tag input field
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data || []);
        setPagination(data.pagination || { total: 0, pages: 1, page: 1 });
      }
    } catch {}
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.data || []);
      })
      .catch(() => {});
  }, []);

  function openAdd() {
    setForm(EMPTY_FORM);
    setTagInput("");
    setSaveError("");
    setModal("add");
  }

  function openEdit(p) {
    setForm({
      name: p.name || "",
      description: p.description || "",
      shortDesc: p.shortDesc || "",
      price: String(p.price || ""),
      salePrice: p.salePrice ? String(p.salePrice) : "",
      thumbnailUrl: p.thumbnailUrl || "",
      categoryId: p.categoryId ? String(p.categoryId) : "",
      productType: p.productType || "physical",
      stock: String(p.stock ?? 1),
      sku: p.sku || "",
      status: p.status || "draft",
      isFeatured: p.isFeatured || false,
      tags: Array.isArray(p.tags) ? p.tags : [], // ← was missing
    });
    setTagInput("");
    setSaveError("");
    setModal({ ...p });
  }

  // ── Tag helpers ───────────────────────────────────────────
  function handleTagKey(e) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (!form.tags.includes(t))
        setForm((prev) => ({ ...prev, tags: [...prev.tags, t] }));
      setTagInput("");
    }
  }
  function removeTag(i) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((_, j) => j !== i) }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaveError("");
    if (!form.name.trim() || !form.price) {
      setSaveError("Name and price are required.");
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      shortDesc: form.shortDesc || null,
      price: parseFloat(form.price),
      salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
      thumbnailUrl: form.thumbnailUrl || null,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      productType: form.productType,
      stock: parseInt(form.stock) || 1,
      sku: form.sku || null,
      status: form.status,
      isFeatured: form.isFeatured,
      tags: form.tags, // ← was missing from payload
    };

    try {
      const isEdit = modal && modal !== "add";
      const url = isEdit
        ? `/api/admin/products/${modal.id}`
        : "/api/admin/products";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.message || "Save failed.");
        setSaving(false);
        return;
      }
      setModal(null);
      loadProducts();
    } catch {
      setSaveError("Network error. Please try again.");
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm("Archive this product? It will no longer appear in the shop."))
      return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      loadProducts();
    } catch {}
    setDeleting(null);
  }

  async function toggleStatus(p) {
    const nextStatus = p.status === "active" ? "paused" : "active";
    try {
      await fetch(`/api/admin/products/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      loadProducts();
    } catch {}
  }

  const f = (k) => (v) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-black text-onyx tracking-tight"
            style={{
              fontFamily: "'Roboto Slab',sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            Products
          </h1>
          <p className="text-onyx/45 text-sm mt-0.5">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary text-sm h-10 px-5 gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>Add
          Product
        </button>
      </div>

      {/* Filters */}
      <div
        className="bg-white rounded-2xl p-4 flex flex-wrap gap-3 items-center"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
        }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-onyx/30 text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or SKU…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
            style={{ background: "#F5EBD8", border: "1.5px solid transparent" }}
            onFocus={(e) => {
              e.target.style.borderColor = "#003F47";
              e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "transparent";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["", "active", "draft", "paused", "archived"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                background: statusFilter === s ? "#003F47" : "#F5EBD8",
                color: statusFilter === s ? "#FFF6E9" : "#6B7D8A",
                boxShadow:
                  statusFilter === s ? "0 2px 8px rgba(0,63,71,0.25)" : "",
              }}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #EDE3D2",
          boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-onyx/20 animate-spin">
              progress_activity
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-onyx/12 block mb-3">
              inventory_2
            </span>
            <p className="font-semibold text-onyx/35">No products found</p>
            <p className="text-sm text-onyx/25 mt-1 mb-5">
              Create your first product to get started
            </p>
            <button onClick={openAdd} className="btn-primary text-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Product
            </button>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-12 gap-4 px-5 py-3 text-[11px] font-bold text-onyx/35 uppercase tracking-[0.08em] border-b"
              style={{ borderColor: "#F2EAE0", background: "#FAF4EC" }}
            >
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-1 text-center">Stock</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y" style={{ borderColor: "#F2EAE0" }}>
              {products.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-wheat/40 transition-colors duration-150"
                >
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-wheat"
                      style={{ border: "1px solid #EDE3D2" }}
                    >
                      {p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl text-onyx/15">
                            image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-onyx text-sm truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-onyx/40 mt-0.5">
                        {p.category?.name || "Uncategorized"} ·{" "}
                        {p.sku || "No SKU"}
                        {/* Show tag count if tags exist */}
                        {Array.isArray(p.tags) && p.tags.length > 0 && (
                          <span className="ml-1 text-oceanic/60">
                            · {p.tags.length} tag
                            {p.tags.length !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="font-bold text-onyx text-sm tabular-nums">
                      {formatCurrency(parseFloat(p.salePrice || p.price))}
                    </p>
                    {p.salePrice && (
                      <p className="text-[11px] text-onyx/35 line-through tabular-nums">
                        {formatCurrency(parseFloat(p.price))}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1 text-center">
                    <span
                      className={`text-sm font-bold tabular-nums ${p.stock === 0 ? "text-red-500" : p.stock <= 5 && p.stock > 0 ? "text-amber-600" : "text-onyx"}`}
                    >
                      {p.stock === -1 ? "∞" : p.stock}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <button
                      onClick={() => toggleStatus(p)}
                      title="Click to toggle active/paused"
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize transition-all hover:opacity-80 ${STATUS_BADGE[p.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {p.status}
                    </button>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(p)}
                      title="Edit"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-onyx/40 hover:text-oceanic hover:bg-oceanic/8 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      title="Archive"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-onyx/40 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      {deleting === p.id ? (
                        <span className="material-symbols-outlined text-[16px] animate-spin">
                          progress_activity
                        </span>
                      ) : (
                        <span className="material-symbols-outlined text-[16px]">
                          archive
                        </span>
                      )}
                    </button>
                    <Link
                      href={`/admin/products/${p.id}`}
                      title="Edit product"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-onyx/40 hover:text-oceanic hover:bg-oceanic/8 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </Link>
                    <a
                      href={`/products/${p.id}`}
                      target="_blank"
                      rel="noreferrer"
                      title="View in shop"
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-onyx/40 hover:text-oceanic hover:bg-oceanic/8 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        open_in_new
                      </span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div
                className="flex items-center justify-between px-5 py-4 border-t"
                style={{ borderColor: "#F2EAE0" }}
              >
                <p className="text-sm text-onyx/40">
                  Page {page} of {pagination.pages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "#F5EBD8",
                      color: "#3D5060",
                      opacity: page === 1 ? 0.5 : 1,
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={page === pagination.pages}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "#003F47",
                      color: "#FFF6E9",
                      opacity: page === pagination.pages ? 0.5 : 1,
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal ──────────────────────────────────────────── */}
      {modal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-8 overflow-y-auto"
          style={{
            background: "rgba(10,23,29,0.55)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-in"
            style={{ border: "1px solid #EDE3D2" }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between px-7 py-5 border-b"
              style={{ borderColor: "#EDE3D2" }}
            >
              <div>
                <h2
                  className="font-bold text-onyx text-lg"
                  style={{ fontFamily: "'Roboto Slab',sans-serif" }}
                >
                  {modal === "add" ? "Add New Product" : "Edit Product"}
                </h2>
                {modal !== "add" && (
                  <p className="text-xs text-onyx/35 mt-0.5">ID #{modal.id}</p>
                )}
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-onyx/40 hover:bg-wheat hover:text-onyx transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="p-7 space-y-5 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field
                    label="Product Name *"
                    value={form.name}
                    onChange={f("name")}
                    placeholder="e.g. Sony WH-1000XM5"
                  />
                </div>

                <Field
                  label="Price (USD) *"
                  value={form.price}
                  onChange={f("price")}
                  type="number"
                  placeholder="0.00"
                />
                <Field
                  label="Sale Price (optional)"
                  value={form.salePrice}
                  onChange={f("salePrice")}
                  type="number"
                  placeholder="0.00"
                />

                <div className="sm:col-span-2">
                  <Field
                    label="Thumbnail URL"
                    value={form.thumbnailUrl}
                    onChange={f("thumbnailUrl")}
                    placeholder="https://…"
                  />
                  {form.thumbnailUrl && (
                    <div
                      className="mt-2 w-20 h-20 rounded-xl overflow-hidden"
                      style={{ border: "1px solid #EDE3D2" }}
                    >
                      <img
                        src={form.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Short Description"
                    value={form.shortDesc}
                    onChange={f("shortDesc")}
                    as="textarea"
                    placeholder="A brief summary shown on cards…"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Field
                    label="Full Description"
                    value={form.description}
                    onChange={f("description")}
                    as="textarea"
                    placeholder="Detailed product description…"
                  />
                </div>

                {/* ── Tags / Features ────────────────────────────── */}
                <div className="sm:col-span-2">
                  <label className="label">Tags / Features</label>
                  <p className="text-[11px] text-onyx/40 mb-2">
                    These appear as bullet points on the product Features tab.
                    Press Enter or comma to add.
                  </p>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.tags.map((t, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: "rgba(0,63,71,0.08)",
                            color: "#003F47",
                          }}
                        >
                          {t}
                          <button
                            type="button"
                            onClick={() => removeTag(i)}
                            className="hover:text-red-500 transition-colors ml-0.5"
                          >
                            <span className="material-symbols-outlined text-[12px]">
                              close
                            </span>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKey}
                    placeholder="Type a tag and press Enter…"
                    className="input-field text-sm"
                    style={{ height: "40px" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#003F47";
                      e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#E2D5C0";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <Field
                  label="Category"
                  value={form.categoryId}
                  onChange={f("categoryId")}
                  as="select"
                >
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Field>

                <Field
                  label="Product Type"
                  value={form.productType}
                  onChange={f("productType")}
                  as="select"
                >
                  <option value="physical">Physical</option>
                  <option value="digital">Digital</option>
                </Field>

                <Field
                  label="Stock Quantity (-1 = unlimited)"
                  value={form.stock}
                  onChange={f("stock")}
                  type="number"
                  placeholder="1"
                />
                <Field
                  label="SKU (optional)"
                  value={form.sku}
                  onChange={f("sku")}
                  placeholder="e.g. SONY-XM5-BLK"
                />

                <Field
                  label="Status"
                  value={form.status}
                  onChange={f("status")}
                  as="select"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="archived">Archived</option>
                </Field>

                <div>
                  <label className="label">Featured</label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, isFeatured: !p.isFeatured }))
                    }
                    className="relative w-12 h-6 rounded-full transition-all duration-200 mt-1"
                    style={{
                      background: form.isFeatured ? "#003F47" : "#E2D5C0",
                      boxShadow: form.isFeatured
                        ? "0 2px 8px rgba(0,63,71,0.3)"
                        : "",
                    }}
                  >
                    <span
                      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
                      style={{
                        transform: form.isFeatured
                          ? "translateX(24px)"
                          : "translateX(0)",
                      }}
                    />
                  </button>
                  <p className="text-[11px] text-onyx/35 mt-1">
                    Show in featured sections
                  </p>
                </div>
              </div>

              {saveError && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-700"
                  style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}
                >
                  <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">
                    error
                  </span>
                  {saveError}
                </div>
              )}

              {form.status === "active" && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <span className="material-symbols-outlined text-emerald-600 text-[16px]">
                    check_circle
                  </span>
                  <span className="text-emerald-700 font-medium">
                    This product will appear in the marketplace immediately.
                  </span>
                </div>
              )}

              <div
                className="flex items-center justify-between pt-3 border-t"
                style={{ borderColor: "#EDE3D2" }}
              >
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="btn-ghost h-11 px-5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary h-11 px-6 text-sm gap-2"
                >
                  {saving ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        progress_activity
                      </span>
                      Saving…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">
                        save
                      </span>
                      {modal === "add" ? "Create Product" : "Save Changes"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
