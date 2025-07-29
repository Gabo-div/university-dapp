import { db } from "@/db";
import { userInfo, users, wallets } from "@/db/schema";
import { university } from "@/lib/contracts";
import { createHono } from "@/lib/hono";
import { publicClient } from "@/lib/viemClients";
import { walletRequiredMiddleware } from "@/middlewares/walletRequired";
import { getUserRoles, UserRole, userRolesSchema } from "@/services/users";
import { zValidator } from "@hono/zod-validator";
import { and, eq, getTableColumns } from "drizzle-orm";
import { mnemonicToAccount } from "viem/accounts";
import { z } from "zod";

const app = createHono()
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        email: z.string().email().optional(),
        wallet: z
          .string()
          .refine((val) => val.startsWith("0x") && val.length === 42)
          .optional(),
      }),
    ),
    async (c) => {
      const queries = c.req.valid("query");

      if (Object.keys(queries).length === 0) {
        return c.json({ data: [] });
      }

      const data = await db
        .select({
          user: { ...getTableColumns(users), wallet: wallets.address },
        })
        .from(users)
        .leftJoin(
          wallets,
          and(eq(users.id, wallets.userId), eq(wallets.active, true)),
        )
        .where(
          and(
            queries.email ? eq(users.email, queries.email) : undefined,
            queries.wallet
              ? eq(wallets.address, queries.wallet as `0x${string}`)
              : undefined,
          ),
        );

      return c.json({ data: data.map(({ user }) => user) });
    },
  )
  .get("/:id/roles", async (c) => {
    const userId = c.req.param("id");
    const roles = await getUserRoles(userId);

    return c.json({
      data: {
        roles,
      },
    });
  })
  .get("/:id/wallets", async (c) => {
    const userId = c.req.param("id");

    const userWallets = await db
      .select({
        id: wallets.id,
        address: wallets.address,
        active: wallets.active,
        userId: wallets.userId,
      })
      .from(wallets)
      .where(eq(wallets.userId, userId));

    const walletsWithBalance = await Promise.all(
      userWallets.map(async (wallet) => {
        const balance = await publicClient.getBalance({
          address: wallet.address,
        });

        return {
          ...wallet,
          balance: balance.toString(),
        };
      }),
    );

    return c.json({ data: walletsWithBalance });
  })
  .get("/:id/info", async (c) => {
    const userId = c.req.param("id");

    const info = await db
      .select()
      .from(userInfo)
      .where(eq(userInfo.userId, userId))
      .get();

    return c.json({ data: info });
  })
  .post(
    "/:id/info",
    zValidator(
      "json",
      z.object({
        firstName: z.string().trim().min(1),
        middleName: z.string().optional(),
        lastName: z.string().trim().min(1),
        secondLastName: z.string().optional(),
        sex: z.union([z.literal("M"), z.literal("F")]),
        phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        birthDate: z.coerce.date(),
        birthCountry: z.string().min(1),
        birthState: z.string().min(1),
        birthCity: z.string().min(1),
        address: z.string().min(1),
        campusId: z.coerce.bigint(),
        careerId: z.coerce.bigint(),
      }),
    ),
    async (c) => {
      const userId = c.req.param("id");
      const {
        firstName,
        middleName,
        lastName,
        secondLastName,
        sex,
        phoneNumber,
        birthDate,
        birthCountry,
        birthState,
        birthCity,
        address,
        campusId,
        careerId,
      } = c.req.valid("json");

      const user = c.get("user");

      if (user?.id !== userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const existingInfo = await db
        .select({ id: userInfo.id })
        .from(userInfo)
        .where(eq(userInfo.userId, userId))
        .get();

      if (existingInfo) {
        return c.json({ error: "User info already exists" }, 400);
      }

      const info = await db
        .insert(userInfo)
        .values({
          userId,
          firstName,
          middleName: middleName || null,
          lastName,
          secondLastName: secondLastName || null,
          sex: sex === "M",
          phoneNumber,
          birthDate: birthDate.toDateString(),
          birthCountry,
          birthState,
          birthCity,
          address,
          campusId: campusId.toString(),
          careerId: careerId.toString(),
        })
        .returning()
        .get();

      return c.json({ data: info });
    },
  )
  .put(
    "/:id/info",
    zValidator(
      "json",
      z
        .object({
          firstName: z.string().trim().min(1),
          middleName: z.string().optional(),
          lastName: z.string().trim().min(1),
          secondLastName: z.string().optional(),
          sex: z.union([z.literal("M"), z.literal("F")]),
          phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/),
          birthDate: z.coerce.date(),
          birthCountry: z.string().min(1),
          birthState: z.string().min(1),
          birthCity: z.string().min(1),
          address: z.string().min(1),
        })
        .partial(),
    ),
    async (c) => {
      const userId = c.req.param("id");
      const {
        firstName,
        middleName,
        lastName,
        secondLastName,
        sex,
        phoneNumber,
        birthDate,
        birthCountry,
        birthState,
        birthCity,
        address,
      } = c.req.valid("json");

      const user = c.get("user");

      if (user?.id !== userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const existingInfo = await db
        .select({ id: userInfo.id })
        .from(userInfo)
        .where(eq(userInfo.userId, userId))
        .get();

      if (!existingInfo) {
        return c.json({ error: "User info does not exist" }, 404);
      }

      const info = await db
        .update(userInfo)
        .set({
          verified: false,
          firstName,
          middleName: middleName || null,
          lastName,
          secondLastName: secondLastName || null,
          sex: sex === "M",
          phoneNumber,
          birthDate: birthDate?.toDateString(),
          birthCountry,
          birthState,
          birthCity,
          address,
        })
        .returning()
        .get();

      return c.json({ data: info });
    },
  )
  .post(
    "/:id/validate",
    walletRequiredMiddleware(),
    zValidator(
      "json",
      z.object({
        roles: userRolesSchema.array(),
      }),
    ),
    async (c) => {
      const userId = c.req.param("id");

      const admin = c.get("user");

      if (!admin) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const adminRoles = await getUserRoles(admin.id);
      if (!adminRoles.includes(UserRole.Administrator)) {
        return c.json({ error: "Forbidden" }, 403);
      }

      const existingInfo = await db
        .select({ id: userInfo.id, careerId: userInfo.careerId })
        .from(userInfo)
        .where(eq(userInfo.userId, userId))
        .get();

      if (!existingInfo) {
        return c.json({ error: "User info does not exist" }, 404);
      }

      const activeWallet = await db
        .select({ address: wallets.address })
        .from(wallets)
        .where(and(eq(wallets.userId, userId), eq(wallets.active, true)))
        .get();

      if (!activeWallet) {
        return c.json({ error: "User wallet does not exist" }, 404);
      }

      const { roles } = c.req.valid("json");

      const phrase = c.get("phrase");

      const account = mnemonicToAccount(phrase);

      await university.write.addUser(
        [activeWallet.address, roles, BigInt(existingInfo.careerId)],
        {
          account,
        },
      );

      await db
        .update(userInfo)
        .set({
          verified: true,
        })
        .where(eq(userInfo.userId, userId));

      return c.json({ data: { message: "User info validated successfully" } });
    },
  );

export default app;
