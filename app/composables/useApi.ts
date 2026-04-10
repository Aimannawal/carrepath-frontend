export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = (config.public.apiUrl || 'http://localhost:8080').replace(/\/$/, '')

  const withBase = (path: string) => `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`

  const get = (path: string, options = {}) => $fetch(withBase(path), options)
  const post = (path: string, body: any, options = {}) => $fetch(withBase(path), { method: 'POST', body, ...options })
  const put = (path: string, body: any, options = {}) => $fetch(withBase(path), { method: 'PUT', body, ...options })
  const del = (path: string, options = {}) => $fetch(withBase(path), { method: 'DELETE', ...options })

  return { get, post, put, del, baseUrl }
}