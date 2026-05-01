import { prisma } from "../config/prisma";
import { Role } from "@prisma/client";

export interface CreateUserData {
  email: string;
  password: string;
  role?: Role;
}

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findById: (id: string) =>
    prisma.user.findUnique({ where: { id } }),

  create: (data: CreateUserData) =>
    prisma.user.create({
      data,
      select: { id: true, email: true, role: true, createdAt: true },
    }),
};