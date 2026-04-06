<script setup>
import { ref, onMounted } from 'vue'

const tokenCookie = useCookie('access_token')
const userRoleCookie = useCookie('user_role')

const adminName = ref('Admin')

onMounted(() => {
  if (tokenCookie.value) {
    try {
      const payloadBase64 = tokenCookie.value.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))
      if (decodedPayload.user_metadata?.full_name) {
        adminName.value = decodedPayload.user_metadata.full_name
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
  <div class="min-h-screen bg-[#F3F4F6] flex flex-col font-['Outfit']">
    <!-- Navbar Superadmin -->
    <header class="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div class="w-full px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">
        <NuxtLink to="/" class="text-[20px] font-bold tracking-tight text-white flex items-center gap-2">
          Carre<span class="text-blue-400">path</span> 
          <span class="text-[10px] font-bold px-2 py-0.5 bg-red-500 text-white rounded-md uppercase tracking-widest align-middle">Root Access</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-slate-300 hidden sm:block">Cmdr {{ adminName }}</span>
          <button @click="handleLogout" class="text-xs font-bold text-red-400 hover:text-white bg-slate-800 hover:bg-red-600 px-4 py-1.5 rounded-md transition uppercase tracking-wider">
            Terminate
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-1">
      <!-- Sidebar -->
      <aside class="w-64 bg-slate-800 text-slate-300 hidden md:flex flex-col py-6">
        <nav class="space-y-1 px-3">
          <a href="#" class="bg-slate-700 text-white group flex items-center px-3 py-2.5 text-sm font-medium rounded-md">
            <svg class="text-slate-300 mr-3 flex-shrink-0 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            Overview
          </a>
          <a href="#" class="hover:bg-slate-700 hover:text-white group flex items-center px-3 py-2.5 text-sm font-medium rounded-md">
            <svg class="text-slate-400 group-hover:text-slate-300 mr-3 flex-shrink-0 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            User Management
          </a>
          <a href="#" class="hover:bg-slate-700 hover:text-white group flex items-center px-3 py-2.5 text-sm font-medium rounded-md">
            <svg class="text-slate-400 group-hover:text-slate-300 mr-3 flex-shrink-0 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            System Logs
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 w-full p-6 sm:p-8 overflow-y-auto">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Metrics Control Panel</h1>
        <p class="text-sm font-medium text-slate-500 mb-8">Pemantauan sistem Carrepath secara real-time.</p>

        <!-- Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center justify-center relative overflow-hidden">
            <div class="absolute bottom-0 w-full h-1 bg-blue-500"></div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Workers</p>
            <p class="text-5xl font-black text-slate-900">0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center justify-center relative overflow-hidden">
            <div class="absolute bottom-0 w-full h-1 bg-indigo-500"></div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Companies</p>
            <p class="text-5xl font-black text-slate-900">0</p>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center justify-center relative overflow-hidden">
            <div class="absolute bottom-0 w-full h-1 bg-emerald-500"></div>
            <p class="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">API Requests / HR</p>
            <p class="text-5xl font-black text-green-600 flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </p>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200">
          <div class="px-6 py-5 border-b border-slate-200">
            <h3 class="text-lg font-bold leading-6 text-slate-900">Aktivitas Terbaru</h3>
          </div>
          <ul class="divide-y divide-slate-200">
            <li class="px-6 py-5 text-sm text-slate-500 text-center font-medium italic">
              Tidak ada data log yang tercatat dalam 24 jam terakhir.
            </li>
          </ul>
        </div>

      </main>
    </div>
  </div>
</template>