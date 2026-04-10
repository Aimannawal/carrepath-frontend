/**
 * usePageFetch - Standardized page-level fetch state management
 * Handles loading, error, and execution with consistent patterns
 */
export const usePageFetch = () => {
  const { get, post, put, del } = useApi()
  const { getData, getErrorMessage } = useApiResponse()

  const loading = ref(false)
  const error = ref('')

  /**
   * Execute async function with automatic loading/error handling
   * @param fn - Async function to execute
   * @param options - { resetError: boolean }
   * @returns Result from function or null on error
   */
  const execute = async (
    fn: () => Promise<any>,
    { resetError = true } = {}
  ) => {
    if (resetError) error.value = ''
    loading.value = true
    try {
      return await fn()
    } catch (e) {
      error.value = getErrorMessage(e)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Convenience wrapper for GET requests with error handling
   */
  const fetchGet = (path: string, options = {}) => {
    return execute(() => get(path, options))
  }

  /**
   * Convenience wrapper for POST requests with error handling
   */
  const fetchPost = (path: string, body: any, options = {}) => {
    return execute(() => post(path, body, options))
  }

  /**
   * Convenience wrapper for PUT requests with error handling
   */
  const fetchPut = (path: string, body: any, options = {}) => {
    return execute(() => put(path, body, options))
  }

  /**
   * Convenience wrapper for DELETE requests with error handling
   */
  const fetchDel = (path: string, options = {}) => {
    return execute(() => del(path, options))
  }

  /**
   * Clear error message
   */
  const clearError = () => {
    error.value = ''
  }

  return {
    loading,
    error,
    execute,
    fetchGet,
    fetchPost,
    fetchPut,
    fetchDel,
    clearError
  }
}
