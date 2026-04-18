"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

function VerifyForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setTimeout(() => {
        setStatus("error");
        setMessage("Invalid verification link.");
      }, 0);
    } else {
      api.get(`/auth/verify?token=${token}`)
        .then((res) => { setStatus("success"); setMessage(res.data.message); })
        .catch((err) => { setStatus("error"); setMessage(err.response?.data?.error || "Verification failed."); });
    }
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "400px", textAlign: "center" }}>

        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "18px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", boxShadow: "0 8px 28px rgba(233,30,140,0.35)", marginBottom: "20px" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            {status === "success" && <polyline points="20 6 9 17 4 12" />}
            {status === "error" && <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
            {status === "loading" && <path d="M21 12a9 9 0 1 1-6.219-8.56" />}
          </svg>
        </div>

        <div style={{ background: "var(--surface)", borderRadius: "20px", padding: "32px", boxShadow: "0 4px 32px rgba(233,30,140,0.08)", border: "1px solid var(--border)" }}>
          {status === "loading" && (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)" }}>Verifying your email...</h2>
              <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)" }}>Please wait a moment.</p>
            </>
          )}
          {status === "success" && (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)" }}>Email Verified! 🎉</h2>
              <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-muted)" }}>{message}</p>
              <Link href="/login" style={{ display: "inline-block", marginTop: "20px", padding: "12px 28px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
                Go to Login
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text)" }}>Verification Failed</h2>
              <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--error)" }}>{message}</p>
              <Link href="/register" style={{ display: "inline-block", marginTop: "20px", padding: "12px 28px", background: "linear-gradient(135deg, #ff4db8, #e91e8c)", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
                Register Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return <Suspense><VerifyForm /></Suspense>;
}
