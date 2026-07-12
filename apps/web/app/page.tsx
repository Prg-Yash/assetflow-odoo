import { ArrowRight, Package, Users, BookOpen, Zap, BarChart3, CheckCircle, ArrowDown, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { PhoneFlowDemo } from './components/phone-flow-demo'
import { LandingNav } from './components/landing-nav'

export const metadata = {
  title: 'AssetFlow — Enterprise Asset Management',
  description: "Centralize asset tracking, streamline allocations, and gain real-time visibility into your organization's resources.",
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/5">
        <div className="mx-auto max-w-7xl px-6 py-32 sm:px-8 sm:py-40">
          <div className="space-y-12 text-center">
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold uppercase tracking-widest text-accent">Enterprise Asset Management</span>
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-tight">
                Manage Assets with <br /> <span className="text-accent">Clarity</span>
              </h1>
              <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                Centralize your asset tracking, streamline allocations, and gain real-time visibility into your organization's resources.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="px-8 py-3 border-2 border-primary hover:bg-primary/5 text-foreground rounded-lg font-semibold transition-colors duration-300 text-center"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="space-y-16">
            <div className="space-y-4 text-center">
              <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">Powerful Features</h2>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
                Everything you need to manage assets effectively and maintain organizational control.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Package,
                  title: 'Asset Lifecycle',
                  description: 'Track assets from acquisition through retirement with automated state transitions.',
                },
                {
                  icon: Users,
                  title: 'Role-Based Workflows',
                  description: 'Secure, department-specific workflows for admins, managers, and employees.',
                },
                {
                  icon: BookOpen,
                  title: 'Resource Booking',
                  description: 'Calendar-based booking for shared resources with built-in overlap prevention.',
                },
                {
                  icon: Zap,
                  title: 'Maintenance Workflows',
                  description: 'Structured approval-based maintenance requests with automated tracking.',
                },
                {
                  icon: BarChart3,
                  title: 'Audit & Compliance',
                  description: 'Scheduled audit cycles with auto-generated discrepancy reports.',
                },
                {
                  icon: CheckCircle,
                  title: 'Real-Time Notifications',
                  description: 'Instant alerts for overdue returns, approvals, and maintenance events.',
                },
              ].map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div key={i} className="bg-card border border-border rounded-lg p-8 group hover:shadow-lg hover:border-accent/30 transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-accent/10 group-hover:bg-accent/20 mb-6 transition-colors duration-300">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-base text-muted-foreground font-medium leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-border h  overflow-hidden">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-12 md:py-20">
          <div className="mb-8 md:mb-10 flex flex-col gap-2">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">How It Works</h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-prose font-medium">
              Streamlined workflow for asset management from registration to resolution.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10">
            {/* Register */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5 flex-1 min-w-0">
              <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[300px] lg:max-w-none">
                <PhoneFlowDemo staticStep="register" showArrows={false} />
              </div>
              <h3 className="text-sm md:text-base font-semibold tracking-tight text-center">Register Assets</h3>
              <div className="lg:hidden flex justify-center pt-1" aria-hidden>
                <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </div>
            </div>
            {/* Desktop arrow */}
            <div className="hidden lg:flex items-center justify-center flex-shrink-0" aria-hidden>
              <ArrowRight className="h-8 w-8 xl:h-10 xl:w-10 text-muted-foreground" />
            </div>
            {/* Track */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5 flex-1 min-w-0">
              <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[300px] lg:max-w-none">
                <PhoneFlowDemo staticStep="track" showArrows={false} />
              </div>
              <h3 className="text-sm md:text-base font-semibold tracking-tight text-center">Track & Monitor</h3>
              <div className="lg:hidden flex justify-center pt-1" aria-hidden>
                <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              </div>
            </div>
            {/* Desktop arrow */}
            <div className="hidden lg:flex items-center justify-center flex-shrink-0" aria-hidden>
              <ArrowRight className="h-8 w-8 xl:h-10 xl:w-10 text-muted-foreground" />
            </div>
            {/* Manage */}
            <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5 flex-1 min-w-0">
              <div className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[300px] lg:max-w-none">
                <PhoneFlowDemo staticStep="manage" showArrows={false} />
              </div>
              <h3 className="text-sm md:text-base font-semibold tracking-tight text-center">Manage & Optimize</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-t border-border py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="space-y-16">
            <div className="space-y-4 text-center">
              <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">Why Choose AssetFlow?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {[
                  'Eliminate spreadsheet chaos with centralized tracking',
                  'Prevent asset conflicts with intelligent allocation rules',
                  'Reduce maintenance delays with approval workflows',
                  'Make data-driven decisions with real-time analytics',
                  'Maintain compliance through automated audit cycles',
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4 items-start group hover:translate-x-2 transition-transform duration-300">
                    <div className="flex-shrink-0 mt-1 p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                      <CheckCircle className="text-accent" size={20} />
                    </div>
                    <p className="font-semibold text-foreground text-lg">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-lg h-96 flex items-center justify-center hover:shadow-lg hover:border-accent/30 transition-all duration-300">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent/10">
                    <BarChart3 className="text-accent" size={32} />
                  </div>
                  <div className="text-muted-foreground font-medium">Dashboard Preview</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-6 sm:px-8">
          <div className="rounded-xl border border-border bg-gradient-to-br from-accent/5 to-secondary/5 p-12 sm:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">Ready to Transform Asset Management?</h2>
              <p className="text-xl text-muted-foreground font-medium">
                Join organizations simplifying their operations with AssetFlow.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 border-2 border-primary text-foreground rounded-lg font-semibold hover:bg-primary/5 transition-colors duration-300 text-center"
              >
                Schedule Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary/2 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Asset<span className="text-accent">Flow</span></h3>
              <p className="text-sm text-muted-foreground font-medium">Enterprise asset management, simplified.</p>
            </div>
            {[
              { title: 'Product', items: ['Features', 'Pricing', 'Security'] },
              { title: 'Company', items: ['About', 'Blog', 'Careers'] },
              { title: 'Resources', items: ['Documentation', 'API', 'Support'] },
            ].map((col, i) => (
              <div key={i} className="space-y-4">
                <h4 className="font-semibold text-sm">{col.title}</h4>
                <ul className="space-y-3">
                  {col.items.map((item, j) => (
                    <li key={j}>
                      <Link href="#" className="text-sm text-muted-foreground font-medium hover:text-accent transition-colors duration-300">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground font-medium">© 2024 AssetFlow. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground font-medium hover:text-accent transition-colors duration-300">Privacy</Link>
              <Link href="#" className="text-sm text-muted-foreground font-medium hover:text-accent transition-colors duration-300">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

