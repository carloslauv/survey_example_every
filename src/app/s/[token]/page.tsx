"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Check } from "lucide-react"

type Question = {
  id: string
  text: string
  type: "text" | "textarea" | "multiple_choice" | "rating"
  required: boolean
  options: string[] | null
}

type Survey = {
  id: string
  title: string
  description: string | null
  shareToken: string
  questions: Question[]
}

export default function PublicSurveyPage() {
  const params = useParams()
  const token = params.token as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [step, setStep] = useState(-1) // -1 = welcome, questions by index, questions.length = done
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/s/${token}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        data.questions = data.questions.map((q: Question & { options: string | null }) => ({
          ...q,
          options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        }))
        setSurvey(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [token])

  const currentQuestion = survey ? survey.questions[step] : null
  const progress = survey ? ((step + 1) / survey.questions.length) * 100 : 0

  const canProceed = () => {
    if (!currentQuestion) return true
    if (!currentQuestion.required) return true
    return !!answers[currentQuestion.id]?.trim()
  }

  const handleNext = () => {
    if (!canProceed()) { setError("This question is required."); return }
    setError("")
    if (survey && step === survey.questions.length - 1) {
      handleSubmit()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    setError("")
    setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    if (!survey) return
    setSubmitting(true)
    const res = await fetch(`/api/s/${token}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      }),
    })
    setSubmitting(false)
    if (res.ok) {
      setSubmitted(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && currentQuestion?.type !== "textarea") {
      e.preventDefault()
      handleNext()
    }
  }

  if (loading) return <Screen><p className="text-gray-400">Loading...</p></Screen>
  if (notFound) return (
    <Screen>
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Survey not found</h1>
        <p className="text-gray-500">This survey may not be published or the link is invalid.</p>
      </div>
    </Screen>
  )
  if (!survey) return null

  // Thank you screen
  if (submitted) return (
    <Screen progress={100}>
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Thank you! 🎉</h1>
        <p className="text-gray-500 text-lg">Your response has been recorded.</p>
      </div>
    </Screen>
  )

  // Welcome screen
  if (step === -1) return (
    <Screen>
      <div className="max-w-lg animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{survey.title}</h1>
        {survey.description && (
          <p className="text-gray-600 text-lg mb-8">{survey.description}</p>
        )}
        <p className="text-sm text-gray-400 mb-8">{survey.questions.length} question{survey.questions.length !== 1 ? "s" : ""}</p>
        <Button size="lg" onClick={() => setStep(0)} className="px-8">
          Start <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Screen>
  )

  // Question screen
  return (
    <Screen progress={progress}>
      {currentQuestion && (
        <div className="max-w-xl w-full animate-fade-in" onKeyDown={handleKeyDown}>
          <div className="mb-8">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {step + 1} / {survey.questions.length}
            </span>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              {currentQuestion.text}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
          </div>

          <QuestionInput
            question={currentQuestion}
            value={answers[currentQuestion.id] || ""}
            onChange={(val) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: val }))}
          />

          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

          <div className="flex items-center gap-3 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={submitting}>
              {submitting
                ? "Submitting..."
                : step === survey.questions.length - 1
                ? "Submit"
                : <> OK <ArrowRight className="w-4 h-4 ml-1" /></>}
            </Button>
            {!currentQuestion.required && step < survey.questions.length - 1 && (
              <button
                className="text-sm text-gray-400 hover:text-gray-600 underline"
                onClick={() => { setError(""); setStep((s) => s + 1) }}
              >
                Skip
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-4">Press <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">Enter ↵</kbd> to continue</p>
        </div>
      )}
    </Screen>
  )
}

function QuestionInput({
  question,
  value,
  onChange,
}: {
  question: Question
  value: string
  onChange: (val: string) => void
}) {
  if (question.type === "text") {
    return (
      <input
        autoFocus
        className="w-full border-b-2 border-gray-300 focus:border-black outline-none py-3 text-lg bg-transparent transition-colors"
        placeholder="Type your answer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (question.type === "textarea") {
    return (
      <textarea
        autoFocus
        className="w-full border-2 border-gray-200 focus:border-black outline-none p-4 text-lg rounded-xl bg-transparent resize-none transition-colors"
        placeholder="Type your answer..."
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }

  if (question.type === "multiple_choice") {
    const opts = question.options || []
    return (
      <div className="space-y-3">
        {opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => onChange(opt)}
            className={`w-full text-left px-5 py-3.5 rounded-xl border-2 text-base transition-all ${
              value === opt
                ? "border-black bg-black text-white"
                : "border-gray-200 hover:border-gray-400 bg-white text-gray-800"
            }`}
          >
            <span className={`font-mono text-sm mr-3 ${value === opt ? "text-gray-300" : "text-gray-400"}`}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>
    )
  }

  if (question.type === "rating") {
    return (
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(String(n))}
            className={`w-14 h-14 rounded-xl border-2 text-xl font-bold transition-all ${
              value === String(n)
                ? "border-black bg-black text-white"
                : "border-gray-200 hover:border-gray-400 bg-white text-gray-700"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    )
  }

  return null
}

function Screen({ children, progress }: { children: React.ReactNode; progress?: number }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative">
      {progress !== undefined && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100">
          <div
            className="h-full bg-black transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {children}
    </div>
  )
}
