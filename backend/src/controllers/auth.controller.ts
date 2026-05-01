import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { refreshSchema } from "../utils/validators/auth.validator";
import { AppError } from "../middlewares/errorHandler";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ status: "success", data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ status: "success", data: result });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = refreshSchema.safeParse(req.body);
      if (!parsed.success) return next(new AppError(400, "refreshToken is required"));

      const tokens = await authService.refresh(parsed.data.refreshToken);
      res.status(200).json({ status: "success", data: tokens });
    } catch (err) {
      next(err);
    }
  },
};