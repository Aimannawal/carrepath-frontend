<script setup>
import { onMounted } from 'vue'

const { get } = useApi()

onMounted(async () => {
  // 1. Ambil seluruh URL Hash pakai window.location
  const hash = window.location.hash

  if (hash && hash.includes('access_token')) {
    // 2. Karena bentuk URLnya pake parameter (ex: #access_token=123&expires_in=...),
    //    kita urai string-nya pake URLSearchParams tapi kita cut dulu pager (#)-nya.
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
   
    if (accessToken) {
      // 3. Token ketangkep! Save ke cookie lu.
      const tokenCookie = useCookie('access_token')
      tokenCookie.value = accessToken

      // 4. (Optional) Save refresh token juga kalau butuh ntar
      const refreshCookie = useCookie('refresh_token')
      if (refreshToken) {
        refreshCookie.value = refreshToken
      }

      // Bersihkan jejak hash dari URL
      window.location.hash = ''

      // 5. Cek API Backend (Golang) Dulu untuk dapet Role Usernya!
      try {
        const payloadBase64 = accessToken.split('.')[1]
        const decodedPayload = JSON.parse(atob(payloadBase64))
        const userId = decodedPayload.sub
        
        // Panggil endpoint baru GET profile/id buat ngecek
        const profile = await get(`/users/profile/${userId}`)
        
        if (profile?.data?.role) {
          // Yes! Dia Google Auth orang lama (udah ada rolenya di DB kita)
          const roleCookie = useCookie('user_role')
          roleCookie.value = profile.data.role
          
          const dest = profile.data.role === 'superadmin' ? '/admin/dashboard' : `/${profile.data.role}/dashboard`
          navigateTo(dest)
        } else {
          navigateTo('/onboarding')
        }
      } catch (err) {
        // Jika API error 404 (Not Found), artinya ini User Google baru pecah telor!
        if (err.status === 404) {
          console.warn("User Google Login belum punya profile DB, pindah ke Onboarding.")
          navigateTo('/onboarding')
        } else {
          console.error("Gagal get profil:", err)
          navigateTo('/auth/login')
        }
      }
    }
  } else {
    // Kalau nggak ada access token di url callback ini
    console.error("Gagal dapet token dari Google :(")
    navigateTo('/auth/login')
  }
})
</script>

<template>
  <div class="h-screen w-screen flex items-center justify-center bg-gray-50 font-['Outfit']">
    <div class="text-center">
      <!-- Loading Spinner menyesuaikan tema biru app lu -->
      <svg class="animate-spin h-10 w-10 text-[color:var(--color-main)] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-[16px] text-gray-700 animate-pulse font-medium">
        Memproses sinkronisasi akun Google Anda... 
      </p>
    </div>
  </div>
</template>



