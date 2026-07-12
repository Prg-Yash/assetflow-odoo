"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { PackageCheck, Clock, Database, ArrowRight, BarChart3, FileText, TrendingUp } from 'lucide-react'

interface WhyChooseStep {
  icon: React.ReactNode
  title: string
  description: string
  number: string
}

export function WhyChooseSection() {
  const [currentStep, setCurrentStep] = React.useState(0)

  const steps: WhyChooseStep[] = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Register assets in one place',
      description: 'Capture devices, tools, and inventory with a single source of truth',
      number: '01',
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: 'Assign ownership and locations',
      description: 'Move assets between teams, sites, and storage with clear accountability',
      number: '02',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Track maintenance and status',
      description: 'Monitor requests, downtime, and lifecycle events before issues spread',
      number: '03',
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Review audits and performance',
      description: 'Use live reports to improve compliance and forecast needs',
      number: '04',
    },
  ]

  const activeStepIndex = Math.min(currentStep, steps.length - 1)
  const step = steps[activeStepIndex]!

  return (
    <section id="how-it-works" className="relative py-20 md:py-32 overflow-hidden">
     
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary mb-6">
            AssetFlow Workflow
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            From asset intake
            <span className="block mt-2 text-primary">to audit-ready operations</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AssetFlow keeps inventory, ownership, maintenance, and compliance connected in one workflow.
          </p>
        </motion.div>

        {/* Large Browser Window with Embedded Step Selector */}
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Large Browser Mockup */}
            <div className="relative rounded-lg border border-black/25 dark:border-white/10 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-black/25 dark:border-white/10 bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 mx-4 px-3 py-1 bg-background/50 rounded text-xs text-muted-foreground text-center">
                  assetflow.app/{step.title.toLowerCase().replace(/\s+/g, '-')}
                </div>
              </div>

              {/* Main Dashboard Layout with Sidebar */}
              <div className="flex bg-gradient-to-br from-background to-muted/20 min-h-[600px]">
                {/* Embedded Step Navigation Sidebar */}
                <div className="w-[30rem] shrink-0 border-r border-black/25 dark:border-white/10 bg-card/30 p-4 flex flex-col items-stretch gap-3">
                  <div className="text-sm font-semibold text-muted-foreground mb-2 px-2">Workflow Steps</div>
                  {steps.map((s, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full self-stretch text-left p-4 rounded-lg border transition-all ${
                        index === currentStep
                          ? 'border-primary bg-primary/10 shadow-md'
                          : 'border-black/25 dark:border-white/10 bg-card/50 hover:bg-card/80 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                          index === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {s.number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm mb-1">{s.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{s.description}</div>
                        </div>
                        {index === currentStep && (
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                  
                  {/* Navigation buttons in sidebar */}
                  <div className="mt-auto pt-4 border-t border-black/25 dark:border-white/10 flex gap-2">
                    <button
                      onClick={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
                      className="flex-1 px-4 py-2 rounded-lg border border-black/25 dark:border-white/10 hover:bg-accent transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <ArrowRight className="h-3 w-3 rotate-180" />
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : 0))}
                      className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      Next
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex-1 p-8"
                >
                  {/* Step Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Content */}
                  <div className="space-y-4">
                  {currentStep === 0 && (
                    <>
                      {/* Asset intake view */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <PackageCheck className="h-8 w-8 text-primary" />
                          <div className="flex-1">
                            <div className="text-sm text-muted-foreground mb-1">Registering asset</div>
                            <div className="text-xl font-bold">Laptop - IT-2048</div>
                          </div>
                          <div className="text-green-500 font-bold">✓ Verified</div>
                        </div>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/60 border border-black/25 dark:border-white/10">
                            <div className="w-10 h-10 rounded bg-muted/50" />
                            <div className="flex-1">
                              <div className="h-3 w-40 bg-muted/50 rounded mb-2" />
                              <div className="h-2 w-28 bg-muted/30 rounded" />
                            </div>
                            <div className="w-16 h-8 rounded bg-green-500/10 flex items-center justify-center text-xs text-green-500">+{i * 10}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {currentStep === 1 && (
                    <>
                      {/* Ownership and location view */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {['A-01', 'A-02', 'A-03', 'B-01', 'B-02', 'B-03'].map((loc, i) => (
                          <div key={loc} className={`p-3 rounded-lg border text-center ${
                            i === 1 ? 'bg-primary/10 border-primary' : 'bg-card/60 border-border'
                          }`}>
                            <Database className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <div className="text-xs font-medium">{loc}</div>
                            <div className="text-xs text-muted-foreground mt-1">{i === 1 ? 'Assigned' : `${85 - i * 10}%`}</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-lg bg-card/70 border border-black/25 dark:border-white/10">
                        <div className="text-sm font-semibold mb-2">Transfer summary</div>
                        <div className="text-sm text-muted-foreground">
                          AssetFlow records department, site, and owner changes automatically so teams always know who has what.
                        </div>
                      </div>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      {/* Maintenance and status view */}
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-card/60 border border-black/25 dark:border-white/10">
                            <Clock className="h-6 w-6 text-primary" />
                            <div className="flex-1">
                              <div className="text-sm font-medium mb-1">Maintenance request #{1000 + i}</div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${i * 25}%` }} />
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">{i * 25}%</div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 rounded-lg bg-card/70 border border-black/25 dark:border-white/10">
                        <div className="text-sm font-semibold mb-2">Compliance note</div>
                        <div className="text-sm text-muted-foreground">
                          Approval trails and service history stay attached to each asset for easier audits.
                        </div>
                      </div>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      {/* Analytics and audit view */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <BarChart3 className="h-6 w-6 text-primary mb-2" />
                            <div className="text-xs text-muted-foreground mb-1">Efficiency</div>
                            <div className="text-2xl font-bold text-primary">94%</div>
                            <div className="text-xs text-green-500 mt-1">↑ 8.2%</div>
                          </div>
                          <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20">
                            <BarChart3 className="h-6 w-6 text-secondary mb-2" />
                            <div className="text-xs text-muted-foreground mb-1">Forecast</div>
                            <div className="text-2xl font-bold text-secondary">+15%</div>
                            <div className="text-xs text-green-500 mt-1">Next 30d</div>
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-card/80 border border-black/25 dark:border-white/10">
                          <div className="text-xs text-muted-foreground mb-3">Performance Trend</div>
                          <div className="flex items-end justify-between gap-1 h-24">
                            {[45, 58, 52, 68, 72, 85, 88, 92, 89, 94].map((height, i) => (
                              <div
                                key={i}
                                className="flex-1 bg-primary/30 rounded-t hover:bg-primary/50 transition-colors"
                                style={{ height: `${height}%` }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg bg-card/70 border border-black/25 dark:border-white/10">
                          <div className="text-sm font-semibold mb-2">Audit ready</div>
                          <div className="text-sm text-muted-foreground">
                            Live reports surface exceptions, utilization, and renewal risks before they become blockers.
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
