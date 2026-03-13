import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import { surveys } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const [survey] = await db.select().from(surveys).where(
    and(eq(surveys.id, id), eq(surveys.userId, session.user.id))
  )
  if (!survey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { publish } = await req.json()
  const [updated] = await db
    .update(surveys)
    .set({ isPublished: publish, updatedAt: new Date() })
    .where(eq(surveys.id, id))
    .returning()

  return NextResponse.json(updated)
}
