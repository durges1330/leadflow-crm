import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Loader2,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ThemeToggle } from "./shared/ThemeToggle";

const FEATURES = [
  {
    icon: Users,
    title: "Lead Management",
    desc: "Capture, track, and nurture leads through the full sales cycle.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
  },
  {
    icon: Bot,
    title: "AI-Powered Insights",
    desc: "Score leads, predict conversions, and get smart follow-up suggestions.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: Target,
    title: "Pipeline Kanban",
    desc: "Visualize deals in a drag-and-drop Kanban board with custom stages.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: Zap,
    title: "Smart Automation",
    desc: "Auto-assign leads, send follow-up sequences, and escalate hot deals.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: CheckCircle2,
    title: "Task Management",
    desc: "Track calls, emails, and follow-ups with overdue alerts and reminders.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Real-time KPIs, conversion funnels, and counselor productivity reports.",
    color: "text-rose-500",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
];

export const LandingPage: React.FC = () => {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-dvh bg-landing text-foreground flex flex-col">
      {/* Nav */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">
              Atlas CRM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              size="sm"
              data-ocid="landing.signin_button"
            >
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border border-primary/20">
                <Bot className="w-3.5 h-3.5" />
                AI-Powered Lead Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight tracking-tight mb-4">
                Close more deals with
                <span className="text-primary"> intelligent CRM</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Capture leads from any source, automate follow-ups, and let AI
                help your sales team prioritize and convert with confidence.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => login()}
                  disabled={isLoggingIn}
                  className="min-w-40"
                  data-ocid="landing.hero_cta_button"
                >
                  {isLoggingIn && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  {isLoggingIn ? "Signing in..." : "Get Started Free"}
                </Button>
                <span className="text-sm text-muted-foreground">
                  No credit card required
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border">
                <img
                  src="/assets/generated/crm-hero.dim_1200x700.jpg"
                  alt="Atlas CRM Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-background py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Everything your sales team needs
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From first contact to closed deal — streamline every step of your
              pipeline.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}
                >
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {f.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/40 border-t border-border py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to boost conversions?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join teams that use Atlas CRM to convert more leads every day.
          </p>
          <Button
            size="lg"
            onClick={() => login()}
            disabled={isLoggingIn}
            data-ocid="landing.bottom_cta_button"
          >
            {isLoggingIn && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isLoggingIn ? "Signing in..." : "Sign in with Internet Identity"}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <p className="text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Atlas CRM. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
};
