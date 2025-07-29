import { auth } from "@/auth";
import { createHono } from "@/lib/hono";

const app = createHono().on(["POST", "GET"], "/**", (c) =>
  auth.handler(c.req.raw),
);

export default app;
