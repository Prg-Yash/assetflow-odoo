'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Package,
  Send,
  Clock,
  User,
  ArrowLeftRight,
  Loader2,
  History,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type AssetStatus = 'Available' | 'Allocated' | 'Maintenance' | 'Retired'

interface AssetRecord {
  id: string
  tag: string
  name: string
  category: string
  status: AssetStatus
  department: string
  assignedTo: string
}

interface HistoryEntry {
  id: string
  date: string
  action: string
  detail: string
}

/* ─── Seed data ────────────────────────────────────────────────────────────── */

const ASSET_DB: AssetRecord[] = [
  { id: 'a1', tag: 'AF-0012', name: 'Dell Laptop',     category: 'Electronics', status: 'Allocated',   department: 'Engineering',  assignedTo: 'Priya Shah' },
  { id: 'a2', tag: 'AF-0062', name: 'Projector',        category: 'Electronics', status: 'Maintenance', department: 'Facilities',   assignedTo: '' },
  { id: 'a3', tag: 'AF-0201', name: 'Office Chair',     category: 'Furniture',   status: 'Available',   department: 'Facilities',   assignedTo: '' },
  { id: 'a4', tag: 'AF-0078', name: 'MacBook Pro 16"',  category: 'Electronics', status: 'Allocated',   department: 'Engineering',  assignedTo: 'Rohan Mehta' },
  { id: 'a5', tag: 'AF-0115', name: 'Standing Desk',    category: 'Furniture',   status: 'Available',   department: '',             assignedTo: '' },
  { id: 'a6', tag: 'AF-0310', name: 'Toyota Innova',    category: 'Vehicles',    status: 'Allocated',   department: 'Field Ops',    assignedTo: 'Sana Iqbal' },
  { id: 'a7', tag: 'AF-0114', name: 'Dell Laptop',      category: 'Electronics', status: 'Allocated',   department: 'Engineering',  assignedTo: 'Priya Shah' },
]

const EMPLOYEES = ['Aditi Rao', 'Rohan Mehta', 'Sana Iqbal', 'Priya Shah', 'Marcus Hall', 'Arjun Nair', 'Neha Gupta', 'Kiran Patel']

const SEED_HISTORY: Record<string, HistoryEntry[]> = {
  'AF-0114': [
    { id: 'h1', date: 'Mar 12, 2025', action: 'Allocated', detail: 'Allocated to Priya Shah — Engineering' },
    { id: 'h2', date: 'Jan 04, 2025', action: 'Returned',  detail: 'Returned by Arjun Nair — condition: good' },
    { id: 'h3', date: 'Sep 20, 2024', action: 'Allocated', detail: 'Allocated to Arjun Nair — Engineering' },
    { id: 'h4', date: 'Sep 15, 2024', action: 'Registered', detail: 'Asset registered — Dell Laptop' },
  ],
  'AF-0012': [
    { id: 'h5', date: 'Feb 28, 2025', action: 'Allocated', detail: 'Allocated to Priya Shah — Engineering' },
    { id: 'h6', date: 'Nov 10, 2024', action: 'Registered', detail: 'Asset registered — Dell Laptop' },
  ],
  'AF-0078': [
    { id: 'h7', date: 'Apr 05, 2025', action: 'Allocated', detail: 'Allocated to Rohan Mehta — Engineering' },
    { id: 'h8', date: 'Jan 15, 2025', action: 'Maintenance', detail: 'Sent for battery replacement' },
    { id: 'h9', date: 'Dec 01, 2024', action: 'Registered', detail: 'Asset registered — MacBook Pro 16"' },
  ],
}

/* ─── Shared UI ────────────────────────────────────────────────────────────── */

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={[
      'fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl shadow-black/50 border text-sm font-medium',
      'animate-in slide-in-from-bottom-4 fade-in duration-300',
      type === 'success' ? 'bg-emerald-950 border-emerald-500/30 text-emerald-300' : 'bg-red-950 border-red-500/30 text-red-300',
    ].join(' ')}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity"><X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition'
const selectCls = 'w-full rounded-lg border border-white/10 bg-[hsl(240_10%_12%)] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/60 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

/* ─── Asset status badge ───────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: AssetStatus }) {
  const styles: Record<AssetStatus, string> = {
    Available:   'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Allocated:   'text-sky-400 border-sky-500/30 bg-sky-500/10',
    Maintenance: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Retired:     'text-white/40 border-white/10 bg-white/5',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {status}
    </span>
  )
}

/* ─── History timeline action badge ────────────────────────────────────────── */

function ActionBadge({ action }: { action: string }) {
  const m: Record<string, string> = {
    Allocated: 'bg-sky-500/15 text-sky-400 border-sky-500/25',
    Returned: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    Maintenance: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    Registered: 'bg-white/5 text-white/50 border-white/10',
    Transferred: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold border ${m[action] ?? m.Registered}`}>
      {action}
    </span>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function AllocationTransferPage() {
  const [assetQuery, setAssetQuery] = useState('')
  const [selectedAsset, setSelectedAsset] = useState<AssetRecord | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [transferTo, setTransferTo] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }, [])
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), [])

  /* Asset search results */
  const searchResults = assetQuery.length >= 2
    ? ASSET_DB.filter(
        (a) =>
          a.tag.toLowerCase().includes(assetQuery.toLowerCase()) ||
          a.name.toLowerCase().includes(assetQuery.toLowerCase()),
      ).slice(0, 6)
    : []

  const selectAsset = (asset: AssetRecord) => {
    setSelectedAsset(asset)
    setAssetQuery(`${asset.tag} — ${asset.name}`)
    setDropdownOpen(false)
    setTransferTo('')
    setReason('')
  }

  const isAllocated = selectedAsset?.status === 'Allocated'
  const isAvailable = selectedAsset?.status === 'Available'
  const isMaintenance = selectedAsset?.status === 'Maintenance'
  const isRetired = selectedAsset?.status === 'Retired'

  const history = selectedAsset ? (SEED_HISTORY[selectedAsset.tag] ?? []) : []

  /* Submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsset || !transferTo) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSubmitting(false)

    if (isAllocated) {
      showToast(`Transfer request submitted: ${selectedAsset.tag} from ${selectedAsset.assignedTo} → ${transferTo}`)
    } else {
      showToast(`Asset ${selectedAsset.tag} allocated to ${transferTo}`)
    }

    setSelectedAsset(null)
    setAssetQuery('')
    setTransferTo('')
    setReason('')
  }

  const handleClear = () => {
    setSelectedAsset(null)
    setAssetQuery('')
    setTransferTo('')
    setReason('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white tracking-tight">Allocation &amp; Transfer</h2>
        <p className="text-sm text-white/40">Allocate available assets or request transfers for already-assigned ones.</p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* ── Asset lookup ── */}
          <Field label="Asset">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                id="asset-search"
                type="text"
                value={assetQuery}
                onChange={(e) => { setAssetQuery(e.target.value); setDropdownOpen(true); if (!e.target.value) setSelectedAsset(null) }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search by tag or name…"
                className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition"
              />
              {selectedAsset && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Search dropdown */}
              {dropdownOpen && searchResults.length > 0 && !selectedAsset && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-white/10 bg-[hsl(240_10%_10%)] shadow-2xl shadow-black/50 py-1.5 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  {searchResults.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => selectAsset(a)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 hover:bg-white/6 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0">{a.tag}</span>
                        <span className="text-sm text-white truncate">{a.name}</span>
                      </div>
                      <StatusBadge status={a.status} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {/* ── Allocation warning banner ── */}
          {selectedAsset && isAllocated && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-950/40 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-300">
                  Already Allocated to {selectedAsset.assignedTo} ({selectedAsset.department})
                </p>
                <p className="text-xs text-red-300/60">
                  Direct re-allocation is blocked — submit a transfer request below.
                </p>
              </div>
            </div>
          )}

          {selectedAsset && isAvailable && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-950/40 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-emerald-300">Asset is Available</p>
                <p className="text-xs text-emerald-300/60">You can directly allocate this asset to an employee.</p>
              </div>
            </div>
          )}

          {selectedAsset && isMaintenance && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-950/40 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-300">Asset is Under Maintenance</p>
                <p className="text-xs text-amber-300/60">This asset cannot be allocated until maintenance is completed.</p>
              </div>
            </div>
          )}

          {selectedAsset && isRetired && (
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/3 px-5 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <AlertCircle className="w-5 h-5 text-white/40 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white/50">Asset is Retired</p>
                <p className="text-xs text-white/30">Retired assets cannot be allocated or transferred.</p>
              </div>
            </div>
          )}

          {/* ── Transfer / Allocation form ── */}
          {selectedAsset && (isAllocated || isAvailable) && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="border-t border-white/6 pt-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-accent" />
                  {isAllocated ? 'Transfer Request' : 'Allocate Asset'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {isAllocated && (
                    <Field label="From">
                      <div className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/3 px-3 py-2.5">
                        <div className="w-7 h-7 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className="text-sm text-white/70">{selectedAsset.assignedTo}</span>
                      </div>
                    </Field>
                  )}

                  <Field label="To">
                    <div className="relative">
                      <select
                        id="transfer-to"
                        required
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        className={selectCls}
                      >
                        <option value="" disabled>Select Employee…</option>
                        {EMPLOYEES.filter((emp) => emp !== selectedAsset?.assignedTo).map((emp) => (
                          <option key={emp} value={emp}>{emp}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                    </div>
                  </Field>
                </div>
              </div>

              <Field label="Reason">
                <textarea
                  id="transfer-reason"
                  rows={3}
                  placeholder={isAllocated ? 'Why is this transfer needed?' : 'Reason for allocation (optional)'}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition resize-none"
                />
              </Field>

              <button
                id="submit-request-btn"
                type="submit"
                disabled={submitting || !transferTo}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                ) : (
                  <><Send className="w-4 h-4" /> {isAllocated ? 'Submit Transfer Request' : 'Allocate Asset'}</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* ── Allocation history ── */}
        {selectedAsset && history.length > 0 && (
          <div className="border-t border-white/6">
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-white/40" />
                Allocation History
              </h3>

              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-white/8" />

                <div className="space-y-4">
                  {history.map((entry, i) => (
                    <div key={entry.id} className="relative flex gap-4 items-start group">
                      {/* Dot */}
                      <div className={`absolute -left-6 top-1 w-[11px] h-[11px] rounded-full border-2 shrink-0 ${
                        i === 0 ? 'border-accent bg-accent/30' : 'border-white/20 bg-[hsl(240_10%_9%)]'
                      }`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-white/35 font-medium tabular-nums shrink-0 w-24">{entry.date}</span>
                          <ActionBadge action={entry.action} />
                        </div>
                        <p className="text-sm text-white/60 mt-1">{entry.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no asset selected */}
        {!selectedAsset && (
          <div className="border-t border-white/5 px-6 py-16 text-center">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 mx-auto">
                <Package className="w-7 h-7 text-white/15" />
              </div>
              <div>
                <p className="text-sm text-white/30 font-medium">Search for an asset to get started</p>
                <p className="text-xs text-white/20 mt-1">Look up by asset tag (e.g. AF-0114) or name</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Transfer Requests table ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/80">Recent Requests</h3>
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Asset</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">From → To</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { tag: 'AF-0042', type: 'Allocation', from: '—', to: 'Neha Gupta', status: 'Approved', date: 'Jul 10, 2025' },
                  { tag: 'AF-0078', type: 'Transfer',   from: 'Aditi Rao', to: 'Rohan Mehta', status: 'Approved', date: 'Apr 05, 2025' },
                  { tag: 'AF-0310', type: 'Transfer',   from: 'Marcus Hall', to: 'Sana Iqbal', status: 'Pending', date: 'Mar 28, 2025' },
                  { tag: 'AF-0012', type: 'Allocation', from: '—', to: 'Priya Shah', status: 'Approved', date: 'Feb 28, 2025' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">{row.tag}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                        row.type === 'Transfer' ? 'bg-violet-500/10 text-violet-400 border-violet-500/25' : 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                      }`}>{row.type}</span>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-sm">
                      {row.from} <ArrowRight className="w-3 h-3 inline mx-1 text-white/25" /> {row.to}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        row.status === 'Approved' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      }`}>
                        {row.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white/40 text-xs tabular-nums">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}