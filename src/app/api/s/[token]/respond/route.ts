import { NextResponse } from "next/server"
import { db } from "@/db"
import { surveys, responses, answers } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const [survey] = await db.select().from(surveys).where(eq(surveys.shareToken, token))
  if (!survey || !survey.isPublished) {
    return NextResponse.json({ error: "Survey not found" }, { status: 404 })
  }

  const { respondentEmail, answers: submittedAnswers } = await req.json()

  const [response] = await db
    .insert(responses)
    .values({
      surveyId: survey.id,
      respondentEmail: respondentEmail || null,
    })
    .returning()

  if (submittedAnswers && Array.isArray(submittedAnswers)) {
    await db.insert(answers).values(
      submittedAnswers.map((a: { questionId: string; value: string }) => ({
        responseId: response.id,
        questionId: a.questionId,
        value: a.value,
      }))
    )
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
