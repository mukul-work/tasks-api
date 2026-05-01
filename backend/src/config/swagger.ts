import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { Application } from "express";

export const setupSwagger = (app: Application): void => {
  const spec = YAML.load(path.join(__dirname, "../../openapi.yaml"));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(spec, {
    customSiteTitle: "Task API Docs",
    swaggerOptions: { persistAuthorization: true },
  }));
};