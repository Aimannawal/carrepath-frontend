export const useApiResponse = () => {
  const getData = (response: any) => {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }
    return response
  }

  const toArray = (value: any) => {
    if (Array.isArray(value)) return value
    if (!value || typeof value !== 'object') return []

    if (Array.isArray(value.data)) return value.data
    if (Array.isArray(value.list)) return value.list
    if (Array.isArray(value.items)) return value.items
    if (Array.isArray(value.rows)) return value.rows
    if (Array.isArray(value.results)) return value.results
    if (Array.isArray(value.jobs)) return value.jobs
    if (Array.isArray(value.applications)) return value.applications
    if (Array.isArray(value.resumes)) return value.resumes
    if (Array.isArray(value.study_plans)) return value.study_plans

    return []
  }

  const asObject = (value: any) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value
    return {}
  }

  const getErrorMessage = (error: any, fallback = 'Request failed') => {
    return (
      error?.data?.error ||
      error?.data?.message ||
      error?.statusMessage ||
      error?.message ||
      fallback
    )
  }

  const getQuota = (response: any) => {
    if (!response || typeof response !== 'object') return null

    const candidates = [
      response?.quota,
      response?.data?.quota,
      response?.data?.data?.quota,
      response?.data?.raw_data?.quota,
      response?.data?.meta?.quota,
      response?.meta?.quota
    ]

    for (const item of candidates) {
      if (item && typeof item === 'object') {
        return {
          quota: Number(item.quota || 0),
          used: Number(item.used || 0),
          remaining: Number(item.remaining ?? Math.max(0, Number(item.quota || 0) - Number(item.used || 0)))
        }
      }
    }

    return null
  }

  return {
    getData,
    toArray,
    asObject,
    getErrorMessage,
    getQuota
  }
}
