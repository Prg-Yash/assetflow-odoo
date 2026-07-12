'use client'

import { useState } from 'react'
import {
  ClipboardList,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Check,
} from 'lucide-react'

/* ─── Types ────────────────────────────────────────────────────────────────── */

type VerificationStatus = 'Verified' | 'Missing' | 'Damaged' | 'Unverified'

interface AuditItem {
  id: string
  assetTag: string
  assetName: string
  expectedLocation: string
  status: VerificationStatus
}

/* ─── Seed Checklist Data (Matches Screen 8 Mockup) ────────────────────────── */

const INITIAL_CHECKLIST: AuditItem[] = [
  { id: '1', assetTag: 'AF-003',  assetName: 'Dell laptop',   expectedLocation: 'Desk E12', status: 'Verified' },
  { id: '2', assetTag: 'AF-9921', assetName: 'Office chair',  expectedLocation: 'Desk E14', status: 'Missing' },
  { id: '3', assetTag: 'AF-9838', assetName: 'Monitor',       expectedLocation: 'Desk E15', status: 'Damaged' },
]

export default function AuditPage() {
  const [checklist, setChecklist] = useState<AuditItem[]>(INITIAL_CHECKLIST)
  const [isClosed, setIsClosed] = useState(false)

  // Toggle/Cycle verification status: Unverified -> Verified -> Missing -> Damaged -> Unverified
  const cycleStatus = (id: string) => {
    if (isClosed) return
    const order: VerificationStatus[] = ['Verified', 'Missing', 'Damaged']
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextIdx = (order.indexOf(item.status) + 1) % order.length
          return { ...item, status: order[nextIdx] as VerificationStatus }
        }
        return item
      })
    )
  }

  // Count flagged assets (Missing or Damaged)
  const flaggedCount = checklist.filter(
    (item) => item.status === 'Missing' || item.status === 'Damaged'
  ).length

  // Reset verification checklist
  const handleReset = () => {
    setChecklist(INITIAL_CHECKLIST)
    setIsClosed(false)
  }

  const getVerificationButton = (status: VerificationStatus) => {
    const base = 'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all text-center min-w-[100px] inline-block'
    if (status === 'Verified') {
      return `${base} border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20`
    }
    if (status === 'Missing') {
      return `${base} border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20`
    }
    if (status === 'Damaged') {
      return `${base} border-border bg-muted text-foreground/70 hover:bg-muted`
    }
    return `${base} border-border text-muted-foreground hover:bg-muted`
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight font-sans">Asset Audit</h2>
          <p className="text-sm text-muted-foreground">
            Run scheduled audit cycles, check expected locations and generate automated discrepancy reports.
          </p>
        </div>
        
        {isClosed && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg bg-card border border-border hover:bg-muted px-4 py-2.5 text-xs font-semibold text-foreground/80 transition-all shrink-0 active:scale-[0.98]"
          >
            <History className="w-4 h-4 text-accent" /> Restart Audit
          </button>
        )}
      </div>

      {/* Audit Target Box (Matches Screen 8 Mockup Top Header) */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-base text-foreground">
              Q3 audit: Engineering dept - 1-15 jul
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span>Auditors: A. Rao, S. Iqbal</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-1 shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-accent/80">
            Cycle Status
          </span>
          <span className={['text-xs font-semibold px-2.5 py-0.5 rounded-full border', isClosed ? 'border-border bg-muted text-muted-foreground' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'].join(' ')}>
            {isClosed ? 'Closed' : 'Active Cycle'}
          </span>
        </div>
      </div>

      {/* Checklist Table (Matches Screen 8 Mockup Checklist) */}
      <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Expected location
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right md:text-center">
                  Verification
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {checklist.map((item) => (
                <tr
                  key={item.id}
                  className={['hover:bg-muted transition-colors', isClosed ? 'opacity-65' : ''].join(' ')}
                >
                  {/* Asset name & tag */}
                  <td className="px-6 py-5 font-medium text-foreground">
                    <span className="text-muted-foreground/80 mr-1.5">{item.assetTag}</span>
                    {item.assetName}
                  </td>
                  {/* Expected location */}
                  <td className="px-6 py-5 text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-foreground/20" />
                      {item.expectedLocation}
                    </span>
                  </td>
                  {/* Verification action pill */}
                  <td className="px-6 py-5 text-right md:text-center">
                    <button
                      onClick={() => cycleStatus(item.id)}
                      disabled={isClosed}
                      className={getVerificationButton(item.status)}
                      title={isClosed ? 'Cycle closed' : 'Click to cycle verification state'}
                    >
                      {item.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-border my-4" />

      {/* Discrepancy Status Box (Matches Screen 8 Mockup bottom yellow border/alert) */}
      {flaggedCount > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 flex items-center gap-3 text-amber-300 animate-in fade-in duration-150">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            {flaggedCount} assets flagged - discrepancy report generated automatically
          </span>
        </div>
      )}

      {/* Close Audit Button (Matches Screen 8 Mockup Bottom Button) */}
      {!isClosed ? (
        <div className="flex justify-start">
          <button
            onClick={() => setIsClosed(true)}
            className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-6 py-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500 hover:text-foreground transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.98]"
          >
            Close audit cycle
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
          <Check className="w-4 h-4 text-emerald-400" />
          Audit cycle marked as closed. Discrepancy report sent to administrative dashboard.
        </div>
      )}
    </div>
  )
}