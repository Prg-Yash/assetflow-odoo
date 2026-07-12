import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrganizationService } from '../services/organization.service'
import {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateEmployeeRequest,
  CreateInviteRequest,
} from '../types/organization'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => OrganizationService.getUserSession(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  })
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => OrganizationService.getOrganizations(),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: ['currentOrganization'],
    queryFn: () => OrganizationService.getCurrentOrganization(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => OrganizationService.createOrganization(data),
    onSuccess: (newOrg) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      if (newOrg && typeof window !== 'undefined') {
        sessionStorage.setItem('assetflow:activeOrgId', newOrg.id)
        sessionStorage.setItem('assetflow:activeOrgName', newOrg.name)
        queryClient.invalidateQueries({ queryKey: ['currentOrganization'] })
        queryClient.invalidateQueries({ queryKey: ['session'] })
      }
    },
  })
}

export function useSwitchOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (organizationId: string) => OrganizationService.switchOrganization(organizationId),
    onSuccess: (data, organizationId) => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('assetflow:activeOrgId', organizationId)
        sessionStorage.setItem('assetflow:activeOrgName', data.organization.name)
      }
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['currentOrganization'] })
      queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateOrganizationRequest) => OrganizationService.updateOrganization(data),
    onSuccess: (updatedOrg) => {
      queryClient.invalidateQueries({ queryKey: ['currentOrganization'] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      if (updatedOrg && typeof window !== 'undefined') {
        sessionStorage.setItem('assetflow:activeOrgName', updatedOrg.name)
      }
    },
  })
}

/* ─── DEPARTMENTS HOOKS ──────────────────────────────────────────────────────── */

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => OrganizationService.getDepartments(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDepartmentRequest) => OrganizationService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentRequest }) =>
      OrganizationService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OrganizationService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

/* ─── CATEGORIES HOOKS ───────────────────────────────────────────────────────── */

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => OrganizationService.getCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => OrganizationService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryRequest }) =>
      OrganizationService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OrganizationService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

/* ─── EMPLOYEES HOOKS ────────────────────────────────────────────────────────── */

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => OrganizationService.getEmployees(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      OrganizationService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OrganizationService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => OrganizationService.getRoles(),
    staleTime: 10 * 60 * 1000,
  })
}

/* ─── INVITATIONS HOOKS ──────────────────────────────────────────────────────── */

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: () => OrganizationService.getInvitations(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useInviteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateInviteRequest) => OrganizationService.createInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

export function useResendInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OrganizationService.resendInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OrganizationService.deleteInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] })
    },
  })
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (token: string) => OrganizationService.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] })
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}
