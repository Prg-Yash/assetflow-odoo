'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Package,
  Pencil,
  Trash2,
  AlertCircle,
  Filter,
  QrCode,
  MapPin,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type AssetStatus = 'Available' | 'Allocated' | 'Maintenance' | 'Retired'

interface Asset {
  id: string
  tag: string
  name: string
  category: string
  status: AssetStatus
  location: string
  department: string
  serialNo: string
  assignedTo: string
}

/* ─── Seed data ────────────────────────────────────────────────────────────── */

const SEED_ASSETS: Asset[] = [
  { id: 'a1', tag: 'AF-0012', name: 'Dell Laptop',        category: 'Electronics', status: 'Allocated',   location: 'Bengaluru',   department: 'Engineering',  serialNo: 'DL-2024-0012', assignedTo: 'Priya Shah' },
  { id: 'a2', tag: 'AF-0062', name: 'Projector',          category: 'Electronics', status: 'Maintenance', location: 'HQ Floor 2',  department: 'Facilities',   serialNo: 'PJ-2024-0062', assignedTo: '' },
  { id: 'a3', tag: 'AF-0201', name: 'Office Chair',       category: 'Furniture',   status: 'Available',   location: 'Warehouse',   department: 'Facilities',   serialNo: 'OC-2024-0201', assignedTo: '' },
  { id: 'a4', tag: 'AF-0078', name: 'MacBook Pro 16"',    category: 'Electronics', status: 'Allocated',   location: 'Mumbai HQ',   department: 'Engineering',  serialNo: 'MB-2024-0078', assignedTo: 'Rohan Mehta' },
  { id: 'a5', tag: 'AF-0115', name: 'Standing Desk',      category: 'Furniture',   status: 'Available',   location: 'Warehouse',   department: '',             serialNo: 'SD-2024-0115', assignedTo: '' },
  { id: 'a6', tag: 'AF-0310', name: 'Toyota Innova',      category: 'Vehicles',    status: 'Allocated',   location: 'Bengaluru',   department: 'Field Ops',    serialNo: 'TI-2023-0310', assignedTo: 'Sana Iqbal' },
  { id: 'a7', tag: 'AF-0042', name: 'Conference Display', category: 'Electronics', status: 'Retired',     location: 'HQ Floor 3',  department: 'Facilities',   serialNo: 'CD-2023-0042', assignedTo: '' },
]

const CATEGORIES = ['All', 'Electronics', 'Furniture', 'Vehicles']
const STATUSES: ('All' | AssetStatus)[] = ['All', 'Available', 'Allocated', 'Maintenance', 'Retired']
const DEPARTMENTS = ['All', 'Engineering', 'Facilities', 'Field Ops']

/* ─── Utilities ────────────────────────────────────────────────────────────── */

function uid() { return Math.random().toString(36).slice(2, 9) }
function nextTag(assets: Asset[]) {
  const nums = assets.map((a) => parseInt(a.tag.replace('AF-', ''), 10)).filter((n) => !isNaN(n))
  const max = nums.length > 0 ? Math.max(...nums) : 0
  return `AF-${String(max + 1).padStart(4, '0')}`
}

/* ─── Shared UI ────────────────────────────────────────────────────────────── */

interface ToastState { show: boolean; message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t) }, [onClose])
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

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl border border-white/10 bg-[hsl(240_10%_9%)] shadow-2xl shadow-black/60 overflow-hidden animate-in zoom-in-95 fade-in duration-200`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/60 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition'
const selectCls = 'w-full rounded-lg border border-white/10 bg-[hsl(240_10%_12%)] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none'

/* ─── Status badge ─────────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: AssetStatus }) {
  const styles: Record<AssetStatus, string> = {
    Available:   'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    Allocated:   'text-sky-400 border-sky-500/30 bg-sky-500/10',
    Maintenance: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    Retired:     'text-white/40 border-white/10 bg-white/5',
  }
  const icons: Record<AssetStatus, React.ReactNode> = {
    Available:   <CheckCircle2 className="w-3 h-3" />,
    Allocated:   <Package className="w-3 h-3" />,
    Maintenance: <AlertCircle className="w-3 h-3" />,
    Retired:     <XCircle className="w-3 h-3" />,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  )
}

/* ─── Filter chip ──────────────────────────────────────────────────────────── */

function FilterDropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const handler = (e: MouseEvent) => { if (!node.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all duration-150',
          value !== 'All'
            ? 'border-accent/40 bg-accent/10 text-accent'
            : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/8',
        ].join(' ')}
      >
        {label}{value !== 'All' && `: ${value}`}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[160px] rounded-xl border border-white/10 bg-[hsl(240_10%_10%)] shadow-2xl shadow-black/50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${opt === value ? 'text-accent bg-accent/10' : 'text-white/70 hover:text-white hover:bg-white/6'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(SEED_ASSETS)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState<string>('All')
  const [filterDepartment, setFilterDepartment] = useState('All')
  const [showRegister, setShowRegister] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }, [])
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), [])

  /* Form state for register */
  const [regForm, setRegForm] = useState({
    name: '', category: 'Electronics', location: '', department: '', serialNo: '', assignedTo: '', status: 'Available' as AssetStatus,
  })

  /* Form state for edit */
  const [editForm, setEditForm] = useState({
    name: '', category: '', location: '', department: '', serialNo: '', assignedTo: '', status: 'Available' as AssetStatus,
  })

  /* Filter logic */
  const filtered = assets.filter((a) => {
    const q = search.toLowerCase()
    const matchSearch = !q || a.tag.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || a.serialNo.toLowerCase().includes(q)
    const matchCat = filterCategory === 'All' || a.category === filterCategory
    const matchStatus = filterStatus === 'All' || a.status === filterStatus
    const matchDept = filterDepartment === 'All' || a.department === filterDepartment
    return matchSearch && matchCat && matchStatus && matchDept
  })

  /* Pagination logic */
  const ITEMS_PER_PAGE = 5
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterCategory, filterStatus, filterDepartment])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const activeFilterCount = [filterCategory, filterStatus, filterDepartment].filter((v) => v !== 'All').length

  /* Register */
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regForm.name.trim()) return
    const newAsset: Asset = {
      id: uid(),
      tag: nextTag(assets),
      ...regForm,
    }
    setAssets((prev) => [...prev, newAsset])
    setRegForm({ name: '', category: 'Electronics', location: '', department: '', serialNo: '', assignedTo: '', status: 'Available' })
    setShowRegister(false)
    showToast(`Asset ${newAsset.tag} registered successfully`)
  }

  /* Edit */
  const handleEditClick = (asset: Asset) => {
    setEditingAsset(asset)
    setEditForm({
      name: asset.name,
      category: asset.category,
      location: asset.location,
      department: asset.department,
      serialNo: asset.serialNo,
      assignedTo: asset.assignedTo,
      status: asset.status,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset || !editForm.name.trim()) return
    setAssets((prev) => prev.map((a) => a.id === editingAsset.id ? { ...a, ...editForm } : a))
    setEditingAsset(null)
    showToast(`Asset ${editingAsset.tag} updated`)
  }

  /* Delete */
  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id))
    showToast('Asset removed', 'error')
  }

  /* Clear filters */
  const clearFilters = () => {
    setFilterCategory('All')
    setFilterStatus('All')
    setFilterDepartment('All')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Assets</h2>
          <p className="text-sm text-white/40">Asset registration and directory — {assets.length} total assets</p>
        </div>
        <button
          id="register-asset-btn"
          onClick={() => setShowRegister(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Register Asset
        </button>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <QrCode className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by tag, serial, or name…"
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown label="Category" options={CATEGORIES} value={filterCategory} onChange={setFilterCategory} />
          <FilterDropdown label="Status" options={STATUSES} value={filterStatus} onChange={setFilterStatus} />
          <FilterDropdown label="Department" options={DEPARTMENTS} value={filterDepartment} onChange={setFilterDepartment} />
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white/40 hover:text-white transition-colors">
              <X className="w-3 h-3" /> Clear filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Tag</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Location</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="space-y-2">
                      <Package className="w-8 h-8 text-white/15 mx-auto" />
                      <p className="text-sm text-white/30">No assets match your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                        {asset.tag}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-medium text-white">{asset.name}</span>
                        {asset.assignedTo && (
                          <p className="text-xs text-white/35 mt-0.5">→ {asset.assignedTo}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md bg-white/6 text-white/60 text-xs font-medium border border-white/8">
                        {asset.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={asset.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-white/50">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-sm">{asset.location}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(asset)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer row count with pagination */}
        <div className="border-t border-white/5 px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center bg-white/2 gap-3">
          <p className="text-xs text-white/30 text-center sm:text-left">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(filtered.length, currentPage * ITEMS_PER_PAGE)} of {filtered.length} assets
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-white/40 px-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-semibold text-white/70 hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Register Asset Modal ── */}
      {showRegister && (
        <Modal title="Register New Asset" onClose={() => setShowRegister(false)} wide>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asset Name">
                <input type="text" required placeholder="e.g. Dell Laptop" value={regForm.name} onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Serial Number">
                <input type="text" placeholder="e.g. DL-2024-0012" value={regForm.serialNo} onChange={(e) => setRegForm((p) => ({ ...p, serialNo: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <div className="relative">
                  <select value={regForm.category} onChange={(e) => setRegForm((p) => ({ ...p, category: e.target.value }))} className={selectCls}>
                    <option>Electronics</option><option>Furniture</option><option>Vehicles</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select value={regForm.status} onChange={(e) => setRegForm((p) => ({ ...p, status: e.target.value as AssetStatus }))} className={selectCls}>
                    <option value="Available">Available</option><option value="Allocated">Allocated</option><option value="Maintenance">Maintenance</option><option value="Retired">Retired</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location">
                <input type="text" placeholder="e.g. Bengaluru" value={regForm.location} onChange={(e) => setRegForm((p) => ({ ...p, location: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Department">
                <input type="text" placeholder="e.g. Engineering" value={regForm.department} onChange={(e) => setRegForm((p) => ({ ...p, department: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <Field label="Assigned To (optional)">
              <input type="text" placeholder="Employee name" value={regForm.assignedTo} onChange={(e) => setRegForm((p) => ({ ...p, assignedTo: e.target.value }))} className={inputCls} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowRegister(false)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">Register Asset</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Asset Modal ── */}
      {editingAsset && (
        <Modal title={`Edit Asset — ${editingAsset.tag}`} onClose={() => setEditingAsset(null)} wide>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asset Name">
                <input type="text" required value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Serial Number">
                <input type="text" value={editForm.serialNo} onChange={(e) => setEditForm((p) => ({ ...p, serialNo: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <div className="relative">
                  <select value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))} className={selectCls}>
                    <option>Electronics</option><option>Furniture</option><option>Vehicles</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as AssetStatus }))} className={selectCls}>
                    <option value="Available">Available</option><option value="Allocated">Allocated</option><option value="Maintenance">Maintenance</option><option value="Retired">Retired</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Location">
                <input type="text" value={editForm.location} onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))} className={inputCls} />
              </Field>
              <Field label="Department">
                <input type="text" value={editForm.department} onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))} className={inputCls} />
              </Field>
            </div>
            <Field label="Assigned To">
              <input type="text" value={editForm.assignedTo} onChange={(e) => setEditForm((p) => ({ ...p, assignedTo: e.target.value }))} className={inputCls} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditingAsset(null)} className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
