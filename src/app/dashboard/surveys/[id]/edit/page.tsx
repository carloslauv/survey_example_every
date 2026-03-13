"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus, Trash2, ChevronUp, ChevronDown, Globe, Lock,
  Copy, Check, ArrowLeft, Eye
} from "lucide-react"

type QuestionType = "text" | "textarea" | "multiple_choice" | "rating"

type Question = {
  id: string
  text: string
  type: QuestionType
  required: boolean
  options: string[] | null
  order: number
}

type Survey = {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  shareToken: string
  questions: Question[]
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "multiple_choice", label: "Multiple choice" },
  { value: "rating", label: "Rating (1–5)" },
]

export default function SurveyEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchSurvey = useCallback(async () => {
    const res = await fetch(`/api/surveys/${id}`)
    if (!res.ok) { router.push("/dashboard"); return }
    const data = await res.json()
    data.questions = data.questions.map((q: Question & { options: string | null }) => ({
      ...q,
      options: q.options ? JSON.parse(q.options as unknown as string) : null,
    }))
    setSurvey(data)
    setLoading(false)
  }, [id, router])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
    if (status === "authenticated") fetchSurvey()
  }, [status, fetchSurvey, router])

  const updateSurveyMeta = async (updates: { title?: string; description?: string }) => {
    setSaving(true)
    await fetch(`/api/surveys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    setSurvey((prev) => prev ? { ...prev, ...updates } : prev)
    setSaving(false)
  }

  const togglePublish = async () => {
    if (!survey) return
    const res = await fetch(`/api/surveys/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish: !survey.isPublished }),
    })
    const updated = await res.json()
    setSurvey((prev) => prev ? { ...prev, isPublished: updated.isPublished } : prev)
  }

  const addQuestion = async () => {
    const res = await fetch(`/api/surveys/${id}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Untitled question", type: "text" }),
    })
    const question = await res.json()
    const newQ = { ...question, options: null }
    setSurvey((prev) => prev ? { ...prev, questions: [...prev.questions, newQ] } : prev)
    setSelectedQuestion(question.id)
  }

  const updateQuestion = async (qId: string, updates: Partial<Question>) => {
    setSurvey((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        questions: prev.questions.map((q) => q.id === qId ? { ...q, ...updates } : q),
      }
    })
    await fetch(`/api/surveys/${id}/questions/${qId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
  }

  const deleteQuestion = async (qId: string) => {
    await fetch(`/api/surveys/${id}/questions/${qId}`, { method: "DELETE" })
    setSurvey((prev) => {
      if (!prev) return prev
      const remaining = prev.questions.filter((q) => q.id !== qId)
      return { ...prev, questions: remaining }
    })
    if (selectedQuestion === qId) setSelectedQuestion(null)
  }

  const moveQuestion = async (qId: string, direction: "up" | "down") => {
    if (!survey) return
    const idx = survey.questions.findIndex((q) => q.id === qId)
    const newIdx = direction === "up" ? idx - 1 : idx + 1
    if (newIdx < 0 || newIdx >= survey.questions.length) return

    const reordered = [...survey.questions]
    ;[reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]]
    reordered[idx].order = idx + 1
    reordered[newIdx].order = newIdx + 1
    setSurvey((prev) => prev ? { ...prev, questions: reordered } : prev)

    await Promise.all([
      fetch(`/api/surveys/${id}/questions/${reordered[idx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered[idx].order }),
      }),
      fetch(`/api/surveys/${id}/questions/${reordered[newIdx].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: reordered[newIdx].order }),
      }),
    ])
  }

  const copyLink = () => {
    if (!survey) return
    navigator.clipboard.writeText(`${window.location.origin}/s/${survey.shareToken}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !survey) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>
  }

  const selected = survey.questions.find((q) => q.id === selectedQuestion)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <input
              className="text-base font-semibold bg-transparent border-none outline-none focus:underline w-64 truncate"
              value={survey.title}
              onChange={(e) => setSurvey((prev) => prev ? { ...prev, title: e.target.value } : prev)}
              onBlur={(e) => updateSurveyMeta({ title: e.target.value })}
            />
          </div>
          {saving && <span className="text-xs text-gray-400">Saving...</span>}
        </div>
        <div className="flex items-center gap-2">
          {survey.isPublished && (
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? <><Check className="w-3.5 h-3.5 mr-1.5 text-green-600" />Copied!</> : <><Copy className="w-3.5 h-3.5 mr-1.5" />Copy link</>}
            </Button>
          )}
          <Link href={`/s/${survey.shareToken}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="w-3.5 h-3.5 mr-1.5" /> Preview
            </Button>
          </Link>
          <Button
            size="sm"
            variant={survey.isPublished ? "outline" : "default"}
            onClick={togglePublish}
          >
            {survey.isPublished ? <><Lock className="w-3.5 h-3.5 mr-1.5" />Unpublish</> : <><Globe className="w-3.5 h-3.5 mr-1.5" />Publish</>}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — question list */}
        <aside className="w-64 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Questions</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {survey.questions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setSelectedQuestion(q.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedQuestion === q.id
                    ? "bg-black text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className="font-medium text-xs opacity-60 block">{i + 1}.</span>
                <span className="truncate block">{q.text || "Untitled question"}</span>
              </button>
            ))}
          </div>
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full" size="sm" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-1.5" /> Add question
            </Button>
          </div>
        </aside>

        {/* Main editor */}
        <main className="flex-1 p-8 overflow-y-auto">
          {!selected ? (
            <div className="max-w-xl mx-auto space-y-6">
              {/* Survey meta */}
              <div className="bg-white rounded-xl border p-6 space-y-4">
                <h2 className="font-semibold text-gray-800">Survey details</h2>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={survey.title}
                    onChange={(e) => setSurvey((prev) => prev ? { ...prev, title: e.target.value } : prev)}
                    onBlur={(e) => updateSurveyMeta({ title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    rows={3}
                    value={survey.description || ""}
                    onChange={(e) => setSurvey((prev) => prev ? { ...prev, description: e.target.value } : prev)}
                    onBlur={(e) => updateSurveyMeta({ description: e.target.value })}
                    placeholder="Describe your survey..."
                  />
                </div>
              </div>
              <div className="text-center text-gray-400 py-8">
                {survey.questions.length === 0
                  ? <>Click <strong>Add question</strong> to get started.</>
                  : <>Select a question from the left to edit it.</>}
              </div>
            </div>
          ) : (
            <QuestionEditor
              key={selected.id}
              question={selected}
              index={survey.questions.findIndex((q) => q.id === selected.id)}
              total={survey.questions.length}
              onUpdate={(updates) => updateQuestion(selected.id, updates)}
              onDelete={() => deleteQuestion(selected.id)}
              onMove={(dir) => moveQuestion(selected.id, dir)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function QuestionEditor({
  question,
  index,
  total,
  onUpdate,
  onDelete,
  onMove,
}: {
  question: Question
  index: number
  total: number
  onUpdate: (updates: Partial<Question>) => void
  onDelete: () => void
  onMove: (dir: "up" | "down") => void
}) {
  const [text, setText] = useState(question.text)
  const [options, setOptions] = useState<string[]>(question.options || ["Option 1", "Option 2"])

  const updateOption = (i: number, value: string) => {
    const updated = [...options]
    updated[i] = value
    setOptions(updated)
    onUpdate({ options: updated })
  }

  const addOption = () => {
    const updated = [...options, `Option ${options.length + 1}`]
    setOptions(updated)
    onUpdate({ options: updated })
  }

  const removeOption = (i: number) => {
    const updated = options.filter((_, idx) => idx !== i)
    setOptions(updated)
    onUpdate({ options: updated })
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl border p-6 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
          Question {index + 1}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onMove("up")} disabled={index === 0}>
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onMove("down")} disabled={index === total - 1}>
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div>
        <Label>Question text</Label>
        <Input
          className="mt-1 text-base"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onUpdate({ text })}
          placeholder="Type your question..."
        />
      </div>

      <div>
        <Label>Type</Label>
        <select
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          value={question.type}
          onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {question.type === "multiple_choice" && (
        <div>
          <Label>Options</Label>
          <div className="mt-2 space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${i + 1}`}
                />
                {options.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeOption(i)}>
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addOption}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add option
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t">
        <input
          type="checkbox"
          id="required"
          checked={question.required}
          onChange={(e) => onUpdate({ required: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="required" className="cursor-pointer">Required</Label>
      </div>
    </div>
  )
}
