"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api";
import { tokenStore } from "../../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const res: any = await api.auth.login(email, password);
      tokenStore.set(res.data.accessToken, res.data.refreshToken);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--bg)",
    }}>
      {/* Grid lines background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        opacity: 0.3,
      }} />

      <div className="fade-up" style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 380,
        background: "var(--bg-2)",
        border: "1px solid var(--border-hi)",
        borderRadius: "var(--radius)",
        padding: 32,
        display: "flex", flexDirection: "column", gap: 24,
      }}>
        {/* Header */}
        <div>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.15em", marginBottom: 8 }}>
            // TASKAPI v1.0
          </p>
          <h1 style={{ fontFamily: "var(--mono)", fontSize: 22, color: "var(--text-hi)", fontWeight: 600 }}>
            SIGN IN
          </h1>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", padding: "11px 16px" }}>
          {loading ? "AUTHENTICATING..." : "SIGN IN →"}
        </button>

        <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)", textAlign: "center" }}>
          No account? <Link href="/register">REGISTER</Link>
        </p>
      </div>
    </main>
  );
}