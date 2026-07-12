'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Tag,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle,
  QrCode,
  MapPin,
  Plus,
  File,
  Download,
  Clock,
  Wrench,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import {
  useAsset,
  useUploadAssetImage,
  useUploadAssetDocument,
} from '@/hooks/use-assets'
import { useSession, useOrganizations } from '@/hooks/use-organizations'
import { AssetStatus, ConditionEnum } from '@/types/asset'

/* ─── Status Badge helper ─────────────────────────────────────────────────── */
const STATUS_OPTIONS = [
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
    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${option.style}`}>
      <CheckCircle2 className="w-3.5 h-3.5" />
      {option.label}
    </span>
  )
}

function ConditionBadge({ condition }: { condition: ConditionEnum }) {
  const styles: Record<ConditionEnum, string> = {
    EXCELLENT: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    GOOD: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    FAIR: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    POOR: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    DAMAGED: 'text-red-400 border-red-500/30 bg-red-500/10',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${styles[condition] || styles.GOOD}`}>
      {condition}
    </span>
  )
}

export default function AssetDetailsPage() {
  const params = useParams()
  const router = useRouter()

  const organizationId = (params.organizationId as string) || ''
  const assetId = (params.assetId as string) || ''

  const { data: asset, isLoading, error } = useAsset(assetId)
  const { data: memberships } = useOrganizations()
  const activeMembership = memberships?.find((m) => m.isActive)
  const userRole = activeMembership?.role?.roleType ?? 'EMPLOYEE'
  const isReadOnly = userRole === 'EMPLOYEE' || userRole === 'AUDITOR' || userRole === 'TECHNICIAN'

  const uploadImgMutation = useUploadAssetImage()
  const uploadDocMutation = useUploadAssetDocument()

  // Upload States
  const [showImgModal, setShowImgModal] = useState(false)
  const [imgUrl, setImgUrl] = useState('')
  const [showDocModal, setShowDocModal] = useState(false)
  const [docType, setDocType] = useState('Invoice')
  const [docUrl, setDocUrl] = useState('')
  const [uploadError, setUploadError] = useState('')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Clock className="w-8 h-8 text-accent animate-spin" />
        <p className="text-sm text-muted-foreground">Loading asset 360 profile...</p>
      </div>
    )
  }

  if (error || !asset) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">Asset Not Found</h3>
        <p className="text-sm text-red-300 opacity-90">
          The requested asset could not be loaded. It may have been deleted or belongs to another organization.
        </p>
        <button
          onClick={() => router.push(`/dashboard/${organizationId}/assets`)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assets
        </button>
      </div>
    )
  }

  // Active Custody Assignment
  const activeAllocation = asset.allocations?.find((a) => a.status === 'ACTIVE')

  // Depreciation calculation
  const purchaseCost = asset.purchaseCost || 0
  const lifespanMonths = asset.category?.customAttributes?.lifespan || 36
  const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date(asset.createdAt)
  const monthsOwned = Math.max(
    0,
    (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4)
  )
  const depreciationPercentage = Math.min(100, Math.round((monthsOwned / lifespanMonths) * 100))
  const bookValue = Math.max(0, Math.round(purchaseCost * (1 - depreciationPercentage / 100)))

  // Handle Add Image Submission
  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')
    if (!imgUrl.trim()) return
    try {
      await uploadImgMutation.mutateAsync({ id: assetId, url: imgUrl.trim() })
      setImgUrl('')
      setShowImgModal(false)
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to link image')
    }
  }

  // Handle Add Document Submission
  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadError('')
    if (!docUrl.trim()) return
    try {
      await uploadDocMutation.mutateAsync({ id: assetId, type: docType, url: docUrl.trim() })
      setDocUrl('')
      setShowDocModal(false)
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to link document')
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Back & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => router.push(`/dashboard/${organizationId}/assets`)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Assets
          </button>
          <div className="flex items-center gap-3 pt-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{asset.name}</h2>
            <span className="font-mono text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded">
              {asset.assetCode}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono">ID: {asset.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <ConditionBadge condition={asset.condition} />
          <StatusBadge status={asset.status} />
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Details cards) */}
        <div className="lg:col-span-2 space-y-6">
          {/* specifications & meta */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Tag className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Specifications & Metadata</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p>
                <p className="font-medium text-foreground mt-0.5">{asset.category?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Serial Number</p>
                <p className="font-mono font-medium text-foreground mt-0.5">
                  {asset.serialNumber || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Shared status</p>
                <p className="font-medium text-foreground mt-0.5">
                  {asset.isShared ? 'Shared / Bookable' : 'Individual custody'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Registered At</p>
                <p className="font-medium text-foreground mt-0.5">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {asset.description && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Description / Specifications
                </p>
                <div className="rounded-lg bg-input/40 p-3 border border-border/50 text-sm text-foreground/80 leading-relaxed">
                  {asset.description}
                </div>
              </div>
            )}
          </div>

          {/* Locations & Custody */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MapPin className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Location & Custody</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Department</p>
                <p className="font-medium text-foreground mt-0.5">
                  {asset.department?.name || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Current Location</p>
                <p className="font-medium text-foreground mt-0.5">{asset.location?.name || '—'}</p>
              </div>
            </div>

            {/* Active custodian check */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Current Custody Allocation
              </p>
              {activeAllocation ? (
                <div className="flex items-center gap-3 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-sm">
                  <User className="w-8 h-8 rounded-full bg-sky-500/15 text-sky-400 p-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {activeAllocation.employee?.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assigned on {new Date(activeAllocation.allocatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                    ACTIVE
                  </span>
                </div>
              ) : (
                <div className="text-center rounded-lg border border-dashed border-border py-4 text-sm text-muted-foreground">
                  <p>Not currently allocated to any employee.</p>
                </div>
              )}
            </div>
          </div>

          {/* Financials & Depreciation */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <DollarSign className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Financial & Depreciation</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Vendor
                </p>
                <p className="font-medium text-foreground mt-0.5">{asset.vendor?.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Purchase Price
                </p>
                <p className="font-semibold text-foreground mt-0.5">
                  {purchaseCost ? `₹${purchaseCost.toLocaleString()}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Calculated Book Value
                </p>
                <p className="font-semibold text-accent mt-0.5">
                  {bookValue ? `₹${bookValue.toLocaleString()}` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Purchase Date
                </p>
                <p className="font-medium text-foreground mt-0.5">
                  {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Warranty Expiry
                </p>
                <p className="font-medium text-foreground mt-0.5">
                  {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>

            {/* Straight-line depreciation tracker */}
            {purchaseCost > 0 && (
              <div className="pt-3 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Depreciation ({depreciationPercentage}%)</span>
                  <span className="text-foreground">Lifespan: {lifespanMonths} months</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${depreciationPercentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Depreciation is calculated straight-line based on the category's standard asset lifespan of{' '}
                  {lifespanMonths} months.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (QR & timelines) */}
        <div className="space-y-6">
          {/* QR Code Card */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center text-center space-y-4">
            <div className="p-3.5 bg-white rounded-2xl border border-border shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=0b0f19&bgcolor=ffffff&data=${encodeURIComponent(asset.assetCode)}`}
                alt={`QR code for ${asset.assetCode}`}
                className="w-36 h-36 select-none"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Asset Tag Verification</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Scan this QR code to view and update the asset profile directly in field inventory checks.
              </p>
            </div>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=0b0f19&bgcolor=ffffff&data=${encodeURIComponent(asset.assetCode)}`}
              target="_blank"
              rel="noreferrer"
              download={`QR_${asset.assetCode}.png`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download QR Image
            </a>
          </div>

          {/* Custody History Timeline */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Activity className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Allocation History</h3>
            </div>
            <div className="relative border-l border-border/60 pl-4 space-y-4 max-h-56 overflow-y-auto">
              {!asset.allocations || asset.allocations.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-1">No custody logs registered.</p>
              ) : (
                asset.allocations.map((alloc) => (
                  <div key={alloc.id} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-card bg-accent" />
                    <p className="font-semibold text-foreground">
                      {alloc.employee?.user?.name || 'Unknown Employee'}
                    </p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">
                      Allocated: {new Date(alloc.allocatedAt).toLocaleDateString()}
                      {alloc.returnedAt && ` | Returned: ${new Date(alloc.returnedAt).toLocaleDateString()}`}
                    </p>
                    <span
                      className={[
                        'inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1.5',
                        alloc.status === 'ACTIVE'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-muted border border-border text-muted-foreground',
                      ].join(' ')}
                    >
                      {alloc.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Maintenance Timelines */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Wrench className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-foreground">Maintenance History</h3>
            </div>
            <div className="relative border-l border-border/60 pl-4 space-y-4 max-h-56 overflow-y-auto">
              {!asset.maintenanceRequests || asset.maintenanceRequests.length === 0 ? (
                <p className="text-xs text-muted-foreground pl-1">No maintenance requests filed.</p>
              ) : (
                asset.maintenanceRequests.map((req) => (
                  <div key={req.id} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-card bg-amber-500" />
                    <p className="font-semibold text-foreground truncate">{req.title}</p>
                    {req.description && (
                      <p className="text-muted-foreground/80 text-[10px] line-clamp-1 mt-0.5">
                        {req.description}
                      </p>
                    )}
                    <p className="text-muted-foreground text-[10px] mt-0.5">
                      Opened: {new Date(req.openedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase tracking-wider">
                        {req.status}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 uppercase tracking-wider">
                        {req.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Media & Attachments */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Files & Media</h3>
              </div>
              {!isReadOnly && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowImgModal(true)}
                    className="p-1 rounded bg-accent/20 hover:bg-accent/30 text-accent text-xs font-semibold"
                    title="Add Image"
                  >
                    + Image
                  </button>
                  <button
                    onClick={() => setShowDocModal(true)}
                    className="p-1 rounded bg-accent/20 hover:bg-accent/30 text-accent text-xs font-semibold"
                    title="Add Doc"
                  >
                    + Doc
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {/* Image grid */}
              {asset.images && asset.images.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1.5">
                    Images
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {asset.images.map((img) => (
                      <a
                        key={img.id}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative aspect-square rounded-lg border border-border overflow-hidden bg-muted group hover:border-accent/40"
                      >
                        <img
                          src={img.url}
                          alt="Asset upload"
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents List */}
              {asset.documents && asset.documents.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1.5">
                    Attachments
                  </p>
                  <div className="space-y-1.5">
                    {asset.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border border-border p-2 bg-muted/40 hover:bg-muted text-xs hover:border-accent/20 transition-all"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="w-3.5 h-3.5 text-accent shrink-0" />
                          <span className="font-semibold text-foreground/80 truncate">
                            {doc.type} Attachment
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {(!asset.images || asset.images.length === 0) &&
                (!asset.documents || asset.documents.length === 0) && (
                  <p className="text-xs text-muted-foreground">No attachments or images uploaded.</p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Add Image Modal ── */}
      {showImgModal && (
        <Modal title="Link Asset Image" onClose={() => setShowImgModal(false)}>
          <form onSubmit={handleAddImage} className="space-y-4">
            {uploadError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {uploadError}
              </div>
            )}
            <Field label="Image URL">
              <input
                type="url"
                required
                placeholder="https://example.com/image.jpg"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImgModal(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadImgMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {uploadImgMutation.isPending ? 'Linking...' : 'Add Image'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Add Document Modal ── */}
      {showDocModal && (
        <Modal title="Link Asset Document" onClose={() => setShowDocModal(false)}>
          <form onSubmit={handleAddDocument} className="space-y-4">
            {uploadError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                {uploadError}
              </div>
            )}
            <Field label="Document Type">
              <div className="relative">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className={selectCls}
                >
                  <option value="Invoice">Invoice / Purchase PO</option>
                  <option value="Warranty">Warranty Certificate</option>
                  <option value="Manual">User Manual / Spec Sheet</option>
                  <option value="Insurance">Insurance Agreement</option>
                  <option value="Receipt">Delivery Receipt</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80 pointer-events-none" />
              </div>
            </Field>
            <Field label="Document URL">
              <input
                type="url"
                required
                placeholder="https://example.com/document.pdf"
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className={inputCls}
              />
            </Field>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadDocMutation.isPending}
                className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {uploadDocMutation.isPending ? 'Linking...' : 'Add Document'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
