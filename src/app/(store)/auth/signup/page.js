"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PERKS = [
  { icon: "local_offer", text: "10% off your first order" },
  { icon: "local_shipping", text: "Free shipping on orders $100+" },
  { icon: "download", text: "Lifetime access to digital products" },
  { icon: "support_agent", text: "Priority customer support" },
];

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-field"
        onFocus={(e) => {
          e.target.style.borderColor = "#003F47";
          e.target.style.boxShadow = "0 0 0 3.5px rgba(0,63,71,0.10)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#E2D5C0";
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }
      // JWT cookie set by API — no localStorage needed
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] flex">
      <div
        className="hidden lg:flex lg:w-[40%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(155deg,#003F47 0%,#0A171D 50%,#1C3040 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 30%, rgba(255,189,118,0.10) 0%,transparent 50%)",
          }}
        />
        <div className="absolute top-1/3 left-0 w-80 h-80 rounded-full border border-white/5 -translate-x-1/3" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-nectarine/15 border border-nectarine/25 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-nectarine text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              storefront
            </span>
          </div>
          <span
            className="text-wheat font-black text-xl tracking-tight"
            style={{ fontFamily: '"Roboto Slab",sans-serif', fontWeight: 800 }}
          >
            Vexon<span className="text-nectarine">Mart</span>
          </span>
        </Link>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-nectarine/12 border border-nectarine/25 rounded-full px-4 py-2 mb-5">
            <span className="material-symbols-outlined text-nectarine text-[14px] material-symbols-filled">
              card_giftcard
            </span>
            <span className="text-nectarine text-[11px] font-bold tracking-[0.1em] uppercase">
              Join free today
            </span>
          </div>
          <h2
            className="text-white leading-tight mb-3"
            style={{
              fontFamily: '"Roboto Slab",sans-serif',
              fontWeight: 800,
              fontSize: "2.2rem",
              letterSpacing: "-0.03em",
            }}
          >
            Start shopping
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#FFBD76,#E8A355)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              smarter today
            </span>
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs mb-8">
            Create your free account and unlock exclusive member benefits.
          </p>
          <div className="space-y-3">
            {PERKS.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-nectarine/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-nectarine text-[16px]">
                    {p.icon}
                  </span>
                </div>
                <span className="text-white/60 text-sm">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/25 text-xs">
          Free account · No credit card required
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-12 bg-wheat overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1
              className="text-onyx mb-1.5"
              style={{
                fontFamily: '"Roboto Slab",sans-serif',
                fontWeight: 800,
                fontSize: "1.85rem",
                letterSpacing: "-0.025em",
              }}
            >
              Create account
            </h1>
            <p className="text-onyx/50 text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-oceanic font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div
            className="bg-white rounded-2xl p-7"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow: "0 4px 24px rgba(10,23,29,0.08)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First Name"
                  name="first_name"
                  placeholder="Amara"
                  required
                  value={form.first_name}
                  onChange={handleChange}
                />
                <Field
                  label="Last Name"
                  name="last_name"
                  placeholder="Osei"
                  required
                  value={form.last_name}
                  onChange={handleChange}
                />
              </div>
              <Field
                label="Email address"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={handleChange}
              />

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    placeholder="Min. 8 characters"
                    className="input-field pr-12"
                    style={
                      focused === "password"
                        ? {
                            borderColor: "#003F47",
                            boxShadow: "0 0 0 3.5px rgba(0,63,71,0.10)",
                          }
                        : {}
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-onyx/30 hover:text-onyx/60 hover:bg-wheat transition-all"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPwd ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <Field
                label="Confirm Password"
                name="confirm"
                type="password"
                placeholder="Repeat password"
                required
                value={form.confirm}
                onChange={handleChange}
              />

              {form.password.length > 0 && (
                <div className="flex items-center gap-2">
                  {[4, 8, 12].map((min, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          form.password.length >= min
                            ? i === 0
                              ? "#ef4444"
                              : i === 1
                                ? "#f59e0b"
                                : "#22c55e"
                            : "#EDE3D2",
                      }}
                    />
                  ))}
                  <span className="text-[11px] text-onyx/40 ml-1 shrink-0">
                    {form.password.length < 4
                      ? "Weak"
                      : form.password.length < 8
                        ? "Fair"
                        : "Strong"}
                  </span>
                </div>
              )}

              {error && (
                <div
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm text-red-700 animate-scale-in"
                  style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}
                >
                  <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0 material-symbols-filled">
                    error
                  </span>
                  {error}
                </div>
              )}

              <p className="text-[11px] text-onyx/40 leading-relaxed">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="text-oceanic hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-oceanic hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center h-12 text-base"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin-smooth">
                      progress_activity
                    </span>
                    Creating account…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      person_add
                    </span>
                    Create Free Account
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-onyx/30 mt-5">
            Free forever · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
