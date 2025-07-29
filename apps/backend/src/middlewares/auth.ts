import { auth } from "@/auth";
import { createMiddleware } from "hono/factory";

export const includeUserMidleware = () =>
  createMiddleware(async (c, next) => {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    c.set("user", session ? session.user : null);
    c.set("session", session ? session.session : null);

    return next();
  });
