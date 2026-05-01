import { tokenStore } from "./auth";
import { ApiError } from "../types";

const BASE = "http://localhost:5000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  // Attempt token refresh on 401
  if (res.status === 401 && withAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${tokenStore.getAccess()}`;
      const retried = await fetch(`${BASE}${path}`, { ...options, headers });
      if (!retried.ok) {
        tokenStore.clear();
        window.location.href = "/login";
        throw new Error("Session expired");
      }
      return retried.status === 204 ? (undefined as T) : retried.json();
    }
    tokenStore.clear();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: "error",
      message: "Unknown error",
    }));
    throw new Error(err.message);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const { data } = await res.json();
    tokenStore.set(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

// ── Auth ──────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (email: string, password: string) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, false),

    login: (email: string, password: string) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, false),
  },

  tasks: {
    list: (page = 1, limit = 10, completed?: boolean) => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (completed !== undefined) params.set("completed", String(completed));
      return request(`/tasks?${params}`);
    },
    create: (data: { title: string; description?: string }) =>
      request("/tasks", { method: "POST", body: JSON.stringify(data) }),

    update: (id: string, data: { title?: string; description?: string; completed?: boolean }) =>
      request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    delete: (id: string) =>
      request(`/tasks/${id}`, { method: "DELETE" }),
  },
};