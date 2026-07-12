'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  BookOpen,
  Trash2,
  AlertTriangle,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled'

interface Resource {
  id: string
  name: string
  type: string
  location: string
}

interface Booking {
  id: string
  resourceId: string
  resourceName: string
  bookedBy: string
  date: string
  startTime: string // e.g. "09:00"
  endTime: string   // e.g. "10:00"
  purpose: string
  status: BookingStatus
  hasConflict?: boolean
}

/* ─── Seed data ────────────────────────────────────────────────────────────── */

const RESOURCES: Resource[] = [
  { id: 'r1', name: 'Conference room B2',  type: 'Meeting Room', location: 'HQ Floor 2' },
  { id: 'r2', name: 'Conf Room — Orion',  type: 'Meeting Room', location: 'HQ Floor 2' },
  { id: 'r3', name: 'Conf Room — Nova',   type: 'Meeting Room', location: 'HQ Floor 3' },
  { id: 'r4', name: 'Projector A',        type: 'Equipment',    location: 'HQ Floor 2' },
  { id: 'r5', name: 'Company Van #1',     type: 'Vehicle',      location: 'Parking B' },
  { id: 'r6', name: 'Hot Desk — 4A',      type: 'Workspace',    location: 'HQ Floor 4' },
]

const SEED_BOOKINGS: Booking[] = [
  // Mockup conflicts for Conference room B2 on Tuesday, 7 Jul 2026 (or 2026-07-07)
  {
    id: 'b1',
    resourceId: 'r1',
    resourceName: 'Conference room B2',
    bookedBy: 'Procurement Team',
    date: '2026-07-07',
    startTime: '09:00',
    endTime: '10:00',
    purpose: 'Procurement alignment',
    status: 'Confirmed',
  },
  {
    id: 'b2',
    resourceId: 'r1',
    resourceName: 'Conference room B2',
    bookedBy: 'Marketing Team',
    date: '2026-07-07',
    startTime: '09:30',
    endTime: '10:30',
    purpose: 'Campaign Launch',
    status: 'Pending',
    hasConflict: true,
  },
  // Other bookings
  {
    id: 'b3',
    resourceId: 'r2',
    resourceName: 'Conf Room — Orion',
    bookedBy: 'Aditi Rao',
    date: '2026-07-07',
    startTime: '10:00',
    endTime: '11:00',
    purpose: 'Sprint planning',
    status: 'Confirmed',
  },
  {
    id: 'b4',
    resourceId: 'r3',
    resourceName: 'Conf Room — Nova',
    bookedBy: 'Rohan Mehta',
    date: '2026-07-08',
    startTime: '14:00',
    endTime: '15:30',
    purpose: 'Vendor call',
    status: 'Confirmed',
  },
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

/* ─── Shared UI ────────────────────────────────────────────────────────────── */

interface ToastState {
  show: boolean
  message: string
  type: 'success' | 'error'
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={[
        'fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl shadow-black/50 border text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300',
        type === 'success'
          ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300'
          : 'bg-red-950 border-red-500/30 text-red-300',
      ].join(' ')}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0" />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl shadow-black/80 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-foreground/45 hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition'
const selectCls =
  'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none cursor-pointer'

function StatusBadge({ status }: { status: BookingStatus }) {
  const s: Record<BookingStatus, string> = {
    Confirmed: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Pending: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Cancelled: 'text-muted-foreground border-border bg-muted line-through',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s[status]}`}
    >
      {status}
    </span>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function ResourceBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS)
  const [selectedResourceId, setSelectedResourceId] = useState('r1')
  const [selectedDate, setSelectedDate] = useState('2026-07-07') // Default matches Tue, 7 Jul
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') =>
      setToast({ show: true, message: msg, type }),
    []
  )
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), [])

  const [form, setForm] = useState({
    resourceId: 'r1',
    bookedBy: '',
    date: '2026-07-07',
    startTime: '11:00',
    endTime: '12:00',
    purpose: '',
  })

  // Hours for timeline view (09:00 to 14:00 matches sketch)
  const TIMELINE_HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00']

  // Find bookings for currently selected resource and date
  const dayBookings = bookings.filter(
    (b) => b.resourceId === selectedResourceId && b.date === selectedDate && b.status !== 'Cancelled'
  )

  // Get human friendly date display (e.g. "Tue, 7 Jul")
  const getFriendlyDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
    } catch {
      return dateStr
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const resource = RESOURCES.find((r) => r.id === form.resourceId)
    if (!resource || !form.bookedBy || !form.date) return

    // Check overlap/conflict
    const overlap = bookings.find(
      (b) =>
        b.resourceId === form.resourceId &&
        b.date === form.date &&
        b.status !== 'Cancelled' &&
        form.startTime < b.endTime &&
        form.endTime > b.startTime
    )

    const newBooking: Booking = {
      id: uid(),
      resourceId: form.resourceId,
      resourceName: resource.name,
      bookedBy: form.bookedBy,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      status: overlap ? 'Pending' : 'Confirmed',
      hasConflict: !!overlap,
    }

    setBookings((prev) => [...prev, newBooking])
    setForm({
      resourceId: selectedResourceId,
      bookedBy: '',
      date: selectedDate,
      startTime: '11:00',
      endTime: '12:00',
      purpose: '',
    })
    setShowCreate(false)

    if (overlap) {
      showToast(
        `Booking submitted with conflicts. Awaiting approval.`,
        'error'
      )
    } else {
      showToast(`${resource.name} booked successfully!`)
    }
  }

  const handleCancel = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Cancelled' as BookingStatus } : b))
    )
    showToast('Booking cancelled', 'error')
  }

  // Filter bookings list table
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase()
    return (
      !q ||
      b.resourceName.toLowerCase().includes(q) ||
      b.bookedBy.toLowerCase().includes(q) ||
      b.purpose.toLowerCase().includes(q)
    )
  })

  /* Pagination logic */
  const ITEMS_PER_PAGE = 5
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Calculate position styles for timeline events
  const getTimelinePosition = (startTimeStr: string, endTimeStr: string) => {
    // 1 hour = 80px high. Starts at 09:00.
    const startHour = parseFloat(startTimeStr.split(':')[0] || '9') + parseFloat(startTimeStr.split(':')[1] || '0') / 60
    const endHour = parseFloat(endTimeStr.split(':')[0] || '10') + parseFloat(endTimeStr.split(':')[1] || '0') / 60
    
    const startOffsetHours = startHour - 9 // 09:00 is base 0
    const durationHours = endHour - startHour

    const top = startOffsetHours * 80
    const height = durationHours * 80

    return {
      top: `${top}px`,
      height: `${height}px`,
    }
  }

  const currentResource = RESOURCES.find((r) => r.id === selectedResourceId)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Resource Booking</h2>
          <p className="text-sm text-muted-foreground">
            Book meeting rooms, shared equipment, workspaces and vehicles.
          </p>
        </div>
      </div>

      {/* Main Grid: Timeline + Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline View Column (Matches Screen 6 Mockup) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl">
            
            {/* Mockup Top Input (Resource Selection) */}
            <div className="space-y-2 mb-8">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Resource
              </label>
              <div className="relative">
                <select
                  value={selectedResourceId}
                  onChange={(e) => {
                    setSelectedResourceId(e.target.value)
                    setForm((prev) => ({ ...prev, resourceId: e.target.value }))
                  }}
                  className="w-full rounded-lg border border-border bg-input hover:bg-muted px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition appearance-none cursor-pointer"
                >
                  {RESOURCES.map((r) => (
                    <option key={r.id} value={r.id} className="bg-card">
                      {r.name} — {r.location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Time Slot Picker for Date */}
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon className="w-4 h-4 text-accent" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }}
                className="bg-transparent text-sm text-foreground/80 focus:outline-none font-medium"
              />
              <span className="text-xs text-muted-foreground/80">
                ({getFriendlyDate(selectedDate)})
              </span>
            </div>

            {/* Scheduler Grid Container */}
            <div className="relative border-l border-border ml-12 min-h-[440px] select-none">
              
              {/* Hour Lines */}
              {TIMELINE_HOURS.map((hour, idx) => {
                const isPm = parseInt(hour.split(':')[0] || '0') >= 12
                const displayHour = parseInt(hour.split(':')[0] || '0') % 12 || 12
                const formatTime = `${displayHour}:00${isPm ? 'pm' : 'am'}`

                return (
                  <div key={hour} className="relative h-[80px]" style={{ contentVisibility: 'auto' }}>
                    {/* Hour Label */}
                    <span className="absolute -left-12 top-0 -translate-y-1/2 text-xs font-semibold text-muted-foreground tabular-nums">
                      {formatTime}
                    </span>
                    {/* Horizontal grid line */}
                    {idx < TIMELINE_HOURS.length - 1 && (
                      <div className="absolute inset-x-0 top-0 border-t border-border" />
                    )}
                  </div>
                )
              })}

              {/* Plotted Bookings & Conflict Requests */}
              {dayBookings.map((b) => {
                const isConflict = b.hasConflict || b.status === 'Pending'
                const pos = getTimelinePosition(b.startTime, b.endTime)

                if (isConflict) {
                  // Red dashed mockup style
                  return (
                    <div
                      key={b.id}
                      style={pos}
                      className="absolute left-[10%] right-[2%] rounded-xl border border-dashed border-red-500 bg-red-950/20 backdrop-blur-sm p-4 flex flex-col justify-center transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    >
                      <div className="flex items-start gap-2 text-xs font-semibold text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <div>
                          <p>
                            Requested {b.startTime} to {b.endTime} - conflict - slot is unavailable
                          </p>
                          <p className="text-[10px] text-red-400/60 font-normal mt-0.5">
                            Requested by {b.bookedBy} • {b.purpose}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }

                // Normal Confirmed Block (Solid Blue)
                return (
                  <div
                    key={b.id}
                    style={pos}
                    className="absolute left-[4%] right-[8%] rounded-xl border border-sky-500/30 bg-sky-500/10 backdrop-blur-sm p-4 flex flex-col justify-center transition-all shadow-[0_4px_20px_rgba(14,165,233,0.1)]"
                  >
                    <div className="text-xs font-semibold text-sky-400">
                      Booked - {b.bookedBy} - {b.startTime} to {b.endTime}
                    </div>
                    <div className="text-[10px] text-sky-400/70 mt-0.5 truncate">
                      {b.purpose}
                    </div>
                  </div>
                )
              })}

              {dayBookings.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/80 italic">
                  No bookings scheduled for this day
                </div>
              )}
            </div>

            {/* Bottom Button (Matches "Book a slot" button in sketch) */}
            <div className="mt-8 pt-6 border-t border-border flex justify-start">
              <button
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    resourceId: selectedResourceId,
                    date: selectedDate,
                  }))
                  setShowCreate(true)
                }}
                className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-foreground transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98]"
              >
                Book a slot
              </button>
            </div>

          </div>
        </div>

        {/* Resources list & Information cards sidebar */}
        <div className="space-y-6">
          
          {/* Quick info panel */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Active Resource</h3>
            {currentResource && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="font-semibold text-sm text-foreground">{currentResource.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {currentResource.location}
                  </div>
                  <div className="inline-block text-[10px] px-2 py-0.5 rounded bg-accent/20 text-accent font-medium uppercase tracking-wider">
                    {currentResource.type}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Conflicts automatically highlight in red with a dashed border. Administrators can resolve conflicts by updating or cancelling bookings.
                </p>
              </div>
            )}
          </div>

          {/* Quick switch sidebar list */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Switch</h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {RESOURCES.map((r) => {
                const active = r.id === selectedResourceId
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedResourceId(r.id)}
                    className={[
                      'w-full text-left p-3 rounded-xl border transition-all text-xs flex justify-between items-center',
                      active
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                    ].join(' ')}
                  >
                    <div>
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-[10px] opacity-60 mt-0.5">{r.location}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90 opacity-40" />
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Bookings Table list */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-foreground">All Bookings</h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings…"
              className="w-full rounded-lg border border-border bg-input pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Booked By
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Purpose
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-sm text-muted-foreground/80">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  paginated.map((b) => (
                    <tr key={b.id} className="hover:bg-muted transition-colors group">
                      <td className="px-5 py-4 font-medium text-foreground">{b.resourceName}</td>
                      <td className="px-5 py-4 text-muted-foreground">{b.bookedBy}</td>
                      <td className="px-5 py-4 text-muted-foreground tabular-nums text-xs">
                        {b.date}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground tabular-nums text-xs">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {b.startTime} – {b.endTime}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground max-w-[200px] truncate">{b.purpose}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4">
                        {b.status !== 'Cancelled' && (
                          <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCancel(b.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer row count with pagination */}
          <div className="border-t border-border px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center bg-muted gap-3">
            <p className="text-xs text-muted-foreground/80 text-center sm:text-left">
              Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} of {filtered.length} bookings
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground/70 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-muted-foreground px-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground/70 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create booking modal */}
      {showCreate && (
        <Modal title="Book a Resource" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Resource">
              <div className="relative">
                <select
                  required
                  value={form.resourceId}
                  onChange={(e) => setForm((p) => ({ ...p, resourceId: e.target.value }))}
                  className={selectCls}
                >
                  <option value="" disabled>
                    Select resource…
                  </option>
                  {RESOURCES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — {r.location}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
              </div>
            </Field>
            <Field label="Booked By">
              <input
                type="text"
                required
                placeholder="Your name or team"
                value={form.bookedBy}
                onChange={(e) => setForm((p) => ({ ...p, bookedBy: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time">
                <input
                  type="time"
                  required
                  value={form.startTime}
                  onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="End Time">
                <input
                  type="time"
                  required
                  value={form.endTime}
                  onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Purpose">
              <input
                type="text"
                placeholder="Meeting, presentation, etc."
                value={form.purpose}
                onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Book Resource
              </button>
            </div>
          </form>
        </Modal>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}