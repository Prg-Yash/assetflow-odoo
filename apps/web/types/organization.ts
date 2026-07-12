export interface User {
  id: string
  email: string
  name: string
  image?: string | null
  status?: string
  organizationId?: string | null
  roleId?: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  userId: string
  expiresAt: string
  token: string
  activeOrganizationId?: string | null
  createdAt: string
  updatedAt: string
}

export interface SessionResponse {
  user: User
  session: Session
}

export interface OrganizationSettings {
  id?: string
  organizationId?: string
  theme: string
  timezone: string
  currency: string
  language: string
}

export interface OrganizationCount {
  users: number
  assets: number
  departments: number
  locations: number
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  settings?: OrganizationSettings | null
  _count?: OrganizationCount
}

export interface Role {
  id: string
  organizationId: string
  name: string
  description?: string | null
  roleType: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE' | 'AUDITOR' | 'TECHNICIAN' | 'CUSTOM'
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

export interface OrganizationMembership {
  membershipId: string
  isDefault: boolean
  joinedAt: string
  role: Role
  organization: Organization
  isActive: boolean
}

export interface CreateOrganizationRequest {
  name: string
  slug?: string
  logo?: string
  phone?: string
  website?: string
  makeActive?: boolean
}

export interface UpdateOrganizationRequest {
  name?: string
  logo?: string
  phone?: string
  website?: string
  settings?: Partial<OrganizationSettings>
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface ApiError {
  message: string
  status?: number
}
