import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { createHono } from "./lib/hono";
import { includeUserMidleware } from "./middlewares/auth";

import authRoutes from "@/routes/auth";
import usersRoutes from "@/routes/users";
import adminRoutes from "@/routes/admin";
import studentRoutes from "@/routes/student";
import walletsRoutes from "@/routes/wallets";
import pricesRoutes from "@/routes/prices";
import transactionsRoutes from "@/routes/transactions";
import campusesRoutes from "@/routes/campuses";
import careersRoutes from "@/routes/careers";
import pensumsRoutes from "@/routes/pensums";
import subjectsRoutes from "@/routes/subjects";

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export const app = createHono()
  .basePath("/api")
  .use(logger())
  .use(
    cors({
      origin: "http://localhost:3001",
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["PUT", "POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    }),
  )
  .use(includeUserMidleware())
  .route("/auth", authRoutes)
  .route("/users", usersRoutes)
  .route("/admin", adminRoutes)
  .route("/student", studentRoutes)
  .route("/wallets", walletsRoutes)
  .route("/prices", pricesRoutes)
  .route("/transactions", transactionsRoutes)
  .route("/campuses", campusesRoutes)
  .route("/careers", careersRoutes)
  .route("/pensums", pensumsRoutes)
  .route("/subjects", subjectsRoutes);
