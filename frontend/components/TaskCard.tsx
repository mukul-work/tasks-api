"use client";
import { useState } from "react";
import { Task } from "../types";
import { api } from "../lib/api";
import TaskForm from "./TaskForm";

interface Props {
  task: Task;
  onRefresh: () => void;
  role?: "USER" | "ADMIN";
}

export default function TaskCard({ task, onRefresh, role }: Props) {
  const [editing, setEditing]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleComplete = async () => {
    try {
      await api.tasks.update(task.id, { completed: !task.completed });
      onRefresh();
    } catch {}
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.tasks.delete(task.id);
      onRefresh();
    } catch { setDeleting(false); }
  };

  if (editing) {
    return (
      <TaskForm
        task={task}
        onDone={() => { setEditing(false); onRefresh(); }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div style={{
      background: "var(--bg-2)",
      border: `1px solid ${task.completed ? "var(--success)" : "var(--border)"}`,
      borderRadius: "var(--radius)",
      padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 8,
      transition: "border-color 0.2s",
      opacity: task.completed ? 0.7 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <button
            onClick={toggleComplete}
            style={{
              width: 16, height: 16,
              border: `1px solid ${task.completed ? "var(--success)" : "var(--border-hi)"}`,
              background: task.completed ? "var(--success)" : "transparent",
              borderRadius: "var(--radius)", cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 10,
            }}
            title="Toggle complete"
          >
            {task.completed ? "✓" : ""}
          </button>

          <span style={{
            fontFamily: "var(--mono)", fontSize: 13, color: "var(--text-hi)",
            textDecoration: task.completed ? "line-through" : "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {task.title}
          </span>
        </div>

        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button className="btn" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setEditing(true)}>
            EDIT
          </button>
          <button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 11 }} onClick={handleDelete} disabled={deleting}>
            {deleting ? "..." : "DEL"}
          </button>
        </div>
      </div>

      {task.description && (
        <p style={{ fontSize: 12, color: "var(--text-dim)", paddingLeft: 26, lineHeight: 1.5 }}>
          {task.description}
        </p>
      )}

      <div style={{ display: "flex", gap: 16, paddingLeft: 26, alignItems: "center" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-dim)" }}>
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
        <span style={{
          fontFamily: "var(--mono)", fontSize: 10,
          color: task.completed ? "var(--success)" : "var(--text-dim)",
        }}>
          {task.completed ? "DONE" : "PENDING"}
        </span>

        {/* Admin-only: show task owner */}
        {role === "ADMIN" && (
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10,
            color: "var(--accent)", marginLeft: "auto",
          }}>
            {task.user.email}
          </span>
        )}
      </div>
    </div>
  );
}