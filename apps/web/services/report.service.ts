import { request, requestBlob } from '../lib/api-client'
import { ApiResponse } from '../types/organization'
import { ReportExportFormat, ReportFilters, ReportsDashboard } from '../types/report'

function buildReportQuery(filters: ReportFilters) {
  const params = new URLSearchParams()
  params.set('range', filters.range)
  if (filters.startDate) params.set('startDate', filters.startDate)
  if (filters.endDate) params.set('endDate', filters.endDate)
  if (filters.idleDays) params.set('idleDays', String(filters.idleDays))
  return params.toString()
}

export const ReportService = {
  async getDashboard(filters: ReportFilters) {
    const res = await request<ApiResponse<ReportsDashboard>>(`/reports/dashboard?${buildReportQuery(filters)}`)
    return res.data
  },

  async exportReport(filters: ReportFilters, format: ReportExportFormat) {
    const query = buildReportQuery(filters)
    return requestBlob(`/reports/export?${query}&format=${format}`)
  },
}
