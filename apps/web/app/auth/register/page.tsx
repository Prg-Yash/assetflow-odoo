'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Package,
  Shield,
  Users,
  Zap,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useSession } from '@/hooks/use-organizations'
import { submitAuth } from '../auth-api'
import { BrandLogo } from '../../components/brand-logo'

const FEATURES = [
  { icon: Package, label: 'Full asset lifecycle management' },
  { icon: Users, label: 'Role-based team collaboration' },
  { icon: Shield, label: 'Audit-ready compliance tracking' },
  { icon: Zap, label: 'Real-time notifications & alerts' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [error, setError] = useState('')

  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const { data: sessionData, isLoading: isSessionLoading } = useSession()
  const user = sessionData?.user

  // Redirect if already logged in
  useEffect(() => {
    if (!isSessionLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isSessionLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await submitAuth('/sign-up/email', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        callbackURL: '/dashboard',
      })
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">

      {/* ── LEFT PANEL (lg+) ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-between w-[46%] xl:w-[42%] relative overflow-hidden bg-[hsl(222_22%_8%)] px-12 py-14 text-white">
        {/* Decorative blobs */}
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

        {/* Logo */}
        <BrandLogo
          href="/"
          size={42}
          className="relative z-10"
          textClassName="text-white"
        />

        {/* Middle copy */}
        <div className="relative z-10 space-y-10">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">
              Enterprise Asset Management
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white">
              Take control of every asset in your&nbsp;
              <span className="text-accent">organisation.</span>
            </h1>
            <p className="text-base text-white/60 leading-relaxed max-w-sm">
              Join hundreds of teams that use AssetFlow to eliminate spreadsheet
              chaos and gain real-time visibility.
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

        {/* Testimonial */}
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

        {/* Card */}
        <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card overflow-hidden shadow-xl ring-1 ring-border/40">

          {/* Title bar */}
          <div className="border-b border-border px-8 py-5 text-center">
            {/* Mobile-only logo */}
            <BrandLogo
              href="/"
              size={34}
              className="lg:hidden mb-2 justify-center"
              textClassName="text-foreground"
            />
            <h2 className="text-sm font-semibold text-foreground tracking-tight">
              AssetFlow – register
            </h2>
          </div>

          <div className="px-8 pt-8 pb-8 space-y-6">
            {step === 'success' ? (
              /* ── Success state ── */
              <div className="text-center space-y-5 py-2">
                <div className="flex justify-center">
                  <div className="w-[72px] h-[72px] rounded-full border-2 border-border bg-muted/40 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-accent" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">Account created!</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Check your inbox at{' '}
                    <span className="text-foreground font-medium">{form.email}</span>
                    {' '}to verify and activate.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/40 px-4 py-3.5 text-left">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your employee account is ready.
                    <br />
                    Admin roles will be assigned by your org admin.
                  </p>
                </div>
                <Link
                  href="/auth/login"
                  className="flex w-full items-center justify-center rounded-lg bg-primary hover:opacity-90 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 shadow-lg shadow-accent/20"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <>
                {/* Avatar */}
                <div className="flex justify-center">
                  <div className="w-[72px] h-[72px] rounded-full border-2 border-border bg-background flex items-center justify-center">
                    <img src="/AF.png" alt="AssetFlow logo" className="h-9 w-9 object-contain" draggable={false} />
                  </div>
                </div>

                {/* Form */}
                <form id="register-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {error && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  {/* Full name */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-name" className="block text-xs font-medium text-muted-foreground">
                      Full name
                    </label>
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="block text-xs font-medium text-muted-foreground">
                      Email
                    </label>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="reg-password" className="block text-xs font-medium text-muted-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password.length > 0 && <PasswordStrength value={form.password} />}
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    By creating an account you agree to our{' '}
                    <Link href="#" className="text-accent hover:underline font-medium">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="#" className="text-accent hover:underline font-medium">Privacy Policy</Link>.
                  </p>

                  {/* Submit */}
                  <button
                    id="register-submit"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 active:scale-[0.99] py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-accent/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-start">
                    <span className="bg-card pr-3 text-xs font-medium text-muted-foreground">
                      Already have an account?
                    </span>
                  </div>
                </div>

                {/* Info box + sign-in link */}
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-muted/40 px-4 py-3.5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sign up creates an employee account
                      <br />
                      admin roles assigned later
                    </p>
                  </div>

                  <Link
                    href="/auth/login"
                    id="register-go-login"
                    className="flex w-full items-center justify-center rounded-lg border border-border bg-background hover:bg-muted py-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

/* ── Password strength indicator ─────────────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; colorClass: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Weak', colorClass: 'bg-destructive' }
  if (score === 2) return { score, label: 'Fair', colorClass: 'bg-yellow-500' }
  if (score === 3) return { score, label: 'Good', colorClass: 'bg-green-500' }
  return { score, label: 'Strong', colorClass: 'bg-green-400' }
}

function PasswordStrength({ value }: { value: string }) {
  const { score, label, colorClass } = getStrength(value)
  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colorClass : 'bg-muted'
              }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength:{' '}
        <span className={
          score <= 1 ? 'text-destructive'
            : score === 2 ? 'text-yellow-500'
              : 'text-green-500'
        }>
          {label}
        </span>
      </p>
    </div>
  )
}
