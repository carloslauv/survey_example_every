import { NextResponse } from "next/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing[0]) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const [user] = await db
      .insert(users)
      .values({
        name: name || null,
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, email: users.email, name: users.name })

    return NextResponse.json({ user }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
