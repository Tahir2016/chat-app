"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/forgot-password", { email });
      router.push(`/reset-password?token=${res.data.resetToken}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "24px" }}>

      <style>{`
        @media (max-width: 480px) {
          .fp-wrapper { padding: 20px 20px !important; }
          .fp-header { margin-bottom: 22px !important; }
          .fp-logo { width: 52px !important; height: 52px !important; margin-bottom: 12px !important; border-radius: 16px !important; }
          .fp-logo svg { width: 25px !important; height: 25px !important; }
          .fp-title { font-size: 22px !important; }
          .fp-subtitle { font-size: 13px !important; margin-top: 5px !important; }
          .fp-card { padding: 28px 24px !important; border-radius: 18px !important; }
          .fp-wrapper { padding: 20px 20px !important; max-width: 420px !important; }
          .fp-form { gap: 14px !important; }
          .fp-footer { margin-top: 18px !important; font-size: 13px !important; }
        }
      `}</style>

      <div className="fp-wrapper" style={{ width: "100%", maxWidth: "400px" }}>

        <div className="fp-header" style={{ textAlign: "center", marginBottom: "28px" }}>
          <div className="fp-logo" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "18px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", boxShadow: "0 8px 28px rgba(233,30,140,0.35)", marginBottom: "16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="fp-title" style={{ fontSize: "26px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px" }}>Forgot Password</h1>
          <p className="fp-subtitle" style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)" }}>Enter your email to reset your password</p>
        </div>

        <div className="fp-card" style={{ background: "var(--surface)", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 32px rgba(233,30,140,0.08)", border: "1px solid var(--border)" }}>
          <form onSubmit={handleSubmit} className="fp-form" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Email address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                required
                autoComplete="email"
              />
            </div>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--error-bg)", border: "1px solid #fed7d7", borderRadius: "10px", padding: "12px 14px", color: "var(--error)", fontSize: "14px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {error}
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: "4px" }}>
              {loading
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    Sending...
                  </span>
                : "Continue"
              }
            </button>
          </form>

          <p className="fp-footer" style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Remember your password?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
