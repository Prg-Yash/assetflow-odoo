'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Building2,
  Pencil,
  Trash2,
  AlertCircle,
  Globe,
  Phone,
  Users,
  Package,
  Settings,
  Star,
  LayoutGrid,
  List,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type Status = 'Active' | 'Inactive'

interface Organization {
  id: string
  name: string
  slug: string
  website: string
  phone: string
  role: string
  members: number
  assets: number
  departments: number
  status: Status
  isCurrent: boolean
}

type ViewMode = 'grid' | 'list'

/* ─── Seed data ────────────────────────────────────────────────────────────── */

const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'o1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    website: 'https://acme.com',
    phone: '+1 555-0100',
    role: 'Admin',
    members: 48,
    assets: 312,
    departments: 6,
    status: 'Active',
    isCurrent: true,
  },
  {
    id: 'o2',
    name: 'Nova Logistics',
    slug: 'nova-logistics',
    website: 'https://novalogistics.io',
    phone: '+1 555-0200',
    role: 'Admin',
    members: 22,
    assets: 156,
    departments: 4,
    status: 'Active',
    isCurrent: false,
  },
  {
    id: 'o3',
    name: 'Brightfield Labs',
    slug: 'brightfield-labs',
    website: 'https://brightfieldlabs.com',
    phone: '+1 555-0300',
    role: 'Asset Manager',
    members: 12,
    assets: 89,
    departments: 3,
    status: 'Inactive',
    isCurrent: false,
  },
]

const STORAGE_KEY = 'assetflow:activeOrgId'
const STORAGE_NAME_KEY = 'assetflow:activeOrgName'

/* ─── Utilities ────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.random().toString(36).slice(2, 7)
  )
}

/* ─── Sub-components ───────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: Status }) {
  const active = status === 'Active'
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
        active
          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
          : 'text-white/40 border-white/10 bg-white/5',
      ].join(' ')}
    >
      {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status}
    </span>
  )
}

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search…'}
        className="w-full sm:w-72 rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition"
      />
    </div>
  )
}

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
        'fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl shadow-black/50 border text-sm font-medium',
        'animate-in slide-in-from-bottom-4 fade-in duration-300',
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
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[hsl(240_10%_9%)] shadow-2xl shadow-black/60 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/8 transition-colors"
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
      <label className="block text-xs font-medium text-white/60 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition'

const selectCls =
  'w-full rounded-lg border border-white/10 bg-[hsl(240_10%_12%)] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none'

const emptyForm = {
  name: '',
  website: '',
  phone: '',
  role: 'Admin',
  status: 'Active' as Status,
}

/* ─── Org card ─────────────────────────────────────────────────────────────── */

function OrgCard({
  org,
  onEdit,
  onDelete,
  onSwitch,
  onToggleStatus,
}: {
  org: Organization
  onEdit: (org: Organization) => void
  onDelete: (id: string) => void
  onSwitch: (id: string) => void
  onToggleStatus: (id: string) => void
}) {
  return (
    <div
      className={[
        'relative rounded-2xl border p-5 transition-all duration-200 hover:border-white/15',
        org.isCurrent
          ? 'border-accent/40 bg-accent/5 shadow-lg shadow-accent/5'
          : 'border-white/8 bg-white/[0.02] hover:bg-white/[0.04]',
      ].join(' ')}
    >
      {org.isCurrent && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
          <Star className="w-3 h-3 fill-current" />
          Active
        </span>
      )}

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
          <Building2 className="w-6 h-6 text-accent" />
        </div>
        <div className="min-w-0 flex-1 pr-16">
          <h3 className="text-base font-semibold text-white truncate">{org.name}</h3>
          <p className="text-xs text-white/35 mt-0.5 font-mono">{org.slug}</p>
          <p className="text-xs text-white/50 mt-2">{org.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-white/30 mb-1">
            <Users className="w-3 h-3" />
          </div>
          <p className="text-sm font-semibold text-white">{org.members}</p>
          <p className="text-[10px] text-white/30">Members</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-white/30 mb-1">
            <Package className="w-3 h-3" />
          </div>
          <p className="text-sm font-semibold text-white">{org.assets}</p>
          <p className="text-[10px] text-white/30">Assets</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-white/30 mb-1">
            <Building2 className="w-3 h-3" />
          </div>
          <p className="text-sm font-semibold text-white">{org.departments}</p>
          <p className="text-[10px] text-white/30">Depts</p>
        </div>
      </div>

      {(org.website || org.phone) && (
        <div className="mt-4 space-y-1">
          {org.website && (
            <p className="flex items-center gap-2 text-xs text-white/40 truncate">
              <Globe className="w-3 h-3 shrink-0" />
              {org.website.replace(/^https?:\/\//, '')}
            </p>
          )}
          {org.phone && (
            <p className="flex items-center gap-2 text-xs text-white/40">
              <Phone className="w-3 h-3 shrink-0" />
              {org.phone}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-5">
        <button onClick={() => onToggleStatus(org.id)} className="hover:opacity-80 transition-opacity">
          <StatusBadge status={org.status} />
        </button>
        <div className="flex items-center gap-1">
          {!org.isCurrent && (
            <button
              onClick={() => onSwitch(org.id)}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-accent hover:bg-accent/10 transition-colors"
            >
              Switch
            </button>
          )}
          <button
            onClick={() => onEdit(org)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(org.id)}
            disabled={org.isCurrent}
            className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <Link
        href="/dashboard/setup"
        onClick={() => {
          if (!org.isCurrent) onSwitch(org.id)
        }}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 py-2 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all"
      >
        <Settings className="w-3.5 h-3.5" />
        Organisation Setup
      </Link>
    </div>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function DashboardOrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>(SEED_ORGANIZATIONS)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showAdd, setShowAdd] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyForm)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast((p) => ({ ...p, show: false }))
  }, [])

  useEffect(() => {
    const storedId = sessionStorage.getItem(STORAGE_KEY)
    if (storedId) {
      setOrgs((prev) =>
        prev.map((o) => ({
          ...o,
          isCurrent: o.id === storedId,
        }))
      )
    } else if (orgs.length > 0) {
      const defaultOrg = orgs.find((o) => o.isCurrent) ?? orgs[0]
      if (defaultOrg) persistActiveOrg(defaultOrg.id, defaultOrg.name)
    }
  }, [])

  const persistActiveOrg = (id: string, name: string) => {
    sessionStorage.setItem(STORAGE_KEY, id)
    sessionStorage.setItem(STORAGE_NAME_KEY, name)
  }

  const filtered = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()) ||
      o.role.toLowerCase().includes(search.toLowerCase())
  )

  const activeOrg = orgs.find((o) => o.isCurrent)
  const totalMembers = orgs.reduce((sum, o) => sum + o.members, 0)
  const totalAssets = orgs.reduce((sum, o) => sum + o.assets, 0)

  const handleSwitch = (id: string) => {
    const org = orgs.find((o) => o.id === id)
    setOrgs((prev) =>
      prev.map((o) => ({
        ...o,
        isCurrent: o.id === id,
      }))
    )
    if (org) persistActiveOrg(id, org.name)
    showToast(`Switched to ${org?.name ?? 'organisation'}`)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    const newOrg: Organization = {
      id: uid(),
      name: form.name.trim(),
      slug: slugify(form.name),
      website: form.website.trim(),
      phone: form.phone.trim(),
      role: form.role,
      members: 1,
      assets: 0,
      departments: 0,
      status: form.status,
      isCurrent: orgs.length === 0,
    }

    setOrgs((prev) => {
      const next = [...prev, newOrg]
      if (newOrg.isCurrent) persistActiveOrg(newOrg.id, newOrg.name)
      return next
    })
    setForm(emptyForm)
    setShowAdd(false)
    showToast('Organisation created successfully')
  }

  const handleEditClick = (org: Organization) => {
    setEditingOrg(org)
    setEditForm({
      name: org.name,
      website: org.website,
      phone: org.phone,
      role: org.role,
      status: org.status,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrg || !editForm.name.trim()) return

    setOrgs((prev) =>
      prev.map((o) =>
        o.id === editingOrg.id
          ? {
              ...o,
              name: editForm.name.trim(),
              website: editForm.website.trim(),
              phone: editForm.phone.trim(),
              role: editForm.role,
              status: editForm.status,
            }
          : o
      )
    )
    if (editingOrg.isCurrent) {
      sessionStorage.setItem(STORAGE_NAME_KEY, editForm.name.trim())
    }
    setEditingOrg(null)
    showToast('Organisation updated successfully')
  }

  const handleDelete = (id: string) => {
    const org = orgs.find((o) => o.id === id)
    if (org?.isCurrent) {
      showToast('Cannot delete the active organisation', 'error')
      return
    }
    setDeletingId(id)
  }

  const confirmDelete = () => {
    if (!deletingId) return
    const org = orgs.find((o) => o.id === deletingId)
    setOrgs((prev) => prev.filter((o) => o.id !== deletingId))
    setDeletingId(null)
    showToast(`${org?.name ?? 'Organisation'} removed`, 'error')
  }

  const toggleStatus = (id: string) => {
    setOrgs((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === 'Active' ? 'Inactive' : 'Active' } : o
      )
    )
  }

  const OrgForm = ({
    data,
    onChange,
    onSubmit,
    onCancel,
    submitLabel,
  }: {
    data: typeof emptyForm
    onChange: (fn: (p: typeof emptyForm) => typeof emptyForm) => void
    onSubmit: (e: React.FormEvent) => void
    onCancel: () => void
    submitLabel: string
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Organisation Name">
        <input
          type="text"
          required
          placeholder="e.g. Acme Corp"
          value={data.name}
          onChange={(e) => onChange((p) => ({ ...p, name: e.target.value }))}
          className={inputCls}
        />
      </Field>
      <Field label="Website (optional)">
        <input
          type="url"
          placeholder="https://example.com"
          value={data.website}
          onChange={(e) => onChange((p) => ({ ...p, website: e.target.value }))}
          className={inputCls}
        />
      </Field>
      <Field label="Phone (optional)">
        <input
          type="tel"
          placeholder="+1 555-0100"
          value={data.phone}
          onChange={(e) => onChange((p) => ({ ...p, phone: e.target.value }))}
          className={inputCls}
        />
      </Field>
      <Field label="Your Role">
        <div className="relative">
          <select
            value={data.role}
            onChange={(e) => onChange((p) => ({ ...p, role: e.target.value }))}
            className={selectCls}
          >
            <option value="Admin">Admin</option>
            <option value="Asset Manager">Asset Manager</option>
            <option value="Auditor">Auditor</option>
            <option value="Employee">Employee</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      </Field>
      <Field label="Status">
        <div className="relative">
          <select
            value={data.status}
            onChange={(e) => onChange((p) => ({ ...p, status: e.target.value as Status }))}
            className={selectCls}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      </Field>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white tracking-tight">Organisations</h2>
          <p className="text-sm text-white/40">
            Manage the workspaces you belong to. Select an organisation before configuring setup.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Organisation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Organisations', value: orgs.length, icon: Building2 },
          { label: 'Active Workspace', value: activeOrg?.name ?? '—', icon: Star, truncate: true },
          { label: 'Total Members', value: totalMembers, icon: Users },
          { label: 'Total Assets', value: totalAssets, icon: Package },
        ].map(({ label, value, icon: Icon, truncate }) => (
          <div
            key={label}
            className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
          >
            <div className="flex items-center gap-2 text-white/30 mb-1.5">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className={['text-lg font-bold text-white', truncate ? 'truncate' : ''].join(' ')}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search organisations…" />
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/4 border border-white/8">
          <button
            onClick={() => setViewMode('grid')}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white',
            ].join(' ')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white',
            ].join(' ')}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/8 py-16 text-center">
          <Building2 className="w-10 h-10 text-white/15 mx-auto mb-3" />
          <p className="text-sm text-white/40">No organisations found.</p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
          >
            Create your first organisation
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((org) => (
            <OrgCard
              key={org.id}
              org={org}
              onEdit={handleEditClick}
              onDelete={handleDelete}
              onSwitch={handleSwitch}
              onToggleStatus={toggleStatus}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Organisation
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Members
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Assets
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((org) => (
                  <tr key={org.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white flex items-center gap-2">
                            {org.name}
                            {org.isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold">
                                ACTIVE
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-white/35 font-mono">{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/70">{org.role}</td>
                    <td className="px-5 py-4 text-white/70">{org.members}</td>
                    <td className="px-5 py-4 text-white/70">{org.assets}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(org.id)}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <StatusBadge status={org.status} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {!org.isCurrent && (
                          <button
                            onClick={() => handleSwitch(org.id)}
                            className="px-2 py-1 rounded text-[11px] font-semibold text-accent hover:bg-accent/10 transition-colors"
                          >
                            Switch
                          </button>
                        )}
                        <Link
                          href="/dashboard/setup"
                          onClick={() => {
                            if (!org.isCurrent) handleSwitch(org.id)
                          }}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Organisation Setup"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleEditClick(org)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id)}
                          disabled={org.isCurrent}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-white/25 italic">
        Switch your active organisation here, then proceed to Organisation Setup to configure
        departments, categories, and employees.
      </p>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Create Organisation" onClose={() => setShowAdd(false)}>
          <OrgForm
            data={form}
            onChange={setForm}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            submitLabel="Create Organisation"
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editingOrg && (
        <Modal title="Edit Organisation" onClose={() => setEditingOrg(null)}>
          <OrgForm
            data={editForm}
            onChange={setEditForm}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingOrg(null)}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {/* Delete confirmation */}
      {deletingId && (
        <Modal title="Delete Organisation" onClose={() => setDeletingId(null)}>
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-white">
                {orgs.find((o) => o.id === deletingId)?.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  )
}
