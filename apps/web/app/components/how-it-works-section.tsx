'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { PhoneFlowDemo } from './phone-flow-demo'
import { cn } from '../lib/utils'

const STEPS = [
  { staticStep: 'register' as const, label: 'Register Assets' },
  { staticStep: 'track' as const, label: 'Track & Monitor' },
  { staticStep: 'manage' as const, label: 'Manage & Optimize' },
]

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.35, rootMargin: '-10% 0px -10% 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className={cn(
        'border-t border-border min-h-screen overflow-hidden flex items-center transition-colors duration-500',
        isActive && 'bg-emerald-500/[0.03]'
      )}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-12 md:py-16 w-full">
        <div className="mb-8 md:mb-10 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-all duration-500',
                isActive
                  ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.35),0_0_0_8px_rgba(52,211,153,0.15)] scale-110'
                  : 'bg-muted-foreground/30'
              )}
              aria-hidden
            />
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">How It Works</h2>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-prose font-medium pl-5">
            Streamlined workflow for asset management from registration to resolution.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6 sm:gap-8 md:gap-10 lg:gap-10">
          {STEPS.map((step, i) => (
            <div key={step.staticStep} className="contents">
              <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5 flex-1 min-w-0">
                <div className="w-full max-w-[300px] sm:max-w-[320px] md:max-w-[340px] lg:max-w-none">
                  <PhoneFlowDemo
                    staticStep={step.staticStep}
                    showArrows={false}
                    sectionActive={isActive}
                  />
                </div>
                <h3 className="text-sm md:text-base font-semibold tracking-tight text-center">
                  {step.label}
                </h3>
                {i < STEPS.length - 1 && (
                  <div className="lg:hidden flex justify-center pt-1" aria-hidden>
                    <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {i < STEPS.length - 1 && (
                <div className="hidden lg:flex items-center justify-center flex-shrink-0" aria-hidden>
                  <ArrowRight className="h-8 w-8 xl:h-10 xl:w-10 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
