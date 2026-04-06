<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const tokenCookie = useCookie('access_token')

const userData = ref({
  fullName: 'User',
  email: ''
})

onMounted(() => {
  // Simple check untuk proteksi halaman sementara
  if (!tokenCookie.value) {
    if (process.client) {
      // Coba periksa apakah ini callback dari Google OAuth (URL Hash Fragment)
      const hash = window.location.hash
      if (hash && hash.includes('access_token=')) {
        const tokenParams = new URLSearchParams(hash.substring(1))
        const accessToken = tokenParams.get('access_token')
        
        if (accessToken) {
          tokenCookie.value = accessToken
          // Hapus fragment dari URL agar rapi
          window.location.hash = ''
          parseToken(accessToken)
          return
        }
      }
      
      // Jika benar-benar tidak ada token, kembali ke login
      alert('Anda belum login!')
      router.push('/auth/login')
    }
  } else {
    parseToken(tokenCookie.value)
  }
})

// Fungsi sederhana untuk decode JWT Token JSON
const parseToken = (token) => {
  try {
    const payloadBase64 = token.split('.')[1]
    if (payloadBase64) {
      const decodedPayload = JSON.parse(atob(payloadBase64))
      
      // Mengambil `raw_user_meta_data.full_name` khas JWT Supabase via Go
      userData.value.email = decodedPayload.email || ''
      
      if (decodedPayload.user_metadata?.full_name) {
        userData.value.fullName = decodedPayload.user_metadata.full_name
      }
    }
  } catch (error) {
    console.error('Gagal mem-parsing token JWT:', error)
  }
}

const handleLogout = () => {
  tokenCookie.value = null // Hapus cookie
  router.push('/auth/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col text-gray-900 font-['Outfit']">
    <!-- Navbar Dashboard -->
    <header class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between">
      <NuxtLink to="/" class="text-[20px] font-semibold tracking-tight inline-block hover:opacity-80 transition">
        <span>Carre</span><span class="text-[#2B4DB6]">path.</span>
      </NuxtLink>

      <div class="flex items-center gap-6">
        <span class="text-sm font-medium text-gray-600 hidden sm:block">Hai, {{ userData.fullName }}</span>
        <button 
          @click="handleLogout"
          class="text-sm font-medium text-red-500 hover:text-red-700 transition"
        >
          Logout
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10 mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to your Dashboard 🚀</h1>
        <p class="text-base text-[#8F8F8F] font-medium mb-8">Ini adalah tampilan sementara setelah kamu berhasil login.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Profile Card -->
          <div class="p-6 rounded-xl bg-gray-50 border border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Informasi Profil Test</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                <div class="text-sm font-medium text-gray-900">{{ userData.fullName || '-' }}</div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                <div class="text-sm font-medium text-gray-900">{{ userData.email || '-' }}</div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role / Status</label>
                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active Talents
                </div>
              </div>
            </div>
          </div>
          
          <!-- Next Steps Card -->
          <div class="p-6 rounded-xl border border-blue-100 bg-blue-50/50">
            <h2 class="text-lg font-semibold text-[#2B4DB6] mb-4">What's Next?</h2>
            <p class="text-sm text-gray-600 mb-4">Sekarang backend login/register sudah tersambung! Selanjutnya fitur Upload CV dan Career Path.</p>
            <ul class="space-y-3 text-sm font-medium text-gray-700">
              <li class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-[#2B4DB6] text-white flex items-center justify-center text-[10px]">&check;</div> 
                Auth & Database terhubung
              </li>
              <li class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 flex items-center justify-center text-[10px]">&mdash;</div> 
                Parsing PDF CV (AI)
              </li>
              <li class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-400 flex items-center justify-center text-[10px]">&mdash;</div> 
                Membangun Dashboard Portfolio
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>