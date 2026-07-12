import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AssetService } from '../services/asset.service'
import { CreateAssetRequest, UpdateAssetRequest } from '../types/asset'

export function useAssets(filters: {
  categoryId?: string
  departmentId?: string
  locationId?: string
  status?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['assets', filters],
    queryFn: () => AssetService.getAssets(filters),
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => AssetService.getAssetById(id),
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssetRequest) => AssetService.createAsset(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useUpdateAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssetRequest }) =>
      AssetService.updateAsset(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDeleteAsset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => AssetService.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => AssetService.getLocations(),
  })
}

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => AssetService.getVendors(),
  })
}

export function useUploadAssetImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      AssetService.uploadAssetImage(id, url),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] })
    },
  })
}

export function useUploadAssetDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, type, url }: { id: string; type: string; url: string }) =>
      AssetService.uploadAssetDocument(id, type, url),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] })
    },
  })
}
