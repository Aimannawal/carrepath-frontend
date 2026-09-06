export default defineNuxtRouteMiddleware((to, from) => {
  const normalizeRole = (rawRole?: string | null) => {
    if (!rawRole) return ''
    if (rawRole === 'user') return 'worker'
    if (rawRole === 'superadmin') return 'admin'
    return rawRole
  }

  const getDashboardPath = (role: string) => {
    if (role === 'worker' || role === 'company' || role === 'admin' || role === 'provider') {
      return `/${role}/dashboard`
    }
    return '/onboarding'
  }

  // Hanya berlaku di sisi client untuk akses cookie
  if (process.client) {
    const token = useCookie('access_token').value
    const roleCookie = useCookie('user_role')
    const role = normalizeRole(roleCookie.value)

    if (role && role !== roleCookie.value) {
      roleCookie.value = role
    }

    // Rute yang dilindungi
    const isProtectedRoute =
      to.path === '/dashboard' ||
      to.path === '/onboarding' ||
      to.path.startsWith('/worker') ||
      to.path.startsWith('/company') ||
      to.path.startsWith('/admin') ||
      to.path.startsWith('/provider')

    // 1. Cek Login
    if (isProtectedRoute && !token) {
      console.warn('Proteksi Route: Anda belum login')
      return navigateTo('/auth/login')
    }

    // 2. Jika sudah login & mencoba akses ke Dashboard umum (legacy), lempar ke onboarding / role
    if (to.path === '/dashboard') {
      if (!role) {
        return navigateTo('/onboarding')
      } else {
        const dest = getDashboardPath(role)
        return navigateTo(dest)
      }
    }

    // 3. Pengecekan Khusus Role workspace (worker/company/admin)
    if (to.path.startsWith('/worker') || to.path.startsWith('/company') || to.path.startsWith('/admin') || to.path.startsWith('/provider')) {
      // Jika nyasar padahal belum milih role
      if (!role) {
        return navigateTo('/onboarding')
      }

      const correctPath = getDashboardPath(role)

      // Hard block untuk role yang nyebrang
      if (to.path.startsWith('/admin') && role !== 'admin') {
        return navigateTo(correctPath)
      }
      if (to.path.startsWith('/worker') && role !== 'worker') {
        return navigateTo(correctPath)
      }
      if (to.path.startsWith('/company') && role !== 'company') {
        return navigateTo(correctPath)
      }
      if (to.path.startsWith('/provider') && role !== 'provider') {
        return navigateTo(correctPath)
      }
    }

    // 4. Edge Case: Kalau udh login + udh pilih role, jangan bisa balik ke Onboarding / Login / Auth Pages
    if ((to.path.startsWith('/auth/') || to.path === '/onboarding') && token && role) {
      const dest = getDashboardPath(role)
      return navigateTo(dest)
    }
  }
})