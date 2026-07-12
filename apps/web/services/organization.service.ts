import { request } from '../lib/api-client'
import {
  ApiResponse,
  SessionResponse,
  OrganizationMembership,
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  AssetCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Employee,
  UpdateEmployeeRequest,
  Invite,
  CreateInviteRequest,
  Role,
} from '../types/organization'

export const OrganizationService = {
  // Session
  async getUserSession() {
    return request<SessionResponse>('/auth/get-session')
  },

  // Organizations
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

  // Departments CRUD
  async getDepartments() {
    const res = await request<ApiResponse<Department[]>>('/departments')
    return res.data
  },

  async createDepartment(data: CreateDepartmentRequest) {
    const res = await request<ApiResponse<Department>>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async updateDepartment(id: string, data: UpdateDepartmentRequest) {
    const res = await request<ApiResponse<Department>>(`/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async deleteDepartment(id: string) {
    const res = await request<ApiResponse<void>>(`/departments/${id}`, {
      method: 'DELETE',
    })
    return res
  },

  // Categories CRUD
  async getCategories() {
    const res = await request<ApiResponse<AssetCategory[]>>('/categories')
    return res.data
  },

  async createCategory(data: CreateCategoryRequest) {
    const res = await request<ApiResponse<AssetCategory>>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async updateCategory(id: string, data: UpdateCategoryRequest) {
    const res = await request<ApiResponse<AssetCategory>>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async deleteCategory(id: string) {
    const res = await request<ApiResponse<void>>(`/categories/${id}`, {
      method: 'DELETE',
    })
    return res
  },

  // Employees CRUD
  async getEmployees() {
    const res = await request<ApiResponse<Employee[]>>('/employees')
    return res.data
  },

  async updateEmployee(id: string, data: UpdateEmployeeRequest) {
    const res = await request<ApiResponse<Employee>>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async deleteEmployee(id: string) {
    const res = await request<ApiResponse<void>>(`/employees/${id}`, {
      method: 'DELETE',
    })
    return res
  },

  // Roles
  async getRoles() {
    const res = await request<ApiResponse<Role[]>>('/roles')
    return res.data
  },

  // Invitations
  async getInvitations() {
    const res = await request<ApiResponse<Invite[]>>('/invites')
    return res.data
  },

  async createInvite(data: CreateInviteRequest) {
    const res = await request<ApiResponse<Invite>>('/invites', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async resendInvite(id: string) {
    const res = await request<ApiResponse<Invite>>(`/invites/${id}/resend`, {
      method: 'POST',
    })
    return res.data
  },

  async deleteInvite(id: string) {
    const res = await request<ApiResponse<void>>(`/invites/${id}`, {
      method: 'DELETE',
    })
    return res
  },

  async acceptInvite(token: string) {
    const res = await request<ApiResponse<void>>('/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
    return res
  },
}
