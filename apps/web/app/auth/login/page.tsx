'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Loader2,
  Package,
  Shield,
  Users,
  Zap,
} from 'lucide-react'

const FEATURES = [
  { icon: Package, label: 'Full asset lifecycle management' },
  { icon: Users, label: 'Role-based team collaboration' },
  { icon: Shield, label: 'Audit-ready compliance tracking' },
  { icon: Zap, label: 'Real-time notifications & alerts' },
]

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans">

      {/* ── LEFT PANEL (lg+) ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col justify-between w-[46%] xl:w-[42%] relative overflow-hidden  px-12 py-14 text-secondary-foreground">
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
              Welcome back to your&nbsp;
              <span className="text-accent">workspace.</span>
            </h1>
            <p className="text-base text-white/60 leading-relaxed max-w-sm">
              Sign in to manage assets, track lifecycle events, and collaborate
              with your team — all in one place.
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
      <main className="flex-1 flex items-center justify-center px-4 py-12 bg-[hsl(240_10%_5%)] dark:bg-[hsl(240_10%_3%)]">

        {/* Card — full width on mobile, fixed width on lg */}
        <div className="w-full max-w-[480px] rounded-2xl border border-white/10 bg-[hsl(240_10%_10%)] dark:bg-[hsl(240_10%_8%)] overflow-hidden shadow-[0_32px_80px_hsl(240_10%_3%/0.7)] ring-1 ring-white/5">

          {/* Title bar */}
          <div className="border-b border-white/10 px-8 py-5 text-center">
            {/* Mobile-only logo */}
            <Link href="/" className="lg:hidden block mb-1 text-lg font-light tracking-tight text-white">
              Asset<span className="font-semibold text-accent">Flow</span>
            </Link>
            <h2 className="text-sm font-semibold text-white/90 tracking-tight">
              AssetFlow – login
            </h2>
          </div>

          <div className="px-8 pt-8 pb-8 space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-[72px] h-[72px] rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center">
                <span className="text-white font-semibold text-xl tracking-wider select-none">AF</span>
              </div>
            </div>

            {/* Form */}
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="block text-xs font-medium text-white/60">
                  Email
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="login-password" className="block text-xs font-medium text-white/60">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Forgot password */}
                <div className="flex justify-end pt-0.5">
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-white/40 hover:text-accent transition-colors"
                  >
                    Forgot password
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 active:scale-[0.99] py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-accent/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-start">
                <span className="bg-[hsl(240_10%_10%)] dark:bg-[hsl(240_10%_8%)] pr-3 text-xs font-medium text-white/40">
                  New here?
                </span>
              </div>
            </div>

            {/* Sign-up info box */}
            <div className="space-y-3">
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3.5">
                <p className="text-sm text-white/50 leading-relaxed">
                  Sign up creates an employee account
                  <br />
                  admin roles assigned later
                </p>
              </div>

              <Link
                href="/auth/register"
                id="login-create-account"
                className="flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 py-3 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
