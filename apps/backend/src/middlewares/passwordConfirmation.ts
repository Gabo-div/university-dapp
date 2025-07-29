import { createMiddleware } from "hono/factory";
import { auth } from "@/auth";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const confirmPasswordMidleware = () =>
  createMiddleware<
    {
      Variables: {
        password: string
        user: typeof auth.$Infer.Session.user | null;
        session: typeof auth.$Infer.Session.session | null;
      }
    }
  >(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401,
      );
    }

    const { password } = await c.req.json()

    if (!password) {
      return c.json({
        error: "Password confirmation is required"
      }, 400)
    }

    const userAccount = await db
      .select({ password: accounts.password })
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, user.id),
          eq(accounts.providerId, "credential"),
        ),
      )
      .get();

    if (!userAccount || !userAccount.password) {
      return c.json(
        {
          error: "Unauthorized",
        },
        401,
      );
    }

    const authContext = await auth.$context;
    const isPasswordEqual = await authContext.password.verify({
      hash: userAccount.password,
      password,
    });

    if (!isPasswordEqual) {
      return c.json(
        {
          error: "Invalid password",
        },
        400,
      );
    }

    c.set('password', password)

    return next();
  });
