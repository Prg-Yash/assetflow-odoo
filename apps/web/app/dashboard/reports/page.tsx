'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  Wrench,
  Clock,
} from 'lucide-react'

/* ─── Chart Data ───────────────────────────────────────────────────────────── */

const DEPT_UTILIZATION = [
  { name: 'Engineering', value: 94 },
  { name: 'Facilities', value: 82 },
  { name: 'Operations', value: 89 },
  { name: 'Admin', value: 75 },
  { name: 'Finance', value: 68 },
  { name: 'HR', value: 55 },
  { name: 'Legal', value: 42 },
]

const MAINTENANCE_FREQ = [
  { month: 'Jan', value: 4 },
  { month: 'Feb', value: 6 },
  { month: 'Mar', value: 5 },
  { month: 'Apr', value: 8 },
  { month: 'May', value: 7 },
  { month: 'Jun', value: 12 },
  { month: 'Jul', value: 15 },
]

const MOST_USED = [
  { tag: 'Room B2', detail: '34 bookings this month' },
  { tag: 'Van AF-343', detail: '21 trips this month' },
  { tag: 'Projector AF-335', detail: '18 uses' },
]

const IDLE_ASSETS = [
  { tag: 'Camera AF-0301', detail: 'unused 60+ days' },
  { tag: 'Chair AF-0410', detail: 'unused 45 days' },
]

const MAINTENANCE_DUE = [
  { tag: 'Forklift AF-0087', detail: 'service due in 5 days' },
  { tag: 'Laptop AF-0020', detail: '4 years old : nearing retirement' },
]

/* ─── Bar Chart (SVG) ──────────────────────────────────────────────────────── */

function BarChartSVG({ data }: { data: { name: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value))
  const barWidth = 36
  const gap = 16
  const chartH = 160
  const chartW = data.length * (barWidth + gap) - gap + 40
  const padLeft = 32
  const padBottom = 28

  return (
    <svg
      viewBox={`0 0 ${chartW + padLeft} ${chartH + padBottom + 10}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Y-axis guide lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = chartH - (pct / 100) * chartH + 5
        return (
          <g key={pct}>
            <line
              x1={padLeft}
              y1={y}
              x2={chartW + padLeft}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 3"
            />
            <text
              x={padLeft - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-white/25"
              fontSize="9"
              fontWeight="500"
            >
              {pct}%
            </text>
          </g>
        )
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH
        const x = padLeft + i * (barWidth + gap)
        const y = chartH - barH + 5
        return (
          <g key={d.name}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              className="fill-amber-600/80 hover:fill-amber-500 transition-colors"
            />
            {/* Value label on top */}
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              className="fill-white/50"
              fontSize="9"
              fontWeight="600"
            >
              {d.value}%
            </text>
            {/* X-axis label */}
            <text
              x={x + barWidth / 2}
              y={chartH + 20}
              textAnchor="middle"
              className="fill-white/35"
              fontSize="9"
              fontWeight="500"
            >
              {d.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ─── Line Chart (SVG) ─────────────────────────────────────────────────────── */

function LineChartSVG({ data }: { data: { month: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value))
  const chartW = 380
  const chartH = 140
  const padLeft = 30
  const padBottom = 28
  const padRight = 16
  const padTop = 10
  const innerW = chartW - padLeft - padRight
  const innerH = chartH - padTop

  const points = data.map((d, i) => ({
    x: padLeft + (i / (data.length - 1)) * innerW,
    y: padTop + innerH - (d.value / maxVal) * innerH,
  }))

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Gradient fill path (area under the curve)
  const areaD = `${pathD} L ${points[points.length - 1]?.x ?? 0} ${chartH} L ${points[0]?.x ?? 0} ${chartH} Z`

  return (
    <svg
      viewBox={`0 0 ${chartW} ${chartH + padBottom}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(244,114,100,0.25)" />
          <stop offset="100%" stopColor="rgba(244,114,100,0)" />
        </linearGradient>
      </defs>

      {/* Horizontal guide lines */}
      {[0, 5, 10, 15].map((val) => {
        const y = padTop + innerH - (val / maxVal) * innerH
        return (
          <g key={val}>
            <line
              x1={padLeft}
              y1={y}
              x2={chartW - padRight}
              y2={y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 3"
            />
            <text
              x={padLeft - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-white/25"
              fontSize="9"
              fontWeight="500"
            >
              {val}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#lineGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="rgb(244,114,100)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" className="fill-card" stroke="rgb(244,114,100)" strokeWidth="2" />
          {/* X label */}
          <text
            x={p.x}
            y={chartH + 16}
            textAnchor="middle"
            className="fill-white/35"
            fontSize="9"
            fontWeight="500"
          >
            {data[i]?.month}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */

export default function ReportsPage() {
  const [selectedRange, setSelectedRange] = useState('Last 30 Days')

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Reports &amp; Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Utilization, maintenance frequency, most-used / idle assets, and booking heatmaps.
          </p>
        </div>
        <div className="relative shrink-0">
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition appearance-none pr-8 cursor-pointer"
          >
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</span>
        </div>
      </div>

      {/* ─── Charts Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Utilization by Department — Bar Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-accent">Utilization by department</h3>
          </div>
          <BarChartSVG data={DEPT_UTILIZATION} />
        </div>

        {/* Maintenance Frequency — Line Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-rose-400">Maintenance Frequency</h3>
          </div>
          <LineChartSVG data={MAINTENANCE_FREQ} />
        </div>
      </div>

      {/* ─── Most Used / Idle Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Most used assets */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-foreground">Most used assets</h3>
          <div className="space-y-3">
            {MOST_USED.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                <div className="text-sm text-foreground/70">
                  <span className="font-semibold text-foreground">{a.tag}</span>: {a.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Idle assets */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-foreground">Idle assets</h3>
          <div className="space-y-3">
            {IDLE_ASSETS.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <div className="text-sm text-foreground/70">
                  <span className="font-semibold text-foreground">{a.tag}</span> : {a.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Maintenance / Retirement ─────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-foreground">Assets due for maintenance / nearing retirement</h3>
        </div>
        <div className="space-y-3">
          {MAINTENANCE_DUE.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
              <div className="text-sm text-foreground/70">
                <span className="font-semibold text-foreground">{a.tag}</span> : {a.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Export Button ─────────────────────────────────────────────── */}
      <div className="flex justify-start">
        <button className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-foreground transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98] flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export report
        </button>
      </div>
    </div>
  )
}