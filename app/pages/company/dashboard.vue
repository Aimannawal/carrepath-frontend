<script setup>
import { ref, computed, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Dashboard' })
definePageMeta({ layout: 'company' })

const { get } = useApi()
const tokenCookie = useCookie('access_token')

const userId = ref('')
const companyProfileId = ref('')
const loading = ref(true)
const error = ref('')
const jobs = ref([])
const recentApplications = ref([])

const totalJobPosted = computed(() => jobs.value.length)
const activeJobs = computed(() => jobs.value.filter((j) => j.status === 'open').length)
const totalApplicants = computed(() => recentApplications.value.length)

onMounted(async () => {
  try {
    if (!tokenCookie.value) throw new Error('Missing access token')
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub || ''

    const profileRes = await get(`/companies/profile/${userId.value}`)
    companyProfileId.value = profileRes.data?.id || profileRes.data?.company_profile_id || userId.value

    const jobsRes = await get(`/companies/${companyProfileId.value}/jobs`)
    jobs.value = jobsRes.data || []

    const appGroups = await Promise.allSettled(jobs.value.slice(0, 5).map((job) => get(`/applications/job/${job.id}`)))
    recentApplications.value = appGroups
      .filter((x) => x.status === 'fulfilled')
      .flatMap((x) => x.value.data || [])
      .slice(0, 5)

    if (appGroups.some((x) => x.status === 'rejected')) {
      error.value = 'Some applicant data failed to load.'
    }
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load company dashboard'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Company Dashboard</h1>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-5">
        <p class="text-[13px] text-[#64748B]">Total Job Posted</p>
        <p class="text-[28px] font-semibold mt-1">{{ totalJobPosted }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-5">
        <p class="text-[13px] text-[#64748B]">Total Pelamar</p>
        <p class="text-[28px] font-semibold mt-1">{{ totalApplicants }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-5">
        <p class="text-[13px] text-[#64748B]">Job Aktif</p>
        <p class="text-[28px] font-semibold mt-1">{{ activeJobs }}</p>
      </div>
    </div>

    <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-5">
      <h2 class="text-[20px] font-semibold mb-4">Recent Applications</h2>
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-[62px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
      </div>
      <div v-else-if="recentApplications.length" class="space-y-3">
        <div v-for="app in recentApplications" :key="app.id" class="p-4 border border-[#E2E8F0] rounded-[10px] flex items-center justify-between">
          <div>
            <p class="text-[15px] font-medium">{{ app.worker_profiles?.full_name || app.worker_name || 'Worker' }}</p>
            <p class="text-[13px] text-[#64748B]">{{ app.jobs?.title || '-' }}</p>
          </div>
          <span class="text-[12px] rounded-full px-3 py-1 bg-[#F1F5F9] capitalize">{{ app.status || 'pending' }}</span>
        </div>
      </div>
      <div v-else class="text-[14px] text-[#64748B]">No application data yet.</div>
    </div>
  </section>
</template>
