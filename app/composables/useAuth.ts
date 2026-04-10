/**
 * useAuth - Centralized auth state management
 * Handles token, userId, role extraction and logout
 */
export const useAuth = () => {
  const token = useCookie('access_token')
  const roleCookie = useCookie('user_role')

  const normalizeRole = (rawRole?: string | null) => {
    if (!rawRole) return ''
    if (rawRole === 'user') return 'worker'
    if (rawRole === 'superadmin') return 'admin'
    return rawRole
  }

  /**
   * Extract userId from JWT token (sub field in payload)
   */
  const userId = computed(() => {
    try {
      if (!token.value) return ''
      const parts = token.value.split('.')
      if (parts.length !== 3) return ''
      const payload = JSON.parse(atob(parts[1]))
      return payload.sub || ''
    } catch {
      return ''
    }
  })

  /**
   * Current user role (normalized)
   */
  const role = computed(() => {
    return normalizeRole(roleCookie.value)
  })

  /**
   * Is user authenticated
   */
  const isAuthenticated = computed(() => {
    return !!token.value && !!role.value
  })

  /**
   * Check if user has specific role
   */
  const isRole = (checkRole: string) => {
    return role.value === normalizeRole(checkRole)
  }

  /**
   * Logout - clear token, role, navigate to login
   */
  const logout = async () => {
    token.value = null
    roleCookie.value = null
    await navigateTo('/auth/login')
  }

  /**
   * Set token and role (after login)
   */
  const setAuth = (newToken: string, newRole: string) => {
    token.value = newToken
    roleCookie.value = newRole
  }

  return {
    token,
    roleCookie,
    userId,
    role,
    isAuthenticated,
    isRole,
    logout,
    setAuth,
    normalizeRole
  }
}
