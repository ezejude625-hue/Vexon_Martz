"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, slugify, formatDate } from "@/lib/utils";

const Fld = ({ label, name, value, onChange, type="text", req=false, placeholder="", hint="" }) => (
  <div>
    <label className="label">{label}{req && <span className="text-red-400 ml-1">*</span>}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required={req}
      className="input-field" style={{ height:"44px" }} />
    {hint && <p className="text-[11px] text-onyx/35 mt-1">{hint}</p>}
  </div>
);

const Section = ({ icon, title, children }) => (
  <div className="bg-white rounded-2xl p-5 space-y-3" style={{ border:"1px solid #EDE3D2", boxShadow:"0 2px 10px rgba(10,23,29,0.05)" }}>
    <h2 className="font-bold text-onyx text-sm flex items-center gap-2" style={{ fontFamily:"Roboto Slab,sans-serif" }}>
      {icon && <span className="material-symbols-outlined text-oceanic text-[16px]">{icon}</span>}
      {title}
    </h2>
    {children}
  </div>
);

export default function EditProductPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [product, setProduct] = useState(null);
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error,   setError]   = useState("");
  const [toast,   setToast]   = useState(null);
  const [tags,    setTags]    = useState([]);
  const [tagInput,setTagInput]= useState("");
  const [form,    setForm]    = useState({
    name:"", slug:"", description:"", shortDesc:"", price:"", salePrice:"",
    sku:"", stock:"", categoryId:"", productType:"physical",
    status:"draft", isFeatured:false, thumbnailUrl:"", metaTitle:"", metaDesc:"",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch("/api/categories"),
      ]);
      const [p, c] = await Promise.all([pRes.json(), cRes.json()]);
      if (p.success) {
        const d = p.data;
        setProduct(d);
        setTags(d.tags || []);
        setForm({
          name:        d.name || "",
          slug:        d.slug || "",
          description: d.description || "",
          shortDesc:   d.shortDesc || "",
          price:       d.price ? String(d.price) : "",
          salePrice:   d.salePrice ? String(d.salePrice) : "",
          sku:         d.sku || "",
          stock:       d.stock !== null ? String(d.stock) : "",
          categoryId:  d.categoryId ? String(d.categoryId) : "",
          productType: d.productType || "physical",
          status:      d.status || "draft",
          isFeatured:  !!d.isFeatured,
          thumbnailUrl:d.thumbnailUrl || "",
          metaTitle:   d.metaTitle || "",
          metaDesc:    d.metaDesc || "",
        });
      }
      if (c.success) setCats(c.data || []);
    } catch {}
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg, ok=true) { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); }
  function setF(k, v) { setForm(p => ({ ...p, [k]: v })); }
  function handleName(v) { setForm(p => ({ ...p, name:v, slug: product?.slug || slugify(v) })); }

  function addTag(e) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase();
      if (!tags.includes(t)) setTags(ts => [...ts, t]);
      setTagInput("");
    }
  }

  async function save(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name,
          slug:        form.slug || undefined,
          description: form.description || null,
          shortDesc:   form.shortDesc || null,
          price:       parseFloat(form.price),
          salePrice:   form.salePrice ? parseFloat(form.salePrice) : null,
          thumbnailUrl:form.thumbnailUrl || null,
          categoryId:  form.categoryId ? parseInt(form.categoryId) : null,
          productType: form.productType,
          stock:       form.stock !== "" ? parseInt(form.stock) : null,
          sku:         form.sku || null,
          status:      form.status,
          isFeatured:  form.isFeatured,
          tags,
          metaTitle:   form.metaTitle || null,
          metaDesc:    form.metaDesc || null,
        }),
      });
      const data = await res.json();
      if (res.ok) { showToast("Product saved!"); load(); }
      else { setError(data.message || "Failed to save"); }
    } catch { setError("Network error — please try again."); }
    setSaving(false);
  }

  async function archive() {
    if (!confirm("Archive this product? It will be hidden from the store.")) return;
    setArchiving(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/products");
    else { showToast("Failed to archive", false); setArchiving(false); }
  }

  if (loading) return (
    <div className="max-w-5xl space-y-5 animate-pulse">
      <div className="h-8 bg-wheat rounded w-56" />
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-2xl h-64" style={{ border:"1px solid #EDE3D2" }} />
          <div className="bg-white rounded-2xl h-48" style={{ border:"1px solid #EDE3D2" }} />
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl h-40" style={{ border:"1px solid #EDE3D2" }} />
          <div className="bg-white rounded-2xl h-40" style={{ border:"1px solid #EDE3D2" }} />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <span className="material-symbols-outlined text-6xl text-onyx/10 block mb-3">inventory_2</span>
      <p className="text-onyx/40 font-semibold">Product not found</p>
      <Link href="/admin/products" className="btn-primary text-sm mt-4 inline-flex">Back to Products</Link>
    </div>
  );

  const STATUS_COLOR = { active:"text-emerald-600 bg-emerald-50", draft:"text-gray-500 bg-gray-100", paused:"text-amber-600 bg-amber-50", archived:"text-red-500 bg-red-50" };

  return (
    <div className="max-w-5xl space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold ${toast.ok ? "bg-oceanic text-wheat" : "bg-red-600 text-white"}`}>
          <span className="material-symbols-outlined text-[18px]">{toast.ok ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-onyx/50 hover:text-onyx hover:bg-wheat transition-all shrink-0"
            style={{ border:"1px solid #EDE3D2" }}>
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black text-onyx leading-tight" style={{ fontFamily:"Roboto Slab,sans-serif" }}>
              {product.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[product.status] || STATUS_COLOR.draft}`}>
                {product.status}
              </span>
              <span className="text-[11px] text-onyx/35">Updated {formatDate(product.updatedAt, { month:"short", day:"numeric" })}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {product.status !== "archived" && (
            <button onClick={archive} disabled={archiving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
              style={{ border:"1px solid #fca5a5" }}>
              <span className="material-symbols-outlined text-[15px]">archive</span>
              {archiving ? "Archiving…" : "Archive"}
            </button>
          )}
          <Link href={`/products/${id}`} target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-oceanic hover:bg-oceanic/5 transition-all"
            style={{ border:"1px solid rgba(0,63,71,0.2)" }}>
            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
            View in Store
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-medium text-red-700 bg-red-50" style={{ border:"1px solid #fca5a5" }}>
          <span className="material-symbols-outlined text-[18px] text-red-400">error</span>
          {error}
        </div>
      )}

      <form onSubmit={save}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-4">
            <Section icon="edit" title="Product Information">
              <Fld label="Product Name" name="name" value={form.name} req
                onChange={e => handleName(e.target.value)} placeholder="e.g. Sony WH-1000XM5 Headphones" />
              <Fld label="URL Slug" name="slug" value={form.slug}
                onChange={e => setF("slug", e.target.value)} placeholder="sony-wh-1000xm5" hint="Auto-generated. Edit to customise the URL." />
              <div>
                <label className="label">Short Description</label>
                <textarea name="shortDesc" value={form.shortDesc} onChange={e => setF("shortDesc", e.target.value)}
                  placeholder="One sentence that appears in product cards…" rows={2}
                  className="input-field resize-none w-full" style={{ height:"auto", paddingTop:"10px", paddingBottom:"10px" }} />
              </div>
              <div>
                <label className="label">Full Description</label>
                <textarea name="description" value={form.description} onChange={e => setF("description", e.target.value)}
                  placeholder="Detailed product description…" rows={6}
                  className="input-field resize-none w-full" style={{ height:"auto", paddingTop:"10px", paddingBottom:"10px" }} />
              </div>
            </Section>

            <Section icon="photo_library" title="Media">
              <Fld label="Thumbnail URL" name="thumbnailUrl" value={form.thumbnailUrl}
                onChange={e => setF("thumbnailUrl", e.target.value)} placeholder="https://…" />
              {form.thumbnailUrl && (
                <div className="flex items-start gap-3">
                  <img src={form.thumbnailUrl} alt="Preview" className="w-20 h-20 rounded-xl object-cover shrink-0"
                    style={{ border:"1px solid #EDE3D2" }} onError={e => e.target.style.display="none"} />
                  <p className="text-[12px] text-onyx/40 mt-1">Thumbnail preview. Supported: JPG, PNG, WebP.</p>
                </div>
              )}
            </Section>

            <Section icon="label" title="Tags">
              <div>
                <label className="label">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-oceanic/8 text-oceanic">
                      {t}
                      <button type="button" onClick={() => setTags(ts => ts.filter(x => x!==t))}
                        className="w-3.5 h-3.5 rounded-full bg-oceanic/20 hover:bg-oceanic/40 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[11px]">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                  placeholder="Type a tag and press Enter or comma…"
                  className="input-field" style={{ height:"40px" }} />
                <p className="text-[11px] text-onyx/35 mt-1">Press Enter or comma to add a tag</p>
              </div>
            </Section>

            <Section icon="search" title="SEO">
              <Fld label="Meta Title" name="metaTitle" value={form.metaTitle}
                onChange={e => setF("metaTitle", e.target.value)} placeholder="Defaults to product name if blank" />
              <div>
                <label className="label">Meta Description</label>
                <textarea value={form.metaDesc} onChange={e => setF("metaDesc", e.target.value)}
                  placeholder="160-character summary for search engines…" rows={3}
                  className="input-field resize-none w-full" style={{ height:"auto", paddingTop:"10px", paddingBottom:"10px" }} />
                <p className="text-[11px] text-onyx/35 mt-1">{form.metaDesc.length}/160 characters</p>
              </div>
            </Section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <Section title="Status">
              <select value={form.status} onChange={e => setF("status", e.target.value)}
                className="input-field" style={{ height:"40px" }}>
                <option value="draft">Draft (hidden from store)</option>
                <option value="active">Active (visible in store)</option>
                <option value="paused">Paused</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer py-1">
                <input type="checkbox" checked={form.isFeatured} onChange={e => setF("isFeatured", e.target.checked)}
                  className="w-4 h-4 rounded accent-oceanic" />
                <span className="text-sm font-medium text-onyx">Featured product</span>
              </label>
              {form.status === "active" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)" }}>
                  <span className="material-symbols-outlined text-emerald-500 text-[14px] material-symbols-filled">check_circle</span>
                  <span className="text-emerald-700 font-medium">Live in marketplace</span>
                </div>
              )}
            </Section>

            <Section icon="sell" title="Pricing">
              <Fld label="Regular Price ($)" name="price" type="number" value={form.price} req
                onChange={e => setF("price", e.target.value)} placeholder="0.00" />
              <Fld label="Sale Price ($)" name="salePrice" type="number" value={form.salePrice}
                onChange={e => setF("salePrice", e.target.value)} placeholder="Optional" />
              {form.salePrice && parseFloat(form.salePrice) > 0 && parseFloat(form.price) > 0 && (
                <div className="px-3 py-2 rounded-xl text-xs font-semibold text-nectarine-dark" style={{ background:"rgba(232,163,85,0.12)", border:"1px solid rgba(232,163,85,0.25)" }}>
                  {Math.round((1 - parseFloat(form.salePrice)/parseFloat(form.price))*100)}% off
                </div>
              )}
            </Section>

            <Section icon="inventory" title="Inventory">
              <Fld label="SKU" name="sku" value={form.sku} onChange={e => setF("sku", e.target.value)} placeholder="SKU-001" />
              <Fld label="Stock Quantity" name="stock" type="number" value={form.stock}
                onChange={e => setF("stock", e.target.value)} hint="Set -1 for unlimited digital stock" />
            </Section>

            <Section icon="folder" title="Organisation">
              <div>
                <label className="label">Category</label>
                <select value={form.categoryId} onChange={e => setF("categoryId", e.target.value)}
                  className="input-field" style={{ height:"40px" }}>
                  <option value="">— Select category —</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Product Type</label>
                <select value={form.productType} onChange={e => setF("productType", e.target.value)}
                  className="input-field" style={{ height:"40px" }}>
                  <option value="physical">Physical</option>
                  <option value="digital">Digital / Downloadable</option>
                </select>
              </div>
            </Section>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl p-5" style={{ border:"1px solid #EDE3D2" }}>
              <h2 className="font-bold text-onyx text-sm mb-4" style={{ fontFamily:"Roboto Slab,sans-serif" }}>Performance</h2>
              <div className="space-y-3">
                {[
                  { l:"Total Sales",  v:product.totalSales  || 0, unit:"units" },
                  { l:"Avg Rating",   v:parseFloat(product.avgRating||0).toFixed(1), unit:"/ 5.0" },
                  { l:"Reviews",      v:product.reviewCount || 0, unit:"reviews" },
                ].map(s => (
                  <div key={s.l} className="flex items-center justify-between">
                    <span className="text-sm text-onyx/50">{s.l}</span>
                    <span className="font-bold text-onyx tabular-nums">{s.v} <span className="font-normal text-onyx/35 text-xs">{s.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button type="submit" disabled={saving} className="btn-primary w-full h-11 gap-2">
              {saving
                ? <><span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span> Saving…</>
                : <><span className="material-symbols-outlined text-[16px]">save</span> Save Changes</>
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
