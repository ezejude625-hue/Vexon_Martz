"use client";
import { useState, useEffect } from "react";

const PERMISSIONS = [
  { group: "Store",     items: ["view_products","manage_products","manage_categories","manage_coupons"] },
  { group: "Orders",    items: ["view_orders","manage_orders","process_refunds","export_orders"] },
  { group: "Customers", items: ["view_customers","manage_customers","message_customers"] },
  { group: "Finance",   items: ["view_revenue","manage_expenses","view_reports","export_finance"] },
  { group: "System",    items: ["manage_roles","manage_settings","view_logs","manage_vendors"] },
];
const ALL_PERMS = PERMISSIONS.flatMap(g => g.items);

const BASE_ROLES = [
  { id: 1, name: "Admin",    color: "#003F47", icon: "admin_panel_settings", desc: "Full system access — can manage everything",                  system: true,  perms: ALL_PERMS },
  { id: 2, name: "Customer", color: "#059669", icon: "person",               desc: "Standard buyer — shop, order, review products",               system: true,  perms: [] },
  { id: 3, name: "Vendor",   color: "#7C3AED", icon: "storefront",           desc: "Seller account — can list and manage own products",           system: false, perms: ["view_products","manage_products","view_orders","view_customers","view_revenue"] },
  { id: 4, name: "Support",  color: "#0ea5e9", icon: "support_agent",        desc: "Handle tickets and customer orders",                          system: false, perms: ["view_orders","manage_orders","view_customers","message_customers"] },
];

function fmt(s) { return s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

export default function AdminRolesPage() {
  const [roles,   setRoles]   = useState(BASE_ROLES);
  const [loading, setLoading] = useState(true);
  const [sel,     setSel]     = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Load real user counts per role from DB
  useEffect(() => {
    fetch("/api/admin/roles")
      .then(r => r.json())
      .then(d => {
        if (!d.success) return;
        setRoles(prev => prev.map(r => {
          const dbRole = (d.data || []).find(x => x.name === r.name);
          return dbRole ? { ...r, users: dbRole.users } : r;
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function togglePerm(roleId, perm) {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId || r.system) return r;
      const has = r.perms.includes(perm);
      return { ...r, perms: has ? r.perms.filter(p => p !== perm) : [...r.perms, perm] };
    }));
    setSaved(false);
  }

  async function savePerms(role) {
    setSaving(true);
    try {
      await fetch(`/api/admin/roles/${role.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: role.perms }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-black text-onyx" style={{ fontFamily: "Roboto Slab,sans-serif", letterSpacing: "-0.025em" }}>
          Roles & Permissions
        </h1>
        <p className="text-onyx/45 text-sm mt-0.5">Manage what each role can access</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Role cards */}
        <div className="space-y-3">
          {roles.map(role => (
            <button key={role.id} onClick={() => setSel(role.id === sel ? null : role.id)}
              className="w-full text-left p-5 bg-white rounded-2xl transition-all duration-200"
              style={{ border: `2px solid ${sel === role.id ? role.color : "#EDE3D2"}`, boxShadow: sel === role.id ? `0 4px 20px ${role.color}25` : "0 2px 10px rgba(10,23,29,0.05)" }}>
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${role.color}14` }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: role.color, fontVariationSettings: "'FILL' 1" }}>{role.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-onyx">{role.name}</p>
                    {role.system && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-onyx/30 border border-onyx/15 rounded px-1.5 py-0.5">System</span>
                    )}
                  </div>
                  <p className="text-[12px] text-onyx/45 mt-0.5 line-clamp-1">{role.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  {loading ? (
                    <div className="w-8 h-4 bg-wheat rounded animate-pulse" />
                  ) : (
                    <p className="text-lg font-black text-onyx tabular-nums" style={{ fontFamily: "Roboto Slab,sans-serif" }}>
                      {(role.users || 0).toLocaleString()}
                    </p>
                  )}
                  <p className="text-[10px] text-onyx/35">users</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Permissions matrix */}
        <div className="xl:col-span-2">
          {!sel ? (
            <div className="bg-white rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center"
              style={{ border: "1px solid #EDE3D2" }}>
              <span className="material-symbols-outlined text-5xl text-onyx/15 block mb-3">admin_panel_settings</span>
              <p className="font-semibold text-onyx/35">Select a role to manage permissions</p>
            </div>
          ) : (() => {
            const role = roles.find(r => r.id === sel);
            return (
              <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #EDE3D2", boxShadow: "0 2px 12px rgba(10,23,29,0.06)" }}>
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#EDE3D2" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${role.color}14` }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: role.color, fontVariationSettings: "'FILL' 1" }}>{role.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-onyx">{role.name} Permissions</p>
                      <p className="text-[11px] text-onyx/40">{role.perms.length} of {ALL_PERMS.length} permissions enabled</p>
                    </div>
                  </div>
                  {!role.system && (
                    <button onClick={() => savePerms(role)} disabled={saving}
                      className="btn-primary text-xs h-8 px-4 gap-1.5">
                      {saving ? (
                        <><span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span> Saving…</>
                      ) : saved ? (
                        <><span className="material-symbols-outlined text-[14px]">check_circle</span> Saved!</>
                      ) : (
                        <><span className="material-symbols-outlined text-[14px]">save</span> Save</>
                      )}
                    </button>
                  )}
                </div>
                {role.system && (
                  <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-[16px]">info</span>
                    <p className="text-xs text-amber-700 font-medium">System roles cannot be modified</p>
                  </div>
                )}
                <div className="p-6 space-y-5">
                  {PERMISSIONS.map(group => (
                    <div key={group.group}>
                      <p className="text-[11px] font-bold text-onyx/40 uppercase tracking-[0.08em] mb-3">{group.group}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {group.items.map(perm => {
                          const enabled = role.perms.includes(perm);
                          return (
                            <button key={perm}
                              onClick={() => !role.system && togglePerm(role.id, perm)}
                              disabled={role.system}
                              className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                              style={{
                                background: enabled ? `${role.color}0E` : "#FAF4EC",
                                border: `1px solid ${enabled ? role.color+"30" : "#EDE3D2"}`,
                                cursor: role.system ? "default" : "pointer",
                              }}>
                              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all"
                                style={{ background: enabled ? role.color : "#E2D5C0" }}>
                                <span className="material-symbols-outlined text-[13px] text-white"
                                  style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {enabled ? "check" : "remove"}
                                </span>
                              </div>
                              <span className="text-[12px] font-medium text-onyx/70">{fmt(perm)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
