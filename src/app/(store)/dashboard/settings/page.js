"use client";
import { useState, useEffect, useCallback } from "react";

const TABS = [
  { k: "profile", l: "Profile", i: "person" },
  { k: "security", l: "Security", i: "lock" },
  { k: "notifications", l: "Notifications", i: "notifications" },
];

const NOTIF_DEFAULTS = [
  {
    k: "order_updates",
    l: "Order Updates",
    d: "Shipping and delivery status changes",
    v: true,
  },
  {
    k: "promotions",
    l: "Deals & Promos",
    d: "Exclusive offers and discount codes",
    v: true,
  },
  {
    k: "new_arrivals",
    l: "New Arrivals",
    d: "New products in your saved categories",
    v: false,
  },
  {
    k: "security",
    l: "Security Alerts",
    d: "Login attempts and account changes",
    v: true,
  },
  {
    k: "newsletters",
    l: "Newsletter",
    d: "Monthly digest and shopping guides",
    v: false,
  },
];

function Toggle({ label, desc, checked, onChange }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-4 border-b last:border-0"
      style={{ borderColor: "#F2EAE0" }}
    >
      <div>
        <p className="text-sm font-semibold text-onyx">{label}</p>
        {desc && <p className="text-xs text-onyx/45 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-all duration-200 shrink-0"
        style={{
          background: checked ? "#003F47" : "#E2D5C0",
          boxShadow: checked ? "0 2px 8px rgba(0,63,71,0.3)" : "",
        }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
          style={{ transform: checked ? "translateX(24px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
  readOnly = false,
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="input-field"
        style={{
          opacity: readOnly ? 0.6 : "",
          cursor: readOnly ? "not-allowed" : "",
        }}
        onFocus={(e) => {
          if (!readOnly) {
            e.target.style.borderColor = "#003F47";
            e.target.style.boxShadow = "0 0 0 3px rgba(0,63,71,0.08)";
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2D5C0";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    avatarUrl: "",
  });
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [notifs, setNotifs] = useState(
    Object.fromEntries(NOTIF_DEFAULTS.map((n) => [n.k, n.v])),
  );

  // ── Load user from DB ─────────────────────────────────────
  const loadUser = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success && data.data) {
        const u = data.data;
        setProfile({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          phone: u.phone || "",
          bio: u.bio || "",
          avatarUrl: u.avatarUrl || "",
        });
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // ── Save profile → PATCH /api/users ──────────────────────
  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
          bio: profile.bio,
          avatar_url: profile.avatarUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      showSaved();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  }

  // ── Change password → PATCH /api/users ───────────────────
  async function savePassword(e) {
    e.preventDefault();
    setPwdError("");
    setError("");
    if (!pwd.current) {
      setPwdError("Enter your current password");
      return;
    }
    if (pwd.newPwd.length < 8) {
      setPwdError("New password must be 8+ characters");
      return;
    }
    if (pwd.newPwd !== pwd.confirm) {
      setPwdError("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd.newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setPwd({ current: "", newPwd: "", confirm: "" });
      showSaved();
    } catch (err) {
      setPwdError(err.message);
    }
    setSaving(false);
  }

  function saveNotifs() {
    showSaved();
  }

  const SaveBtn = ({ onSave }) => (
    <div
      className="flex items-center gap-3 pt-5 border-t"
      style={{ borderColor: "#EDE3D2" }}
    >
      <button
        onClick={onSave}
        disabled={saving}
        className="btn-primary gap-2 h-11"
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
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Changes
          </>
        )}
      </button>
      {saved && (
        <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
          <span
            className="material-symbols-outlined text-[15px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          Saved!
        </span>
      )}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );

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
      <div>
        <h1
          className="text-2xl font-black text-onyx tracking-tight"
          style={{
            fontFamily: "'Roboto Slab',sans-serif",
            letterSpacing: "-0.025em",
          }}
        >
          Account Settings
        </h1>
        <p className="text-onyx/45 text-sm mt-0.5">
          Manage your profile, security, and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Tab nav */}
        <nav className="md:w-48 shrink-0">
          <div
            className="bg-white rounded-2xl p-2 space-y-0.5"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 2px 10px rgba(10,23,29,0.05)",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.k}
                onClick={() => {
                  setTab(t.k);
                  setError("");
                  setPwdError("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-150"
                style={{
                  background: tab === t.k ? "#003F47" : "transparent",
                  color: tab === t.k ? "#FFF6E9" : "#3D5060",
                  boxShadow: tab === t.k ? "0 2px 8px rgba(0,63,71,0.2)" : "",
                }}
                onMouseEnter={(e) => {
                  if (tab !== t.k) {
                    e.currentTarget.style.background = "#F5EBD8";
                    e.currentTarget.style.color = "#0A171D";
                  }
                }}
                onMouseLeave={(e) => {
                  if (tab !== t.k) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#3D5060";
                  }
                }}
              >
                <span
                  className="material-symbols-outlined text-[17px]"
                  style={{ color: tab === t.k ? "#FFBD76" : undefined }}
                >
                  {t.i}
                </span>
                {t.l}
              </button>
            ))}
          </div>
        </nav>

        {/* Panel */}
        <div
          className="flex-1 bg-white rounded-2xl p-6"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 2px 12px rgba(10,23,29,0.06)",
          }}
        >
          {/* ── PROFILE ───────────────────────────────────── */}
          {tab === "profile" && (
            <div className="space-y-5">
              <h2
                className="font-bold text-onyx text-lg border-b pb-3"
                style={{
                  fontFamily: "'Roboto Slab',sans-serif",
                  borderColor: "#EDE3D2",
                }}
              >
                Personal Information
              </h2>

              {/* Avatar preview + upload */}
              <div
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "#F5EBD8", border: "1px solid #E2D5C0" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg,#003F47,#005566)",
                    color: "#FFBD76",
                  }}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    profile.firstName?.charAt(0) || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-onyx text-sm">
                    {profile.firstName || "Your name"} {profile.lastName}
                  </p>
                  <p className="text-xs text-onyx/45 mt-0.5">{profile.email}</p>
                  <p className="text-[11px] text-onyx/30 mt-1">
                    Paste an image URL below to update your avatar
                  </p>
                </div>
              </div>

              {/* Avatar URL field */}
              <div>
                <label className="label">Avatar Image URL</label>
                <input
                  type="url"
                  value={profile.avatarUrl}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, avatarUrl: e.target.value }))
                  }
                  placeholder="https://example.com/your-photo.jpg"
                  className="input-field"
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

              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  value={profile.firstName}
                  onChange={(v) => setProfile((p) => ({ ...p, firstName: v }))}
                  placeholder="John"
                />
                <InputField
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(v) => setProfile((p) => ({ ...p, lastName: v }))}
                  placeholder="Doe"
                />
              </div>
              <InputField
                label="Email Address"
                type="email"
                value={profile.email}
                onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
                placeholder="you@example.com"
              />
              <InputField
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(v) => setProfile((p) => ({ ...p, phone: v }))}
                placeholder="+234 801 234 5678"
              />
              <div>
                <label className="label">Bio</label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Tell us a bit about yourself…"
                  className="input-field resize-none py-3"
                  style={{ height: "auto" }}
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
              <SaveBtn onSave={saveProfile} />
            </div>
          )}

          {/* ── SECURITY ──────────────────────────────────── */}
          {tab === "security" && (
            <div className="space-y-5">
              <h2
                className="font-bold text-onyx text-lg border-b pb-3"
                style={{
                  fontFamily: "'Roboto Slab',sans-serif",
                  borderColor: "#EDE3D2",
                }}
              >
                Change Password
              </h2>
              {[
                {
                  label: "Current Password",
                  k: "current",
                  p: "Enter your current password",
                },
                {
                  label: "New Password",
                  k: "newPwd",
                  p: "Minimum 8 characters",
                },
                {
                  label: "Confirm Password",
                  k: "confirm",
                  p: "Re-enter new password",
                },
              ].map((f) => (
                <div key={f.k}>
                  <label className="label">{f.label}</label>
                  <input
                    type="password"
                    value={pwd[f.k]}
                    placeholder={f.p}
                    onChange={(e) =>
                      setPwd((p) => ({ ...p, [f.k]: e.target.value }))
                    }
                    className="input-field"
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
              ))}

              {pwd.newPwd.length > 0 && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => {
                      const s =
                        (pwd.newPwd.length >= 8 ? 1 : 0) +
                        (/[A-Z]/.test(pwd.newPwd) ? 1 : 0) +
                        (/[0-9]/.test(pwd.newPwd) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(pwd.newPwd) ? 1 : 0);
                      const c =
                        s <= 1
                          ? "#ef4444"
                          : s === 2
                            ? "#f59e0b"
                            : s === 3
                              ? "#0ea5e9"
                              : "#22c55e";
                      return (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full"
                          style={{ background: i <= s ? c : "#EDE3D2" }}
                        />
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-onyx/40">
                    {pwd.newPwd.length < 8
                      ? "Too short"
                      : /[A-Z]/.test(pwd.newPwd) && /[0-9]/.test(pwd.newPwd)
                        ? "Strong"
                        : "Add uppercase and numbers for a stronger password"}
                  </p>
                </div>
              )}

              {pwdError && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    error
                  </span>
                  {pwdError}
                </p>
              )}

              <div
                className="flex items-start gap-3 p-4 rounded-2xl"
                style={{
                  background: "rgba(255,189,118,0.08)",
                  border: "1px solid rgba(255,189,118,0.25)",
                }}
              >
                <span
                  className="material-symbols-outlined text-[20px] mt-0.5"
                  style={{ color: "#E8A355" }}
                >
                  shield
                </span>
                <div>
                  <p className="text-sm font-bold text-onyx">
                    Two-factor authentication
                  </p>
                  <p className="text-xs text-onyx/50 mt-0.5">
                    Coming soon — adds extra protection to your account.
                  </p>
                </div>
              </div>
              <SaveBtn onSave={savePassword} />
            </div>
          )}

          {/* ── NOTIFICATIONS ─────────────────────────────── */}
          {tab === "notifications" && (
            <div className="space-y-1">
              <h2
                className="font-bold text-onyx text-lg border-b pb-3 mb-3"
                style={{
                  fontFamily: "'Roboto Slab',sans-serif",
                  borderColor: "#EDE3D2",
                }}
              >
                Notification Preferences
              </h2>
              <p className="text-sm text-onyx/50 pb-3">
                These preferences are saved to your account.
              </p>
              {NOTIF_DEFAULTS.map((item) => (
                <Toggle
                  key={item.k}
                  label={item.l}
                  desc={item.d}
                  checked={notifs[item.k]}
                  onChange={(v) => setNotifs((n) => ({ ...n, [item.k]: v }))}
                />
              ))}
              <div className="pt-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={saveNotifs}
                    className="btn-primary gap-2 h-11"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      save
                    </span>
                    Save Preferences
                  </button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
                      <span
                        className="material-symbols-outlined text-[15px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check_circle
                      </span>
                      Saved!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
