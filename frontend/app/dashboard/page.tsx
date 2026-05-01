"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { tokenStore } from "../../lib/auth";
import { Task } from "../../types";
import Navbar from "../../components/NavBar";
import TaskCard from "../../components/TaskCard";
import TaskForm from "../../components/TaskForm";

type Filter = "all" | "pending" | "done";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [role, setRole]         = useState<"USER" | "ADMIN">("USER");
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [meta, setMeta]         = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [filter, setFilter]     = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const token = tokenStore.getAccess();
    if (!token) { router.push("/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.email ?? "");
      setRole(payload.role ?? "USER");
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchTasks = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      const completed = filter === "all" ? undefined : filter === "done";
      const res: any = await api.tasks.list(page, 10, completed);
      setTasks(res.data.tasks);
      setMeta(res.data.meta);
    } catch (e: any) {
      setError(e.message ?? "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(1); }, [fetchTasks]);

  const filterBtn = (f: Filter, label: string) => (
    <button
      className="btn"
      onClick={() => setFilter(f)}
      style={{
        borderColor: filter === f ? "var(--accent)" : undefined,
        color: filter === f ? "var(--accent)" : undefined,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar email={email} role={role} />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" }}>
              // DASHBOARD
            </p>
            <h1 style={{ fontFamily: "var(--mono)", fontSize: 20, color: "var(--text-hi)", fontWeight: 600 }}>
              TASKS <span style={{ color: "var(--text-dim)", fontSize: 14 }}>({meta.total})</span>
            </h1>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ CANCEL" : "+ NEW TASK"}
          </button>
        </div>

        {/* Admin banner */}
        {role === "ADMIN" && (
          <div style={{
            fontFamily: "var(--mono)", fontSize: 11,
            background: "#1a1500", border: "1px solid var(--accent)",
            borderRadius: "var(--radius)", padding: "8px 14px",
            color: "var(--accent)", marginBottom: 20, letterSpacing: "0.05em",
          }}>
            ⬡ ADMIN MODE — viewing all users' tasks
          </div>
        )}

        {/* New task form */}
        {showForm && (
          <div style={{ marginBottom: 20 }} className="fade-up">
            <TaskForm
              onDone={() => { setShowForm(false); fetchTasks(1); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {filterBtn("all", "ALL")}
          {filterBtn("pending", "PENDING")}
          {filterBtn("done", "DONE")}
        </div>

        <div style={{ borderTop: "1px solid var(--border)", marginBottom: 20 }} />

        {error && <p className="error-msg" style={{ marginBottom: 16 }}>{error}</p>}

        {/* Task list */}
        {loading ? (
          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)" }}>
            LOADING...
          </p>
        ) : tasks.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 0",
            fontFamily: "var(--mono)", color: "var(--text-dim)", fontSize: 12,
          }}>
            <p style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>▭</p>
            <p>NO TASKS FOUND</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="fade-up">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} onRefresh={() => fetchTasks(meta.page)} role={role} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 24 }}>
            <button className="btn" disabled={meta.page === 1} onClick={() => fetchTasks(meta.page - 1)}>← PREV</button>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)", alignSelf: "center" }}>
              {meta.page} / {meta.totalPages}
            </span>
            <button className="btn" disabled={meta.page === meta.totalPages} onClick={() => fetchTasks(meta.page + 1)}>NEXT →</button>
          </div>
        )}
      </main>
    </div>
  );
}