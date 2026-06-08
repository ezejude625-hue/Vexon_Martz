"use client";
// Forgot password — src/app/(store)/auth/forgot-password/page.js
import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok || res.status === 404) setStep("sent");
      else setError("Something went wrong. Please try again.");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-var(--nav-height))] bg-wheat flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[400px]">
        {/* Icon */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mx-auto mb-4"
            style={{
              background: "rgba(0,63,71,0.08)",
              border: "1px solid rgba(0,63,71,0.15)",
            }}
          >
            <span className="material-symbols-outlined text-oceanic text-3xl">
              {step === "sent" ? "mark_email_read" : "lock_reset"}
            </span>
          </div>
          <h1
            className="text-2xl font-black text-onyx"
            style={{
              fontFamily: '"Roboto Slab",sans-serif',
              letterSpacing: "-0.025em",
            }}
          >
            {step === "sent" ? "Check your inbox" : "Reset password"}
          </h1>
          <p className="text-onyx/50 text-sm mt-2 max-w-xs mx-auto">
            {step === "sent"
              ? `We sent a reset link to ${email}. It expires in 30 minutes.`
              : "Enter your email and we'll send a secure reset link."}
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-7"
          style={{
            border: "1px solid #EDE3D2",
            boxShadow: "0 4px 24px rgba(10,23,29,0.08)",
          }}
        >
          {step === "email" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[20px] pointer-events-none text-onyx/30">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>
              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-700 animate-scale-in"
                  style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}
                >
                  <span className="material-symbols-outlined text-red-500 text-[16px] material-symbols-filled shrink-0">
                    error
                  </span>
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center h-12 text-sm"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin-smooth">
                      progress_activity
                    </span>
                    Sending…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">
                      send
                    </span>
                    Send reset link
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-5">
              <div
                className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto"
                style={{ border: "1px solid #bbf7d0" }}
              >
                <span className="material-symbols-outlined text-emerald-600 text-4xl material-symbols-filled">
                  check_circle
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-onyx">Email sent!</p>
                <p className="text-xs text-onyx/45">
                  Check your spam folder if you don&apos;t see it within a few
                  minutes.
                </p>
              </div>
              <button
                onClick={() => setStep("email")}
                className="flex items-center gap-1.5 text-sm font-semibold text-oceanic hover:underline mx-auto"
              >
                <span className="material-symbols-outlined text-[16px]">
                  refresh
                </span>
                Try a different email
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-5 text-sm text-onyx/45">
          <Link
            href="/auth/login"
            className="flex items-center gap-1 justify-center font-semibold text-oceanic hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
