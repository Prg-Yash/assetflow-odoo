const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5001/api/v1').replace(/\/$/, '')

type AuthPayload = Record<string, string>

function getErrorMessage(data: unknown, fallback: string) {
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

export async function submitAuth(path: '/sign-in/email' | '/sign-up/email', payload: AuthPayload) {
  const response = await fetch(`${apiBaseUrl}/auth${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  const contentType = response.headers.get('content-type')
  const data = contentType?.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Authentication failed. Please try again.'))
  }

  return data
}
