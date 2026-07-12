import { Department, AssetCategory, Employee } from './organization'

export type AssetStatus =
  | 'AVAILABLE'
  | 'ALLOCATED'
  | 'RESERVED'
  | 'UNDER_MAINTENANCE'
  | 'LOST'
  | 'DAMAGED'
  | 'RETIRED'
  | 'DISPOSED'
  | 'IN_AUDIT'

export type ConditionEnum =
  | 'EXCELLENT'
  | 'GOOD'
  | 'FAIR'
  | 'POOR'
  | 'DAMAGED'

export interface Location {
  id: string
  organizationId: string
  name: string
  parentLocationId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Vendor {
  id: string
  organizationId: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  createdAt: string
  updatedAt: string
}

export interface Purchase {
  id: string
  organizationId: string
  vendorId?: string | null
  invoiceNo?: string | null
  purchaseDate: string
  totalCost: number
  createdAt: string
  updatedAt: string
}

export interface AssetImage {
  id: string
  assetId: string
  url: string
  createdAt: string
}

export interface AssetDocument {
  id: string
  assetId: string
  type: string
  url: string
  createdAt: string
}

export interface QRCode {
  id: string
  assetId: string
  code: string
  createdAt: string
}

export interface Allocation {
  id: string
  organizationId: string
  assetId: string
  employeeId: string
  allocatedAt: string
  returnedAt?: string | null
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED'
  employee: Employee
}

export interface MaintenanceRequest {
  id: string
  organizationId: string
  assetId: string
  title: string
  description?: string | null
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'APPROVED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED' | 'CLOSED'
  openedAt: string
  closedAt?: string | null
  raisedBy?: { id: string; name: string } | null
  assignedTo?: { id: string; name: string } | null
}

export interface Asset {
  id: string
  organizationId: string
  assetCode: string
  name: string
  serialNumber?: string | null
  categoryId: string
  category?: AssetCategory
  departmentId?: string | null
  department?: Department | null
  locationId?: string | null
  location?: Location | null
  vendorId?: string | null
  vendor?: Vendor | null
  purchaseId?: string | null
  purchase?: Purchase | null
  status: AssetStatus
  condition: ConditionEnum
  isShared: boolean
  purchaseDate?: string | null
  purchaseCost?: number | null
  currentValue?: number | null
  warrantyExpiry?: string | null
  description?: string | null
  customValues?: Record<string, any> | null
  createdAt: string
  updatedAt: string
  images?: AssetImage[]
  documents?: AssetDocument[]
  qrCode?: QRCode | null
  allocations?: Allocation[]
  maintenanceRequests?: MaintenanceRequest[]
  _count?: {
    images: number
    documents: number
    maintenanceRequests: number
  }
}

export interface CreateAssetRequest {
  name: string
  assetCode: string
  serialNumber?: string
  description?: string
  categoryId: string
  departmentId?: string
  locationId?: string
  vendorId?: string
  purchaseCost?: number
  status?: AssetStatus
  condition?: ConditionEnum
  isShared?: boolean
  customValues?: Record<string, any>
}

export interface UpdateAssetRequest {
  name?: string
  serialNumber?: string
  description?: string
  categoryId?: string
  departmentId?: string
  locationId?: string
  vendorId?: string
  purchaseCost?: number
  status?: AssetStatus
  condition?: ConditionEnum
  isShared?: boolean
  customValues?: Record<string, any>
}
