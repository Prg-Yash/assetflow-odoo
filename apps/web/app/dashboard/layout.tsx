'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/hooks/use-organizations'
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
import { signOut } from '../auth/auth-api'

/* ─── Nav items for Organization Mode ─────────────────────────────────────────── */
const ORG_NAV = [
  { href: '/dashboard/[organizationId]',      label: 'Dashboard',             icon: LayoutDashboard },
  { href: '/dashboard/[organizationId]/setup',         label: 'Organization Setup',    icon: Settings },
  { href: '/dashboard/[organizationId]/assets',        label: 'Assets',                icon: Package },
  { href: '/dashboard/[organizationId]/transfer',      label: 'Allocation & Transfer', icon: ArrowLeftRight },
  { href: '/dashboard/[organizationId]/booking',       label: 'Resource Booking',      icon: BookOpen },
  { href: '/dashboard/[organizationId]/maintainence',  label: 'Maintenance',           icon: Wrench },
  { href: '/dashboard/[organizationId]/audit',         label: 'Audit',                 icon: ClipboardList },
  { href: '/dashboard/[organizationId]/reports',       label: 'Reports',               icon: BarChart3 },
  { href: '/dashboard/[organizationId]/notifications', label: 'Notifications',         icon: Bell },
]

const QUICK_NOTIFICATIONS = [
  { id: 'q1', message: 'Laptop AF-0014 assigned to Priya Shah', time: '2m ago', dotColor: 'bg-cyan-400', unread: true },
  { id: 'q2', message: 'Maintenance request AF-0055 approved', time: '18m ago', dotColor: 'bg-emerald-400', unread: true },
  { id: 'q3', message: 'Booking confirmed: Room B2 : 2:00 to 3:00 PM', time: '1h ago', dotColor: 'bg-blue-400', unread: true },
  { id: 'q4', message: 'Audit mismatch: 2 items in main storage', time: '3h ago', dotColor: 'bg-amber-400', unread: false },
]

/* ─── Sidebar ────────────────────────────────────────────────────────────── */
function Sidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
  onSignOut,
  user,
  orgId,
}: {
  collapsed: boolean
  onCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
  onSignOut: () => void
  user?: { name: string; email: string }
  orgId: string | null
}) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  /* Close mobile sidebar on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (mobileOpen && ref.current && !ref.current.contains(e.target as Node)) {
        onMobileClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen, onMobileClose])

  /* Close mobile on route change */
  useEffect(() => { onMobileClose() }, [pathname, onMobileClose])

  const menuItems = orgId
    ? [
        ...ORG_NAV.map((item) => ({
          ...item,
          href: item.href.replace('[organizationId]', orgId),
        })),
        { href: '/dashboard', label: 'Switch Organisation', icon: Building2 },
      ]
    : [{ href: '/dashboard', label: 'Dashboard (Orgs)', icon: Building2 }]

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        ref={ref}
        className={[
          'fixed top-0 left-0 z-50 h-screen flex flex-col',
          'bg-[hsl(222_22%_8%)] border-r border-white/8',
          'transition-all duration-300 ease-in-out',
          /* desktop width */
          collapsed ? 'lg:w-[68px]' : 'lg:w-[240px]',
          /* mobile: full sidebar, hidden off-screen unless open */
          'w-[240px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Logo row */}
        <div className={[
          'flex items-center h-[60px] border-b border-white/8 shrink-0 px-4',
          collapsed ? 'lg:justify-center' : 'justify-between',
        ].join(' ')}>
          {/* Logo text — hidden when collapsed on desktop */}
          <Link
            href={orgId ? `/dashboard/${orgId}` : '/dashboard'}
            className={['text-lg font-light tracking-tight text-white transition-all duration-200', collapsed ? 'lg:hidden' : ''].join(' ')}
          >
            Asset<span className="font-semibold text-accent">Flow</span>
          </Link>

          {/* Collapsed: just the monogram */}
          {collapsed && (
            <Link href={orgId ? `/dashboard/${orgId}` : '/dashboard'} className="hidden lg:flex items-center justify-center">
              <span className="text-sm font-bold text-accent">AF</span>
            </Link>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={onCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard'
              ? pathname === '/dashboard' || pathname === '/dashboard/organizations'
              : pathname === href || pathname.startsWith(href + '/')

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={[
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 relative',
                  active
                    ? 'bg-accent/15 text-accent'
                    : 'text-white/50 hover:text-white hover:bg-white/6',
                ].join(' ')}
              >
                {/* Active indicator bar */}
                <span className={[
                  'absolute left-0 w-[3px] h-6 rounded-r-full bg-accent transition-all duration-150',
                  active ? 'opacity-100' : 'opacity-0',
                ].join(' ')} />

                <Icon className={[
                  'w-[18px] h-[18px] shrink-0 transition-colors duration-150',
                  active ? 'text-accent' : 'text-white/40 group-hover:text-white/80',
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

        {/* Bottom: user info + sign out */}
        <div className="shrink-0 border-t border-white/8 p-3">
          <div className={[
            'flex items-center gap-3 px-1 py-2',
            collapsed ? 'lg:justify-center' : '',
          ].join(' ')}>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className={['min-w-0 flex-1', collapsed ? 'lg:hidden' : ''].join(' ')}>
              <p className="text-xs font-semibold text-white truncate">{user?.name ?? 'Admin User'}</p>
              <p className="text-[11px] text-white/40 truncate">{user?.email ?? 'admin@assetflow.com'}</p>
            </div>
            <button
              onClick={onSignOut}
              className={[
                'shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-white/6 transition-colors',
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
  onSignOut,
  user,
  orgId,
}: {
  onMobileOpen: () => void
  onSignOut: () => void
  user?: { name: string; email: string }
  orgId: string | null
}) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const [notiOpen, setNotiOpen] = useState(false)
  const notiRef = useRef<HTMLDivElement>(null)

  const resolvedNAV = orgId
    ? ORG_NAV.map((n) => ({ ...n, href: n.href.replace('[organizationId]', orgId) }))
    : [{ href: '/dashboard', label: 'Dashboard (Orgs)' }]

  const activeItem = resolvedNAV.find((n) => {
    if (n.href === pathname) return true
    return pathname.startsWith(n.href + '/')
  })
  const pageTitle = activeItem?.label ?? 'Dashboard'

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

  /* Close dropdowns on route change */
  useEffect(() => {
    setProfileOpen(false)
    setNotiOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 h-[60px] flex items-center gap-4 border-b border-white/8 bg-[hsl(240_10%_5%)] px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMobileOpen}
        className="lg:hidden flex items-center justify-center w-8 h-8 rounded-md text-white/50 hover:text-white hover:bg-white/8 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/dashboard"
          className="text-xs text-white/30 hover:text-white/60 transition-colors hidden sm:block"
        >
          Dashboard
        </Link>
        <span className="text-xs text-white/20 hidden sm:block">/</span>
        <h1 className="text-sm font-semibold text-white truncate">{pageTitle}</h1>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notifications popover */}
        <div className="relative" ref={notiRef}>
          <button
            onClick={() => { setNotiOpen(v => !v); setProfileOpen(false) }}
            className="relative w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          </button>

          {notiOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-[hsl(240_10%_10%)] shadow-2xl shadow-black/60 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
                <p className="text-xs font-semibold text-white">Notifications</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">3 new</span>
              </div>
              <div className="divide-y divide-white/5 max-h-[280px] overflow-y-auto">
                {QUICK_NOTIFICATIONS.map((n) => (
                  <div key={n.id} className={['px-4 py-3 flex items-start gap-3 hover:bg-white/[0.03] transition-colors', n.unread ? '' : 'opacity-55'].join(' ')}>
                    <span className={['w-2 h-2 rounded-full mt-1.5 shrink-0', n.dotColor].join(' ')} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/90 leading-relaxed truncate">{n.message}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 px-4 py-2.5">
                {orgId && (
                  <Link
                    href={`/dashboard/${orgId}/notifications`}
                    onClick={() => setNotiOpen(false)}
                    className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-accent hover:text-accent/80 transition-colors"
                  >
                    View all notifications
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/8 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="hidden sm:block text-xs font-medium text-white/70">{user?.name ?? 'Admin'}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/10 bg-[hsl(240_10%_10%)] shadow-2xl shadow-black/60 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-xs font-semibold text-white">{user?.name ?? 'Admin User'}</p>
                <p className="text-[11px] text-white/40 truncate">{user?.email ?? 'admin@assetflow.com'}</p>
              </div>
              <div className="py-1">
                {orgId ? (
                  <>
                    <Link
                      href={`/dashboard/${orgId}`}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-white/70 hover:bg-white/6 hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                    <Link
                      href={`/dashboard/${orgId}/setup`}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-white/70 hover:bg-white/6 hover:text-white transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Organization Setup
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-white/70 hover:bg-white/6 hover:text-white transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Organisations
                  </Link>
                )}
              </div>
              <div className="border-t border-white/8 py-1">
                <button
                  type="button"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-white/6 transition-colors w-full text-left"
                  onClick={() => {
                    setProfileOpen(false)
                    onSignOut()
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
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
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()

  // Parse organizationId from pathname
  const segments = pathname.split('/').filter(Boolean)
  const orgId = (segments[0] === 'dashboard' && segments[1] && segments[1] !== 'organizations')
    ? segments[1]
    : null

  // Fetch session using custom React Query hook
  const { data: sessionData, isLoading: isSessionLoading } = useSession()
  const user = sessionData?.user

  // Handle automatic redirect if unauthenticated
  useEffect(() => {
    if (!isSessionLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, isSessionLoading, router])

  const sidebarW = collapsed ? 'lg:pl-[68px]' : 'lg:pl-[240px]'
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      queryClient.clear()
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('assetflow:activeOrgId')
        sessionStorage.removeItem('assetflow:activeOrgName')
      }
      router.push('/auth/login')
      router.refresh()
    }
  }

  // Display verification view during initial session load
  if (isSessionLoading && !user) {
    return (
      <div className="min-h-screen bg-[hsl(240_10%_4%)] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-white/50">Verifying session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(240_10%_4%)] text-white font-sans">
      <Sidebar
        collapsed={collapsed}
        onCollapse={() => setCollapsed(v => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        onSignOut={handleSignOut}
        user={user ? { name: user.name, email: user.email } : undefined}
        orgId={orgId}
      />

      {/* Main area shifts right on desktop by sidebar width */}
      <div className={['transition-all duration-300', sidebarW].join(' ')}>
        <Topbar
          onMobileOpen={() => setMobileOpen(true)}
          onSignOut={handleSignOut}
          user={user ? { name: user.name, email: user.email } : undefined}
          orgId={orgId}
        />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
