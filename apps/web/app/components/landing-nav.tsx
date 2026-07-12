'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function LandingNav() {
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#benefits', label: 'Benefits' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        {/* Logo */}
        <Link href="/" className="text-2xl font-light tracking-tight text-foreground">
          Asset<span className="font-semibold text-accent">Flow</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-light hover:text-accent transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-4 w-px bg-border" />
          <Link
            href="/auth/login"
            className="text-sm font-medium hover:text-accent transition-colors duration-300"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:scale-105 transition-all duration-300 shadow-sm"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-border pt-4 flex flex-col gap-3">
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 text-center"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold text-center hover:bg-primary/95 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
