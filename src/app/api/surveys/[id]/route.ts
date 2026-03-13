import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { surveys, questions } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const surveyQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.surveyId, id))
    .orderBy(asc(questions.order))

  return NextResponse.json({ ...survey, questions: surveyQuestions })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const updates: Partial<typeof survey> = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.isPublished !== undefined) updates.isPublished = body.isPublished
  updates.updatedAt = new Date()

  const [updated] = await db.update(surveys).set(updates).where(eq(surveys.id, id)).returning()
  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.delete(surveys).where(eq(surveys.id, id))
  return NextResponse.json({ success: true })
}
