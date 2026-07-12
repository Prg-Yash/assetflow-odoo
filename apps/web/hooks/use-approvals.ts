import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApprovalService } from '../services/approval.service'
import { CreateApprovalRequest, ApproveRequest, RejectRequest } from '../types/approval'

export function useApprovalRequests(filters: {
  status?: string
  requestType?: string
  priority?: string
  departmentId?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['approvalRequests', filters],
    queryFn: () => ApprovalService.getApprovalRequests(filters),
  })
}

export function useApprovalStats() {
  return useQuery({
    queryKey: ['approvalStats'],
    queryFn: () => ApprovalService.getApprovalStats(),
  })
}

export function useCreateApprovalRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateApprovalRequest) => ApprovalService.createApprovalRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] })
      queryClient.invalidateQueries({ queryKey: ['approvalStats'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useApproveRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveRequest }) =>
      ApprovalService.approveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] })
      queryClient.invalidateQueries({ queryKey: ['approvalStats'] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useRejectRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectRequest }) =>
      ApprovalService.rejectRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] })
      queryClient.invalidateQueries({ queryKey: ['approvalStats'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
