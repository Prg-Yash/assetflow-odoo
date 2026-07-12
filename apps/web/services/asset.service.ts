import { request } from '../lib/api-client'
import { ApiResponse } from '../types/organization'
import {
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
  Location,
  Vendor,
  AssetImage,
  AssetDocument,
} from '../types/asset'

export const AssetService = {
  async getAssets(params: {
    categoryId?: string
    departmentId?: string
    locationId?: string
    status?: string
    search?: string
  } = {}) {
    const searchParams = new URLSearchParams()
    if (params.categoryId && params.categoryId !== 'All') {
      searchParams.append('categoryId', params.categoryId)
    }
    if (params.departmentId && params.departmentId !== 'All') {
      searchParams.append('departmentId', params.departmentId)
    }
    if (params.locationId && params.locationId !== 'All') {
      searchParams.append('locationId', params.locationId)
    }
    if (params.status && params.status !== 'All') {
      searchParams.append('status', params.status)
    }
    if (params.search) {
      searchParams.append('search', params.search)
    }

    const queryStr = searchParams.toString()
    const path = `/assets${queryStr ? `?${queryStr}` : ''}`
    const res = await request<ApiResponse<Asset[]>>(path)
    return res.data
  },

  async getAssetById(id: string) {
    const res = await request<ApiResponse<Asset>>(`/assets/${id}`)
    return res.data
  },

  async createAsset(data: CreateAssetRequest) {
    const res = await request<ApiResponse<Asset>>('/assets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async updateAsset(id: string, data: UpdateAssetRequest) {
    const res = await request<ApiResponse<Asset>>(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return res.data
  },

  async deleteAsset(id: string) {
    const res = await request<ApiResponse<void>>(`/assets/${id}`, {
      method: 'DELETE',
    })
    return res
  },

  async getLocations() {
    const res = await request<ApiResponse<Location[]>>('/locations')
    return res.data
  },

  async getVendors() {
    const res = await request<ApiResponse<Vendor[]>>('/vendors')
    return res.data
  },

  async uploadAssetImage(id: string, url: string) {
    const res = await request<ApiResponse<AssetImage>>(`/assets/${id}/images`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    })
    return res.data
  },

  async uploadAssetDocument(id: string, type: string, url: string) {
    const res = await request<ApiResponse<AssetDocument>>(`/assets/${id}/documents`, {
      method: 'POST',
      body: JSON.stringify({ type, url }),
    })
    return res.data
  },
}
