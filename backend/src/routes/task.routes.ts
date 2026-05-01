import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createTaskSchema, updateTaskSchema } from "../utils/validators/task.validator";

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get(   "/",    taskController.getAll);
router.get(   "/:id", taskController.getById);
router.post(  "/",    validate(createTaskSchema), taskController.create);
router.patch( "/:id", validate(updateTaskSchema), taskController.update);
router.delete("/:id", taskController.delete);

export default router;