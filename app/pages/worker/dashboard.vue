<script setup>
import { ref, onMounted } from 'vue'

const tokenCookie = useCookie('access_token')
const userRoleCookie = useCookie('user_role')

const userData = ref({
  fullName: 'Talent',
  email: ''
})

onMounted(() => {
  if (tokenCookie.value) {
    try {
      const payloadBase64 = tokenCookie.value.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))
      userData.value.email = decodedPayload.email || ''
      if (decodedPayload.user_metadata?.full_name) {
        userData.value.fullName = decodedPayload.user_metadata.full_name
      }
    } catch (e) {
      console.error(e)
    }
  }
})

const handleLogout = () => {
  tokenCookie.value = null
  userRoleCookie.value = null
  navigateTo('/auth/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col font-['Outfit']">
    <!-- Navbar Worker -->
    <header class="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-[20px] font-bold tracking-tight text-gray-900">
          Carre<span class="text-[#2B4DB6]">path</span> <span class="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full ml-1 align-middle">Worker</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-600 hidden sm:block">Hai, {{ userData.fullName }} 👋</span>
          <button @click="handleLogout" class="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Dashboard Talent</h1>
        <p class="text-sm text-gray-500 mt-1">Kelola portofolio, AI Resume, dan lamaran kerjamu.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- AI CV Upload Card -->
        <div class="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -z-10"></div>
          
          <h2 class="text-lg font-bold text-gray-900 mb-2">Upload CV 📄</h2>
          <p class="text-sm text-gray-600 mb-6 max-w-md">Sistem AI kami akan mem-parsing PDF CV-mu secara otomatis dan membangun profil portofoliomu dalam hitungan detik.</p>
          
          <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-colors cursor-pointer group">
            <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            </div>
            <p class="text-sm font-semibold text-gray-700">Klik atau drag PDF di sini</p>
            <p class="text-xs text-gray-500 mt-1">Maksimal ukuran file 5MB</p>
          </div>
        </div>

        <!-- Job status -->
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Aktivitas Terakhir</h2>
          
          <div class="space-y-4">
            <!-- Empty state -->
            <div class="text-center py-8">
              <div class="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              </div>
              <p class="text-sm font-medium text-gray-600">Belum ada lamaran</p>
              <p class="text-xs text-gray-400 mt-1">Mulai cari pekerjaan dan kirim CV-mu.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>