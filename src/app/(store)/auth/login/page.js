"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [focused, setFocused] = useState("");

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }
      // JWT cookie is set by the API — no localStorage needed
      router.push(data.data.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] flex">
      {/* ── Left panel — decorative ──────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative overflow-hidden flex-col justify-between p-12"
        style={{
          background:
            "linear-gradient(155deg, #0A171D 0%, #1C3040 40%, #003F47 100%)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 70%, rgba(255,189,118,0.10) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,85,102,0.5) 0%, transparent 40%)",
          }}
        />
        <div className="absolute bottom-1/3 right-0 w-80 h-80 rounded-full border border-white/5 translate-x-1/3" />
        <div className="absolute bottom-1/3 right-0 w-52 h-52 rounded-full border border-white/8 translate-x-1/3" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
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
              style={{
                fontFamily: '"Roboto Slab", sans-serif',
                fontWeight: 800,
              }}
            >
              Vexon<span className="text-nectarine">Mart</span>
            </span>
          </Link>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/12 rounded-full px-4 py-2 mb-6">
            <span className="material-symbols-outlined text-nectarine text-[14px] material-symbols-filled">
              verified
            </span>
            <span className="text-white/60 text-[11px] font-semibold tracking-[0.1em] uppercase">
              Secure Login
            </span>
          </div>
          <h2
            className="text-white leading-tight mb-4"
            style={{
              fontFamily: '"Roboto Slab", sans-serif',
              fontWeight: 800,
              fontSize: "2.2rem",
              letterSpacing: "-0.03em",
            }}
          >
            Welcome back,
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FFBD76, #E8A355)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              good to see you
            </span>
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs">
            Sign in to access your orders, wishlist, and account settings.
          </p>
          <div className="flex flex-wrap gap-2 mt-8">
            {["2M+ Customers", "Secure Checkout", "Fast Delivery"].map((s) => (
              <span
                key={s}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 border border-white/10 rounded-full text-white/50 text-xs font-medium"
              >
                <span className="material-symbols-outlined text-nectarine text-[13px] material-symbols-filled">
                  check_circle
                </span>
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="relative card-glass p-5 rounded-2xl">
          <div className="flex gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className="material-symbols-outlined text-nectarine-dark text-sm star-filled"
              >
                star
              </span>
            ))}
          </div>
          <p className="text-white/60 text-sm leading-relaxed italic">
            "The best shopping platform I've used. Fast, reliable, and the deals
            are unbeatable!"
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-8 h-8 rounded-full bg-nectarine/20 flex items-center justify-center font-black text-nectarine text-sm">
              A
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold">Amara Osei</p>
              <p className="text-white/35 text-[11px]">
                Verified Buyer · Lagos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ───────────────────── */}
      <div className="flex-1 flex items-center justify-center px-5 py-12 bg-wheat">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <h1
              className="text-onyx mb-1.5"
              style={{
                fontFamily: '"Roboto Slab", sans-serif',
                fontWeight: 800,
                fontSize: "1.85rem",
                letterSpacing: "-0.025em",
              }}
            >
              Sign in
            </h1>
            <p className="text-onyx/50 text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-oceanic font-semibold hover:underline"
              >
                Create one free
              </Link>
            </p>
          </div>

          <div
            className="bg-white rounded-2xl p-7"
            style={{
              border: "1px solid #EDE3D2",
              boxShadow:
                "0 4px 24px rgba(10,23,29,0.08), 0 1px 6px rgba(10,23,29,0.05)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none transition-colors duration-200"
                    style={{
                      color: focused === "email" ? "#003F47" : "#9AAAB5",
                    }}
                  >
                    mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused("")}
                    placeholder="you@example.com"
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-semibold text-oceanic hover:text-oceanic-light transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none transition-colors duration-200"
                    style={{
                      color: focused === "password" ? "#003F47" : "#9AAAB5",
                    }}
                  >
                    lock
                  </span>
                  <input
                    name="password"
                    type={showPwd ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused("")}
                    placeholder="Your password"
                    className="input-field pl-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-onyx/30 hover:text-onyx/60 hover:bg-wheat transition-all duration-150"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPwd ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center h-12 text-base mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin-smooth">
                      progress_activity
                    </span>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-wheat-dark" />
              <span className="text-xs text-onyx/35 font-medium whitespace-nowrap">
                or continue with
              </span>
              <div className="flex-1 h-px bg-wheat-dark" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Google",
                  svg: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  svg: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M22 12C22 6.477 17.523 2 12 2S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
                    </svg>
                  ),
                },
              ].map((provider) => (
                <button
                  key={provider.label}
                  type="button"
                  className="flex h-11 items-center justify-center gap-2.5 rounded-xl text-sm font-semibold text-onyx/65 hover:text-onyx transition-all duration-200"
                  style={{
                    border: "1.5px solid #E2D5C0",
                    background: "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#003F47";
                    e.currentTarget.style.background = "#F5EBD8";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2D5C0";
                    e.currentTarget.style.background = "#FFFFFF";
                  }}
                >
                  {provider.svg}
                  {provider.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-onyx/35 mt-6">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-oceanic hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-oceanic hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
