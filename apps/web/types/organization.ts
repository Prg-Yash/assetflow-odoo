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

/* ─── NEW TYPES FOR ORGANIZATION SETUP ────────────────────────────────────────── */

export interface Department {
  id: string
  organizationId: string
  name: string
  managerId?: string | null
  parentDepartmentId?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  manager?: {
    id: string
    employeeCode: string
    user: {
      id: string
      name: string
      email: string
    }
  } | null
  _count?: {
    employees: number
    assets: number
  }
}

export interface CreateDepartmentRequest {
  name: string
  managerId?: string | null
  parentDepartmentId?: string | null
}

export interface UpdateDepartmentRequest {
  name?: string
  managerId?: string | null
  parentDepartmentId?: string | null
  isActive?: boolean
}

export interface AssetCategory {
  id: string
  organizationId: string
  name: string
  icon?: string | null
  color?: string | null
  customAttributes?: {
    description?: string
    status?: 'Active' | 'Inactive'
    depreciationRate?: number
    lifespan?: number
    parentCategoryId?: string | null
  } | null
  createdAt: string
  updatedAt: string
  _count?: {
    assets: number
  }
}

export interface CreateCategoryRequest {
  name: string
  icon?: string | null
  color?: string | null
  customAttributes?: AssetCategory['customAttributes']
}

export interface UpdateCategoryRequest {
  name?: string
  icon?: string | null
  color?: string | null
  customAttributes?: AssetCategory['customAttributes']
}

export interface Employee {
  id: string
  organizationId: string
  userId: string
  employeeCode: string
  designation?: string | null
  departmentId?: string | null
  phone?: string | null
  joiningDate?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    status?: string
    image?: string | null
    role?: Role
  }
  department?: {
    id: string
    name: string
  } | null
}

export interface UpdateEmployeeRequest {
  departmentId?: string | null
  designation?: string | null
  phone?: string | null
  joiningDate?: string | null
  isActive?: boolean
}

export interface Invite {
  id: string
  organizationId: string
  email: string
  roleId: string
  role: Role
  invitedById?: string | null
  invitedBy?: {
    id: string
    name: string
    email: string
  } | null
  token: string
  expiresAt: string
  accepted: boolean
  name?: string | null
  designation?: string | null
  departmentId?: string | null
  phone?: string | null
  createdAt: string
}

export interface CreateInviteRequest {
  email: string
  roleId: string
  name?: string
  designation?: string
  departmentId?: string
  phone?: string
}
