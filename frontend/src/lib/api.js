const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export function buildApiUrl(path) {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path
}

export function buildAdminHeaders(adminPassword) {
  return adminPassword
    ? { 'x-admin-password': adminPassword }
    : {}
}
