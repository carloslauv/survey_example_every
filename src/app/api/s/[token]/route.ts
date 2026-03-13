import { NextResponse } from "next/server"
import { db } from "@/db"
import { surveys, questions } from "@/db/schema"
import { eq, asc } from "drizzle-orm"

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [survey] = await db.select().from(surveys).where(eq(surveys.shareToken, token))
  if (!survey || !survey.isPublished) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 })
  }

  const surveyQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.surveyId, survey.id))
    .orderBy(asc(questions.order))

  return NextResponse.json({ ...survey, questions: surveyQuestions })
}
