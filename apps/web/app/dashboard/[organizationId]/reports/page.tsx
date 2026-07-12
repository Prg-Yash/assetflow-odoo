'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  BarChart3,
  TrendingUp,
  Download,
  Wrench,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { exportReport, useReportsDashboard } from '@/hooks/use-reports'
import {
  ChartPoint,
  DistributionPoint,
  IdleAsset,
  MaintenanceDueAsset,
  MostUsedAsset,
  ReportExportFormat,
  ReportFilters,
  ReportRangeKey,
  ReportsDashboard,
} from '@/types/report'

const RANGE_OPTIONS: Array<{ label: string; value: ReportRangeKey }> = [
  { label: 'Last 7 Days', value: 'last_7_days' },
  { label: 'Last 30 Days', value: 'last_30_days' },
  { label: 'Last 90 Days', value: 'last_90_days' },
  { label: 'Last 6 Months', value: 'last_6_months' },
  { label: 'Last Year', value: 'last_year' },
  { label: 'Custom Date Range', value: 'custom' },
]

function toInputDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function defaultStartDate() {
  const date = new Date()
  date.setDate(date.getDate() - 29)
  return toInputDate(date)
}

/* ─── Bar Chart (SVG) ──────────────────────────────────────────────────────── */

function BarChartSVG({ data }: { data: { name: string; value: number }[] }) {
  const normalized = data.length ? data : [{ name: 'No data', value: 0 }]
  const maxVal = Math.max(100, ...normalized.map((d) => d.value))
  const barWidth = 36
  const gap = 16
  const chartH = 160
  const chartW = normalized.length * (barWidth + gap) - gap + 40
  const padLeft = 32
  const padBottom = 28

  return (
    <svg
      viewBox={`0 0 ${chartW + padLeft} ${chartH + padBottom + 10}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = chartH - (pct / 100) * chartH + 5
        return (
          <g key={pct}>
            <line x1={padLeft} y1={y} x2={chartW + padLeft} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 3" />
            <text x={padLeft - 6} y={y + 3} textAnchor="end" className="fill-white/25" fontSize="9" fontWeight="500">
              {pct}%
            </text>
          </g>
        )
      })}

      {normalized.map((d, i) => {
        const barH = (d.value / maxVal) * chartH
        const x = padLeft + i * (barWidth + gap)
        const y = chartH - barH + 5
        return (
          <g key={`${d.name}-${i}`}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barH, d.value > 0 ? 2 : 0)} rx={4} className="fill-amber-600/80 hover:fill-amber-500 transition-colors" />
            <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="fill-white/50" fontSize="9" fontWeight="600">
              {d.value}%
            </text>
            <text x={x + barWidth / 2} y={chartH + 20} textAnchor="middle" className="fill-white/35" fontSize="9" fontWeight="500">
              {d.name.length > 8 ? `${d.name.slice(0, 7)}…` : d.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Line Chart (SVG) ─────────────────────────────────────────────────────── */

function LineChartSVG({ data }: { data: ChartPoint[] }) {
  const normalized = data.length ? data : [{ label: 'No data', value: 0 }]
  const maxVal = Math.max(1, ...normalized.map((d) => d.value))
  const chartW = 380
  const chartH = 140
  const padLeft = 30
  const padBottom = 28
  const padRight = 16
  const padTop = 10
  const innerW = chartW - padLeft - padRight
  const innerH = chartH - padTop

  const points = normalized.map((d, i) => ({
    x: padLeft + (normalized.length === 1 ? 0 : (i / (normalized.length - 1)) * innerW),
    y: padTop + innerH - (d.value / maxVal) * innerH,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const firstPoint = points[0] ?? { x: 0, y: chartH }
  const lastPoint = points[points.length - 1] ?? firstPoint
  const areaD = `${pathD} L ${lastPoint.x} ${chartH} L ${firstPoint.x} ${chartH} Z`

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH + padBottom}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(244,114,100,0.25)" />
          <stop offset="100%" stopColor="rgba(244,114,100,0)" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map((pct) => {
        const value = Math.round((pct / 100) * maxVal)
        const y = padTop + innerH - (value / maxVal) * innerH
        return (
          <g key={pct}>
            <line x1={padLeft} y1={y} x2={chartW - padRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="4 3" />
            <text x={padLeft - 6} y={y + 3} textAnchor="end" className="fill-white/25" fontSize="9" fontWeight="500">
              {value}
            </text>
          </g>
        )
      })}

      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="rgb(244,114,100)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => (
        <g key={`${normalized[i]?.label}-${i}`}>
          <circle cx={p.x} cy={p.y} r="4" className="fill-card" stroke="rgb(244,114,100)" strokeWidth="2" />
          <text x={p.x} y={chartH + 16} textAnchor="middle" className="fill-white/35" fontSize="9" fontWeight="500">
            {normalized[i]?.label}
          </text>
        </g>
      ))}
    </svg>
  )
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/5 ${className}`} />
}

function EmptyState({ label }: { label: string }) {
  return <div className="rounded-lg border border-border/70 bg-background/20 px-4 py-8 text-center text-sm text-muted-foreground">{label}</div>
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-4 h-4 text-accent" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function MiniList({ rows }: { rows: Array<{ label: string; value: number | string }> }) {
  if (!rows.length) return <EmptyState label="No data for this period." />
  return (
    <div className="space-y-3">
      {rows.slice(0, 5).map((row) => (
        <div key={row.label} className="flex items-center justify-between gap-4 text-sm">
          <span className="truncate text-foreground/75">{row.label}</span>
          <span className="font-semibold text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

function Heatmap({ rows }: { rows: Array<{ day: string; hour: number; value: number }> }) {
  const maxValue = Math.max(1, ...rows.map((row) => row.value))
  return (
    <div className="grid grid-cols-6 gap-2">
      {rows.map((row) => (
        <div
          key={`${row.day}-${row.hour}`}
          title={`${row.day} ${String(row.hour).padStart(2, '0')}:00 · ${row.value} bookings`}
          className="h-10 rounded-md border border-border/70 text-[10px] text-foreground/70 flex items-center justify-center"
          style={{ backgroundColor: `rgba(245, 158, 11, ${0.08 + (row.value / maxValue) * 0.5})` }}
        >
          {row.value}
        </div>
      ))}
    </div>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function ReportsPage() {
  const params = useParams<{ organizationId: string }>()
  const organizationId = params.organizationId
  const [selectedRange, setSelectedRange] = useState<ReportRangeKey>('last_30_days')
  const [startDate, setStartDate] = useState(defaultStartDate())
  const [endDate, setEndDate] = useState(toInputDate(new Date()))
  const [idleDays, setIdleDays] = useState(30)
  const [exportFormat, setExportFormat] = useState<ReportExportFormat>('pdf')
  const [isExporting, setIsExporting] = useState(false)

  const filters = useMemo<ReportFilters>(
    () => ({
      range: selectedRange,
      startDate: selectedRange === 'custom' ? startDate : undefined,
      endDate: selectedRange === 'custom' ? endDate : undefined,
      idleDays,
    }),
    [endDate, idleDays, selectedRange, startDate]
  )
  const { data: reportData, isLoading, isError, error, refetch } = useReportsDashboard(organizationId, filters)
  const data = reportData as ReportsDashboard | undefined

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportReport(filters, exportFormat)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Reports &amp; Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Utilization, maintenance frequency, most-used / idle assets, and booking heatmaps.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative shrink-0">
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as ReportRangeKey)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none pr-8 cursor-pointer"
            >
              {RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</span>
          </div>
          {selectedRange === 'custom' && (
            <>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent" />
            </>
          )}
          <select value={idleDays} onChange={(e) => setIdleDays(Number(e.target.value))} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
            <option value={30}>Idle 30 days</option>
            <option value={60}>Idle 60 days</option>
            <option value={90}>Idle 90 days</option>
          </select>
        </div>
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Reports failed to load
          </div>
          <p className="mt-2 text-red-100/80">{error instanceof Error ? error.message : 'Please try again.'}</p>
          <button onClick={() => refetch()} className="mt-3 rounded-lg border border-red-300/40 px-3 py-1.5 text-xs font-semibold hover:bg-red-300/10">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {isLoading || !data ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} className="h-28 rounded-2xl" />)
        ) : (
          <>
            <StatCard icon={Package} label="Total Assets" value={data.assetSummary.totalAssets} />
            <StatCard icon={CheckCircle2} label="Active" value={data.assetSummary.activeAssets} />
            <StatCard icon={Clock} label="Available" value={data.assetSummary.availableAssets} />
            <StatCard icon={BarChart3} label="Allocated" value={data.assetSummary.allocatedAssets} />
            <StatCard icon={Wrench} label="Maintenance" value={data.assetSummary.underMaintenanceAssets} />
            <StatCard icon={AlertTriangle} label="Retired" value={data.assetSummary.retiredAssets} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-accent">Utilization by department</h3>
          </div>
          {isLoading || !data ? <SkeletonBlock className="h-56" /> : data.utilizationByDepartment.length ? <BarChartSVG data={data.utilizationByDepartment} /> : <EmptyState label="No department usage for this period." />}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-rose-400">Maintenance Frequency</h3>
          </div>
          {isLoading || !data ? <SkeletonBlock className="h-56" /> : data.maintenanceFrequency.some((p: ChartPoint) => p.value > 0) ? <LineChartSVG data={data.maintenanceFrequency} /> : <EmptyState label="No maintenance records for this period." />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-foreground">Most used assets</h3>
          {isLoading || !data ? <SkeletonBlock className="h-32" /> : data.mostUsedAssets.length ? (
            <div className="space-y-3">
              {data.mostUsedAssets.map((asset: MostUsedAsset) => (
                <div key={asset.assetId} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <div className="text-sm text-foreground/70">
                    <span className="font-semibold text-foreground">{asset.assetName} {asset.assetCode}</span>: {asset.usageCount} uses · {asset.department}
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState label="No asset usage found for this period." />}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-foreground">Idle assets</h3>
          {isLoading || !data ? <SkeletonBlock className="h-32" /> : data.idleAssets.length ? (
            <div className="space-y-3">
              {data.idleAssets.map((asset: IdleAsset) => (
                <div key={asset.assetId} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <div className="text-sm text-foreground/70">
                    <span className="font-semibold text-foreground">{asset.assetName} {asset.assetCode}</span>: unused {asset.idleDays}+ days · {asset.department}
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState label="No idle assets match the current threshold." />}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-foreground">Assets due for maintenance / nearing retirement</h3>
        </div>
        {isLoading || !data ? <SkeletonBlock className="h-28" /> : data.maintenanceDue.length ? (
          <div className="space-y-3">
            {data.maintenanceDue.map((asset: MaintenanceDueAsset) => (
              <div key={`${asset.assetId}-${asset.type}`} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                <div className="text-sm text-foreground/70">
                  <span className="font-semibold text-foreground">{asset.assetName} {asset.assetCode}</span>: {asset.detail} · {asset.department}
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState label="No assets are due for maintenance or retirement review." />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-foreground">Booking trends</h3>
          {isLoading || !data ? <SkeletonBlock className="h-40" /> : <LineChartSVG data={data.bookingTrends} />}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-foreground">Asset growth over time</h3>
          {isLoading || !data ? <SkeletonBlock className="h-40" /> : <LineChartSVG data={data.assetGrowthOverTime} />}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-foreground">Asset allocation trends</h3>
          {isLoading || !data ? <SkeletonBlock className="h-40" /> : <LineChartSVG data={data.assetAllocationTrends} />}
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatCard icon={TrendingUp} label="Maintenance Cost" value={data.maintenanceCostSummary.totalCost.toLocaleString()} />
          <StatCard icon={Package} label="Depreciation" value={`${data.assetDepreciationSummary.depreciationRate}%`} />
          <StatCard icon={CheckCircle2} label="Approvals Pending" value={data.approvalRequestStatistics.pending} />
        </div>
      )}

      {isLoading || !data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonBlock className="h-48 rounded-2xl" />
          <SkeletonBlock className="h-48 rounded-2xl" />
          <SkeletonBlock className="h-48 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-foreground">Department-wise asset distribution</h3>
              <MiniList rows={data.departmentAssetDistribution.map((row: DistributionPoint) => ({ label: row.name, value: row.value }))} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-foreground">Category-wise asset distribution</h3>
              <MiniList rows={data.categoryAssetDistribution.map((row: DistributionPoint) => ({ label: row.name, value: row.value }))} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-foreground">Approval request statistics</h3>
              <MiniList rows={[
                { label: 'Total', value: data.approvalRequestStatistics.total },
                { label: 'Pending', value: data.approvalRequestStatistics.pending },
                { label: 'Approved', value: data.approvalRequestStatistics.approved },
                { label: 'Rejected', value: data.approvalRequestStatistics.rejected },
              ]} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl lg:col-span-2">
              <h3 className="text-base font-bold text-foreground">Booking heatmap</h3>
              <Heatmap rows={data.bookingHeatmap} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-foreground">Maintenance cost summary</h3>
              <MiniList rows={[
                { label: 'Total cost', value: data.maintenanceCostSummary.totalCost.toLocaleString() },
                { label: 'Average cost', value: data.maintenanceCostSummary.averageCost.toLocaleString() },
                { label: 'Requests', value: data.maintenanceCostSummary.requestCount },
                { label: 'Asset purchase value', value: data.assetDepreciationSummary.purchaseValue.toLocaleString() },
                { label: 'Current value', value: data.assetDepreciationSummary.currentValue.toLocaleString() },
              ]} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-foreground">Most active employees</h3>
              <MiniList rows={data.mostActiveEmployees.map((row) => ({ label: `${row.employeeName} · ${row.department}`, value: row.usageCount }))} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-foreground">Top departments by usage</h3>
              <MiniList rows={data.topDepartmentsByUsage.map((row) => ({ label: row.departmentName, value: row.usageCount }))} />
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value as ReportExportFormat)} className="rounded-lg border border-border bg-card px-3 py-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-accent">
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
          <option value="csv">CSV</option>
        </select>
        <button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-foreground transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting…' : 'Export report'}
        </button>
      </div>
    </div>
  )
}
