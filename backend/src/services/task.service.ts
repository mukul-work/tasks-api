import { taskRepository } from "../repositories/task.repository";
import { AppError } from "../middlewares/errorHandler";
import { CreateTaskInput, UpdateTaskInput, TaskQuery } from "../utils/validators/task.validator";
import { Role } from "@prisma/client";

interface RequestingUser {
  id: string;
  role: Role;
}

export const taskService = {
  async getAll(user: RequestingUser, query: TaskQuery) {
    const [tasks, total] = await taskRepository.findAll(user.id, user.role, query);
    return {
      tasks,
      meta: {
        total,
        page:       query.page,
        limit:      query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getById(id: string, user: RequestingUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new AppError(404, "Task not found");

    // USER can only access their own tasks
    if (user.role !== "ADMIN" && task.userId !== user.id) {
      throw new AppError(403, "Insufficient permissions");
    }

    return task;
  },

  async create(input: CreateTaskInput, user: RequestingUser) {
    return taskRepository.create({ ...input, userId: user.id });
  },

  async update(id: string, input: UpdateTaskInput, user: RequestingUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new AppError(404, "Task not found");

    if (user.role !== "ADMIN" && task.userId !== user.id) {
      throw new AppError(403, "Insufficient permissions");
    }

    return taskRepository.update(id, input);
  },

  async delete(id: string, user: RequestingUser) {
    const task = await taskRepository.findById(id);
    if (!task) throw new AppError(404, "Task not found");

    if (user.role !== "ADMIN" && task.userId !== user.id) {
      throw new AppError(403, "Insufficient permissions");
    }

    await taskRepository.delete(id);
  },
};