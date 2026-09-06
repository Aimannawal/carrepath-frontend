<script setup>
import { ref, computed, onMounted } from 'vue'

useHead({ title: 'CarrePath | Provider Dashboard' })
definePageMeta({ layout: 'provider' })

const { get } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
const tokenCookie = useCookie('access_token')

const userId = ref('')
const providerProfileId = ref('')
const loading = ref(true)
const error = ref('')
const bootcamps = ref([])

const totalBootcamps = computed(() => bootcamps.value.length)
const activeBootcamps = computed(() => bootcamps.value.filter((b) => b.is_active !== false).length)

onMounted(async () => {
  try {
    if (!tokenCookie.value) throw new Error('Missing access token')
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub || ''

    // NOTE: The endpoint for /providers/profile/... and /providers/.../bootcamps need to be created in backend later.
    // For now we mock the data or handle 404 gracefully.
    try {
      const profileRes = await get(`/providers/profile/${userId.value}`)
      const profile = asObject(getData(profileRes))
      providerProfileId.value = profile.id || profile.provider_profile_id || userId.value
      
      const bcRes = await get(`/providers/${providerProfileId.value}/bootcamps`)
      bootcamps.value = toArray(getData(bcRes))
    } catch (apiError) {
      console.warn("Backend endpoints for provider not fully ready", apiError)
      error.value = "Fitur provider API sedang dalam tahap pengembangan (Endpoint belum tersedia sepenuhnya)."
    }
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load provider dashboard')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="mb-5 rounded-[24px] border border-[#E2E8F0] bg-gradient-to-r from-white via-[#F8FAFC] to-[#EFF6FF] p-5 md:p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <p class="text-[13px] uppercase tracking-[0.24em] text-[#64748B]">Overview</p>
      <h1 class="text-[28px] font-semibold mt-2">Provider Dashboard</h1>
      <p class="text-[14px] text-[#64748B] mt-1">Kelola program bootcamp dan pantau ketersediaan Anda.</p>
    </div>
    <p v-if="error" class="text-[14px] text-amber-600 bg-amber-50 p-4 rounded-[12px] mb-4 border border-amber-200">{{ error }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white border border-[#E2E8F0] rounded-[18px] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <p class="text-[13px] text-[#64748B]">Total Bootcamp</p>
        <p class="text-[28px] font-semibold mt-1">{{ totalBootcamps }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[18px] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <p class="text-[13px] text-[#64748B]">Bootcamp Aktif</p>
        <p class="text-[28px] font-semibold mt-1">{{ activeBootcamps }}</p>
      </div>
    </div>

    <div class="bg-white border border-[#E2E8F0] rounded-[18px] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div class="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-[20px] font-semibold">Daftar Bootcamp Anda</h2>
          <p class="text-[13px] text-[#64748B] mt-1">Bootcamp yang saat ini tersedia untuk diakses pengguna.</p>
        </div>
      </div>
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-[86px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[18px] animate-pulse"></div>
      </div>
      <div v-else-if="bootcamps.length" class="space-y-3">
        <div v-for="bc in bootcamps" :key="bc.id" class="p-4 border border-[#E2E8F0] rounded-[18px] bg-gradient-to-br from-white to-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_10px_20px_rgba(15,23,42,0.03)]">
          <div>
            <p class="text-[15px] font-semibold text-[#0F172A]">{{ bc.title }}</p>
            <p class="text-[13px] text-[#64748B] mt-1">{{ bc.category }} - {{ bc.level }}</p>
          </div>
          <div class="flex items-center gap-2 self-start md:self-auto">
            <span :class="['text-[12px] rounded-full px-3 py-1 border capitalize', bc.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200']">{{ bc.is_active ? 'Aktif' : 'Non-Aktif' }}</span>
          </div>
        </div>
      </div>
      <div v-else class="text-[14px] text-[#64748B]">Belum ada bootcamp yang ditambahkan.</div>
    </div>
  </section>
</template>
