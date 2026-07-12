'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Wrench,
  Clock,
  User,
  AlertTriangle,
  Play,
  Check,
  Ban,
  Loader2,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type MaintenanceStatus = 'Pending Approval' | 'In Progress' | 'Completed' | 'Rejected'
type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

interface MaintenanceRequest {
  id: string
  assetTag: string
  assetName: string
  requestedBy: string
  issue: string
  priority: Priority
  status: MaintenanceStatus
  cost?: number
  date: string
}

/* ─── Seed data ────────────────────────────────────────────────────────────── */

const SEED_REQUESTS: MaintenanceRequest[] = [
  { id: 'm1', assetTag: 'AF-0062', assetName: 'Projector', requestedBy: 'Rohan Mehta', issue: 'Lamp replacement required. Image is dim.', priority: 'Medium', status: 'In Progress', cost: 120, date: '2025-07-10' },
  { id: 'm2', assetTag: 'AF-0012', assetName: 'Dell Laptop', requestedBy: 'Priya Shah', issue: 'Keyboard keys not working (A, S, D). Water spill.', priority: 'High', status: 'Pending Approval', date: '2025-07-12' },
  { id: 'm3', assetTag: 'AF-0078', assetName: 'MacBook Pro 16"', requestedBy: 'System Audit', issue: 'Battery health degraded below 70%. Swelling observed.', priority: 'Critical', status: 'Completed', cost: 240, date: '2025-07-05' },
  { id: 'm4', assetTag: 'AF-0310', assetName: 'Toyota Innova', requestedBy: 'Sana Iqbal', issue: 'Scheduled engine oil change and brake inspection.', priority: 'Low', status: 'Pending Approval', date: '2025-07-11' },
]

const ASSETS = [
  { tag: 'AF-0012', name: 'Dell Laptop' },
  { tag: 'AF-0062', name: 'Projector' },
  { tag: 'AF-0201', name: 'Office Chair' },
  { tag: 'AF-0078', name: 'MacBook Pro 16"' },
  { tag: 'AF-0310', name: 'Toyota Innova' },
]

const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical']

function uid() { return Math.random().toString(36).slice(2, 9) }

/* ─── Shared UI ────────────────────────────────────────────────────────────── */

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={[
      'fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl shadow-black/50 border text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300',
      type === 'success' ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' : 'bg-red-950 border-red-500/30 text-red-300',
    ].join(' ')}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[hsl(240_10%_9%)] shadow-2xl shadow-black/60 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="block text-xs font-medium text-white/60 uppercase tracking-wide">{label}</label>{children}</div>
}

const inputCls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition'
const selectCls = 'w-full rounded-lg border border-white/10 bg-[hsl(240_10%_12%)] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none'

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    Low:      'text-white/40 border-white/10 bg-white/5',
    Medium:   'text-sky-400 border-sky-500/30 bg-sky-500/10',
    High:     'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Critical: 'text-red-400 border-red-500/30 bg-red-500/10 animate-pulse',
  }
  return <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${styles[priority]}`}>{priority}</span>
}

function StatusBadge({ status }: { status: MaintenanceStatus }) {
  const s: Record<MaintenanceStatus, string> = {
    'Pending Approval': 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    'In Progress':      'text-sky-400 border-sky-500/30 bg-sky-500/10',
    'Completed':        'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    'Rejected':         'text-white/30 border-white/10 bg-white/5 line-through',
  }
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${s[status]}`}>{status}</span>
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(SEED_REQUESTS)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => setToast({ show: true, message: msg, type }), [])
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), [])

  const [form, setForm] = useState({
    assetTag: '', requestedBy: '', issue: '', priority: 'Medium' as Priority,
  })

  const filtered = requests.filter((r) => {
    const q = search.toLowerCase()
    return !q || r.assetTag.toLowerCase().includes(q) || r.assetName.toLowerCase().includes(q) || r.requestedBy.toLowerCase().includes(q) || r.issue.toLowerCase().includes(q)
  })

  /* Pagination logic */
  const ITEMS_PER_PAGE = 5
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const asset = ASSETS.find((a) => a.tag === form.assetTag)
    if (!asset || !form.requestedBy || !form.issue) return

    setRequests((prev) => [
      {
        id: uid(),
        assetTag: form.assetTag,
        assetName: asset.name,
        requestedBy: form.requestedBy,
        issue: form.issue,
        priority: form.priority,
        status: 'Pending Approval',
        date: new Date().toISOString().split('T')[0] || '',
      },
      ...prev,
    ])
    setForm({ assetTag: '', requestedBy: '', issue: '', priority: 'Medium' })
    setShowCreate(false)
    showToast(`Maintenance request registered for ${asset.name}`)
  }

  const updateStatus = (id: string, newStatus: MaintenanceStatus, cost?: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const update: Partial<MaintenanceRequest> = { status: newStatus }
          if (cost !== undefined) update.cost = cost
          return { ...r, ...update }
        }
        return r
      })
    )
    showToast(`Request updated to ${newStatus}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Maintenance</h2>
          <p className="text-sm text-white/40">Structured approval-based maintenance requests with automated tracking.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shrink-0">
          <Plus className="w-4 h-4" /> Request Maintenance
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pending Approval', count: requests.filter((r) => r.status === 'Pending Approval').length, color: 'text-amber-400' },
          { label: 'In Progress', count: requests.filter((r) => r.status === 'In Progress').length, color: 'text-sky-400' },
          { label: 'Completed', count: requests.filter((r) => r.status === 'Completed').length, color: 'text-emerald-400' },
          { label: 'Total Requests', count: requests.length, color: 'text-white' },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-1">
            <p className="text-xs text-white/40 font-medium">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search maintenance requests…" className="w-full sm:w-72 rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Asset</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Requested By</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Issue Description</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Cost</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-14 text-center text-sm text-white/30">No maintenance requests found.</td></tr>
              ) : (
                paginated.map((r) => (
                  <tr key={r.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">{r.assetTag}</span>
                        <p className="text-sm font-medium text-white mt-1">{r.assetName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60">{r.requestedBy}</td>
                    <td className="px-5 py-4 text-white/50 max-w-[240px] truncate" title={r.issue}>{r.issue}</td>
                    <td className="px-5 py-4"><PriorityBadge priority={r.priority} /></td>
                    <td className="px-5 py-4 text-white/60 tabular-nums font-medium">{r.cost ? `$${r.cost}` : '—'}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {r.status === 'Pending Approval' && (
                          <>
                            <button
                              onClick={() => updateStatus(r.id, 'In Progress')}
                              title="Approve & Start Work"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateStatus(r.id, 'Rejected')}
                              title="Reject Request"
                              className="w-7 h-7 flex items-center justify-center rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {r.status === 'In Progress' && (
                          <button
                            onClick={() => {
                              const costStr = prompt('Enter resolution cost ($):', '50')
                              const costVal = costStr ? parseFloat(costStr) : 0
                              updateStatus(r.id, 'Completed', costVal)
                            }}
                            title="Complete Maintenance"
                            className="w-7 h-7 flex items-center justify-center rounded-md text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Maintenance Request Modal */}
      {showCreate && (
        <Modal title="Request Maintenance" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Asset">
              <div className="relative">
                <select required value={form.assetTag} onChange={(e) => setForm((p) => ({ ...p, assetTag: e.target.value }))} className={selectCls}>
                  <option value="" disabled>Select asset…</option>
                  {ASSETS.map((a) => <option key={a.tag} value={a.tag}>{a.tag} — {a.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </Field>
            <Field label="Requested By">
              <input type="text" required placeholder="Your name" value={form.requestedBy} onChange={(e) => setForm((p) => ({ ...p, requestedBy: e.target.value }))} className={inputCls} />
            </Field>
            <Field label="Priority">
              <div className="relative">
                <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))} className={selectCls}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </Field>
            <Field label="Issue Description">
              <textarea required rows={3} placeholder="Please describe the issue in detail…" value={form.issue} onChange={(e) => setForm((p) => ({ ...p, issue: e.target.value }))} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition resize-none" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">Submit Request</button>
            </div>
          </form>
        </Modal>
      )}

      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}