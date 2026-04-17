"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    setError("");
    try {
      await register(form.name, form.email, form.password);
      setCountdown(3);
      let secs = 3;
      const interval = setInterval(() => {
        secs -= 1;
        setCountdown(secs);
        if (secs === 0) { clearInterval(interval); router.push("/login?registered=true"); }
      }, 1000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "16px 24px" }}>

      <style>{`
        @media (max-width: 480px) {
          .reg-wrapper { padding: 10px 18px !important; }
          .reg-card { padding: 18px 16px !important; border-radius: 16px !important; }
          .reg-logo { width: 42px !important; height: 42px !important; margin-bottom: 8px !important; border-radius: 12px !important; }
          .reg-logo svg { width: 21px !important; height: 21px !important; }
          .reg-title { font-size: 19px !important; }
          .reg-subtitle { font-size: 12px !important; margin-top: 3px !important; }
          .reg-header { margin-bottom: 12px !important; }
          .reg-form { gap: 10px !important; }
          .reg-form label { font-size: 13px !important; }
          .reg-form .auth-input { padding: 10px 13px !important; font-size: 14px !important; border-radius: 10px !important; }
          .reg-footer { margin-top: 12px !important; font-size: 13px !important; }
          .auth-btn { padding: 12px !important; font-size: 14px !important; border-radius: 10px !important; }
        }
      `}</style>

      <div className="reg-wrapper" style={{ width: "100%", maxWidth: "400px" }}>

        {/* Logo */}
        <div className="reg-header" style={{ textAlign: "center", marginBottom: "20px" }}>
          <div className="reg-logo" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", boxShadow: "0 6px 20px rgba(233,30,140,0.35)", marginBottom: "12px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="white" />
            </svg>
          </div>
          <h1 className="reg-title" style={{ fontSize: "22px", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>Create account ✨</h1>
          <p className="reg-subtitle" style={{ marginTop: "4px", fontSize: "13px", color: "var(--text-muted)" }}>Join ChatApp and start connecting</p>
        </div>

        {/* Card */}
        <div className="reg-card" style={{ background: "var(--surface)", borderRadius: "20px", padding: "24px", boxShadow: "0 4px 32px rgba(233,30,140,0.08)", border: "1px solid var(--border)", position: "relative" }}>

          {/* X close button */}
          <button onClick={() => router.push("/login")} style={{ position: "absolute", top: "14px", right: "14px", width: "18px", height: "18px", borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--primary)"; (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "var(--primary)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
          <form onSubmit={handleSubmit} className="reg-form" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>Name</label>
              <input className="auth-input" type="text" name="name" placeholder="e.g. John" value={form.name} onChange={handleChange} required autoComplete="name" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>Email address</label>
              <input className="auth-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required autoComplete="email" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-secondary)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className="auth-input" type={showPassword ? "text" : "password"} name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required autoComplete="new-password" style={{ paddingRight: "48px" }} />
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

            {countdown !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: "10px", padding: "10px 14px", color: "#276749", fontSize: "13px", fontWeight: 600 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                Account created! Redirecting in {countdown}s...
              </div>
            )}

            <button className="auth-btn" type="submit" disabled={loading || countdown !== null} style={{ marginTop: "2px" }}>
              {loading
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                    Creating account...
                  </span>
                : "Create Account"
              }
            </button>
          </form>

          <p className="reg-footer" style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
