import { db } from "@/db";
import { userInfo, users } from "@/db/schema";
import { createHono } from "@/lib/hono";
import { eq } from "drizzle-orm";

const app = createHono().get("/pending-validations", async (c) => {
  const data = await db
    .select({
      user: users,
      userInfo: userInfo,
    })
    .from(userInfo)
    .innerJoin(users, eq(users.id, userInfo.userId))
    .where(eq(userInfo.verified, false));

  return c.json({
    data,
  });
});

export default app;
