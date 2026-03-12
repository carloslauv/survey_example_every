"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing[0]) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  await db.insert(users).values({
    name: data.name,
    email: data.email,
    hashedPassword,
  });

  return { success: true };
}
