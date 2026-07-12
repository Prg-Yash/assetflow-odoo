'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { cn } from '../lib/utils'

type ThemeToggleVariant = 'landing' | 'dashboard'

const variantStyles: Record<ThemeToggleVariant, string> = {
  landing:
    'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border',
  dashboard:
    'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border',
}

export function ThemeToggle({
  variant = 'landing',
  className,
}: {
  variant?: ThemeToggleVariant
  className?: string
}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={mounted ? (isDark ? 'Switch to light mode' : 'Switch to dark mode') : 'Toggle theme'}
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200',
        variantStyles[variant],
        className
      )}
    >
      {mounted ? (
        isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
      ) : (
        <span className="w-4 h-4" aria-hidden />
      )}
    </button>
  )
}
