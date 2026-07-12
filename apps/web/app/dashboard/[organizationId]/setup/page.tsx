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
  RefreshCw,
  Copy,
  Check,
  UserCheck,
  UserX,
  Clock,
} from 'lucide-react'
import {
  useOrganizations,
  useSession,
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useEmployees,
  useUpdateEmployee,
  useDeleteEmployee,
  useRoles,
  useInvitations,
  useInviteEmployee,
  useResendInvitation,
  useDeleteInvitation,
} from '@/hooks/use-organizations'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type Status = 'Active' | 'Inactive'
type Tab = 'departments' | 'categories' | 'employees'

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
  depreciationRate: number
  lifespan: number
  status: Status
}

interface EmployeeRow {
  type: 'member' | 'invite'
  id: string // employee id or invite id
  name: string
  email: string
  department: string
  departmentId?: string
  designation: string
  role: string
  roleId: string
  status: string
  joinedDate: string
  lastSent: string
  phone: string
  token?: string
  isActive?: boolean
}

/* ─── Sub-components ───────────────────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
  const active = status === 'Active' || status === 'Accepted'
  const pending = status === 'Pending Invitation'
  const expired = status === 'Expired'
  const declined = status === 'Declined'
  const cancelled = status === 'Cancelled'

  let classes = 'text-white/40 border-white/10 bg-white/5'
  let Icon = XCircle

  if (active) {
    classes = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    Icon = CheckCircle2
  } else if (pending) {
    classes = 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    Icon = Clock
  } else if (expired || declined || cancelled) {
    classes = 'text-red-400 border-red-500/30 bg-red-500/10'
    Icon = XCircle
  }

  return (
    <span className={['inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border', classes].join(' ')}>
      <Icon className="w-3 h-3" />
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
        className="w-full sm:w-64 rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition"
      />
    </div>
  )
}

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

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
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
  'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition disabled:opacity-50'

const selectCls =
  'w-full rounded-lg border border-white/10 bg-[hsl(240_10%_12%)] px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none disabled:opacity-50'

/* ─── Skeletons ────────────────────────────────────────────────────────────── */

function SkeletonTable() {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 animate-pulse space-y-4">
      <div className="h-4 bg-white/10 rounded w-1/4" />
      <hr className="border-white/8" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="h-4 bg-white/10 rounded w-1/5" />
          <div className="ml-auto h-6 bg-white/10 rounded w-12" />
        </div>
      ))}
    </div>
  )
}

/* ─── DEPARTMENTS TAB ──────────────────────────────────────────────────────── */

function DepartmentsTab({
  showToast,
  isReadOnly,
}: {
  showToast: (msg: string, type?: 'success' | 'error') => void
  isReadOnly: boolean
}) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)

  const [form, setForm] = useState({ name: '', managerId: '', parentDepartmentId: '' })
  const [editForm, setEditForm] = useState({ name: '', managerId: '', parentDepartmentId: '', isActive: true })

  // Hooks
  const { data: depts, isLoading } = useDepartments()
  const { data: employees } = useEmployees()

  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  const deleteMutation = useDeleteDepartment()

  const filtered = (depts ?? []).filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.manager?.user?.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    try {
      await createMutation.mutateAsync({
        name: form.name.trim(),
        managerId: form.managerId || null,
        parentDepartmentId: form.parentDepartmentId || null,
      })
      setForm({ name: '', managerId: '', parentDepartmentId: '' })
      setShowAdd(false)
      showToast('Department added successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add department', 'error')
    }
  }

  const handleEditClick = (dept: any) => {
    setEditingItem(dept)
    setEditForm({
      name: dept.name,
      managerId: dept.managerId ?? '',
      parentDepartmentId: dept.parentDepartmentId ?? '',
      isActive: dept.isActive,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editForm.name.trim()) return

    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        data: {
          name: editForm.name.trim(),
          managerId: editForm.managerId || null,
          parentDepartmentId: editForm.parentDepartmentId || null,
          isActive: editForm.isActive,
        },
      })
      setEditingItem(null)
      showToast('Department updated successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update department', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      showToast('Department removed successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete department', 'error')
    }
  }

  const toggleStatus = async (dept: any) => {
    if (isReadOnly) return
    try {
      await updateMutation.mutateAsync({
        id: dept.id,
        data: {
          isActive: !dept.isActive,
        },
      })
      showToast(`Department ${!dept.isActive ? 'activated' : 'deactivated'} successfully`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to change department status', 'error')
    }
  }

  if (isLoading) return <SkeletonTable />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search departments…" />
        {!isReadOnly && (
          <button
            id="add-department-btn"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Department</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Head</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Parent Dept</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-white/30">
                    No departments found.
                  </td>
                </tr>
              ) : (
                filtered.map((dept) => {
                  const parentName = depts?.find((d) => d.id === dept.parentDepartmentId)?.name ?? '—'
                  return (
                    <tr key={dept.id} className="hover:bg-white/2 transition-colors group">
                      <td className="px-5 py-4 font-medium text-white">{dept.name}</td>
                      <td className="px-5 py-4 text-white/70">{dept.manager?.user?.name ?? '—'}</td>
                      <td className="px-5 py-4 text-white/50">{parentName}</td>
                      <td className="px-5 py-4">
                        <button
                          disabled={isReadOnly}
                          onClick={() => toggleStatus(dept)}
                          className="hover:opacity-80 transition-opacity disabled:pointer-events-none"
                        >
                          <StatusBadge status={dept.isActive ? 'Active' : 'Inactive'} />
                        </button>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {!isReadOnly && (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditClick(dept)}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <div className="relative">
                <select
                  value={form.managerId}
                  onChange={(e) => setForm((p) => ({ ...p, managerId: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">No Department Head</option>
                  {(employees ?? []).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user.name} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </Field>
            <Field label="Parent Department (optional)">
              <div className="relative">
                <select
                  value={form.parentDepartmentId}
                  onChange={(e) => setForm((p) => ({ ...p, parentDepartmentId: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">None (Top-Level)</option>
                  {(depts ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Department'}
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
              <div className="relative">
                <select
                  value={editForm.managerId}
                  onChange={(e) => setEditForm((p) => ({ ...p, managerId: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">No Department Head</option>
                  {(employees ?? []).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.user.name} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </Field>
            <Field label="Parent Department (optional)">
              <div className="relative">
                <select
                  value={editForm.parentDepartmentId}
                  onChange={(e) => setEditForm((p) => ({ ...p, parentDepartmentId: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">None (Top-Level)</option>
                  {(depts ?? [])
                    .filter((d) => d.id !== editingItem.id) // Avoid self-hierarchy loops
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={editForm.isActive ? 'Active' : 'Inactive'}
                  onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.value === 'Active' }))}
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
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ─── CATEGORIES TAB ───────────────────────────────────────────────────────── */

function CategoriesTab({
  showToast,
  isReadOnly,
}: {
  showToast: (msg: string, type?: 'success' | 'error') => void
  isReadOnly: boolean
}) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingItem, setEditingItem] = useState<any | null>(null)

  const [form, setForm] = useState({ name: '', description: '', depreciationRate: 15, lifespan: 5, parentCategoryId: '', status: 'Active' })
  const [editForm, setEditForm] = useState({ name: '', description: '', depreciationRate: 15, lifespan: 5, parentCategoryId: '', status: 'Active' })

  // Hooks
  const { data: categories, isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const mappedCategories: Category[] = (categories ?? []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.customAttributes?.description ?? '',
    depreciationRate: cat.customAttributes?.depreciationRate ?? 10,
    lifespan: cat.customAttributes?.lifespan ?? 5,
    status: (cat.customAttributes?.status as Status) ?? 'Active',
  }))

  const filtered = mappedCategories.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    try {
      await createMutation.mutateAsync({
        name: form.name.trim(),
        customAttributes: {
          description: form.description.trim(),
          status: form.status as 'Active' | 'Inactive',
          depreciationRate: Number(form.depreciationRate),
          lifespan: Number(form.lifespan),
          parentCategoryId: form.parentCategoryId || null,
        },
      })
      setForm({ name: '', description: '', depreciationRate: 15, lifespan: 5, parentCategoryId: '', status: 'Active' })
      setShowAdd(false)
      showToast('Category added successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add category', 'error')
    }
  }

  const handleEditClick = (cat: Category) => {
    const rawCat = categories?.find((c) => c.id === cat.id)
    setEditingItem(cat)
    setEditForm({
      name: cat.name,
      description: cat.description,
      depreciationRate: cat.depreciationRate,
      lifespan: cat.lifespan,
      parentCategoryId: rawCat?.customAttributes?.parentCategoryId ?? '',
      status: cat.status,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editForm.name.trim()) return

    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        data: {
          name: editForm.name.trim(),
          customAttributes: {
            description: editForm.description.trim(),
            status: editForm.status as 'Active' | 'Inactive',
            depreciationRate: Number(editForm.depreciationRate),
            lifespan: Number(editForm.lifespan),
            parentCategoryId: editForm.parentCategoryId || null,
          },
        },
      })
      setEditingItem(null)
      showToast('Category updated successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update category', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      showToast('Category removed successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete category', 'error')
    }
  }

  if (isLoading) return <SkeletonTable />

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search categories…" />
        {!isReadOnly && (
          <button
            id="add-category-btn"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        )}
      </div>

      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Deprec. Rate</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Lifespan</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-white/30">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filtered.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4 font-medium text-white">{cat.name}</td>
                    <td className="px-5 py-4 text-white/50">{cat.description || '—'}</td>
                    <td className="px-5 py-4 text-white/70">{cat.depreciationRate}%</td>
                    <td className="px-5 py-4 text-white/70">{cat.lifespan} Years</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={cat.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isReadOnly && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditClick(cat)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
      </div>

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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Depreciation Rate (%)">
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={form.depreciationRate}
                  onChange={(e) => setForm((p) => ({ ...p, depreciationRate: Number(e.target.value) }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Lifespan (Years)">
                <input
                  type="number"
                  required
                  min={1}
                  value={form.lifespan}
                  onChange={(e) => setForm((p) => ({ ...p, lifespan: Number(e.target.value) }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Parent Category (optional)">
                <div className="relative">
                  <select
                    value={form.parentCategoryId}
                    onChange={(e) => setForm((p) => ({ ...p, parentCategoryId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">None (Top-Level)</option>
                    {(categories ?? []).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Category'}
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Depreciation Rate (%)">
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={editForm.depreciationRate}
                  onChange={(e) => setEditForm((p) => ({ ...p, depreciationRate: Number(e.target.value) }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Lifespan (Years)">
                <input
                  type="number"
                  required
                  min={1}
                  value={editForm.lifespan}
                  onChange={(e) => setEditForm((p) => ({ ...p, lifespan: Number(e.target.value) }))}
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Parent Category (optional)">
                <div className="relative">
                  <select
                    value={editForm.parentCategoryId}
                    onChange={(e) => setEditForm((p) => ({ ...p, parentCategoryId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">None (Top-Level)</option>
                    {(categories ?? [])
                      .filter((cat) => cat.id !== editingItem.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ─── EMPLOYEES TAB ────────────────────────────────────────────────────────── */

function EmployeesTab({
  showToast,
  isReadOnly,
}: {
  showToast: (msg: string, type?: 'success' | 'error') => void
  isReadOnly: boolean
}) {
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    roleId: '',
    departmentId: '',
    designation: '',
    phone: '',
  })

  const [editForm, setEditForm] = useState({
    designation: '',
    departmentId: '',
    phone: '',
    isActive: true,
  })

  // Hooks
  const { data: employees, isLoading: employeesLoading } = useEmployees()
  const { data: invitations, isLoading: invitesLoading } = useInvitations()
  const { data: depts } = useDepartments()
  const { data: roles } = useRoles()

  const inviteMutation = useInviteEmployee()
  const resendMutation = useResendInvitation()
  const cancelInviteMutation = useDeleteInvitation()
  const updateEmployeeMutation = useUpdateEmployee()
  const deleteEmployeeMutation = useDeleteEmployee()

  // Assemble list mapping database values to Employees Setup workflow
  const employeeRows: EmployeeRow[] = (employees ?? []).map((emp) => ({
    type: 'member',
    id: emp.id,
    name: emp.user.name,
    email: emp.user.email,
    department: emp.department?.name ?? '—',
    departmentId: emp.departmentId ?? '',
    designation: emp.designation ?? '—',
    role: emp.user.role?.name ?? 'Employee',
    roleId: emp.user.roleId ?? '',
    status: emp.isActive ? 'Accepted' : 'Inactive',
    joinedDate: new Date(emp.createdAt).toLocaleDateString(),
    lastSent: '—',
    phone: emp.phone ?? '',
    isActive: emp.isActive,
  }))

  const inviteRows: EmployeeRow[] = (invitations ?? [])
    .filter((inv) => !inv.accepted)
    .map((inv) => {
      let status = 'Pending Invitation'
      if (new Date() > new Date(inv.expiresAt)) {
        status = 'Expired'
      }
      const resolvedDeptName = depts?.find((d) => d.id === inv.departmentId)?.name ?? '—'
      return {
        type: 'invite',
        id: inv.id,
        name: inv.name ?? '—',
        email: inv.email,
        department: resolvedDeptName,
        departmentId: inv.departmentId ?? '',
        designation: inv.designation ?? '—',
        role: inv.role.name,
        roleId: inv.roleId,
        status,
        joinedDate: '—',
        lastSent: new Date(inv.createdAt).toLocaleDateString(),
        phone: inv.phone ?? '',
        token: inv.token,
      }
    })

  const combinedRows = [...employeeRows, ...inviteRows]

  const filtered = combinedRows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.designation.toLowerCase().includes(search.toLowerCase())
  )

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email.trim() || !form.roleId) return

    try {
      await inviteMutation.mutateAsync({
        email: form.email.trim(),
        roleId: form.roleId,
        name: form.name.trim() || undefined,
        designation: form.designation.trim() || undefined,
        departmentId: form.departmentId || undefined,
        phone: form.phone.trim() || undefined,
      })
      setForm({ name: '', email: '', roleId: '', departmentId: '', designation: '', phone: '' })
      setShowAdd(false)
      showToast('Invitation enqueued and email sent successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send invitation', 'error')
    }
  }

  const handleResend = async (id: string) => {
    try {
      await resendMutation.mutateAsync(id)
      showToast('Invitation resent successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to resend invitation', 'error')
    }
  }

  const handleCopyLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const link = `${origin}/auth/accept-invite?token=${token}`
    navigator.clipboard.writeText(link)
    showToast('Invitation link copied')
  }

  const handleCancelInvite = async (id: string) => {
    try {
      await cancelInviteMutation.mutateAsync(id)
      showToast('Invitation cancelled successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel invitation', 'error')
    }
  }

  const handleEditClick = (emp: EmployeeRow) => {
    setEditingEmployee(emp)
    setEditForm({
      designation: emp.designation === '—' ? '' : emp.designation,
      departmentId: emp.departmentId ?? '',
      phone: emp.phone,
      isActive: emp.isActive ?? true,
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    try {
      await updateEmployeeMutation.mutateAsync({
        id: editingEmployee.id,
        data: {
          designation: editForm.designation.trim() || null,
          departmentId: editForm.departmentId || null,
          phone: editForm.phone.trim() || null,
          isActive: editForm.isActive,
        },
      })
      setEditingEmployee(null)
      showToast('Employee profile updated successfully')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update employee', 'error')
    }
  }

  const handleRemoveMember = async (id: string) => {
    try {
      await deleteEmployeeMutation.mutateAsync(id)
      showToast('Member removed from organization', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove member', 'error')
    }
  }

  if (employeesLoading || invitesLoading) return <SkeletonTable />

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search employees…" />
        {!isReadOnly && (
          <button
            id="add-employee-btn"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
          >
            <Plus className="w-4 h-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Department</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Joined / Sent</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-white/30">
                    No employees or invites found.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                          {emp.name[0] ?? 'E'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">{emp.name}</p>
                          <p className="text-[11px] text-white/40 truncate">{emp.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60">{emp.email}</td>
                    <td className="px-5 py-4 text-white/70">{emp.department}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex px-2.5 py-0.5 rounded-md bg-white/6 text-white/60 text-xs font-medium border border-white/8">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={emp.status} />
                    </td>
                    <td className="px-5 py-4 text-white/50 text-xs">
                      {emp.status === 'Accepted' ? emp.joinedDate : emp.lastSent}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isReadOnly && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {emp.type === 'invite' ? (
                            <>
                              <button
                                onClick={() => handleResend(emp.id)}
                                className="px-2 py-1 rounded text-[11px] font-semibold text-accent hover:bg-accent/10 transition-colors"
                                title="Resend Invite"
                              >
                                Resend
                              </button>
                              {emp.token && (
                                <button
                                  onClick={() => handleCopyLink(emp.token!)}
                                  className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
                                  title="Copy Link"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => handleCancelInvite(emp.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Cancel Invite"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(emp)}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-accent hover:bg-accent/10 transition-colors"
                                title="Edit Employee"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveMember(emp.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Remove From Workspace"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Invite Employee" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <Field label="Full Name">
              <input
                type="text"
                placeholder="Jane Smith"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </Field>
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
            <Field label="Phone (optional)">
              <input
                type="tel"
                placeholder="+1 555-0100"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Organization Role">
                <div className="relative">
                  <select
                    required
                    value={form.roleId}
                    onChange={(e) => setForm((p) => ({ ...p, roleId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">Select Role</option>
                    {(roles ?? [])
                      .filter((r) => r.roleType !== 'ADMIN')
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
              <Field label="Department (optional)">
                <div className="relative">
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">None</option>
                    {(depts ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                </div>
              </Field>
            </div>
            <Field label="Designation / Job Title">
              <input
                type="text"
                placeholder="e.g. Lead Frontend Architect"
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Invite Employee'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingEmployee && (
        <Modal title="Edit Employee Profile" onClose={() => setEditingEmployee(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Field label="Designation / Job Title">
              <input
                type="text"
                required
                placeholder="e.g. Senior Developer"
                value={editForm.designation}
                onChange={(e) => setEditForm((p) => ({ ...p, designation: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Department">
              <div className="relative">
                <select
                  value={editForm.departmentId}
                  onChange={(e) => setEditForm((p) => ({ ...p, departmentId: e.target.value }))}
                  className={selectCls}
                >
                  <option value="">No Department</option>
                  {(depts ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              </div>
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                placeholder="+1 555-0100"
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls}
              />
            </Field>
            <Field label="Status">
              <div className="relative">
                <select
                  value={editForm.isActive ? 'Active' : 'Inactive'}
                  onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.value === 'Active' }))}
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
                onClick={() => setEditingEmployee(null)}
                className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateEmployeeMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                {updateEmployeeMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

/* ─── TABS CONFIG ──────────────────────────────────────────────────────────── */

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
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

  // Query session role for RBAC
  const { data: sessionData } = useSession()
  const { data: memberships } = useOrganizations()
  const activeMembership = memberships?.find((m) => m.isActive)
  const userRole = activeMembership?.role?.roleType ?? 'EMPLOYEE'

  const isReadOnly = userRole === 'EMPLOYEE' || userRole === 'AUDITOR' || userRole === 'TECHNICIAN'

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
        <h2 className="text-2xl font-bold text-white tracking-tight">Organisation Setup</h2>
        <p className="text-sm text-white/40">
          {activeOrgName ? (
            <>
              Configure departments, asset categories, and employees for{' '}
              <span className="text-white/70 font-medium">{activeOrgName}</span>.
            </>
          ) : (
            'Configure departments, asset categories, and employee directory for your organisation.'
          )}
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/4 border border-white/8 w-fit">
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
                  : 'text-white/50 hover:text-white hover:bg-white/6',
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
        {activeTab === 'departments' && <DepartmentsTab showToast={showToast} isReadOnly={isReadOnly} />}
        {activeTab === 'categories'  && <CategoriesTab  showToast={showToast} isReadOnly={isReadOnly} />}
        {activeTab === 'employees'   && <EmployeesTab   showToast={showToast} isReadOnly={isReadOnly} />}
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