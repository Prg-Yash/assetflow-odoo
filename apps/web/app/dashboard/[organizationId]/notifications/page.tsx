'use client'

import { useState } from 'react'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowLeftRight,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type FilterCategory = 'all' | 'alerts' | 'approvals' | 'bookings'

interface NotificationItem {
  id: string
  message: string
  time: string
  category: Exclude<FilterCategory, 'all'>
  dotColor: string // CSS class for dot color
  icon: any
  read: boolean
}

/* ─── Seed data (Matches Screen 10 Sketch Exactly) ─────────────────────────── */

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    message: 'Laptop AF-0014 assigned to Priya shah',
    time: '2m ago',
    category: 'approvals', // categorized as assignment approval
    dotColor: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]',
    icon: CheckCircle2,
    read: false,
  },
  {
    id: 'n2',
    message: 'Maintenance request AF-0055 approved',
    time: '18m ago',
    category: 'approvals',
    dotColor: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]',
    icon: CheckCircle2,
    read: false,
  },
  {
    id: 'n3',
    message: 'Booking confirmed : Room B2 : 2:00 to 3:00 PM',
    time: '1h ago',
    category: 'bookings',
    dotColor: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]',
    icon: BookOpen,
    read: false,
  },
  {
    id: 'n4',
    message: 'Transfer approved : AF-0033 to facilities dept',
    time: '3h ago',
    category: 'approvals',
    dotColor: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]',
    icon: ArrowLeftRight,
    read: true,
  },
  {
    id: 'n5',
    message: 'Overdue return : AF-0021 was due 3 days ago',
    time: '1d ago',
    category: 'alerts',
    dotColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    icon: Clock,
    read: true,
  },
  {
    id: 'n6',
    message: 'audit discrepancy flagged : AF-0088 damaged',
    time: '2d ago',
    category: 'alerts',
    dotColor: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    icon: AlertCircle,
    read: true,
  },
]

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>(SEED_NOTIFICATIONS)
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')

  const unreadCount = items.filter((item) => !item.read).length

  const markAllRead = () => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })))
  }

  const toggleRead = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: !item.read } : item))
    )
  }

  const deleteNotification = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'all') return true
    return item.category === activeFilter
  })

  // Dynamic active pill filter styles
  const getFilterStyle = (category: FilterCategory) => {
    const isActive = activeFilter === category
    if (!isActive) {
      return 'border-border bg-muted text-muted-foreground hover:bg-muted hover:text-foreground'
    }
    // Colored active styles matching mockup + premium vibe
    const styles: Record<FilterCategory, string> = {
      all: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold',
      alerts: 'border-red-500/40 bg-red-500/10 text-red-400 font-semibold',
      approvals: 'border-amber-500/40 bg-amber-500/10 text-amber-400 font-semibold',
      bookings: 'border-blue-500/40 bg-blue-500/10 text-blue-400 font-semibold',
    }
    return styles[category]
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent text-primary-foreground animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Activity logs, alerts, asset bookings and pending approvals.
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 rounded-lg bg-card border border-border hover:bg-muted hover:text-foreground px-4 py-2.5 text-xs font-semibold text-foreground/80 transition-all shrink-0 active:scale-[0.98]"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs (Matches Mockup) */}
      <div className="flex flex-wrap gap-2.5 pb-2 border-b border-border">
        {(['all', 'alerts', 'approvals', 'bookings'] as FilterCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={[
              'px-4 py-1.5 rounded-lg border text-xs capitalize transition-all duration-150',
              getFilterStyle(cat),
            ].join(' ')}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Activity Logs / Notifications list */}
      <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden divide-y divide-border">
        {filteredItems.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-card border border-border mx-auto">
                <Bell className="w-7 h-7 text-foreground/20" />
              </div>
              <p className="text-sm text-muted-foreground font-semibold">No logs in this category</p>
              <p className="text-xs text-muted-foreground/70">Check back later for system activities.</p>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className={[
                  'px-6 py-5 flex items-center justify-between gap-4 transition-all duration-200 group relative',
                  item.read ? 'opacity-55 hover:opacity-90' : 'bg-muted',
                ].join(' ')}
              >
                {/* Unread indicator left bar */}
                {!item.read && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-accent" />
                )}

                {/* Left content group */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  
                  {/* Indicator Dot (Colored circle) */}
                  <span className={['w-2 h-2 rounded-full shrink-0', item.dotColor].join(' ')} />

                  {/* Icon */}
                  <div className="hidden sm:flex w-8 h-8 rounded-lg bg-card border border-border items-center justify-center text-muted-foreground group-hover:text-foreground/80 transition-colors shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Notification text */}
                  <p className="text-sm text-foreground/95 leading-relaxed truncate pr-4">
                    {item.message}
                  </p>
                </div>

                {/* Right side: time & actions */}
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-foreground/35 font-medium tabular-nums group-hover:hidden">
                    {item.time}
                  </span>

                  {/* Hover Actions */}
                  <div className="hidden group-hover:flex items-center gap-1.5 animate-in fade-in duration-100">
                    <button
                      onClick={() => toggleRead(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={item.read ? 'Mark as unread' : 'Mark as read'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNotification(item.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground/45 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete activity log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-border bg-card p-4 flex gap-3 items-start">
        <Bell className="w-4 h-4 text-muted-foreground/80 mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          This log contains all automated status changes, manual resource reservations, asset allocation confirmations, and audit events.
        </p>
      </div>
    </div>
  )
}