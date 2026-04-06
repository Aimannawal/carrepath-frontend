<script setup>
import { ref, onMounted } from 'vue'

const selectedRole = ref('')
const isLoading = ref(false)
const { post } = useApi()
const tokenCookie = useCookie('access_token')
const userRoleCookie = useCookie('user_role')

// Data user dari decode token (Bisa juga dari GET /users/me nantinya)
const userData = ref({ id: '', fullName: '', email: '' })

onMounted(() => {
  if (tokenCookie.value) {
    try {
      const payloadJSON = JSON.parse(atob(tokenCookie.value.split('.')[1]))
      userData.value.id = payloadJSON.sub || ''
      userData.value.email = payloadJSON.email || ''
      userData.value.fullName = payloadJSON.user_metadata?.full_name || ''
    } catch (err) {
      console.error('Failed to parse JWT for onboarding', err)
    }
  }
})

const handleSetRole = async () => {
  if (!selectedRole.value) return

  isLoading.value = true
  try {
    const response = await post('/users/set-role', {
      id: userData.value.id,
      role: selectedRole.value,
      full_name: userData.value.fullName,
      email: userData.value.email
    }, {
      headers: { 
        'Content-Type': 'application/json'
      }
    })

    console.log("Berhasil Update Database Supabase:", response)

    // Simpan role di cookie Frontend buat proteksi middleware
    userRoleCookie.value = selectedRole.value

    // Auto redirect sesuai role (sudah disesuaikan dengan folder baru)
    if (selectedRole.value === 'worker') {
      navigateTo('/worker/dashboard')
    } else if (selectedRole.value === 'company') {
      navigateTo('/company/dashboard')
    }
  } catch (error) {
    console.error('Gagal set role Backend Go menolak:', error)
    alert(error.data?.error || 'Terjadi kesalahan saat menyimpan role.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 font-['Outfit'] relative overflow-hidden">
    <!-- Background Decoration -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>

    <div class="max-w-3xl w-full relative z-10">
      
      <div class="text-center mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">Kamu mau jadi apa hari ini?</h1>
        <p class="text-[16px] text-gray-500 font-normal">Pilih peran yang paling sesuai dengan tujuanmu di platform Carrepath.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <!-- Worker Card -->
        <div 
          @click="selectedRole = 'worker'"
          :class="[
            'group cursor-pointer rounded-3xl p-8 transition-all duration-300 border-2 text-left relative overflow-hidden',
            selectedRole === 'worker' 
              ? 'border-[#2B4DB6] bg-white shadow-[0_20px_40px_-15px_rgba(43,77,182,0.15)] scale-[1.02]' 
              : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-gray-200'
          ]"
        >
          <div class="absolute top-6 right-6">
            <div :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300', selectedRole === 'worker' ? 'border-[#2B4DB6] bg-[#2B4DB6]' : 'border-gray-200']">
              <svg v-if="selectedRole === 'worker'" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>
          
          <div class="w-14 h-14 rounded-2xl bg-blue-50 text-[#2B4DB6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          
          <h3 class="text-xl font-bold text-gray-900 mb-3">Cari Kerja</h3>
          <p class="text-[15px] text-gray-500 font-normal leading-relaxed">
            Temukan pekerjaan impianmu. Bangun karir, kembangkan portofolio, dan di-notice oleh perusahaan top.
          </p>
        </div>

        <!-- Company Card -->
        <div 
          @click="selectedRole = 'company'"
          :class="[
            'group cursor-pointer rounded-3xl p-8 transition-all duration-300 border-2 text-left relative overflow-hidden',
            selectedRole === 'company' 
              ? 'border-[#2B4DB6] bg-white shadow-[0_20px_40px_-15px_rgba(43,77,182,0.15)] scale-[1.02]' 
              : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-gray-200'
          ]"
        >
          <div class="absolute top-6 right-6">
            <div :class="['w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300', selectedRole === 'company' ? 'border-[#2B4DB6] bg-[#2B4DB6]' : 'border-gray-200']">
              <svg v-if="selectedRole === 'company'" class="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>

          <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
          </div>
          
          <h3 class="text-xl font-bold text-gray-900 mb-3">Cari Karyawan</h3>
          <p class="text-[15px] text-gray-500 font-normal leading-relaxed">
            Rekrut talenta terbaik secara instan. Pasang lowongan dan percepat pertumbuhan bisnismu sekarang.
          </p>
        </div>
      </div>

      <div class="flex justify-center border-t border-gray-200/60 pt-8 mt-4">
        <button 
          @click="handleSetRole"
          :disabled="!selectedRole || isLoading"
          :class="[
            'w-full max-w-[280px] py-4 rounded-2xl font-semibold text-[15px] transition-all flex items-center justify-center gap-2',
            selectedRole && !isLoading 
              ? 'bg-[#2B4DB6] text-white hover:bg-blue-800 shadow-[0_10px_20px_-10px_rgba(43,77,182,0.4)] hover:-translate-y-0.5' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
          ]"
        >
          <span>{{ isLoading ? 'Menyimpan...' : 'Lanjutkan ke Dashboard' }}</span>
          <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
        </button>
      </div>

    </div>
  </div>
</template>