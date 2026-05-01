import { Request, Response, NextFunction } from "express";
import { taskService } from "../services/task.service";
import { taskQuerySchema } from "../utils/validators/task.validator";
import { AppError } from "../middlewares/errorHandler";
import { Role } from "@prisma/client";

// Ensures req.user is present (authenticate middleware must precede all routes)
const getUser = (req: Request) => {
  if (!req.user) throw new AppError(401, "Unauthenticated");
  return req.user as { id: string; role: Role };
};

export const taskController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = taskQuerySchema.parse(req.query);
      const result = await taskService.getAll(getUser(req), query);
      res.status(200).json({ status: "success", data: result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getById(req.params.id, getUser(req));
      res.status(200).json({ status: "success", data: task });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create(req.body, getUser(req));
      res.status(201).json({ status: "success", data: task });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.update(req.params.id, req.body, getUser(req));
      res.status(200).json({ status: "success", data: task });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id, getUser(req));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};