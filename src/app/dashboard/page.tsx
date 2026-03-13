"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, BarChart2, Edit, Trash2, Globe, Lock, Copy, Check, LogOut } from "lucide-react"

type Survey = {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  shareToken: string
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin")
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/surveys")
        .then((r) => r.json())
        .then((data) => { setSurveys(Array.isArray(data) ? data : []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [status])

  const createSurvey = async () => {
    setCreating(true)
    const res = await fetch("/api/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled Survey" }),
    })
    const survey = await res.json()
    router.push(`/dashboard/surveys/${survey.id}/edit`)
  }

  const deleteSurvey = async (id: string) => {
    if (!confirm("Delete this survey?")) return
    await fetch(`/api/surveys/${id}`, { method: "DELETE" })
    setSurveys((prev) => prev.filter((s) => s.id !== id))
  }

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/s/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-black rounded-md" />
          <span className="font-semibold text-lg">SurveyApp</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{session?.user?.name || session?.user?.email}</span>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="w-4 h-4 mr-1" /> Sign out
          </Button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Surveys</h1>
            <p className="text-gray-500 mt-1">{surveys.length} survey{surveys.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={createSurvey} disabled={creating}>
            <Plus className="w-4 h-4 mr-2" />
            {creating ? "Creating..." : "New Survey"}
          </Button>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-medium text-gray-700 mb-2">No surveys yet</h2>
            <p className="text-gray-500 mb-6">Create your first survey and start collecting responses.</p>
            <Button onClick={createSurvey} disabled={creating}>
              <Plus className="w-4 h-4 mr-2" />
              Create Survey
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{survey.title}</CardTitle>
                      {survey.description && (
                        <CardDescription className="mt-1 truncate">{survey.description}</CardDescription>
                      )}
                    </div>
                    <span className={`ml-4 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      survey.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {survey.isPublished ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {survey.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-2 pt-0">
                  <Link href={`/dashboard/surveys/${survey.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/surveys/${survey.id}/results`}>
                    <Button variant="outline" size="sm">
                      <BarChart2 className="w-3.5 h-3.5 mr-1.5" /> Results
                    </Button>
                  </Link>
                  {survey.isPublished && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(survey.shareToken, survey.id)}
                    >
                      {copiedId === survey.id ? (
                        <><Check className="w-3.5 h-3.5 mr-1.5 text-green-600" /> Copied!</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Link</>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                    onClick={() => deleteSurvey(survey.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
