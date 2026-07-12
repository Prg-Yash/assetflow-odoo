'use client'
import { useEffect, useState } from 'react'
import { Package, Eye, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StepDef {
  key: string
  title: string
  icon: any
  desc: string
  hint: string
}

const STEPS: StepDef[] = [
  {
    key: 'register',
    title: 'Register',
    icon: Package,
    desc: 'Add assets to your inventory with essential details: name, serial number, location, and category.',
    hint: 'New asset added to system.',
  },
  {
    key: 'track',
    title: 'Track',
    icon: Eye,
    desc: 'Monitor asset status, location, and maintenance history in real time. Get instant notifications.',
    hint: 'Asset tracked across locations.',
  },
  {
    key: 'manage',
    title: 'Manage',
    icon: CheckCircle2,
    desc: 'Manage transfers, bookings, and maintenance schedules. Keep everything organized and compliant.',
    hint: 'Asset lifecycle managed.',
  },
]

export function PhoneFlowDemo({
  intervalMs = 4200,
  staticStep,
  showArrows = true,
  sectionActive,
}: {
  intervalMs?: number
  staticStep?: string
  showArrows?: boolean
  sectionActive?: boolean
}) {
  const [index, setIndex] = useState(0)
  const staticIndex = staticStep ? Math.max(0, STEPS.findIndex((s) => s.key === staticStep)) : null
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (sectionActive) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 650)
      return () => clearTimeout(t)
    } else {
      setFlash(false)
    }
  }, [sectionActive])

  useEffect(() => {
    if (staticIndex !== null) return
    const id = setInterval(() => setIndex((i) => (i + 1) % STEPS.length), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs, staticIndex])

  const active = ((staticIndex !== null && staticIndex !== -1 ? STEPS[staticIndex] : STEPS[index]) || STEPS[0]) as StepDef

  return (
    <div className="w-full flex items-center justify-center">
      {/* Outer scalable wrapper for responsiveness */}
      <div className="[--phone-w:240px] sm:[--phone-w:280px] md:[--phone-w:300px] lg:[--phone-w:300px] xl:[--phone-w:320px] [--phone-h:420px] sm:[--phone-h:480px] md:[--phone-h:550px] lg:[--phone-h:550px] xl:[--phone-h:580px]">
        {/* Phone shell */}
        <div className="relative mx-auto" style={{ width: 'var(--phone-w)', height: 'var(--phone-h)' }}>
          {/* Bezel / body */}
          <div className="absolute inset-0 rounded-[3rem] bg-neutral-900 dark:bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_24px_-6px_rgba(0,0,0,0.6)] border border-neutral-800/70 dark:border-neutral-700/40" />
          {/* Inner screen */}
          <div
            className="absolute inset-[8px] rounded-[2.4rem] bg-card border border-border overflow-hidden flex flex-col"
            style={{ padding: '52px 16px 18px 16px' }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 h-7 w-36 rounded-full bg-black/90 dark:bg-black/80 border border-white/10 flex items-center justify-center gap-1 px-3 text-[10px] text-white/70">
              <span
                className={cn(
                  'h-2 w-2 rounded-full transition-all duration-500 ease-out',
                  sectionActive ? 'bg-emerald-400/90' : 'bg-muted-foreground/40',
                  flash && 'shadow-[0_0_0_4px_rgba(52,211,153,0.55),0_0_0_8px_rgba(52,211,153,0.25)] scale-125'
                )}
              />
              <span className="uppercase tracking-wider font-medium text-[9px]">{active.title}</span>
            </div>
            {/* Step pills (inside screen) */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-medium mb-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon
                const on = s.key === active.key
                return (
                  <button
                    key={s.key}
                    onClick={() => {
                      if (staticIndex === null) setIndex(i)
                    }}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1 py-1 rounded-md border transition-colors',
                      on
                        ? 'bg-foreground text-background border-foreground'
                        : ' hover:text-foreground'
                    )}
                    aria-label={`Show ${s.title} step`}
                  >
                    <Icon className="h-3 w-3" /> {s.title}
                  </button>
                )
              })}
            </div>
            {/* Arrow navigation (only when dynamic) */}
            {staticIndex === null && showArrows && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i - 1 + STEPS.length) % STEPS.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border bg-background/70 text-foreground flex items-center justify-center text-xs hover:bg-muted transition"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex((i) => (i + 1) % STEPS.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border bg-background/70 text-foreground flex items-center justify-center text-xs hover:bg-muted transition"
                  aria-label="Next step"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
            {/* Active content card */}
            <div className="flex-1 rounded-lg border  p-4 flex flex-col gap-3 text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground/90">
                {(() => {
                  const I = active.icon
                  return <I className="h-4 w-4" />
                })()} {active.title}
              </div>
              <p className="leading-relaxed text-muted-foreground text-[11px]">{active.desc}</p>
              <div className="mt-auto border-t pt-2 text-[10px] text-muted-foreground/80 italic">
                {active.hint}
              </div>
            </div>
            {/* Progress dots only in auto mode */}
            {staticIndex === null && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {STEPS.map((s, i) => {
                  const on = i === index
                  return (
                    <span
                      key={s.key}
                      className={cn(
                        'h-2 w-2 rounded-full border transition-colors',
                        on ? 'bg-foreground border-foreground' : 'bg-muted border-border'
                      )}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PhoneFlowDemo
