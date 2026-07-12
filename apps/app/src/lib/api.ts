import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Prioritize the Expo environment variable (from .env file)
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001').replace(/\/$/, '');

export const AUTH_TOKEN_KEY = 'assetflow_auth_token';
export const ORG_ID_KEY = 'assetflow_active_org_id';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------
export async function setToken(token: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function clearToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(ORG_ID_KEY);
  } else {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(ORG_ID_KEY);
  }
}

// ---------------------------------------------------------------------------
// Organization context helpers
// ---------------------------------------------------------------------------
export async function setActiveOrgId(orgId: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(ORG_ID_KEY, orgId);
  } else {
    await SecureStore.setItemAsync(ORG_ID_KEY, orgId);
  }
}

export async function getActiveOrgId(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(ORG_ID_KEY);
  }
  return SecureStore.getItemAsync(ORG_ID_KEY);
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const orgId = await getActiveOrgId();

  const headers = new Headers(options.headers || {});
  // Skip ngrok browser warning interstitial
  headers.set('ngrok-skip-browser-warning', 'true');

  // Only set JSON content-type when not uploading files
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // better-auth supports Bearer token fallback
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Multi-tenant isolation — required for all org-scoped endpoints
  if (orgId) {
    headers.set('X-Organization-Id', orgId);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    // Send cookies for better-auth HTTP-only session
    credentials: 'include',
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg =
      data?.error?.message ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  return data as T;
}
