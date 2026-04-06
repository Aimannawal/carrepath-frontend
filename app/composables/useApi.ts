export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.siteUrl

  const get = (path, options = {}) => $fetch(`${baseUrl}${path}`, options)
  const post = (path, body, options = {}) => $fetch(`${baseUrl}${path}`, { method: 'POST', body, ...options })

  return { get, post, baseUrl }
}