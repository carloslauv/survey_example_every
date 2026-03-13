"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

type Question = {
  id: string
  text: string
  type: string
  options: string | null
  order: number
}

type Answer = {
  questionId: string
  value: string | null
}

type Response = {
  id: string
  submittedAt: string
  respondentEmail: string | null
  answers: Answer[]
}

type ResultsData = {
  questions: Question[]
  responses: Response[]
}

export default function ResultsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<ResultsData | null>(null)
  const [surveyTitle, setSurveyTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeResponse, setActiveResponse] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const [surveyRes, resultsRes] = await Promise.all([
      fetch(`/api/surveys/${id}`),
      fetch(`/api/surveys/${id}/responses`),
    ])
    if (!surveyRes.ok) { router.push("/dashboard"); return }
    const survey = await surveyRes.json()
    const results = await resultsRes.json()
    setSurveyTitle(survey.title)
    setData(results)
    setLoading(false)
  }, [id, router])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchData()
  }, [status, fetchData, router])

  if (loading || !data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }

  const questions = data.questions.sort((a, b) => a.order - b.order)
  const responses = data.responses

  // Aggregate answers per question
  const getAnswersForQuestion = (qId: string) =>
    responses.flatMap((r) => r.answers.filter((a) => a.questionId === qId && a.value))

  const getCountsForQuestion = (qId: string, options: string[]) => {
    const ans = getAnswersForQuestion(qId)
    return options.map((opt) => ({
      option: opt,
      count: ans.filter((a) => a.value === opt).length,
    }))
  }

  const avgRating = (qId: string) => {
    const ans = getAnswersForQuestion(qId)
    if (ans.length === 0) return null
    const sum = ans.reduce((acc, a) => acc + Number(a.value || 0), 0)
    return (sum / ans.length).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        </Link>
        <div>
          <h1 className="font-semibold text-gray-900">{surveyTitle}</h1>
          <p className="text-sm text-gray-500">{responses.length} response{responses.length !== 1 ? "s" : ""}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {responses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="text-5xl mb-4">📭</div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">No responses yet</h2>
            <p className="text-gray-500">Share your survey link to start collecting responses.</p>
          </div>
        ) : (
          <>
            {/* Per-question summary */}
            {questions.map((q, i) => {
              const opts = q.options ? JSON.parse(q.options) : null
              const answers = getAnswersForQuestion(q.id)

              return (
                <div key={q.id} className="bg-white rounded-xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs text-gray-400 font-medium">{i + 1}.</span>
                      <h3 className="font-semibold text-gray-900 mt-0.5">{q.text}</h3>
                    </div>
                    <span className="text-sm text-gray-400">{answers.length} answer{answers.length !== 1 ? "s" : ""}</span>
                  </div>

                  {q.type === "multiple_choice" && opts && (
                    <div className="space-y-2">
                      {getCountsForQuestion(q.id, opts).map(({ option, count }) => {
                        const pct = answers.length > 0 ? Math.round((count / answers.length) * 100) : 0
                        return (
                          <div key={option}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700">{option}</span>
                              <span className="text-gray-400">{count} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-black rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {q.type === "rating" && (
                    <div>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-4xl font-bold">{avgRating(q.id)}</span>
                        <span className="text-gray-400">/ 5 average</span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => {
                          const count = answers.filter((a) => a.value === String(n)).length
                          const pct = answers.length > 0 ? Math.round((count / answers.length) * 100) : 0
                          return (
                            <div key={n} className="flex-1 text-center">
                              <div className="h-16 bg-gray-100 rounded-lg relative flex items-end overflow-hidden">
                                <div
                                  className="w-full bg-black rounded-lg transition-all"
                                  style={{ height: `${pct}%` }}
                                />
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{n}</div>
                              <div className="text-xs text-gray-400">{count}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {(q.type === "text" || q.type === "textarea") && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {answers.length === 0 ? (
                        <p className="text-gray-400 text-sm">No answers yet.</p>
                      ) : (
                        answers.map((a, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm text-gray-700">
                            {a.value}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Individual responses */}
            <div className="bg-white rounded-xl border">
              <div className="p-6 border-b">
                <h2 className="font-semibold text-gray-900">Individual responses</h2>
              </div>
              <div className="divide-y">
                {responses.map((response) => (
                  <div key={response.id}>
                    <button
                      className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                      onClick={() => setActiveResponse(activeResponse === response.id ? null : response.id)}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {response.respondentEmail || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(response.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-gray-400 text-sm">{activeResponse === response.id ? "▲" : "▼"}</span>
                    </button>
                    {activeResponse === response.id && (
                      <div className="px-6 pb-4 space-y-3">
                        {questions.map((q) => {
                          const ans = response.answers.find((a) => a.questionId === q.id)
                          return (
                            <div key={q.id} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-400 mb-1">{q.text}</p>
                              <p className="text-sm text-gray-800">{ans?.value || <em className="text-gray-400">No answer</em>}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
