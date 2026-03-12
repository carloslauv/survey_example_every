import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navbar */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <svg className="w-4 h-4 text-[hsl(var(--primary-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-bold text-lg">SurveyApp</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
          Now in beta — free to use
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[hsl(var(--foreground))] mb-6 max-w-3xl mx-auto leading-tight">
          Build surveys. Share instantly. Collect insights.
        </h1>
        <p className="text-lg sm:text-xl text-[hsl(var(--muted-foreground))] mb-10 max-w-2xl mx-auto leading-relaxed">
          Create beautiful surveys in minutes, share them with a link, and watch responses roll in. No setup required.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/auth/signup">
            <Button size="lg" className="text-base px-8">
              Start for free
              <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button size="lg" variant="outline" className="text-base px-8">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
            Everything you need to gather feedback
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">
            A simple but powerful platform for creating and sharing surveys.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ),
              title: "Easy to create",
              description: "Build surveys with multiple question types — text, multiple choice, ratings, and more.",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              ),
              title: "Share with a link",
              description: "Get a unique shareable link for every survey. Share it anywhere — email, social, Slack.",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "View responses",
              description: "See all your responses in one place. Export data and understand your audience.",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Secure by default",
              description: "Your data is protected. Sign in with GitHub, Google, or email to keep everything safe.",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: "Lightning fast",
              description: "Built on Next.js and deployed on Vercel. Global CDN ensures fast load times everywhere.",
            },
            {
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              ),
              title: "Powered by Neon",
              description: "Serverless PostgreSQL database that scales automatically with your usage.",
            },
          ].map((feature) => (
            <Card key={feature.title} className="border-[hsl(var(--border))]">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center text-[hsl(var(--foreground))] mb-2">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[hsl(var(--primary))] rounded-2xl px-8 py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--primary-foreground))] mb-4">
            Ready to start collecting feedback?
          </h2>
          <p className="text-[hsl(var(--primary-foreground))]/80 text-lg mb-8 max-w-lg mx-auto">
            Create your first survey in under two minutes. No credit card required.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-base px-8">
              Create your first survey
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[hsl(var(--primary))] flex items-center justify-center">
              <svg className="w-3 h-3 text-[hsl(var(--primary-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-sm font-medium">SurveyApp</span>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            &copy; {new Date().getFullYear()} SurveyApp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
