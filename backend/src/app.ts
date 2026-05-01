import express, { Application } from "express";
import 'dotenv/config';
import { config } from "./config/env";
import { setupSwagger } from "./config/swagger";
import router from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (_req.method === "OPTIONS") { res.sendStatus(204); return; }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);
app.use("/api/v1", router);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[server] Running in ${config.nodeEnv} mode on port ${config.port}`);
  console.log(`[docs]   http://localhost:${config.port}/api/docs`);
});

export default app;