export type Role = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  user: { id: string; email: string };
}

export interface PaginatedTasks {
  tasks: Task[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiSuccess<T> {
  status: "success";
  data: T;
}

export interface ApiError {
  status: "error";
  message: string;
}