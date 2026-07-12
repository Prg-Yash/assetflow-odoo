'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Plus,
  Search,
  X,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Building2,
  Tag,
  Users,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type Status = 'Active' | 'Inactive'

interface Department {
  id: string
  name: string
  head: string
  parentDept: string
  status: Status
}

interface Category {
  id: string
  name: string
  description: string
  assetCount: number
  status: Status
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  role: string
  status: Status
}

type Tab = 'departments' | 'categories' | 'employees'

/* ─── Seed data ────────────────────────────────────────────────────────────── */

const SEED_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Engineering',       head: 'Aditi Rao',   parentDept: '—',        status: 'Active' },
  { id: 'd2', name: 'Facilities',        head: 'Rohan Mehta', parentDept: '—',        status: 'Active' },
  { id: 'd3', name: 'Field Ops (East)',  head: 'Sana Iqbal',  parentDept: 'Field Ops', status: 'Inactive' },
]

const SEED_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Laptops & Computers', description: 'End-user compute devices',   assetCount: 142, status: 'Active' },
  { id: 'c2', name: 'Office Furniture',    description: 'Desks, chairs, shelves',      assetCount: 89,  status: 'Active' },
  { id: 'c3', name: 'Vehicles',            description: 'Company-owned motor vehicles', assetCount: 14,  status: 'Active' },
  { id: 'c4', name: 'AV Equipment',        description: 'Projectors, displays, cameras', assetCount: 31, status: 'Inactive' },
]

const SEED_EMPLOYEES: Employee[] = [
  { id: 'e1', firstName: 'Aditi',  lastName: 'Rao',    email: 'aditi@acme.com',  department: 'Engineering',      role: 'Manager',       status: 'Active' },
  { id: 'e2', firstName: 'Rohan',  lastName: 'Mehta',  email: 'rohan@acme.com',  department: 'Facilities',       role: 'Manager',       status: 'Active' },
  { id: 'e3', firstName: 'Sana',   lastName: 'Iqbal',  email: 'sana@acme.com',   department: 'Field Ops (East)', role: 'Employee',      status: 'Inactive' },
  { id: 'e4', firstName: 'Priya',  lastName: 'Singh',  email: 'priya@acme.com',  department: 'Engineering',      role: 'Employee',      status: 'Active' },
  { id: 'e5', firstName: 'Marcus', lastName: 'Hall',   email: 'marcus@acme.com', department: 'Facilities',       role: 'Administrator', status: 'Active' },
]

/* ─── Utilities ────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2, 9)
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
          : 'text-muted-foreground border-border bg-muted',
      ].join(' ')}
    >
      {active ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search…'}
        className="w-full sm:w-64 rounded-lg border border-border bg-card pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition"
      />
    </div>
  )
}

/* Toast */
interface ToastState { show: boolean; message: string; type: 'success' | 'error' }

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
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

/* Modal wrapper */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/* Form field helper */
function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
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
  'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition'

const selectCls =
  'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none'

/* ─── DEPARTMENTS TAB ──────────────────────────────────────────────────────── */

function DepartmentsTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [rows, setRows] = useState<Department[]>(SEED_DEPARTMENTS)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState<Department | null>(null)
  
  const [form, setForm] = useState({ name: '', head: '', parentDept: '', status: 'Active' as Status })
  const [editForm, setEditForm] = useState({ name: '', head: '', parentDept: '', status: 'Active' as Status })

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.head.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setRows((prev) => [
      ...prev,
      { id: uid(), name: form.name, head: form.head, parentDept: form.parentDept || '—', status: form.status },
    ])
    setForm({ name: '', head: '', parentDept: '', status: 'Active' })
    setShowAdd(false)
    showToast('Department added successfully')
  }

  const handleEditClick = (dept: Department) => {
    setEditingItem(dept)
    setEditForm({
      name: dept.name,
      head: dept.head,
      parentDept: dept.parentDept === '—' ? '' : dept.parentDept,
      status: dept.status,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editForm.name.trim()) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === editingItem.id
          ? { ...r, name: editForm.name, head: editForm.head, parentDept: editForm.parentDept || '—', status: editForm.status }
          : r
      )
    )
    setEditingItem(null)
    showToast('Department updated successfully')
  }

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    showToast('Department removed', 'error')
  }

  const toggleStatus = (id: string) => {
    setRows((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: r.status === 'Active' ? 'Inactive' : 'Active' } : r)
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search departments…" />
        <button
          id="add-department-btn"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Head</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent Dept</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground/80">
                    No departments found.
                  </td>
                </tr>
              ) : (
                filtered.map((dept) => (
                  <tr key={dept.id} className="hover:bg-muted transition-colors group">
                    <td className="px-5 py-4 font-medium text-foreground">{dept.name}</td>
                    <td className="px-5 py-4 text-foreground/70">{dept.head}</td>
                    <td className="px-5 py-4 text-muted-foreground">{dept.parentDept}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleStatus(dept.id)} className="hover:opacity-80 transition-opacity">
                        <StatusBadge status={dept.status} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
      </div>

      <p className="text-xs text-muted-foreground/70 italic">
        Editing a department here also drives the picklist in asset allocation &amp; employee assignment.
      </p>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Department" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="Department Name">
              <input
                type="text"
                required
                placeholder="e.g. Engineering"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Department Head">
              <input
                type="text"
                placeholder="e.g. Aditi Rao"
                value={form.head}
                onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Parent Department (optional)">
              <input
                type="text"
                placeholder="Leave blank if top-level"
                value={form.parentDept}
                onChange={(e) => setForm((p) => ({ ...p, parentDept: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Status }))}
                  className={selectCls}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Add Department
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <Modal title="Edit Department" onClose={() => setEditingItem(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Field label="Department Name">
              <input
                type="text"
                required
                placeholder="e.g. Engineering"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Department Head">
              <input
                type="text"
                placeholder="e.g. Aditi Rao"
                value={editForm.head}
                onChange={(e) => setEditForm((p) => ({ ...p, head: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Parent Department (optional)">
              <input
                type="text"
                placeholder="Leave blank if top-level"
                value={editForm.parentDept}
                onChange={(e) => setEditForm((p) => ({ ...p, parentDept: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as Status }))}
                  className={selectCls}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ─── CATEGORIES TAB ───────────────────────────────────────────────────────── */

function CategoriesTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [rows, setRows] = useState<Category[]>(SEED_CATEGORIES)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState<Category | null>(null)

  const [form, setForm] = useState({ name: '', description: '', status: 'Active' as Status })
  const [editForm, setEditForm] = useState({ name: '', description: '', status: 'Active' as Status })

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setRows((prev) => [
      ...prev,
      { id: uid(), name: form.name, description: form.description, assetCount: 0, status: form.status },
    ])
    setForm({ name: '', description: '', status: 'Active' })
    setShowAdd(false)
    showToast('Category added successfully')
  }

  const handleEditClick = (cat: Category) => {
    setEditingItem(cat)
    setEditForm({
      name: cat.name,
      description: cat.description,
      status: cat.status,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editForm.name.trim()) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === editingItem.id
          ? { ...r, name: editForm.name, description: editForm.description, status: editForm.status }
          : r
      )
    )
    setEditingItem(null)
    showToast('Category updated successfully')
  }

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    showToast('Category removed', 'error')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search categories…" />
        <button
          id="add-category-btn"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assets</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground/80">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted transition-colors group">
                    <td className="px-5 py-4 font-medium text-foreground">{cat.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{cat.description}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-semibold">
                        {cat.assetCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={cat.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
      </div>

      <p className="text-xs text-muted-foreground/70 italic">
        Categories are used to classify assets and drive reporting filters.
      </p>

      {showAdd && (
        <Modal title="Add Category" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="Category Name">
              <input
                type="text"
                required
                placeholder="e.g. Laptops & Computers"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <input
                type="text"
                placeholder="Short description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Status }))}
                  className={selectCls}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Add Category
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <Modal title="Edit Category" onClose={() => setEditingItem(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Field label="Category Name">
              <input
                type="text"
                required
                placeholder="e.g. Laptops & Computers"
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Description">
              <input
                type="text"
                placeholder="Short description"
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as Status }))}
                  className={selectCls}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ─── EMPLOYEES TAB ────────────────────────────────────────────────────────── */

function EmployeesTab({ showToast }: { showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [rows, setRows] = useState<Employee[]>(SEED_EMPLOYEES)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState<Employee | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'Employee',
    status: 'Active' as Status,
  })

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    role: 'Employee',
    status: 'Active' as Status,
  })

  const filtered = rows.filter(
    (r) =>
      `${r.firstName} ${r.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.email.trim()) return
    setRows((prev) => [
      ...prev,
      { id: uid(), ...form },
    ])
    setForm({ firstName: '', lastName: '', email: '', department: '', role: 'Employee', status: 'Active' })
    setShowAdd(false)
    showToast('Employee added successfully')
  }

  const handleEditClick = (emp: Employee) => {
    setEditingItem(emp)
    setEditForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department,
      role: emp.role,
      status: emp.status,
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editForm.firstName.trim() || !editForm.email.trim()) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === editingItem.id
          ? {
              ...r,
              firstName: editForm.firstName,
              lastName: editForm.lastName,
              email: editForm.email,
              department: editForm.department,
              role: editForm.role,
              status: editForm.status,
            }
          : r
      )
    )
    setEditingItem(null)
    showToast('Employee updated successfully')
  }

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
    showToast('Employee removed', 'error')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search employees…" />
        <button
          id="add-employee-btn"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground/80">
                    No employees found.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <span className="font-medium text-foreground">{emp.firstName} {emp.lastName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{emp.email}</td>
                    <td className="px-5 py-4 text-foreground/70">{emp.department}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(emp)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
      </div>

      <p className="text-xs text-muted-foreground/70 italic">
        Employees listed here can be assigned assets and appear in allocation picklists.
      </p>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add Employee" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name">
                <input
                  type="text"
                  required
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  placeholder="Smith"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Work Email">
              <input
                type="email"
                required
                placeholder="jane@acme.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Department">
              <input
                type="text"
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className={selectCls}
                  >
                    <option>Employee</option>
                    <option>Manager</option>
                    <option>Administrator</option>
                    <option>Auditor</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Status }))}
                    className={selectCls}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Add Employee
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <Modal title="Edit Employee" onClose={() => setEditingItem(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name">
                <input
                  type="text"
                  required
                  placeholder="Jane"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  placeholder="Smith"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Work Email">
              <input
                type="email"
                required
                placeholder="jane@acme.com"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Department">
              <input
                type="text"
                placeholder="e.g. Engineering"
                value={editForm.department}
                onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Role">
                <div className="relative">
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}
                    className={selectCls}
                  >
                    <option>Employee</option>
                    <option>Manager</option>
                    <option>Administrator</option>
                    <option>Auditor</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as Status }))}
                    className={selectCls}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ─── TABS CONFIG ──────────────────────────────────────────────────────────── */

const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'categories',  label: 'Categories',  icon: Tag },
  { id: 'employees',   label: 'Employees',   icon: Users },
]

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

const ACTIVE_ORG_NAME_KEY = 'assetflow:activeOrgName'

export default function DashboardSetupPage() {
  const [activeTab, setActiveTab] = useState<Tab>('departments')
  const [activeOrgName, setActiveOrgName] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  useEffect(() => {
    setActiveOrgName(sessionStorage.getItem(ACTIVE_ORG_NAME_KEY))
  }, [])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast((p) => ({ ...p, show: false }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight">Organisation Setup</h2>
        <p className="text-sm text-muted-foreground">
          {activeOrgName
            ? <>Configure departments, asset categories, and employees for <span className="text-foreground/70 font-medium">{activeOrgName}</span>.</>
            : 'Configure departments, asset categories, and employee directory for your organisation.'}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border w-fit">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-accent text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'departments' && <DepartmentsTab showToast={showToast} />}
        {activeTab === 'categories'  && <CategoriesTab  showToast={showToast} />}
        {activeTab === 'employees'   && <EmployeesTab   showToast={showToast} />}
      </div>

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}