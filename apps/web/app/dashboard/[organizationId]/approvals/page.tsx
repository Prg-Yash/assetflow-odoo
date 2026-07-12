'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  X,
  ChevronDown,
  Eye,
  FileCheck,
  Building,
  User,
  Package,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import {
  useApprovalRequests,
  useApprovalStats,
  useApproveRequest,
  useRejectRequest,
} from '@/hooks/use-approvals'
import {
  useDepartments,
  useOrganizations,
  useSession,
} from '@/hooks/use-organizations'
import { ApprovalRequest, ApprovalRequestType, ApprovalRequestStatus } from '@/types/approval'

/* ─── Shared Toast ──────────────────────────────────────────────────────────── */
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
        'fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl border text-sm font-medium animate-in slide-in-from-bottom-4 fade-in duration-300',
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

/* ─── Modal wrapper ─────────────────────────────────────────────────────────── */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
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

/* ─── Stat Card ──────────────────────────────────────────────────────────────── */
function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  subtext?: string
  icon: React.ComponentType<any>
  color: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between shadow-sm">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtext && <p className="text-[10px] text-muted-foreground/80">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  )
}

/* ─── PAGE ──────────────────────────────────────────────────────────────────── */
export default function ApprovalsPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const organizationId = (params.organizationId as string) || ''

  // Filter keys from searchParams
  const filterType = searchParams.get('requestType') || 'All'
  const filterStatus = searchParams.get('status') || 'All'
  const filterPriority = searchParams.get('priority') || 'All'
  const filterDepartment = searchParams.get('departmentId') || 'All'
  const search = searchParams.get('search') || ''
  const currentPage = Number(searchParams.get('page') || '1')

  const [searchVal, setSearchVal] = useState(search)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [approvingRequest, setApprovingRequest] = useState<ApprovalRequest | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<ApprovalRequest | null>(null)

  // Form inputs for approve/reject
  const [approveComments, setApproveComments] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [rejectComments, setRejectComments] = useState('')

  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  // Session & RBAC Check
  const { data: sessionData, isLoading: isSessionLoading } = useSession()
  const { data: memberships } = useOrganizations()
  const activeMembership = memberships?.find((m) => m.isActive)
  const userRole = activeMembership?.role?.roleType ?? 'EMPLOYEE'
  const isManager = userRole === 'ADMIN' || userRole === 'ASSET_MANAGER'

  // Fetch lists
  const { data: departments } = useDepartments()
  const { data: stats } = useApprovalStats()
  const { data: requests, isLoading: isRequestsLoading } = useApprovalRequests({
    status: filterStatus,
    requestType: filterType,
    priority: filterPriority,
    departmentId: filterDepartment,
    search,
  })

  const approveMutation = useApproveRequest()
  const rejectMutation = useRejectRequest()

  // Debounce search val to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString())
      if (searchVal.trim()) {
        p.set('search', searchVal.trim())
      } else {
        p.delete('search')
      }
      p.delete('page')
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
    p.delete('page')
    router.push(`${pathname}?${p.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const p = new URLSearchParams(searchParams.toString())
    p.set('page', String(page))
    router.push(`${pathname}?${p.toString()}`)
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!approvingRequest) return

    try {
      await approveMutation.mutateAsync({
        id: approvingRequest.id,
        data: { comments: approveComments },
      })
      setApprovingRequest(null)
      setApproveComments('')
      showToast('Approval request approved successfully.')
    } catch (err: any) {
      showToast(err?.message || 'Failed to approve request', 'error')
    }
  }

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingRequest) return
    if (!rejectReason.trim()) {
      showToast('Rejection reason is required', 'error')
      return
    }

    try {
      await rejectMutation.mutateAsync({
        id: rejectingRequest.id,
        data: {
          rejectionReason: rejectReason,
          comments: rejectComments,
        },
      })
      setRejectingRequest(null)
      setRejectReason('')
      setRejectComments('')
      showToast('Approval request rejected successfully.')
    } catch (err: any) {
      showToast(err?.message || 'Failed to reject request', 'error')
    }
  }

  if (isSessionLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Clock className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-muted-foreground">Checking authorization...</p>
      </div>
    )
  }

  if (!isManager) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center max-w-lg mx-auto my-16">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
        <p className="text-sm text-red-300 opacity-90 leading-relaxed">
          The Approval Requests module is restricted to organization Administrators and Asset Managers. Please contact your administrator if you believe this is in error.
        </p>
        <button
          onClick={() => router.push(`/dashboard/${organizationId}`)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    )
  }

  // Slicing/Pagination client-side over backend filtered results
  const items = requests ?? []
  const ITEMS_PER_PAGE = 8
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE)
  const paginated = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Approval Requests</h2>
          <p className="text-sm text-muted-foreground">
            Review and manage allocation, return, and maintenance request queues.
          </p>
        </div>
      </div>

      {/* Stats Summary Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Requests"
          value={stats?.pendingTotal ?? 0}
          subtext={`Allocations: ${stats?.pendingAllocations ?? 0} | Returns: ${stats?.pendingReturns ?? 0}`}
          icon={Clock}
          color="bg-amber-500/10 text-amber-400"
        />
        <StatCard
          title="Approved Today"
          value={stats?.approvedToday ?? 0}
          subtext="Resolution sync active"
          icon={CheckCircle2}
          color="bg-emerald-500/10 text-emerald-400"
        />
        <StatCard
          title="Rejected Today"
          value={stats?.rejectedToday ?? 0}
          subtext="History log generated"
          icon={XCircle}
          color="bg-red-500/10 text-red-400"
        />
        <StatCard
          title="Avg Approval Time"
          value={`${stats?.avgApprovalTimeMinutes ?? 0}m`}
          subtext="SLA limit: 24 hours"
          icon={TrendingUp}
          color="bg-sky-500/10 text-sky-400"
        />
      </div>

      {/* Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/85 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by asset tag, name, or employee…"
            className="w-full rounded-lg border border-border bg-input pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Request Type */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => handleFilterChange('requestType', e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-border bg-muted text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="ALLOCATION">Allocation</option>
              <option value="RETURN">Return</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-border bg-muted text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              value={filterPriority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-border bg-muted text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>

          {/* Department */}
          <div className="relative">
            <select
              value={filterDepartment}
              onChange={(e) => handleFilterChange('departmentId', e.target.value)}
              className="px-3.5 py-2 rounded-lg border border-border bg-muted text-sm font-medium text-foreground hover:bg-muted/80 focus:outline-none cursor-pointer"
            >
              <option value="All">All Departments</option>
              {(departments ?? []).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {[filterType, filterStatus, filterPriority, filterDepartment].some((v) => v !== 'All') && (
            <button
              onClick={() => {
                const p = new URLSearchParams()
                router.push(`${pathname}?${p.toString()}`)
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority
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
              {isRequestsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-5"><div className="h-4 w-12 bg-white/10 rounded" /></td>
                    <td className="px-5 py-5">
                      <div className="space-y-1">
                        <div className="h-4 w-28 bg-white/10 rounded" />
                        <div className="h-3 w-16 bg-white/10 rounded" />
                      </div>
                    </td>
                    <td className="px-5 py-5"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                    <td className="px-5 py-5"><div className="h-4 w-12 bg-white/10 rounded" /></td>
                    <td className="px-5 py-5"><div className="h-6 w-20 bg-white/10 rounded-full" /></td>
                    <td className="px-5 py-5 text-right"><div className="h-4 w-8 bg-white/10 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <div className="space-y-2">
                      <FileCheck className="w-8 h-8 text-foreground/15 mx-auto" />
                      <p className="text-sm text-muted-foreground/80">
                        No approval requests in current queue.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((req) => {
                  const submitDate = new Date(req.createdAt).toLocaleDateString()
                  return (
                    <tr key={req.id} className="hover:bg-muted transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-semibold text-foreground/60">
                          {req.id.substring(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-foreground">{req.employee?.user?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.employee?.employeeCode || '—'} {req.employee?.department?.name ? `| ${req.employee.department.name}` : ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-foreground">{req.asset?.name || '—'}</p>
                          <p className="text-xs text-accent font-mono font-medium mt-0.5">
                            {req.asset?.assetCode || '—'}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                          {req.requestType}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                            req.priority === 'CRITICAL'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : req.priority === 'HIGH'
                                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                : 'bg-muted text-foreground/50 border border-border',
                          ].join(' ')}
                        >
                          {req.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={[
                            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
                            req.status === 'PENDING'
                              ? 'text-amber-400 border-amber-500/25 bg-amber-500/10'
                              : req.status === 'APPROVED'
                                ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10'
                                : 'text-red-400 border-red-500/25 bg-red-500/10',
                          ].join(' ')}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="View request details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => setApprovingRequest(req)}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                                title="Approve Request"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectingRequest(req)}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Reject Request"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
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

        {/* Pagination */}
        <div className="border-t border-border px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center bg-muted gap-3">
          <p className="text-xs text-muted-foreground/85">
            Showing {items.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(items.length, currentPage * ITEMS_PER_PAGE)} of {items.length} requests
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground/75 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground/75 hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── View Details Modal ── */}
      {selectedRequest && (
        <Modal title="Request Specifications & Details" onClose={() => setSelectedRequest(null)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Submitted By</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedRequest.employee?.user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Code: {selectedRequest.employee?.employeeCode}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Target Asset</span>
                <p className="font-semibold text-foreground mt-0.5">
                  {selectedRequest.asset?.name}
                </p>
                <p className="text-xs text-accent font-mono">
                  Tag: {selectedRequest.asset?.assetCode}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pb-3 border-b border-border">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Request Type</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedRequest.requestType}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Priority</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedRequest.priority}</p>
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Submission Reason / Notes</span>
              <div className="mt-1 rounded-lg bg-input p-3 border border-border/50 text-foreground/80 leading-relaxed text-xs">
                {selectedRequest.reason || 'No description or reasons provided.'}
              </div>
            </div>

            {selectedRequest.status !== 'PENDING' && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <p className="font-semibold text-xs text-foreground uppercase tracking-wider">
                  Reviewer Verdict
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Reviewed By:</span>
                    <p className="text-foreground">{selectedRequest.reviewedBy?.name || 'Manager'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verdict Date:</span>
                    <p className="text-foreground">
                      {selectedRequest.reviewedAt
                        ? new Date(selectedRequest.reviewedAt).toLocaleDateString()
                        : '—'}
                    </p>
                  </div>
                </div>
                {selectedRequest.rejectionReason && (
                  <div className="pt-1.5 text-xs">
                    <span className="text-red-400 font-semibold">Rejection Reason:</span>
                    <p className="text-red-300 mt-0.5">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
                {selectedRequest.comments && (
                  <div className="pt-1.5 text-xs">
                    <span className="text-muted-foreground font-semibold">Comments:</span>
                    <p className="text-foreground/80 mt-0.5">{selectedRequest.comments}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {selectedRequest.asset && (
                <Link
                  href={`/dashboard/${organizationId}/assets/${selectedRequest.asset.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted text-center"
                >
                  <Package className="w-3.5 h-3.5" /> View Asset
                </Link>
              )}
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Close Window
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirm Approve Modal ── */}
      {approvingRequest && (
        <Modal title="Confirm Request Approval" onClose={() => setApprovingRequest(null)}>
          <form onSubmit={handleApproveSubmit} className="space-y-4">
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Verify workflow authorization</p>
                <p className="opacity-90">
                  Approving this request will immediately execute the lifecycle transition in the catalog:
                </p>
                <ul className="list-disc pl-4 mt-1.5 space-y-1">
                  {approvingRequest.requestType === 'ALLOCATION' && (
                    <li>Create active asset allocation assignment for employee.</li>
                  )}
                  {approvingRequest.requestType === 'RETURN' && (
                    <li>Terminate current employee custody and set asset status to Available.</li>
                  )}
                  {approvingRequest.requestType === 'MAINTENANCE' && (
                    <li>Flag asset status as In Maintenance and open ticket logs.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Comments / Review Notes (optional)
              </label>
              <textarea
                placeholder="Add comments or instructions for the employee..."
                value={approveComments}
                onChange={(e) => setApproveComments(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[70px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={approveMutation.isPending}
                className="flex-1 rounded-lg bg-emerald-500 hover:opacity-90 text-sm font-semibold text-white transition-opacity"
              >
                {approveMutation.isPending ? 'Processing...' : 'Confirm Approve'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Confirm Reject Modal ── */}
      {rejectingRequest && (
        <Modal title="Confirm Request Rejection" onClose={() => setRejectingRequest(null)}>
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Rejection Verification Required</p>
                <p className="opacity-90">
                  Rejection is logged in the request timeline. You must provide a valid rejection reason below.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Rejection Reason *
              </label>
              <select
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select Reason</option>
                <option value="Asset Unavailable / Already Allocated">Asset Unavailable / Already Allocated</option>
                <option value="Employee Limit Exceeded">Employee Limit Exceeded</option>
                <option value="Department Restriction Error">Department Restriction Error</option>
                <option value="Incorrect Asset Selection">Incorrect Asset Selection</option>
                <option value="Maintenance Request Invalid">Maintenance Request Invalid</option>
                <option value="Other / Incorrect Request">Other / Incorrect Request</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Additional Comments (optional)
              </label>
              <textarea
                placeholder="Add comments explaining the rejection..."
                value={rejectComments}
                onChange={(e) => setRejectComments(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[70px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rejectMutation.isPending}
                className="flex-1 rounded-lg bg-red-500 hover:opacity-90 text-sm font-semibold text-white transition-opacity"
              >
                {rejectMutation.isPending ? 'Processing...' : 'Confirm Reject'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast notifications */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast((p) => ({ ...p, show: false }))} />}
    </div>
  )
}
