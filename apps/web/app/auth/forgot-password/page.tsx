'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react'
import { requestPasswordReset } from '../auth-api'
import { BrandLogo } from '../../components/brand-logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await requestPasswordReset(email.trim())
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-[460px] rounded-2xl border border-border bg-card shadow-xl ring-1 ring-border/40">
        <div className="border-b border-border px-8 py-5 text-center">
          <BrandLogo
            href="/"
            size={34}
            className="justify-center"
            textClassName="text-foreground"
          />
          <h1 className="mt-1 text-sm font-semibold text-foreground tracking-tight">
            Reset password
          </h1>
        </div>

        <div className="px-8 py-8">
          {sent ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Check your email</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  If an account exists for {email}, AssetFlow sent a password reset link.
                  In local development, check the API terminal if SMTP is not configured.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Mail className="h-7 w-7" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">Forgot your password?</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Enter your email and we will send a reset link.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="forgot-email" className="block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-accent/20 transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </button>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-xs text-muted-foreground transition-colors hover:text-accent"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to login
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
