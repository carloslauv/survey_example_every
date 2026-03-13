import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { surveys, questions } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, questionId } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if (body.text !== undefined) updates.text = body.text
  if (body.type !== undefined) updates.type = body.type
  if (body.required !== undefined) updates.required = body.required
  if (body.options !== undefined) updates.options = body.options ? JSON.stringify(body.options) : null
  if (body.order !== undefined) updates.order = body.order

  const [updated] = await db
    .update(questions)
    .set(updates)
    .where(and(eq(questions.id, questionId), eq(questions.surveyId, id)))
    .returning()

  return NextResponse.json(updated)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, questionId } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.delete(questions).where(and(eq(questions.id, questionId), eq(questions.surveyId, id)))
  return NextResponse.json({ success: true })
}
