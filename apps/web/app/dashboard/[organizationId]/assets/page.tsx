'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
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
  QrCode,
  MapPin,
  Eye,
  Copy,
  RefreshCw,
  Archive,
  MoreVertical,
  Download,
  Info,
  Calendar,
  Layers,
  Briefcase,
  DollarSign,
  UserCheck,
} from 'lucide-react'
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useDeleteAsset,
  useLocations,
  useVendors,
} from '@/hooks/use-assets'
import {
  useCategories,
  useDepartments,
  useEmployees,
  useSession,
  useOrganizations,
} from '@/hooks/use-organizations'
import { Asset, AssetStatus, ConditionEnum } from '@/types/asset'

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
  wide,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-in zoom-in-95 fade-in duration-200`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
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
  'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none'

/* ─── Status badge ─────────────────────────────────────────────────────────── */

const STATUS_OPTIONS: { value: AssetStatus; label: string; style: string }[] = [
  { value: 'AVAILABLE', label: 'Available', style: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { value: 'ALLOCATED', label: 'Allocated', style: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { value: 'UNDER_MAINTENANCE', label: 'Maintenance', style: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { value: 'RESERVED', label: 'Reserved', style: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { value: 'LOST', label: 'Lost', style: 'text-red-400 border-red-500/30 bg-red-500/10' },
  { value: 'DAMAGED', label: 'Damaged', style: 'text-rose-450 border-rose-500/30 bg-rose-500/10' },
  { value: 'RETIRED', label: 'Retired', style: 'text-gray-400 border-gray-500/30 bg-gray-500/10' },
  { value: 'DISPOSED', label: 'Disposed', style: 'text-stone-400 border-stone-500/30 bg-stone-500/10' },
  { value: 'IN_AUDIT', label: 'In Audit', style: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
]

function StatusBadge({ status }: { status: AssetStatus }) {
  const option = STATUS_OPTIONS.find((o) => o.value === status) ?? STATUS_OPTIONS[0]
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${option.style}`}>
      <CheckCircle2 className="w-3 h-3" />
      {option.label}
    </span>
  )
}

/* ─── Filter dropdown ──────────────────────────────────────────────────────── */

function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return
    const handler = (e: MouseEvent) => {
      if (!node.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedOption = options.find((o) => o.value === value)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all duration-150',
          value !== 'All'
            ? 'border-accent/40 bg-accent/10 text-accent'
            : 'border-border bg-muted text-muted-foreground hover:text-foreground hover:bg-muted',
        ].join(' ')}
      >
        {label}
        {value !== 'All' && selectedOption ? `: ${selectedOption.label}` : ''}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[180px] max-h-60 overflow-y-auto rounded-xl border border-border bg-popover shadow-2xl shadow-black/50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${opt.value === value ? 'text-accent bg-accent/10' : 'text-foreground/70 hover:text-foreground hover:bg-muted'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function AssetsPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const organizationId = (params.organizationId as string) || ''

  // Sync Search and Filters from URL
  const filterCategory = searchParams.get('categoryId') || 'All'
  const filterStatus = searchParams.get('status') || 'All'
  const filterDepartmentFromUrl = searchParams.get('departmentId') || 'All'
  const filterLocation = searchParams.get('locationId') || 'All'
  const search = searchParams.get('search') || ''
  const currentPage = Number(searchParams.get('page') || '1')

  const [searchVal, setSearchVal] = useState(search)
  const [showRegister, setShowRegister] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [deletingAsset, setDeletingAsset] = useState<Asset | null>(null)
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  // Session & RBAC
  const { data: sessionData } = useSession()
  const { data: memberships } = useOrganizations()
  const activeMembership = memberships?.find((m) => m.isActive)
  const userRole = activeMembership?.role?.roleType ?? 'EMPLOYEE'

  const { data: employees } = useEmployees()
  const currentEmployee = employees?.find((e) => e.userId === sessionData?.user?.id)
  const myDepartmentId = currentEmployee?.departmentId

  const isReadOnly = userRole === 'EMPLOYEE' || userRole === 'AUDITOR' || userRole === 'TECHNICIAN'
  const isDeptHead = userRole === 'DEPARTMENT_HEAD'

  // If DEPARTMENT_HEAD, force department filter to their department
  const filterDepartment = isDeptHead ? (myDepartmentId || 'NONE') : filterDepartmentFromUrl

  // Fetch metadata options
  const { data: categories } = useCategories()
  const { data: departments } = useDepartments()
  const { data: locations } = useLocations()
  const { data: vendors } = useVendors()

  // Fetch Assets
  const { data: assets, isLoading, error } = useAssets({
    categoryId: filterCategory,
    departmentId: filterDepartment,
    locationId: filterLocation,
    status: filterStatus,
    search,
  })

  const createMutation = useCreateAsset()
  const updateMutation = useUpdateAsset()
  const deleteMutation = useDeleteAsset()

  // Debounce search update to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString())
      if (searchVal.trim()) {
        p.set('search', searchVal.trim())
      } else {
        p.delete('search')
      }
      p.delete('page') // Reset page on search
      router.push(`${pathname}?${p.toString()}`)
    }, 450)
    return () => clearTimeout(handler)
  }, [searchVal, router, pathname])

  const handleFilterChange = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value && value !== 'All') {
      p.set(key, value)
    } else {
      p.delete(key)
    }
    p.delete('page') // Reset page on filter
    router.push(`${pathname}?${p.toString()}`)
  }

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }, [])
  const hideToast = useCallback(() => setToast((p) => ({ ...p, show: false })), [])

  // Auto-generate tag helper
  const suggestCode = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    return `AF-${randomDigits}`
  }

  /* Form state for register */
  const [regForm, setRegForm] = useState({
    name: '',
    assetCode: '',
    serialNumber: '',
    categoryId: '',
    departmentId: '',
    locationId: '',
    vendorId: '',
    purchaseCost: '',
    status: 'AVAILABLE' as AssetStatus,
    condition: 'GOOD' as ConditionEnum,
    isShared: false,
    description: '',
  })

  // Auto-generate code when modal opens
  useEffect(() => {
    if (showRegister) {
      setRegForm({
        name: '',
        assetCode: suggestCode(),
        serialNumber: '',
        categoryId: categories?.[0]?.id || '',
        departmentId: departments?.[0]?.id || '',
        locationId: locations?.[0]?.id || '',
        vendorId: vendors?.[0]?.id || '',
        purchaseCost: '',
        status: 'AVAILABLE',
        condition: 'GOOD',
        isShared: false,
        description: '',
      })
    }
  }, [showRegister, categories, departments, locations, vendors])

  /* Form state for edit */
  const [editForm, setEditForm] = useState({
    name: '',
    serialNumber: '',
    categoryId: '',
    departmentId: '',
    locationId: '',
    vendorId: '',
    purchaseCost: '',
    status: 'AVAILABLE' as AssetStatus,
    condition: 'GOOD' as ConditionEnum,
    isShared: false,
    description: '',
  })

  // Filter list client-side if EMPLOYEE to only show their own allocated assets
  let displayAssets = assets ?? []
  if (userRole === 'EMPLOYEE') {
    displayAssets = displayAssets.filter((a) =>
      a.allocations?.some((alloc) => alloc.employee?.userId === sessionData?.user?.id && alloc.status === 'ACTIVE')
    )
  }

  /* Pagination */
  const ITEMS_PER_PAGE = 8
  const totalPages = Math.ceil(displayAssets.length / ITEMS_PER_PAGE)
  const paginated = displayAssets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('page', String(page))
    router.push(`${pathname}?${p.toString()}`)
  }

  const activeFilterCount = [filterCategory, filterStatus, filterDepartment, filterLocation].filter(
    (v) => v !== 'All'
  ).length

  /* Submit Handlers */
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regForm.name.trim() || !regForm.assetCode.trim() || !regForm.categoryId) {
      showToast('Name, Category, and Asset Tag are required', 'error')
      return
    }

    try {
      await createMutation.mutateAsync({
        ...regForm,
        purchaseCost: regForm.purchaseCost ? Number(regForm.purchaseCost) : undefined,
        serialNumber: regForm.serialNumber || undefined,
        departmentId: regForm.departmentId || undefined,
        locationId: regForm.locationId || undefined,
        vendorId: regForm.vendorId || undefined,
        description: regForm.description || undefined,
      })
      setShowRegister(false)
      showToast(`Asset ${regForm.assetCode} registered successfully`)
    } catch (err: any) {
      showToast(err?.message || 'Failed to register asset', 'error')
    }
  }

  const handleEditClick = (asset: Asset) => {
    setEditingAsset(asset)
    setOpenActionId(null)
    setEditForm({
      name: asset.name,
      serialNumber: asset.serialNumber ?? '',
      categoryId: asset.categoryId,
      departmentId: asset.departmentId ?? '',
      locationId: asset.locationId ?? '',
      vendorId: asset.vendorId ?? '',
      purchaseCost: asset.purchaseCost ? String(asset.purchaseCost) : '',
      status: asset.status,
      condition: asset.condition,
      isShared: asset.isShared,
      description: asset.description ?? '',
    })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset || !editForm.name.trim()) return

    try {
      await updateMutation.mutateAsync({
        id: editingAsset.id,
        data: {
          ...editForm,
          purchaseCost: editForm.purchaseCost ? Number(editForm.purchaseCost) : undefined,
          serialNumber: editForm.serialNumber || undefined,
          departmentId: editForm.departmentId || undefined,
          locationId: editForm.locationId || undefined,
          vendorId: editForm.vendorId || undefined,
          description: editForm.description || undefined,
        },
      })
      setEditingAsset(null)
      showToast(`Asset ${editingAsset.assetCode} updated successfully`)
    } catch (err: any) {
      showToast(err?.message || 'Failed to update asset', 'error')
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingAsset) return
    try {
      await deleteMutation.mutateAsync(deletingAsset.id)
      setDeletingAsset(null)
      showToast(`Asset deleted successfully`)
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete asset', 'error')
    }
  }

  const handleDuplicate = async (asset: Asset) => {
    try {
      await createMutation.mutateAsync({
        name: `${asset.name} (Copy)`,
        assetCode: `${asset.assetCode}-COPY`,
        serialNumber: asset.serialNumber ? `${asset.serialNumber}-C` : undefined,
        categoryId: asset.categoryId,
        departmentId: asset.departmentId || undefined,
        locationId: asset.locationId || undefined,
        vendorId: asset.vendorId || undefined,
        purchaseCost: asset.purchaseCost || undefined,
        status: 'AVAILABLE',
        condition: asset.condition,
        isShared: asset.isShared,
        description: asset.description || undefined,
      })
      showToast('Asset duplicated successfully')
    } catch (err: any) {
      showToast(err?.message || 'Failed to duplicate asset', 'error')
    }
  }

  const handleArchive = async (asset: Asset) => {
    try {
      await updateMutation.mutateAsync({
        id: asset.id,
        data: { status: 'RETIRED' },
      })
      showToast('Asset archived (Retired)')
    } catch (err: any) {
      showToast(err?.message || 'Failed to archive asset', 'error')
    }
  }

  const clearFilters = () => {
    const p = new URLSearchParams()
    router.push(`${pathname}?${p.toString()}`)
  }

  // Categories list
  const catOptions = [
    { value: 'All', label: 'All Categories' },
    ...(categories ?? []).map((c) => ({ value: c.id, label: c.name })),
  ]

  // Statuses list
  const statusOptions = [
    { value: 'All', label: 'All Statuses' },
    ...STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  ]

  // Departments list
  const deptOptions = [
    { value: 'All', label: 'All Departments' },
    ...(departments ?? []).map((d) => ({ value: d.id, label: d.name })),
  ]

  // Locations list
  const locOptions = [
    { value: 'All', label: 'All Locations' },
    ...(locations ?? []).map((l) => ({ value: l.id, label: l.name })),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Assets</h2>
          <p className="text-sm text-muted-foreground">
            Asset directory and configuration — {displayAssets.length} total assets
          </p>
        </div>
        {!isReadOnly && (
          <button
            id="register-asset-btn"
            onClick={() => setShowRegister(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Register Asset
          </button>
        )}
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by asset tag, serial, or name…"
            className="w-full rounded-lg border border-border bg-input pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Category"
            options={catOptions}
            value={filterCategory}
            onChange={(val) => handleFilterChange('categoryId', val)}
          />
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={filterStatus}
            onChange={(val) => handleFilterChange('status', val)}
          />
          {!isDeptHead && (
            <FilterDropdown
              label="Department"
              options={deptOptions}
              value={filterDepartment}
              onChange={(val) => handleFilterChange('departmentId', val)}
            />
          )}
          <FilterDropdown
            label="Location"
            options={locOptions}
            value={filterLocation}
            onChange={(val) => handleFilterChange('locationId', val)}
          />
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> Clear filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Table & skeleton loading */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tag
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-5">
                      <div className="h-4 w-16 bg-white/10 rounded" />
                    </td>
                    <td className="px-5 py-5">
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-white/10 rounded" />
                        <div className="h-3 w-20 bg-white/10 rounded" />
                      </div>
                    </td>
                    <td className="px-5 py-5">
                      <div className="h-4 w-24 bg-white/10 rounded" />
                    </td>
                    <td className="px-5 py-5">
                      <div className="h-6 w-20 bg-white/10 rounded-full" />
                    </td>
                    <td className="px-5 py-5">
                      <div className="h-4 w-28 bg-white/10 rounded" />
                    </td>
                    <td className="px-5 py-5 text-right">
                      <div className="h-4 w-8 bg-white/10 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center">
                    <div className="space-y-2">
                      <Package className="w-8 h-8 text-foreground/15 mx-auto" />
                      <p className="text-sm text-muted-foreground/80">
                        No assets match your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((asset) => {
                  const assignedEmployee = asset.allocations?.find((a) => a.status === 'ACTIVE')?.employee
                  return (
                    <tr key={asset.id} className="hover:bg-muted transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
                          {asset.assetCode}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-medium text-foreground">{asset.name}</span>
                          {assignedEmployee && (
                            <p className="text-xs text-foreground/35 mt-0.5">
                              → {assignedEmployee.user.name} ({assignedEmployee.employeeCode})
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium border border-border">
                          {asset.category?.name || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="text-sm">
                            {asset.location?.name || asset.department?.name || 'HQ'}
                          </span>
                        </span>
                      </td>
                      <td className="px-5 py-4 relative">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() =>
                              setOpenActionId(openActionId === asset.id ? null : asset.id)
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Complete Actions Dropdown menu */}
                          {openActionId === asset.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenActionId(null)}
                              />
                              <div className="absolute right-5 top-11 mt-1 w-56 rounded-xl border border-border bg-popover shadow-2xl z-50 py-1.5 text-left text-sm animate-in fade-in slide-in-from-top-1 duration-150">
                                <Link
                                  href={`/dashboard/${organizationId}/assets/${asset.id}`}
                                  className="flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground/85 hover:text-foreground"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Asset Details
                                </Link>
                                {!isReadOnly && (
                                  <>
                                    <button
                                      onClick={() => handleEditClick(asset)}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground/85 hover:text-foreground text-left"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Edit Asset
                                    </button>
                                    <button
                                      onClick={() => {
                                        setQrAsset(asset)
                                        setOpenActionId(null)
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground/85 hover:text-foreground text-left"
                                    >
                                      <QrCode className="w-4 h-4" />
                                      View/Download QR Code
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleDuplicate(asset)
                                        setOpenActionId(null)
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground/85 hover:text-foreground text-left"
                                    >
                                      <Copy className="w-4 h-4" />
                                      Duplicate Asset
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleArchive(asset)
                                        setOpenActionId(null)
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-muted text-foreground/85 hover:text-foreground text-left"
                                    >
                                      <Archive className="w-4 h-4" />
                                      Archive Asset
                                    </button>
                                    <div className="border-t border-border my-1" />
                                    <button
                                      onClick={() => {
                                        setDeletingAsset(asset)
                                        setOpenActionId(null)
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-400 text-left"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete Asset
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="border-t border-border px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center bg-muted gap-3">
          <p className="text-xs text-muted-foreground/85 text-center sm:text-left">
            Showing {displayAssets.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(displayAssets.length, currentPage * ITEMS_PER_PAGE)} of {displayAssets.length}{' '}
            assets
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground/70 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asset Name *">
                <input
                  type="text"
                  required
                  placeholder="e.g. Dell Latitude 5420"
                  value={regForm.name}
                  onChange={(e) => setRegForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Asset Tag *">
                <input
                  type="text"
                  required
                  placeholder="e.g. AF-0012"
                  value={regForm.assetCode}
                  onChange={(e) => setRegForm((p) => ({ ...p, assetCode: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Serial Number">
                <input
                  type="text"
                  placeholder="e.g. SN-98765432"
                  value={regForm.serialNumber}
                  onChange={(e) => setRegForm((p) => ({ ...p, serialNumber: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Category *">
                <div className="relative">
                  <select
                    value={regForm.categoryId}
                    onChange={(e) => setRegForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className={selectCls}
                  >
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Department">
                <div className="relative">
                  <select
                    value={regForm.departmentId}
                    onChange={(e) => setRegForm((p) => ({ ...p, departmentId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">No Department</option>
                    {(departments ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Location">
                <div className="relative">
                  <select
                    value={regForm.locationId}
                    onChange={(e) => setRegForm((p) => ({ ...p, locationId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">No Location</option>
                    {(locations ?? []).map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Vendor">
                <div className="relative">
                  <select
                    value={regForm.vendorId}
                    onChange={(e) => setRegForm((p) => ({ ...p, vendorId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">No Vendor</option>
                    {(vendors ?? []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Purchase Price (Cost)">
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  value={regForm.purchaseCost}
                  onChange={(e) => setRegForm((p) => ({ ...p, purchaseCost: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Initial Status">
                <div className="relative">
                  <select
                    value={regForm.status}
                    onChange={(e) => setRegForm((p) => ({ ...p, status: e.target.value as AssetStatus }))}
                    className={selectCls}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Condition">
                <div className="relative">
                  <select
                    value={regForm.condition}
                    onChange={(e) => setRegForm((p) => ({ ...p, condition: e.target.value as ConditionEnum }))}
                    className={selectCls}
                  >
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                id="is-shared"
                type="checkbox"
                checked={regForm.isShared}
                onChange={(e) => setRegForm((p) => ({ ...p, isShared: e.target.checked }))}
                className="w-4 h-4 accent-accent rounded border-border"
              />
              <label htmlFor="is-shared" className="text-sm text-foreground/80">
                Shared / Bookable Asset (accessible to multiple users)
              </label>
            </div>

            <Field label="Description / Specifications">
              <textarea
                placeholder="Details about hardware spec, notes, condition..."
                value={regForm.description}
                onChange={(e) => setRegForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition min-h-[70px]"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {createMutation.isPending ? 'Registering...' : 'Register Asset'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Asset Modal ── */}
      {editingAsset && (
        <Modal title={`Edit Asset — ${editingAsset.assetCode}`} onClose={() => setEditingAsset(null)} wide>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Asset Name">
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputCls}
                />
              </Field>
              <Field label="Serial Number">
                <input
                  type="text"
                  value={editForm.serialNumber}
                  onChange={(e) => setEditForm((p) => ({ ...p, serialNumber: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <div className="relative">
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => setEditForm((p) => ({ ...p, categoryId: e.target.value }))}
                    className={selectCls}
                  >
                    {(categories ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Purchase Price (Cost)">
                <input
                  type="number"
                  value={editForm.purchaseCost}
                  onChange={(e) => setEditForm((p) => ({ ...p, purchaseCost: e.target.value }))}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Department">
                <div className="relative">
                  <select
                    value={editForm.departmentId}
                    onChange={(e) => setEditForm((p) => ({ ...p, departmentId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">No Department</option>
                    {(departments ?? []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Location">
                <div className="relative">
                  <select
                    value={editForm.locationId}
                    onChange={(e) => setEditForm((p) => ({ ...p, locationId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">No Location</option>
                    {(locations ?? []).map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Vendor">
                <div className="relative">
                  <select
                    value={editForm.vendorId}
                    onChange={(e) => setEditForm((p) => ({ ...p, vendorId: e.target.value }))}
                    className={selectCls}
                  >
                    <option value="">No Vendor</option>
                    {(vendors ?? []).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <Field label="Status">
                <div className="relative">
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value as AssetStatus }))}
                    className={selectCls}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Condition">
                <div className="relative">
                  <select
                    value={editForm.condition}
                    onChange={(e) => setEditForm((p) => ({ ...p, condition: e.target.value as ConditionEnum }))}
                    className={selectCls}
                  >
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
                </div>
              </Field>
              <div className="flex items-center gap-2 pt-5">
                <input
                  id="edit-is-shared"
                  type="checkbox"
                  checked={editForm.isShared}
                  onChange={(e) => setEditForm((p) => ({ ...p, isShared: e.target.checked }))}
                  className="w-4 h-4 accent-accent rounded border-border"
                />
                <label htmlFor="edit-is-shared" className="text-sm text-foreground/80">
                  Shared / Bookable Asset
                </label>
              </div>
            </div>

            <Field label="Description">
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full rounded-lg border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition min-h-[70px]"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {deletingAsset && (
        <Modal title="Confirm Asset Deletion" onClose={() => setDeletingAsset(null)}>
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">This action is permanent!</p>
                <p className="opacity-95">
                  Are you sure you want to delete asset <strong>{deletingAsset.name}</strong> ({deletingAsset.assetCode})? All historical data associated with this asset will be lost.
                </p>
              </div>
            </div>

            {/* Lock check for deletion */}
            {(deletingAsset.status === 'ALLOCATED' || deletingAsset.status === 'UNDER_MAINTENANCE') ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-400">
                  <p className="font-semibold">Deletion Blocked</p>
                  <p className="opacity-90">
                    This asset is currently <strong>{deletingAsset.status.replace('_', ' ')}</strong>. Under platform business rules, assets must be returned or resolved (Status: Available/Retired) before they can be deleted.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeletingAsset(null)}
                  className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingAsset(null)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-lg bg-red-500 hover:opacity-90 text-sm font-semibold text-white transition-opacity"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── View/Download QR Code Modal ── */}
      {qrAsset && (
        <Modal title={`QR Code — ${qrAsset.assetCode}`} onClose={() => setQrAsset(null)}>
          <div className="flex flex-col items-center gap-6 py-4 text-center">
            <div className="p-4 bg-white rounded-2xl border border-border shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=0b0f19&bgcolor=ffffff&data=${encodeURIComponent(qrAsset.assetCode)}`}
                alt={`QR code for ${qrAsset.assetCode}`}
                className="w-48 h-48 select-none"
              />
            </div>
            <div>
              <p className="font-semibold text-base text-foreground">{qrAsset.name}</p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{qrAsset.assetCode}</p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setQrAsset(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Close
              </button>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0b0f19&bgcolor=ffffff&data=${encodeURIComponent(qrAsset.assetCode)}`}
                target="_blank"
                rel="noreferrer"
                download={`QR_${qrAsset.assetCode}.png`}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity text-center text-decoration-none"
              >
                <Download className="w-4 h-4" />
                Download / Print
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
