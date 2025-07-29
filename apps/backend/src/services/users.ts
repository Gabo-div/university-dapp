import { university } from "@/lib/contracts";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as z from "zod";

export enum UserRole {
  Student = 0,
  Professor = 1,
  PregradeCoordinator = 2,
  PostgradeCoordinator = 3,
  CareerCoordinator = 4,
  Administrator = 5,
}

export const userRolesSchema = z.nativeEnum(UserRole);

export const getUserRoles = async (userId: string) => {
  const userWallet = await db
    .select({
      address: wallets.address,
    })
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .get();

  if (!userWallet) {
    throw "User wallet not found";
  }

  const roles = new Set<UserRole>();

  const owner = await university.read.owner();
  const user = await university.read.getUser([userWallet.address]);

  if (userWallet.address === owner) {
    roles.add(UserRole.Administrator);
  }

  user.roles.forEach((r) => roles.add(r));

  return Array.from(roles);
};
