import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { OrganizationService } from '../services/organization.service'
import { CreateOrganizationRequest, UpdateOrganizationRequest } from '../types/organization'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => OrganizationService.getUserSession(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't keep retrying if unauthenticated
  })
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => OrganizationService.getOrganizations(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useCurrentOrganization() {
  return useQuery({
    queryKey: ['currentOrganization'],
    queryFn: () => OrganizationService.getCurrentOrganization(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => OrganizationService.createOrganization(data),
    onSuccess: (newOrg) => {
      // Invalidate organizations list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      // If we made it active, store it in sessionStorage and invalidate session/currentOrg
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
      // Invalidate all related queries
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
