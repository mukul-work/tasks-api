"use client";
import { useState } from "react";
import { api } from "../lib/api";
import { Task } from "../types";

interface Props {
  task?: Task;
  onDone: () => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onDone, onCancel }: Props) {
  const [title, setTitle]       = useState(task?.title ?? "");
  const [desc, setDesc]         = useState(task?.description ?? "");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");
    try {
      if (task) {
        await api.tasks.update(task.id, { title, description: desc || undefined });
      } else {
        await api.tasks.create({ title, description: desc || undefined });
      }
      onDone();
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: "var(--bg-3)",
      border: "1px solid var(--border-hi)",
      borderRadius: "var(--radius)",
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.1em" }}>
        {task ? "// EDIT TASK" : "// NEW TASK"}
      </span>

      {error && <p className="error-msg">{error}</p>}

      <div className="field">
        <label>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
      </div>

      <div className="field">
        <label>Description (optional)</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Details..." />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="btn" onClick={onCancel} disabled={loading}>CANCEL</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "SAVING..." : task ? "UPDATE" : "CREATE"}
        </button>
      </div>
    </div>
  );
}