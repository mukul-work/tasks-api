import { prisma } from "../config/prisma";
import { CreateTaskInput, UpdateTaskInput, TaskQuery } from "../utils/validators/task.validator";

export const taskRepository = {
  findAll: (userId: string, role: string, query: TaskQuery) => {
    const where: Record<string, unknown> = {};

    // ADMIN sees all tasks; USER sees only their own
    if (role !== "ADMIN") where.userId = userId;
    if (query.completed !== undefined) {
      where.completed = query.completed === "true";
    }

    const skip = (query.page - 1) * query.limit;

    return prisma.$transaction([
      prisma.task.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, email: true } } },
      }),
      prisma.task.count({ where }),
    ]);
  },

  findById: (id: string) =>
    prisma.task.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    }),

  create: (data: CreateTaskInput & { userId: string }) =>
    prisma.task.create({
      data,
      include: { user: { select: { id: true, email: true } } },
    }),

  update: (id: string, data: UpdateTaskInput) =>
    prisma.task.update({
      where: { id },
      data,
      include: { user: { select: { id: true, email: true } } },
    }),

  delete: (id: string) =>
    prisma.task.delete({ where: { id } }),
};