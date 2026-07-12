'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Loader2,
  Mail,
  Package,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { BrandLogo } from '../../components/brand-logo'

const FEATURES = [
  { icon: Package, label: 'Full asset lifecycle management' },
  { icon: Users, label: 'Role-based team collaboration' },
  { icon: Shield, label: 'Audit-ready compliance tracking' },
  { icon: Zap, label: 'Real-time notifications & alerts' },
]

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setStep('success')
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">

      {/* ── LEFT PANEL (lg+) ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-between w-[46%] xl:w-[42%] relative overflow-hidden bg-[hsl(222_22%_8%)] px-12 py-14 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, hsl(24 100% 50%) 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, hsl(24 100% 60%) 0%, transparent 70%)' }}
        />

        <BrandLogo
          href="/"
          size={42}
          className="relative z-10"
          textClassName="text-white"
        />

        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Secure Account Recovery
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
              Reset your password and get back to your&nbsp;
              <span className="text-accent">workspace.</span>
            </h1>
            <p className="text-base text-white/60 leading-relaxed max-w-sm">
              Enter the email linked to your account and we&apos;ll send you a secure
              link to create a new password.
            </p>
          </div>

          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-accent/15">
                  <Icon className="w-4 h-4 text-accent" />
                </span>
                <span className="text-sm font-medium text-white/80">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <blockquote className="relative z-10 space-y-3">
          <p className="text-sm italic text-white/60 leading-relaxed">
            &ldquo;AssetFlow reduced our asset-related incidents by 60% in the first
            quarter. The audit trail alone is worth it.&rdquo;
          </p>
          <footer className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent text-xs font-bold">
              RP
            </span>
            <div>
              <p className="text-xs font-semibold text-white">Rahul Patel</p>
              <p className="text-xs text-white/50">IT Director, Nexora Group</p>
            </div>
          </footer>
        </blockquote>
      </aside>

      {/* ── RIGHT PANEL ───────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-background">

        <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card overflow-hidden shadow-xl ring-1 ring-border/40">

          <div className="border-b border-border px-8 py-5 text-center">
            <BrandLogo
              href="/"
              size={34}
              className="lg:hidden mb-2 justify-center"
              textClassName="text-foreground"
            />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              AssetFlow – forgot password
            </h2>
          </div>

          <div className="px-8 pt-8 pb-8 space-y-6">
            {step === 'success' ? (
              <div className="text-center space-y-5 py-2">
                <div className="flex justify-center">
                  <div className="w-[72px] h-[72px] rounded-full border-2 border-border bg-muted/40 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">Check your inbox</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If an account exists for{' '}
                    <span className="text-foreground font-medium">{email}</span>, we&apos;ve sent
                    password reset instructions.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3.5 text-left">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Didn&apos;t receive the email? Check your spam folder or try again
                    with a different address.
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="flex w-full items-center justify-center rounded-lg border border-border bg-background hover:bg-muted py-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Try another email
                  </button>
                  <Link
                    href="/auth/login"
                    className="flex w-full items-center justify-center rounded-lg bg-primary hover:opacity-90 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 shadow-lg shadow-accent/20"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="w-[72px] h-[72px] rounded-full border-2 border-border bg-muted/40 flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-accent" />
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-base font-semibold text-foreground">Forgot your password?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    No worries — enter your email and we&apos;ll send you reset instructions.
                  </p>
                </div>

                <form id="forgot-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-1.5">
                    <label htmlFor="forgot-email" className="block text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        id="forgot-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <button
                    id="forgot-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 active:scale-[0.99] py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-accent/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending reset link…
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-start">
                    <span className="bg-card pr-3 text-xs font-medium text-muted-foreground">
                      Remember your password?
                    </span>
                  </div>
                </div>

                <Link
                  href="/auth/login"
                  id="forgot-back-login"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted py-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
