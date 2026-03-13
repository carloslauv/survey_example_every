import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { surveys, questions } from "@/db/schema"
import { eq, and, max } from "drizzle-orm"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { text, type, required, options } = await req.json()

  const [maxOrder] = await db
    .select({ max: max(questions.order) })
    .from(questions)
    .where(eq(questions.surveyId, id))

  const nextOrder = (maxOrder?.max ?? 0) + 1

  const [question] = await db
    .insert(questions)
    .values({
      surveyId: id,
      text: text || "Untitled question",
      type: type || "text",
      required: required ?? false,
      options: options ? JSON.stringify(options) : null,
      order: nextOrder,
    })
    .returning()

  return NextResponse.json(question, { status: 201 })
}
