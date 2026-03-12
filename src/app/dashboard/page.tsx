import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/lib/auth";
import { BarChart3, Plus } from "lucide-react";

export const metadata = {
  title: "Dashboard — SurveyApp",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Dashboard header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
              S
            </div>
            <span className="font-semibold">SurveyApp</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.user?.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome banner */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome{session.user?.name ? `, ${session.user.name}` : ""}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your surveys and view responses here.
          </p>
        </div>

        {/* Empty state */}
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BarChart3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>No surveys yet</CardTitle>
            <CardDescription>
              Create your first survey to start collecting responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="gap-2">
              <Plus className="h-4 w-4" />
              Create survey
              <span className="ml-1 text-xs opacity-70">(coming soon)</span>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
