'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Package,
  Wrench,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Info,
  Calendar,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react'
import { useAssets } from '@/hooks/use-assets'
import { useSession, useEmployees } from '@/hooks/use-organizations'
import { useApprovalRequests, useCreateApprovalRequest } from '@/hooks/use-approvals'
import { Asset, AssetStatus } from '@/types/asset'
import { ApprovalRequest } from '@/types/approval'

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

/* ─── Modal ─────────────────────────────────────────────────────────────────── */
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

/* ─── FIELD ─────────────────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent'
const selectCls =
  'w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent appearance-none'

export default function MyAssetsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = (params.organizationId as string) || ''

  const { data: sessionData } = useSession()
  const { data: employees } = useEmployees()
  const { data: assets, isLoading: isAssetsLoading } = useAssets()
  const { data: allRequests, isLoading: isRequestsLoading } = useApprovalRequests()

  const createRequestMutation = useCreateApprovalRequest()

  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' })

  // Request form modals
  const [allocationModal, setAllocationModal] = useState(false)
  const [returnModalAsset, setReturnModalAsset] = useState<Asset | null>(null)
  const [maintenanceModalAsset, setMaintenanceModalAsset] = useState<Asset | null>(null)

  // Request form state
  const [reqAssetId, setReqAssetId] = useState('')
  const [reqPriority, setReqPriority] = useState('MEDIUM')
  const [reqReason, setReqReason] = useState('')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type })
  }

  // Find employee profile
  const employeeProfile = employees?.find((e) => e.userId === sessionData?.user?.id)

  // 1. Employee's currently allocated assets
  const myAllocatedAssets = (assets ?? []).filter((asset) =>
    asset.allocations?.some(
      (a) => a.employee?.userId === sessionData?.user?.id && a.status === 'ACTIVE'
    )
  )

  // 2. Available assets for allocation requests
  const availableAssets = (assets ?? []).filter((asset) => asset.status === 'AVAILABLE')

  // 3. Employee's request history
  const myRequests = (allRequests ?? []).filter(
    (req) => req.employee?.userId === sessionData?.user?.id
  )

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reqAssetId) {
      showToast('Please select an asset to request', 'error')
      return
    }

    try {
      await createRequestMutation.mutateAsync({
        assetId: reqAssetId,
        requestType: 'ALLOCATION',
        priority: reqPriority,
        reason: reqReason,
      })
      setAllocationModal(false)
      setReqAssetId('')
      setReqReason('')
      showToast('Allocation request submitted successfully.')
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit request', 'error')
    }
  }

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!returnModalAsset) return

    try {
      await createRequestMutation.mutateAsync({
        assetId: returnModalAsset.id,
        requestType: 'RETURN',
        priority: 'MEDIUM',
        reason: reqReason,
      })
      setReturnModalAsset(null)
      setReqReason('')
      showToast('Return request submitted successfully.')
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit request', 'error')
    }
  }

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!maintenanceModalAsset) return
    if (!reqReason.trim()) {
      showToast('Please specify the maintenance issue', 'error')
      return
    }

    try {
      await createRequestMutation.mutateAsync({
        assetId: maintenanceModalAsset.id,
        requestType: 'MAINTENANCE',
        priority: reqPriority,
        reason: reqReason,
      })
      setMaintenanceModalAsset(null)
      setReqReason('')
      showToast('Maintenance request submitted successfully.')
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit request', 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">My Assets & Workspace</h2>
          <p className="text-sm text-muted-foreground">
            Manage your assigned equipment and request allocations, returns, or maintenance.
          </p>
        </div>
        <button
          onClick={() => {
            if (availableAssets.length === 0) {
              showToast('No equipment currently available in the catalog.', 'error')
              return
            }
            setReqAssetId(availableAssets[0].id)
            setAllocationModal(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" /> Request New Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Assigned Assets) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" /> Currently Allocated Equipment ({myAllocatedAssets.length})
            </h3>

            {isAssetsLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading assets...</div>
            ) : myAllocatedAssets.length === 0 ? (
              <div className="text-center rounded-lg border border-dashed border-border py-12 text-sm text-muted-foreground">
                <p className="font-semibold">No equipment assigned</p>
                <p className="text-xs opacity-80 mt-1">Submit an allocation request to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myAllocatedAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-lg border border-border p-4 bg-muted/30 hover:border-accent/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                          {asset.assetCode}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {asset.category?.name}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground text-sm mt-2">{asset.name}</h4>
                      {asset.serialNumber && (
                        <p className="text-xs text-muted-foreground/80 mt-0.5">S/N: {asset.serialNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border/50 mt-4">
                      <button
                        onClick={() => {
                          setReturnModalAsset(asset)
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Request Return
                      </button>
                      <button
                        onClick={() => {
                          setMaintenanceModalAsset(asset)
                        }}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground hover:bg-muted transition"
                      >
                        <Wrench className="w-3.5 h-3.5" /> Report Issue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Requests History Timeline) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" /> My Requests History ({myRequests.length})
            </h3>

            {isRequestsLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading history...</div>
            ) : myRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No requests history recorded.</p>
            ) : (
              <div className="relative border-l border-border pl-4 space-y-5 max-h-[70vh] overflow-y-auto">
                {myRequests.map((req) => (
                  <div key={req.id} className="relative text-xs">
                    <span
                      className={[
                        'absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card',
                        req.status === 'PENDING'
                          ? 'bg-amber-500'
                          : req.status === 'APPROVED'
                            ? 'bg-emerald-500'
                            : 'bg-red-500',
                      ].join(' ')}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{req.requestType} REQUEST</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground/80 mt-1 font-medium">Asset: {req.asset?.name}</p>
                    {req.reason && <p className="text-muted-foreground mt-0.5">Notes: "{req.reason}"</p>}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span
                        className={[
                          'text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider',
                          req.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : req.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400',
                        ].join(' ')}
                      >
                        {req.status}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-muted border border-border text-muted-foreground uppercase tracking-wider">
                        {req.priority}
                      </span>
                    </div>

                    {req.status === 'REJECTED' && req.rejectionReason && (
                      <div className="mt-2 rounded bg-red-500/10 border border-red-500/20 p-2 text-[10px] text-red-300">
                        <span className="font-semibold">Rejection Reason:</span> {req.rejectionReason}
                      </div>
                    )}
                    {req.comments && (
                      <div className="mt-1 rounded bg-muted/40 p-2 text-[10px] text-muted-foreground">
                        <span className="font-semibold text-foreground/80">Manager comments:</span> "{req.comments}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Request Allocation Modal ── */}
      {allocationModal && (
        <Modal title="Request Equipment Allocation" onClose={() => setAllocationModal(false)}>
          <form onSubmit={handleAllocationSubmit} className="space-y-4">
            <Field label="Select Available Equipment">
              <div className="relative">
                <select
                  required
                  value={reqAssetId}
                  onChange={(e) => setReqAssetId(e.target.value)}
                  className={selectCls}
                >
                  {availableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.assetCode})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field label="Request Priority">
              <div className="relative">
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value)}
                  className={selectCls}
                >
                  <option value="LOW">Low (Replacement / Future needs)</option>
                  <option value="MEDIUM">Medium (Standard equipment request)</option>
                  <option value="HIGH">High (Urgent project requirement)</option>
                  <option value="CRITICAL">Critical (Hardware failure / Blocker)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field label="Business Justification / Reason">
              <textarea
                required
                placeholder="Explain why this equipment is needed..."
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAllocationModal(false)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
              >
                {createRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Request Return Modal ── */}
      {returnModalAsset && (
        <Modal
          title={`Request Equipment Return: ${returnModalAsset.name}`}
          onClose={() => setReturnModalAsset(null)}
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              This request will be sent to the Asset Management approval queue. Once approved, the equipment will be removed from your profile.
            </div>

            <Field label="Reason for Return / Comments">
              <textarea
                placeholder="Optional explanation (e.g. upgrading to new hardware, leaving project...)"
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturnModalAsset(null)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
              >
                {createRequestMutation.isPending ? 'Submitting...' : 'Submit Return'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Report Maintenance Modal ── */}
      {maintenanceModalAsset && (
        <Modal
          title={`Report Hardware Issue: ${maintenanceModalAsset.name}`}
          onClose={() => setMaintenanceModalAsset(null)}
        >
          <form onSubmit={handleMaintenanceSubmit} className="space-y-4">
            <Field label="Issue Priority">
              <div className="relative">
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value)}
                  className={selectCls}
                >
                  <option value="LOW">Low (Cosmetic issue / fully usable)</option>
                  <option value="MEDIUM">Medium (Partial malfunction)</option>
                  <option value="HIGH">High (Critical component failed / unusable)</option>
                  <option value="CRITICAL">Critical (Safety hazard / broken completely)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </Field>

            <Field label="Issue Description / Justification">
              <textarea
                required
                placeholder="Describe the failure, damage, or hardware issues you are encountering..."
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent min-h-[80px]"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMaintenanceModalAsset(null)}
                className="flex-1 rounded-lg border border-border py-2 text-xs font-semibold hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition"
              >
                {createRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast((p) => ({ ...p, show: false }))} />}
    </div>
  )
}
