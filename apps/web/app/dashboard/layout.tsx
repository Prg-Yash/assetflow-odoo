'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import {
  BarChart3,
  Bell,
  Building2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ArrowLeftRight,
  Wrench,
  X,
  User,
} from 'lucide-react'
import { ThemeToggle } from '../components/theme-toggle'

/* ─── Nav items ──────────────────────────────────────────────────────────── */
const NAV = [
  { href: '/dashboard/overview',      label: 'Dashboard',             icon: LayoutDashboard },
  { href: '/dashboard/organizations', label: 'Organisations',         icon: Building2 },
  { href: '/dashboard/setup',         label: 'Organization Setup',    icon: Settings },
  { href: '/dashboard/assets',        label: 'Assets',                icon: Package },
  { href: '/dashboard/transfer',      label: 'Allocation & Transfer', icon: ArrowLeftRight },
  { href: '/dashboard/booking',       label: 'Resource Booking',      icon: BookOpen },
  { href: '/dashboard/maintainence',  label: 'Maintenance',           icon: Wrench },
  { href: '/dashboard/audit',         label: 'Audit',                 icon: ClipboardList },
  { href: '/dashboard/reports',       label: 'Reports',               icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'Notifications',         icon: Bell },
]

const QUICK_NOTIFICATIONS = [
  { id: 'q1', message: 'Laptop AF-0014 assigned to Priya Shah', time: '2m ago', dotColor: 'bg-cyan-400', unread: true },
  { id: 'q2', message: 'Maintenance request AF-0055 approved', time: '18m ago', dotColor: 'bg-emerald-400', unread: true },
  { id: 'q3', message: 'Booking confirmed: Room B2 : 2:00 to 3:00 PM', time: '1h ago', dotColor: 'bg-blue-400', unread: true },
  { id: 'q4', message: 'Audit mismatch: 2 items in main storage', time: '3h ago', dotColor: 'bg-amber-400', unread: false },
]

const iconBtn =
  'flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
function Sidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean
  onCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (mobileOpen && ref.current && !ref.current.contains(e.target as Node)) {
        onMobileClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen, onMobileClose])

  useEffect(() => { onMobileClose() }, [pathname])

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        ref={ref}
        className={[
          'fixed top-0 left-0 z-50 h-screen flex flex-col',
          'bg-sidebar border-r border-sidebar-border text-sidebar-foreground',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'lg:w-[68px]' : 'lg:w-[240px]',
          'w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className={[
          'flex items-center h-[60px] border-b border-sidebar-border shrink-0 px-4',
          collapsed ? 'lg:justify-center' : 'justify-between',
        ].join(' ')}>
          <Link
            href="/"
            className={['text-lg font-light tracking-tight text-sidebar-foreground transition-all duration-200', collapsed ? 'lg:hidden' : ''].join(' ')}
          >
            Asset<span className="font-semibold text-accent">Flow</span>
          </Link>

          {collapsed && (
            <Link href="/" className="hidden lg:flex items-center justify-center">
              <span className="text-sm font-bold text-accent">AF</span>
            </Link>
          )}

          <button
            onClick={onCollapse}
            className={['hidden lg:flex w-7 h-7', iconBtn].join(' ')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={onMobileClose}
            className={['lg:hidden w-7 h-7', iconBtn].join(' ')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={[
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-accent/15 text-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
                ].join(' ')}
              >
                <span className={[
                  'absolute left-0 w-[3px] h-6 rounded-r-full bg-accent transition-all duration-150',
                  active ? 'opacity-100' : 'opacity-0',
                ].join(' ')} />

                <Icon className={[
                  'w-[18px] h-[18px] shrink-0 transition-colors duration-150',
                  active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground',
                ].join(' ')} />

                <span className={[
                  'truncate transition-all duration-200',
                  collapsed ? 'lg:hidden' : '',
                ].join(' ')}>
                  {label}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="shrink-0 border-t border-sidebar-border p-3 space-y-2">
          <div className={[
            'flex items-center gap-2 px-1',
            collapsed ? 'lg:justify-center' : 'justify-between',
          ].join(' ')}>
            <span className={['text-[11px] font-medium text-muted-foreground', collapsed ? 'lg:hidden' : ''].join(' ')}>
              Theme
            </span>
            <ThemeToggle variant="dashboard" />
          </div>
          <div className={[
            'flex items-center gap-3 px-1 py-2',
            collapsed ? 'lg:justify-center' : '',
          ].join(' ')}>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className={['min-w-0 flex-1', collapsed ? 'lg:hidden' : ''].join(' ')}>
              <p className="text-xs font-semibold text-sidebar-foreground truncate">Admin User</p>
              <p className="text-[11px] text-muted-foreground truncate">admin@assetflow.com</p>
            </div>
            <button
              className={[
                'shrink-0 w-7 h-7 text-muted-foreground hover:text-red-500 hover:bg-muted transition-colors',
                iconBtn,
                collapsed ? 'lg:hidden' : '',
              ].join(' ')}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

/* ─── Topbar ─────────────────────────────────────────────────────────────── */
function Topbar({
  onMobileOpen,
}: {
  collapsed: boolean
  onMobileOpen: () => void
}) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [notiOpen, setNotiOpen] = useState(false)
  const notiRef = useRef<HTMLDivElement>(null)

  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1] ?? 'overview'
  const pageTitle = NAV.find(n => n.href.endsWith(lastSegment))?.label ?? 'Dashboard'

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setNotiOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setProfileOpen(false)
    setNotiOpen(false)
  }, [pathname])

  const menuItem =
    'flex items-center gap-2.5 px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'

  return (
    <header className="sticky top-0 z-30 h-[60px] flex items-center gap-4 border-b border-border bg-card px-4 sm:px-6">
      <button
        onClick={onMobileOpen}
        className={['lg:hidden w-8 h-8', iconBtn].join(' ')}
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/dashboard/overview"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
        >
          Dashboard
        </Link>
        <span className="text-xs text-muted-foreground/50 hidden sm:block">/</span>
        <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle variant="dashboard" />

        <div className="relative" ref={notiRef}>
          <button
            onClick={() => { setNotiOpen(v => !v); setProfileOpen(false) }}
            className={['relative w-8 h-8', iconBtn].join(' ')}
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </button>

          {notiOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <p className="text-xs font-semibold text-foreground">Notifications</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">3 new</span>
              </div>
              <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
                {QUICK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className={['px-4 py-3 flex items-start gap-3 hover:bg-muted transition-colors', n.unread ? '' : 'opacity-55'].join(' ')}>
                    <span className={['w-2 h-2 rounded-full mt-1.5 shrink-0', n.dotColor].join(' ')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground leading-relaxed truncate">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-4 py-2.5">
                <Link
                  href="/dashboard/notifications"
                  onClick={() => setNotiOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors"
                >
                  View all notifications
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="hidden sm:block text-xs font-medium text-muted-foreground">Admin</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-xs font-semibold text-foreground">Admin User</p>
                <p className="text-[11px] text-muted-foreground truncate">admin@assetflow.com</p>
              </div>
              <div className="py-1">
                <Link href="/dashboard/overview" className={menuItem} onClick={() => setProfileOpen(false)}>
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
                <Link href="/dashboard/organizations" className={menuItem} onClick={() => setProfileOpen(false)}>
                  <Building2 className="w-3.5 h-3.5" />
                  Organisations
                </Link>
                <Link href="/dashboard/setup" className={menuItem} onClick={() => setProfileOpen(false)}>
                  <Settings className="w-3.5 h-3.5" />
                  Organization Setup
                </Link>
                <Link href="/dashboard/notifications" className={menuItem} onClick={() => setProfileOpen(false)}>
                  <Bell className="w-3.5 h-3.5" />
                  Notifications
                </Link>
              </div>
              <div className="border-t border-border py-1">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-muted transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

/* ─── Dashboard Layout ───────────────────────────────────────────────────── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed]       = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)

  const sidebarW = collapsed ? 'lg:pl-[68px]' : 'lg:pl-[240px]'

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className={['transition-all duration-300', sidebarW].join(' ')}>
        <Topbar
          collapsed={collapsed}
          onMobileOpen={() => setMobileOpen(true)}
        />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
