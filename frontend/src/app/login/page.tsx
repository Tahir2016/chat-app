"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "true")
      setSuccess("Account created! Please sign in.");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(form.email, form.password);
      localStorage.setItem("token", data.token);
      router.push("/chat");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg)" }}>

      <style>{`
        @media (max-width: 480px) {
          .login-card { padding: 24px 20px !important; }
          .login-logo { width: 52px !important; height: 52px !important; margin-bottom: 12px !important; }
          .login-logo svg { width: 26px !important; height: 26px !important; }
          .login-title { font-size: 22px !important; }
          .login-subtitle { font-size: 13px !important; }
          .login-header { margin-bottom: 24px !important; }
          .login-panel { padding: 20px 16px !important; }
        }
      `}</style>

      {/* Left decorative panel */}
      <div style={{ display: "none", flex: 1, background: "linear-gradient(160deg, #ff4db8 0%, #e91e8c 50%, #c2185b 100%)", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "24px", padding: "48px" }} className="left-panel">
        <div style={{ width: "80px", height: "80px", borderRadius: "24px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#fff" }}>ChatApp</h2>
          <p style={{ color: "rgba(255,255,255,0.8)", marginTop: "10px", fontSize: "16px", lineHeight: 1.6 }}>Connect with friends and family in real time</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Logo */}
          <div className="login-header" style={{ textAlign: "center", marginBottom: "36px" }}>
            <div className="login-logo" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "68px", height: "68px", borderRadius: "22px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", boxShadow: "0 8px 28px rgba(233,30,140,0.35)", marginBottom: "18px" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
              </svg>
            </div>
            <h1 className="login-title" style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>Welcome back 👋</h1>
            <p className="login-subtitle" style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)" }}>Sign in to continue to ChatApp</p>
          </div>

          {/* Card */}
          <div className="login-card" style={{ background: "var(--surface)", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 32px rgba(233,30,140,0.08)", border: "1px solid var(--border)" }}>

            {success && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "10px", padding: "12px 14px", marginBottom: "20px", color: "#276749", fontSize: "14px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Email address</label>
                <input className="auth-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)" }}>Password</label>
                  <Link href="/forgot-password" style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Forgot password?</Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input className="auth-input" type={showPassword ? "text" : "password"} name="password" placeholder="Your password" value={form.password} onChange={handleChange} required autoComplete="current-password" style={{ paddingRight: "48px" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                    {showPassword
                      ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
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
                      Signing in...
                    </span>
                  : "Sign In"
                }
              </button>
            </form>

            <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
