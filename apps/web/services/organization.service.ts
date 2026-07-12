import { request } from '../lib/api-client'
import {
  ApiResponse,
  SessionResponse,
  OrganizationMembership,
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '../types/organization'

export const OrganizationService = {
  async getUserSession() {
    return request<SessionResponse>('/auth/get-session')
  },

  async getOrganizations() {
    const res = await request<ApiResponse<OrganizationMembership[]>>('/organizations/my-memberships')
    return res.data
  },

  async getCurrentOrganization() {
    const res = await request<ApiResponse<Organization>>('/organizations/current')
    return res.data
  },

  async createOrganization(data: CreateOrganizationRequest) {
    const res = await request<ApiResponse<Organization>>('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async switchOrganization(organizationId: string) {
    const res = await request<ApiResponse<{ organization: Organization; role: any }>>('/organizations/switch', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    })
    return res.data
  },

  async updateOrganization(data: UpdateOrganizationRequest) {
    const res = await request<ApiResponse<Organization>>('/organizations/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },
}
