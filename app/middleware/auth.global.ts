export default defineNuxtRouteMiddleware((to, from) => {
  // Hanya berlaku di sisi client untuk akses cookie
  if (process.client) {
    const token = useCookie('access_token').value
    const role = useCookie('user_role').value
    
    // Rute yang dilindungi
    const isProtectedRoute = to.path.startsWith('/dashboard') || to.path === '/onboarding'

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
        const dest = role === 'superadmin' ? '/admin/dashboard' : `/${role}/dashboard`
        return navigateTo(dest)
      }
    }

    // 3. Pengecekan Khusus Role Dashboard
    if (to.path.endsWith('/dashboard') && to.path !== '/dashboard') {
      // Jika nyasar padahal belum milih role
      if (!role) {
        return navigateTo('/onboarding')
      }

      const correctPath = role === 'superadmin' ? '/admin/dashboard' : `/${role}/dashboard`

      // Hard block untuk role yang nyebrang
      if (to.path.startsWith('/admin') && role !== 'superadmin') {
        return navigateTo(correctPath)
      }
      if (to.path.startsWith('/worker') && role !== 'worker') {
        return navigateTo(correctPath)
      }
      if (to.path.startsWith('/company') && role !== 'company') {
        return navigateTo(correctPath)
      }
    }

    // 4. Edge Case: Kalau udh login + udh pilih role, jangan bisa balik ke Onboarding / Login / Auth Pages
    if ((to.path.startsWith('/auth/') || to.path === '/onboarding') && token && role) {
      const dest = role === 'superadmin' ? '/admin/dashboard' : `/${role}/dashboard`
      return navigateTo(dest)
    }
  }
})