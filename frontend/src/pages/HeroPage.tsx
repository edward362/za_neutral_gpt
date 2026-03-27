import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sticker, Stamp } from "@/components/ui/sticker"
import { Marquee, MarqueeItem, MarqueeSeparator } from "@/components/ui/marquee"
import { ArrowRight, Flame, Brain, Layers, Zap } from "lucide-react"

export function HeroPage() {
  const navigate = useNavigate()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-background">
      {/* Marquee banner at top */}
      <Marquee speed="fast" bordered className="border-x-0 border-t-0 bg-primary text-primary-foreground">
        <MarqueeItem>NO SUGARCOATING</MarqueeItem>
        <MarqueeSeparator className="text-primary-foreground">/</MarqueeSeparator>
        <MarqueeItem>BRUTALLY HONEST AI</MarqueeItem>
        <MarqueeSeparator className="text-primary-foreground">/</MarqueeSeparator>
        <MarqueeItem>ZERO FLATTERY</MarqueeItem>
        <MarqueeSeparator className="text-primary-foreground">/</MarqueeSeparator>
        <MarqueeItem>GROW OR GO HOME</MarqueeItem>
        <MarqueeSeparator className="text-primary-foreground">/</MarqueeSeparator>
      </Marquee>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className={`flex max-w-3xl flex-col items-center text-center ${showContent ? "" : "opacity-0"}`}>
          {/* Stickers floating */}
          <div className="relative mb-8 w-full">
            <Sticker
              variant="destructive"
              rotation="slight"
              shadow="default"
              className={`absolute -left-4 -top-4 hidden sm:inline-flex opacity-0 ${showContent ? "animate-fade-in-up stagger-1" : ""}`}
            >
              NO BS
            </Sticker>
            <Sticker
              variant="secondary"
              rotation="slight-right"
              shadow="default"
              className={`absolute -right-4 top-0 hidden sm:inline-flex opacity-0 ${showContent ? "animate-fade-in-up stagger-2" : ""}`}
            >
              REAL TALK
            </Sticker>

            {/* Logo */}
            <div className={`flex items-center justify-center gap-4 opacity-0 ${showContent ? "animate-scale-in" : ""}`}>
              <div className="flex h-16 w-16 items-center justify-center border-3 border-foreground bg-primary shadow-[4px_4px_0px_hsl(var(--shadow-color))]">
                <Flame className="h-8 w-8 text-primary-foreground" />
              </div>
              <span className="font-serif text-4xl font-bold tracking-tight text-foreground uppercase">
                GOATED GPT
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1
            className={`mb-6 font-serif text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-7xl uppercase opacity-0 ${showContent ? "animate-fade-in-up stagger-1" : ""}`}
          >
            The AI that won't{" "}
            <span className="bg-accent px-2 border-3 border-foreground inline-block -rotate-1">lie to you</span>
          </h1>

          {/* Subheading */}
          <p
            className={`mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground opacity-0 ${showContent ? "animate-fade-in-up stagger-2" : ""}`}
          >
            Every other AI validates you, flatters you, agrees with your worst ideas.
            GOATED GPT tells you the truth so you actually learn and grow.
          </p>

          {/* CTA */}
          <div
            className={`flex flex-col items-center gap-4 sm:flex-row opacity-0 ${showContent ? "animate-fade-in-up stagger-3" : ""}`}
          >
            <Button
              size="xl"
              variant="default"
              animation="pop"
              onClick={() => navigate("/chat")}
              className="gap-3"
            >
              Start a conversation
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Badge variant="outline" className="border-3 border-foreground text-xs font-bold uppercase">
              Free. No signup.
            </Badge>
          </div>

          {/* Feature cards */}
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={<Flame className="h-6 w-6" />}
              title="Brutally honest"
              description="If you're wrong, you'll hear it. No sugarcoating."
              color="bg-primary"
              className={`opacity-0 ${showContent ? "animate-fade-in-up stagger-4" : ""}`}
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="Growth focused"
              description="Every correction comes with direction. Learn faster."
              color="bg-secondary"
              className={`opacity-0 ${showContent ? "animate-fade-in-up stagger-5" : ""}`}
            />
            <FeatureCard
              icon={<Layers className="h-6 w-6" />}
              title="Multi-model"
              description="GPT-4o, Claude, Gemini. Pick your provider."
              color="bg-accent"
              className={`opacity-0 ${showContent ? "animate-fade-in-up stagger-6" : ""}`}
            />
          </div>
        </div>
      </div>

      {/* Bottom marquee */}
      <Marquee speed="slow" direction="right" bordered className="border-x-0 border-b-0 bg-accent text-accent-foreground">
        <MarqueeItem>
          <Zap className="h-4 w-4 mr-1 inline" />
          GPT-4o
        </MarqueeItem>
        <MarqueeSeparator>/</MarqueeSeparator>
        <MarqueeItem>
          <Zap className="h-4 w-4 mr-1 inline" />
          CLAUDE
        </MarqueeItem>
        <MarqueeSeparator>/</MarqueeSeparator>
        <MarqueeItem>
          <Zap className="h-4 w-4 mr-1 inline" />
          GEMINI
        </MarqueeItem>
        <MarqueeSeparator>/</MarqueeSeparator>
      </Marquee>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  className = "",
}: {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  className?: string
}) {
  return (
    <Card interactive className={`text-left ${className}`}>
      <CardContent className="p-5">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center border-3 border-foreground ${color} shadow-[2px_2px_0px_hsl(var(--shadow-color))]`}>
          {icon}
        </div>
        <h3 className="mb-2 font-bold uppercase tracking-wide text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
