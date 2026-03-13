import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { surveys } from "@/db/schema"
import { eq } from "drizzle-orm"
import { nanoid } from "nanoid"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userSurveys = await db
    .select()
    .from(surveys)
    .where(eq(surveys.userId, session.user.id))
    .orderBy(surveys.createdAt)

  return NextResponse.json(userSurveys)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { title, description } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 })

  const [survey] = await db
    .insert(surveys)
    .values({
      title: title.trim(),
      description: description?.trim() || null,
      userId: session.user.id,
      shareToken: nanoid(10),
    })
    .returning()

  return NextResponse.json(survey, { status: 201 })
}
