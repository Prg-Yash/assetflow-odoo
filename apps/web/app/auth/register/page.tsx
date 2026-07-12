'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Package,
  Shield,
  User,
  Users,
  Zap,
} from 'lucide-react'

const FEATURES = [
  { icon: Package, label: 'Full asset lifecycle management' },
  { icon: Users, label: 'Role-based team collaboration' },
  { icon: Shield, label: 'Audit-ready compliance tracking' },
  { icon: Zap, label: 'Real-time notifications & alerts' },
]

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')

  const [form, setForm] = useState({
    org: '',
    name: '',
    email: '',
    password: '',
    role: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1800))
    setLoading(false)
    setStep('success')
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* ── Left panel: brand / features ─────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-between w-[46%] xl:w-[42%] relative overflow-hidden bg-secondary px-12 py-14 text-secondary-foreground">
        {/* Decorative blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-28 -left-28 w-[480px] h-[480px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, hsl(24 100% 50%) 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 w-[360px] h-[360px] rounded-full opacity-15"
          style={{
            background:
              'radial-gradient(circle, hsl(24 100% 60%) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 text-2xl font-light tracking-tight text-white">
          Asset<span className="font-semibold text-accent">Flow</span>
        </Link>

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

      {/* ── Right panel: form ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 py-12">
        {/* Mobile logo */}
        <Link
          href="/"
          className="lg:hidden mb-10 text-2xl font-light tracking-tight"
        >
          Asset<span className="font-semibold text-accent">Flow</span>
        </Link>

        <div className="w-full max-w-md">
          {step === 'success' ? (
            /* ── Success state ── */
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mx-auto">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold">You&apos;re all set!</h2>
                <p className="text-muted-foreground text-sm">
                  We&apos;ve sent a confirmation link to{' '}
                  <span className="text-foreground font-medium">{form.email}</span>.
                  Check your inbox to activate your account.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
              >
                Back to home <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* ── Registration form ── */
            <>
              <div className="mb-8 space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">
                  Create your account
                </h2>
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-accent hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <form
                id="register-form"
                onSubmit={handleSubmit}
                className="space-y-4"
                noValidate
              >
                {/* Organisation */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-org"
                    className="block text-sm font-medium"
                  >
                    Organisation name
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="reg-org"
                      name="org"
                      type="text"
                      required
                      placeholder="Acme Corp"
                      value={form.org}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-card/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Full name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-name"
                    className="block text-sm font-medium"
                  >
                    Full name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-card/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-email"
                    className="block text-sm font-medium"
                  >
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      required
                      placeholder="jane@acmecorp.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-card/60 py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-role"
                    className="block text-sm font-medium"
                  >
                    Your role
                  </label>
                  <select
                    id="reg-role"
                    name="role"
                    required
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-input bg-card/60 py-2.5 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition appearance-none"
                  >
                    <option value="" disabled>
                      Select a role…
                    </option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Asset Manager</option>
                    <option value="employee">Employee</option>
                    <option value="auditor">Auditor</option>
                  </select>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="reg-password"
                    className="block text-sm font-medium"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      id="reg-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-input bg-card/60 py-2.5 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {form.password.length > 0 && (
                    <PasswordStrength value={form.password} />
                  )}
                </div>

                {/* Terms */}
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  By creating an account you agree to our{' '}
                  <Link href="#" className="text-accent hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-accent hover:underline font-medium">
                    Privacy Policy
                  </Link>
                  .
                </p>

                {/* Submit */}
                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs text-muted-foreground">
                    or continue with
                  </span>
                </div>
              </div>

              {/* SSO placeholder */}
              <button
                id="register-google"
                type="button"
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-card/60 py-2.5 text-sm font-medium hover:bg-muted/50 hover:border-accent/30 transition-all duration-200"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

/* ── Password strength indicator ────────────────────────────────────── */
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++

  if (score <= 1) return { score, label: 'Weak', color: 'bg-destructive' }
  if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500' }
  if (score === 3) return { score, label: 'Good', color: 'bg-green-500' }
  return { score, label: 'Strong', color: 'bg-green-600' }
}

function PasswordStrength({ value }: { value: string }) {
  const { score, label, color } = getStrength(value)
  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? color : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Strength:{' '}
        <span
          className={
            score <= 1
              ? 'text-destructive'
              : score === 2
                ? 'text-yellow-500'
                : 'text-green-500'
          }
        >
          {label}
        </span>
      </p>
    </div>
  )
}

/* ── Google icon ────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  )
}