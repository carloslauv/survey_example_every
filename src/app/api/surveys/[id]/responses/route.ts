import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { surveys, responses, answers, questions } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const surveyResponses = await db.select().from(responses).where(eq(responses.surveyId, id))
  const surveyQuestions = await db.select().from(questions).where(eq(questions.surveyId, id))

  const responsesWithAnswers = await Promise.all(
    surveyResponses.map(async (response) => {
      const responseAnswers = await db
        .select()
        .from(answers)
        .where(eq(answers.responseId, response.id))
      return { ...response, answers: responseAnswers }
    })
  )

  return NextResponse.json({ responses: responsesWithAnswers, questions: surveyQuestions })
}
