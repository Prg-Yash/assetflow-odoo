'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { resetPassword } from '../auth-api'
import { BrandLogo } from '../../components/brand-logo'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Reset token is missing. Please request a new password reset link.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, password)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[hsl(240_10%_5%)] px-4 py-12 text-white">
      <div className="w-full max-w-[460px] rounded-2xl border border-white/10 bg-[hsl(240_10%_10%)] shadow-[0_32px_80px_hsl(240_10%_3%/0.7)] ring-1 ring-white/5">
        <div className="border-b border-white/10 px-8 py-5 text-center">
          <BrandLogo
            href="/"
            size={34}
            className="justify-center"
            textClassName="text-white"
          />
          <h1 className="mt-1 text-sm font-semibold text-white/90 tracking-tight">
            Create new password
          </h1>
        </div>

        <div className="px-8 py-8">
          {success ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                <CheckCircle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">Password updated</h2>
                <p className="text-sm leading-6 text-white/55">
                  You can now sign in with your new password.
                </p>
              </div>
              <Link
                href="/auth/login"
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-accent/20 transition-all duration-200 hover:opacity-90"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-semibold text-white">Set a new password</h2>
                <p className="text-sm leading-6 text-white/55">
                  Choose a password with at least 8 characters.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {!token && (
                <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                  This reset link is missing a token. Request a new link from the forgot password page.
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="new-password" className="block text-xs font-medium text-white/60">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/70"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-accent/20 transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </button>

              <Link
                href="/auth/forgot-password"
                className="block text-center text-xs text-white/40 transition-colors hover:text-accent"
              >
                Request another reset link
              </Link>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[hsl(240_10%_5%)] px-4 py-12 text-white">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
