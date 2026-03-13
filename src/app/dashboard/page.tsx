import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome, {session.user?.name || session.user?.email}</p>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-gray-500">Your surveys will appear here.</p>
        </div>
      </div>
    </div>
  )
}
