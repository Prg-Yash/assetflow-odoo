import { ArrowRight, Package, Users, BookOpen, Zap, BarChart3, CheckCircle, Download, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { LandingNav } from './components/landing-nav'
import { PhoneFlowDemo } from './components/phone-flow-demo'
import { HowItWorksSection } from './components/how-it-works-section'
import { WhyChooseSection } from './components/why-choose-section'

export const metadata = {
  title: 'AssetFlow — Enterprise Asset Management',
  description: "Centralize asset tracking, streamline allocations, and gain real-time visibility into your organization's resources.",
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/5 min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 w-full">
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
      <section id="features" className="border-t border-border min-h-[80vh] flex items-center py-16 sm:py-20">
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

      <HowItWorksSection />

      {/* Benefits */}
      <section id="benefits" className="border-t border-border min-h-[80vh] flex items-center py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="space-y-16">
            
              
           <WhyChooseSection />
          </div>
        </div>
      </section>

      {/* Mobile App Download Section */}
      <section id="mobile-app" className="border-t border-border bg-card min-h-[90vh] flex items-center py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 w-full">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                <Smartphone className="h-4 w-4" />
                Mobile App
              </div>
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Download our mobile app
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground font-medium leading-relaxed">
                  Keep asset updates, approvals, and field workflows in your pocket. Install the Android APK to get
                  quick access wherever your team works.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  'Fast asset check-ins',
                  'Offline-ready field updates',
                  'Instant approval alerts',
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm font-medium text-foreground shadow-sm">
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/downloads/assetflow-mobile.apk"
                  download
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Download className="w-4 h-4" />
                  Download APK
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-3 border-2 border-primary text-foreground rounded-lg font-semibold hover:bg-primary/5 transition-colors duration-300 text-center"
                >
                  Explore Features
                </Link>
              </div>

              <p className="text-sm text-muted-foreground">
                Android APK available for direct install. Place the file at <span className="font-medium text-foreground">/public/downloads/assetflow-mobile.apk</span>.
              </p>
            </div>

            <div className="relative flex justify-center lg:justify-end lg:pl-6">
              <div className="absolute inset-0 -z-10 rounded-full bg-accent/10 blur-3xl" />
              <PhoneFlowDemo variant="mobile-app" staticStep="download" showArrows={false} sectionActive />
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

