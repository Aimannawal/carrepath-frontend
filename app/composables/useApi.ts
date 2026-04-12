export const useApi = () => {
  const config = useRuntimeConfig()
  const fallbackUrl = 'http://localhost:8080'
  const runtimeApiUrl = (config.public.apiUrl || '').replace(/\/$/, '')
  const useRemoteInDev = String(config.public.useRemoteApi || '').toLowerCase() === 'true'
  const isLocalRuntimeTarget = /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(runtimeApiUrl)
  const isRemoteRuntimeTarget = /^https?:\/\//i.test(runtimeApiUrl) && !isLocalRuntimeTarget

  const baseUrl = (() => {
    // In dev, default to local backend to avoid exhausting production Gemini quota.
    if (import.meta.env.DEV && isRemoteRuntimeTarget && !useRemoteInDev) {
      return fallbackUrl
    }

    return (
      runtimeApiUrl && !(import.meta.env.PROD && isLocalRuntimeTarget)
        ? runtimeApiUrl
        : fallbackUrl
    )
  })().replace(/\/$/, '')

  /**
   * Get bearer token from cookie
   */
  const getToken = () => {
    try {
      const token = useCookie('access_token').value
      return token || ''
    } catch {
      return ''
    }
  }

  /**
   * Build headers with auto-injected Bearer token if available
   */
  const getHeaders = (customHeaders: Record<string, string> = {}) => {
    const headers: Record<string, string> = {
      ...customHeaders
    }

    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  const withBase = (path: string) => `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  /**
   * Handle 401 responses - redirect to login on token expiry
   */
  const handleUnauthenticated = async () => {
    if (process.client) {
      const token = useCookie('access_token')
      token.value = null
      const roleCookie = useCookie('user_role')
      roleCookie.value = null

      // Only redirect if not already on auth pages
      const route = useRoute()
      if (!route.path.startsWith('/auth/')) {
        await navigateTo('/auth/login')
      }
    }
  }

  /**
   * GET request with auto-injected token
   */
  const get = async (path: string, options = {}) => {
    try {
      return await $fetch(withBase(path), {
        headers: getHeaders(options.headers),
        ...options
      })
    } catch (error) {
      if (error.status === 401) {
        await handleUnauthenticated()
      }
      throw error
    }
  }

  /**
   * POST request with auto-injected token
   */
  const post = async (path: string, body: any, options = {}) => {
    try {
      // For FormData, don't set Content-Type header - let browser handle it
      const isFormData = body instanceof FormData
      const headers = isFormData ? { Authorization: '' } : getHeaders(options.headers)
      
      // Add token to FormData if needed
      if (isFormData) {
        const token = getToken()
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }
      }

      return await $fetch(withBase(path), {
        method: 'POST',
        body,
        headers: isFormData ? headers : getHeaders(options.headers),
        ...options
      })
    } catch (error) {
      if (error.status === 401) {
        await handleUnauthenticated()
      }
      throw error
    }
  }

  /**
   * PUT request with auto-injected token
   */
  const put = async (path: string, body: any, options = {}) => {
    try {
      return await $fetch(withBase(path), {
        method: 'PUT',
        body,
        headers: getHeaders(options.headers),
        ...options
      })
    } catch (error) {
      if (error.status === 401) {
        await handleUnauthenticated()
      }
      throw error
    }
  }

  /**
   * DELETE request with auto-injected token
   */
  const del = async (path: string, options = {}) => {
    try {
      return await $fetch(withBase(path), {
        method: 'DELETE',
        headers: getHeaders(options.headers),
        ...options
      })
    } catch (error) {
      if (error.status === 401) {
        await handleUnauthenticated()
      }
      throw error
    }
  }

  return { get, post, put, del, baseUrl, getHeaders, getToken }
}