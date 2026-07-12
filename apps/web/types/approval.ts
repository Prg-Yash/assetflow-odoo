import { Asset } from './asset'
import { Employee, User } from './organization'

export type ApprovalRequestType = 'ALLOCATION' | 'RETURN' | 'MAINTENANCE'

export type ApprovalRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface ApprovalRequest {
  id: string
  organizationId: string
  assetId: string
  asset?: Asset
  employeeId: string
  employee?: Employee
  requestType: ApprovalRequestType
  status: ApprovalRequestStatus
  priority: string // LOW, MEDIUM, HIGH, CRITICAL
  reason?: string | null
  rejectionReason?: string | null
  comments?: string | null
  reviewedById?: string | null
  reviewedBy?: User | null
  reviewedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateApprovalRequest {
  assetId: string
  requestType: ApprovalRequestType
  priority?: string
  reason?: string
}

export interface ApproveRequest {
  comments?: string
}

export interface RejectRequest {
  rejectionReason: string
  comments?: string
}

export interface ApprovalStats {
  pendingTotal: number
  pendingAllocations: number
  pendingReturns: number
  pendingMaintenance: number
  approvedToday: number
  rejectedToday: number
  avgApprovalTimeMinutes: number
}
