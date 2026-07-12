const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001/api/v1').replace(/\/$/, '')

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  // Set default Content-Type if a body is present
  if (options.body && !headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Inject active organization ID if present in sessionStorage
  if (typeof window !== 'undefined') {
    const activeOrgId = sessionStorage.getItem('assetflow:activeOrgId')
    if (activeOrgId && !headers.has('x-organization-id')) {
      headers.set('x-organization-id', activeOrgId)
    }
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    const errorMessage = getErrorMessage(data, `Request failed with status ${response.status}`)
    throw new Error(errorMessage)
  }

  return data as T
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback

  const body = data as {
    message?: unknown
    error?: unknown
    errors?: Array<{ message?: unknown }>
  }

  if (typeof body.message === 'string') return body.message
  if (typeof body.error === 'string') return body.error
  if (body.error && typeof body.error === 'object' && 'message' in body.error) {
    const message = (body.error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  if (Array.isArray(body.errors) && typeof body.errors[0]?.message === 'string') {
    return body.errors[0].message
  }

  return fallback
}
