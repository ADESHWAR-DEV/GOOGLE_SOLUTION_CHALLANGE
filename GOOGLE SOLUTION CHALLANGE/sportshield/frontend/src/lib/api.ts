/**
 * API client for AthletiChain FastAPI backend.
 * All frontend data fetching goes through here.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('ath_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || err.message || 'Request failed')
  }

  return res.json()
}

// Auth
export async function apiLogin(email: string, password: string) {
  const data = await fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (data.uid) {
    localStorage.setItem('ath_token', `demo_${data.uid}`)
    localStorage.setItem('ath_user', JSON.stringify(data))
  }
  return data
}

export async function apiSignup(
  email: string,
  password: string,
  displayName: string,
  role: string,
  walletAddress?: string
) {
  return fetchWithAuth('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, display_name: displayName, role, wallet_address: walletAddress }),
  })
}

export async function apiGetMe() {
  return fetchWithAuth('/auth/me')
}

export function apiLogout() {
  localStorage.removeItem('ath_token')
  localStorage.removeItem('ath_user')
}

// Assets
export async function apiListAssets(params?: Record<string, string>) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return fetchWithAuth(`/assets/${qs}`)
}

export async function apiGetAsset(id: string) {
  return fetchWithAuth(`/assets/${id}`)
}

export async function apiUploadAsset(formData: FormData) {
  const token = localStorage.getItem('ath_token')
  const res = await fetch(`${API_BASE}/assets/upload-asset`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Upload failed' }))
    throw new Error(err.detail || 'Upload failed')
  }
  return res.json()
}

export async function apiBuyAsset(assetId: string, buyerWallet: string) {
  return fetchWithAuth('/assets/buy-asset', {
    method: 'POST',
    body: JSON.stringify({ asset_id: assetId, buyer_wallet: buyerWallet }),
  })
}

export async function apiDetectFraud(formData: FormData) {
  const token = localStorage.getItem('ath_token')
  const res = await fetch(`${API_BASE}/assets/detect-fraud`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Detection failed' }))
    throw new Error(err.detail || 'Detection failed')
  }
  return res.json()
}

// Violations
export async function apiListViolations(status?: string) {
  const qs = status ? `?status=${status}` : ''
  return fetchWithAuth(`/violations/${qs}`)
}

export async function apiFreezeAsset(assetId: string, reason: string) {
  const token = localStorage.getItem('ath_token')
  const res = await fetch(`${API_BASE}/assets/freeze-asset`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: new URLSearchParams({ asset_id: assetId, reason }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Freeze failed' }))
    throw new Error(err.detail || 'Freeze failed')
  }
  return res.json()
}

