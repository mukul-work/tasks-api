"use client";
import { useRouter } from "next/navigation";
import { tokenStore } from "../lib/auth";

interface Props {
  email: string;
  role: "USER" | "ADMIN";
}

export default function Navbar({ email, role }: Props) {
  const router = useRouter();
  const logout = () => { tokenStore.clear(); router.push("/login"); };

  return (
    <nav style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 24px",
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-2)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 13,
        color: "var(--accent)", letterSpacing: "0.1em",
      }}>
        ▸ TASKAPI
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)" }}>
          {email}
        </span>

        {role === "ADMIN" && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10,
            background: "var(--accent)", color: "var(--bg)",
            padding: "2px 8px", borderRadius: "var(--radius)", fontWeight: 600,
            letterSpacing: "0.08em",
          }}>
            ADMIN
          </span>
        )}

        <span style={{
          fontFamily: "var(--mono)", fontSize: 10,
          border: "1px solid var(--border-hi)", color: "var(--text-dim)",
          padding: "2px 8px", borderRadius: "var(--radius)",
        }}>
          {role}
        </span>

        <button className="btn" onClick={logout}>LOGOUT</button>
      </div>
    </nav>
  );
}