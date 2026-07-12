'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, useAcceptInvitation } from '@/hooks/use-organizations'
import { CheckCircle2, AlertCircle, RefreshCw, LogIn, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function AcceptInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { data: sessionData, isLoading: isSessionLoading } = useSession()
  const acceptMutation = useAcceptInvitation()

  const isLoggedIn = !!sessionData?.user

  useEffect(() => {
    if (!token) {
      setErrorMsg('No invitation token found in link.')
    }
  }, [token])

  const handleAccept = async () => {
    if (!token) return
    setErrorMsg(null)
    try {
      await acceptMutation.mutateAsync(token)
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to accept invitation. The link may have expired or is invalid.')
    }
  }

  if (isSessionLoading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-white/50">Verifying session...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[hsl(240_10%_8%)] shadow-2xl p-8 space-y-6 text-center">
      <div className="space-y-2">
        <span className="text-xl font-light tracking-tight">Asset<span className="font-semibold text-accent">Flow</span></span>
        <h2 className="text-2xl font-bold tracking-tight">Workspace Invitation</h2>
        <p className="text-sm text-white/40">You have been invited to collaborate on AssetFlow.</p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Acceptance Failed</p>
            <p className="opacity-90">{errorMsg}</p>
          </div>
        </div>
      )}

      {success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-emerald-400 animate-in fade-in duration-300">
          <CheckCircle2 className="w-12 h-12" />
          <p className="text-base font-semibold">Invitation Accepted!</p>
          <p className="text-xs text-white/40">Redirecting to your dashboard...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {!isLoggedIn ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-left text-sm text-amber-400">
                <p className="font-semibold">Authentication Required</p>
                <p className="opacity-90">Please login or register to accept this invitation.</p>
              </div>
              <Link
                href={`/auth/login?redirectTo=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                Log In & Accept
              </Link>
            </div>
          ) : (
            <button
              onClick={handleAccept}
              disabled={acceptMutation.isPending || !token}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {acceptMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Joining Workspace...
                </>
              ) : (
                <>
                  Join Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-[hsl(240_10%_4%)] text-white flex items-center justify-center p-4 font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-accent animate-spin" />
          <p className="text-sm text-white/50">Loading page...</p>
        </div>
      }>
        <AcceptInviteContent />
      </Suspense>
    </div>
  )
}
