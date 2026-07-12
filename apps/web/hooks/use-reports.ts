import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ReportService } from '../services/report.service'
import { ReportExportFormat, ReportFilters } from '../types/report'

export const reportsQueryKey = (organizationId: string, filters: ReportFilters) => [
  'reports',
  organizationId,
  filters,
]

export function useReportsDashboard(organizationId: string, filters: ReportFilters) {
  return useQuery({
    queryKey: reportsQueryKey(organizationId, filters),
    queryFn: () => ReportService.getDashboard(filters),
    enabled: Boolean(organizationId),
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  })
}

export function useInvalidateReports() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['reports'] })
}

export async function exportReport(filters: ReportFilters, format: ReportExportFormat) {
  const { blob, filename } = await ReportService.exportReport(filters, format)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `assetflow-report.${format === 'excel' ? 'xls' : format}`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
