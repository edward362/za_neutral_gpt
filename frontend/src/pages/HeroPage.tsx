import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Target } from "lucide-react"

export function HeroPage() {
  const navigate = useNavigate()

  return (
    <div className="noise-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-medium text-brand">
            AI without the bullshit
          </span>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-5xl font-black tracking-tight text-foreground sm:text-7xl">
          Stop getting{" "}
          <span className="text-gradient">lied to</span>
          <br />
          by your AI.
        </h1>

        {/* Subheading */}
        <p className="mb-10 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
          Every AI chat validates you, flatters you, agrees with your bad takes.{" "}
          <span className="text-foreground font-medium">NeutralGPT doesn't.</span>{" "}
          It tells you when you're wrong so you actually grow.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Button
            size="lg"
            onClick={() => navigate("/chat")}
            className="group h-12 gap-2 rounded-full bg-brand px-8 text-sm font-semibold text-brand-foreground hover:bg-brand/90 glow-brand transition-all"
          >
            Try it — if you can handle it
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <span className="text-xs text-muted-foreground/60">Free. No signup. No feelings spared.</span>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Brutally honest"
            description="Wrong is wrong. You'll hear it."
          />
          <FeatureCard
            icon={<Target className="h-5 w-5" />}
            title="Growth-focused"
            description="Redirects you to the right path."
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5" />}
            title="Multi-model"
            description="GPT-4o, Claude, Gemini. Your pick."
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group flex flex-col items-center gap-3 rounded-xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm transition-all hover:border-brand/20 hover:bg-card/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand transition-colors group-hover:bg-brand/20">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
