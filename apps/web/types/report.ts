export type ReportRangeKey =
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'last_6_months'
  | 'last_year'
  | 'custom'

export type ReportExportFormat = 'csv' | 'excel' | 'pdf'

export interface ReportFilters {
  range: ReportRangeKey
  startDate?: string
  endDate?: string
  idleDays?: number
}

export interface ChartPoint {
  label: string
  value: number
}

export interface DistributionPoint {
  name: string
  value: number
}

export interface DepartmentUtilization {
  name: string
  value: number
  bookingCount: number
  allocationCount: number
  assetCount: number
}

export interface AssetSummary {
  totalAssets: number
  activeAssets: number
  availableAssets: number
  allocatedAssets: number
  underMaintenanceAssets: number
  retiredAssets: number
}

export interface MostUsedAsset {
  assetId: string
  assetName: string
  assetCode: string
  usageCount: number
  department: string
}

export interface IdleAsset {
  assetId: string
  assetName: string
  assetCode: string
  idleDays: number
  department: string
}

export interface MaintenanceDueAsset {
  assetId: string
  assetName: string
  assetCode: string
  detail: string
  department: string
  type: 'MAINTENANCE' | 'RETIREMENT'
}

export interface MaintenanceFrequencyPoint extends ChartPoint {
  cost: number
}

export interface BookingHeatmapPoint {
  day: string
  hour: number
  value: number
}

export interface ActiveEmployee {
  employeeId: string
  employeeName: string
  department: string
  usageCount: number
}

export interface TopDepartmentUsage {
  departmentId: string
  departmentName: string
  usageCount: number
}

export interface MaintenanceCostSummary {
  totalCost: number
  averageCost: number
  requestCount: number
}

export interface AssetDepreciationSummary {
  purchaseValue: number
  currentValue: number
  depreciationValue: number
  depreciationRate: number
}

export interface ApprovalRequestStatistics {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface ReportsDashboard {
  generatedAt: string
  filters: {
    range: ReportRangeKey
    startDate: string
    endDate: string
    idleDays: number
  }
  assetSummary: AssetSummary
  utilizationByDepartment: DepartmentUtilization[]
  maintenanceFrequency: MaintenanceFrequencyPoint[]
  mostUsedAssets: MostUsedAsset[]
  idleAssets: IdleAsset[]
  maintenanceDue: MaintenanceDueAsset[]
  bookingTrends: ChartPoint[]
  assetGrowthOverTime: ChartPoint[]
  departmentAssetDistribution: DistributionPoint[]
  categoryAssetDistribution: DistributionPoint[]
  bookingHeatmap: BookingHeatmapPoint[]
  mostActiveEmployees: ActiveEmployee[]
  topDepartmentsByUsage: TopDepartmentUsage[]
  maintenanceCostSummary: MaintenanceCostSummary
  assetDepreciationSummary: AssetDepreciationSummary
  approvalRequestStatistics: ApprovalRequestStatistics
  assetAllocationTrends: ChartPoint[]
}
