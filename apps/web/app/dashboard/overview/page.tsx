'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Package,
  CheckCircle2,
  Users,
  Wrench,
  BookOpen,
  ArrowLeftRight,
  Calendar,
  AlertTriangle,
  Plus,
  Send,
  ArrowRight,
  Clock,
} from 'lucide-react'

export default function DashboardOverviewPage() {
  const [metrics, setMetrics] = useState({
    available: 128,
    allocated: 76,
    maintenance: 4,
    activeBookings: 9,
    pendingTransfers: 3,
    upcomingReturns: 12,
    overdueReturns: 3,
  })

  const recentActivity = [
    {
      id: 1,
      text: 'Laptop AF-0114 - allocated to Priya Shah - IT dept',
      time: '10m ago',
      type: 'allocation',
      icon: Users,
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20',
    },
    {
      id: 2,
      text: 'Room B2 - booking confirmed - 2:00 to 3:00 PM',
      time: '1h ago',
      type: 'booking',
      icon: BookOpen,
      color: 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    },
    {
      id: 3,
      text: 'Projector AF-0062 - maintenance resolved',
      time: '4h ago',
      type: 'maintenance',
      icon: Wrench,
      color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20',
    },
  ]

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight font-sans">
          Today&apos;s Overview
        </h2>
        <p className="text-sm text-muted-foreground">
          Real-time snapshot of your organization&apos;s assets, allocations, and requests.
        </p>
      </div>

      {/* ─── Metrics Grid (Matches Screen 2 Mockup Layout) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Available */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl hover:border-accent/30 hover:bg-muted transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
              Available
            </p>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-bold text-foreground mt-4 tracking-tight tabular-nums">
            {metrics.available}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Ready for deployment</p>
        </div>

        {/* Card 2: Allocated */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl hover:border-accent/30 hover:bg-muted transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
              Allocated
            </p>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <p className="text-4xl font-bold text-foreground mt-4 tracking-tight tabular-nums">
            {metrics.allocated}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Assigned to employees</p>
        </div>

        {/* Card 3: In Maintenance (labeled as Maintenance/Available in mockup) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl hover:border-accent/30 hover:bg-muted transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
              In Maintenance
            </p>
            <Wrench className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <p className="text-4xl font-bold text-foreground mt-4 tracking-tight tabular-nums">
            {metrics.maintenance}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Currently offline</p>
        </div>

        {/* Card 4: Active Bookings */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl hover:border-accent/30 hover:bg-muted transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
              Active Bookings
            </p>
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-foreground mt-4 tracking-tight tabular-nums">
            {metrics.activeBookings}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Shared resource sessions</p>
        </div>

        {/* Card 5: Pending Transfers */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl hover:border-accent/30 hover:bg-muted transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
              Pending Transfers
            </p>
            <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-4xl font-bold text-foreground mt-4 tracking-tight tabular-nums">
            {metrics.pendingTransfers}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Awaiting approval</p>
        </div>

        {/* Card 6: Upcoming Returns */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl hover:border-accent/30 hover:bg-muted transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground/70 transition-colors">
              Upcoming Returns
            </p>
            <Calendar className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-4xl font-bold text-foreground mt-4 tracking-tight tabular-nums">
            {metrics.upcomingReturns}
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-1 font-medium">Due in next 7 days</p>
        </div>
      </div>

      {/* ─── Overdue Alert Banner (Matches Screen 2 Mockup Red Banner) ─── */}
      {metrics.overdueReturns > 0 && (
        <div className="rounded-xl border border-red-500/25 bg-red-950/40 px-5 py-4 flex items-center gap-3 text-red-300 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm font-semibold">
            {metrics.overdueReturns} assets overdue for return - flagged for follow-up
          </span>
        </div>
      )}

      {/* ─── Quick Actions (Matches Screen 2 Mockup Buttons Row) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/dashboard/assets"
          className="flex items-center justify-center gap-2 rounded-xl bg-accent/15 border border-accent/30 hover:bg-accent/25 px-6 py-4 text-sm font-bold text-accent transition-all duration-150 active:scale-[0.98] shadow-lg shadow-black/10"
        >
          <Plus className="w-4 h-4" />
          + register asset
        </Link>
        <Link
          href="/dashboard/booking"
          className="flex items-center justify-center gap-2 rounded-xl bg-card border border-border hover:bg-muted px-6 py-4 text-sm font-bold text-foreground transition-all duration-150 active:scale-[0.98]"
        >
          <BookOpen className="w-4 h-4" />
          Book resource
        </Link>
        <Link
          href="/dashboard/transfer"
          className="flex items-center justify-center gap-2 rounded-xl bg-card border border-border hover:bg-muted px-6 py-4 text-sm font-bold text-foreground transition-all duration-150 active:scale-[0.98]"
        >
          <Send className="w-4 h-4" />
          Raise requests
        </Link>
      </div>

      {/* ─── Recent Activity Section (Matches Screen 2 Mockup bottom) ─── */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
          <Link
            href="/dashboard/notifications"
            className="text-xs text-accent hover:text-accent/80 font-semibold transition-colors flex items-center gap-1"
          >
            View system logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="relative pl-6 space-y-6">
          {/* Vertical timeline connector */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-muted" />

          {recentActivity.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="relative flex gap-4 items-start group">
                {/* Timeline node dot */}
                <div className="absolute -left-6 top-1.5 w-[9px] h-[9px] rounded-full border border-border bg-card group-hover:border-accent transition-colors" />

                {/* Left Icon Badge */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${activity.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Activity Message Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-foreground/85 leading-relaxed font-medium">
                      {activity.text}
                    </p>
                    <span className="text-[10px] text-muted-foreground/80 font-medium shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}