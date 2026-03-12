import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Link2, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Now in beta
          </Badge>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Create surveys that people{" "}
            <span className="text-primary">actually complete</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Build beautiful surveys in minutes, share with a single link, and
            collect responses from anyone — no account required for respondents.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get started for free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Everything you need to run surveys
            </h2>
            <p className="mt-3 text-muted-foreground">
              Simple, powerful, and built for speed.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Create surveys</CardTitle>
                <CardDescription>
                  Build multi-question surveys with multiple choice, text, and
                  rating question types in minutes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Drag-and-drop builder, real-time preview, and instant
                  publishing.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Share anywhere</CardTitle>
                <CardDescription>
                  Get a unique link for every survey. Share it via email, social
                  media, or embed it in your site.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No account needed for respondents — just click and answer.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Collect responses</CardTitle>
                <CardDescription>
                  Watch responses come in real time. Export to CSV or view
                  charts directly in your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Unlimited responses on all plans during beta.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to start collecting insights?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Join thousands of teams using SurveyApp to make better decisions.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg">Create your first survey →</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
