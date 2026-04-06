<script setup>
import { ref, onMounted } from 'vue'

const tokenCookie = useCookie('access_token')
const userRoleCookie = useCookie('user_role')

const companyName = ref('Perusahaan')
const email = ref('')

onMounted(() => {
  if (tokenCookie.value) {
    try {
      const payloadBase64 = tokenCookie.value.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))
      email.value = decodedPayload.email || ''
      if (decodedPayload.user_metadata?.full_name) {
        companyName.value = decodedPayload.user_metadata.full_name
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
    <!-- Navbar Company -->
    <header class="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-[20px] font-bold tracking-tight text-gray-900">
          Carre<span class="text-[#2B4DB6]">path</span> <span class="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full ml-1 align-middle">Company</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-gray-600 hidden sm:block">Welcome, {{ companyName }} 🏢</span>
          <button @click="handleLogout" class="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition">
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard Rekrutmen</h1>
          <p class="text-sm text-gray-500 mt-1">Kelola lowongan, telusuri talenta, dan periksa pelamar.</p>
        </div>
        <button class="bg-[#2B4DB6] text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:bg-blue-800 transition">
          + Pasang Lowongan
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Stats Card -->
        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div class="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lowongan Aktif</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-3xl font-bold text-gray-900">0</span>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div class="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pelamar</p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-3xl font-bold text-gray-900">0</span>
          </div>
        </div>
      </div>
      
      <!-- Recent Job Posts Empty State -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div class="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-500">
          <svg width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Mulai Bangun Timmu</h2>
        <p class="text-sm text-gray-500 mt-2 max-w-sm mx-auto mb-6">Perusahaanmu belum membuat satupun lowongan. Posting lowongan pertamamu untuk menemukan talenta terbaik.</p>
        <button class="bg-white border-2 border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-semibold text-sm hover:border-[#2B4DB6] hover:text-[#2B4DB6] transition">
          Buat Lowongan Pekerjaan
        </button>
      </div>

    </main>
  </div>
</template>