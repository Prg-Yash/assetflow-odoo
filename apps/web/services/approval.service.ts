import { request } from '../lib/api-client'
import { ApiResponse } from '../types/organization'
import {
  ApprovalRequest,
  CreateApprovalRequest,
  ApproveRequest,
  RejectRequest,
  ApprovalStats,
} from '../types/approval'

export const ApprovalService = {
  async getApprovalRequests(params: {
    status?: string
    requestType?: string
    priority?: string
    departmentId?: string
    search?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    if (params.status && params.status !== 'All') {
      searchParams.append('status', params.status)
    }
    if (params.requestType && params.requestType !== 'All') {
      searchParams.append('requestType', params.requestType)
    }
    if (params.priority && params.priority !== 'All') {
      searchParams.append('priority', params.priority)
    }
    if (params.departmentId && params.departmentId !== 'All') {
      searchParams.append('departmentId', params.departmentId)
    }
    if (params.search) {
      searchParams.append('search', params.search)
    }

    const queryStr = searchParams.toString()
    const path = `/approval-requests${queryStr ? `?${queryStr}` : ''}`
    const res = await request<ApiResponse<ApprovalRequest[]>>(path)
    return res.data
  },

  async getApprovalStats() {
    const res = await request<ApiResponse<ApprovalStats>>('/approval-requests/stats')
    return res.data
  },

  async createApprovalRequest(data: CreateApprovalRequest) {
    const res = await request<ApiResponse<ApprovalRequest>>('/approval-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async approveRequest(id: string, data: ApproveRequest = {}) {
    const res = await request<ApiResponse<void>>(`/approval-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res
  },

  async rejectRequest(id: string, data: RejectRequest) {
    const res = await request<ApiResponse<void>>(`/approval-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res
  },
}
