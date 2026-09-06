<script setup>
import { ref, computed, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Dashboard' })
definePageMeta({ layout: 'company' })

const { get } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
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
const jobsById = computed(() => {
  const map = new Map()
  for (const job of jobs.value) {
    if (job?.id) map.set(job.id, job)
  }
  return map
})

const resolveJobTitle = (app) => {
  return (
    app?.job?.title ||
    app?.jobs?.title ||
    jobsById.value.get(app?.job_id)?.title ||
    'Lowongan tidak ditemukan'
  )
}

const openApplicantReview = (app) => {
  const jobId = app?.job_id || app?.job?.id || app?.jobs?.id
  if (!jobId) return
  navigateTo(`/company/jobs/${jobId}/applicants`)
}

onMounted(async () => {
  try {
    if (!tokenCookie.value) throw new Error('Missing access token')
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub || ''

    const profileRes = await get(`/companies/profile/${userId.value}`)
    const profile = asObject(getData(profileRes))
    companyProfileId.value = profile.id || profile.company_profile_id || userId.value

    const jobsRes = await get(`/companies/${companyProfileId.value}/jobs`)
    jobs.value = toArray(getData(jobsRes))

    const appGroups = await Promise.allSettled(jobs.value.slice(0, 5).map((job) => get(`/applications/job/${job.id}`)))
    recentApplications.value = appGroups
      .filter((x) => x.status === 'fulfilled')
      .flatMap((x) => toArray(getData(x.value)))
      .sort((a, b) => new Date(b.applied_at || b.created_at || 0).getTime() - new Date(a.applied_at || a.created_at || 0).getTime())
      .slice(0, 5)

    if (appGroups.some((x) => x.status === 'rejected')) {
      error.value = 'Some applicant data failed to load.'
    }
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load company dashboard')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="mb-5 rounded-[24px] border border-[#E2E8F0] bg-gradient-to-r from-white via-[#F8FAFC] to-[#EFF6FF] p-5 md:p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <p class="text-[13px] uppercase tracking-[0.24em] text-[#64748B]">Overview</p>
      <h1 class="text-[28px] font-semibold mt-2">Company Dashboard</h1>
      <p class="text-[14px] text-[#64748B] mt-1">Track job activity and recent applications in a more polished layout.</p>
    </div>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white border border-[#E2E8F0] rounded-[18px] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <p class="text-[13px] text-[#64748B]">Total Job Posted</p>
        <p class="text-[28px] font-semibold mt-1">{{ totalJobPosted }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[18px] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <p class="text-[13px] text-[#64748B]">Total Pelamar</p>
        <p class="text-[28px] font-semibold mt-1">{{ totalApplicants }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[18px] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
        <p class="text-[13px] text-[#64748B]">Job Aktif</p>
        <p class="text-[28px] font-semibold mt-1">{{ activeJobs }}</p>
      </div>
    </div>

    <div class="bg-white border border-[#E2E8F0] rounded-[18px] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div class="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 class="text-[20px] font-semibold">Recent Applications</h2>
          <p class="text-[13px] text-[#64748B] mt-1">Latest applicant activity from your newest jobs.</p>
        </div>
      </div>
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-[86px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[18px] animate-pulse"></div>
      </div>
      <div v-else-if="recentApplications.length" class="space-y-3">
        <div v-for="app in recentApplications" :key="app.id" class="p-4 border border-[#E2E8F0] rounded-[18px] bg-gradient-to-br from-white to-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-[0_10px_20px_rgba(15,23,42,0.03)]">
          <div>
            <p class="text-[15px] font-semibold text-[#0F172A]">{{ app.worker_user?.full_name || app.worker_profile?.full_name || app.worker_name || 'Worker' }}</p>
            <p class="text-[13px] text-[#64748B] mt-1">{{ resolveJobTitle(app) }}</p>
            <p class="text-[12px] text-[#94A3B8] mt-1">Applied {{ formatDate(app.applied_at || app.created_at || Date.now(), true) }}</p>
          </div>
          <div class="flex items-center gap-2 self-start md:self-auto">
            <span :class="['text-[12px] rounded-full px-3 py-1 border capitalize', app.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : app.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200']">{{ app.status || 'pending' }}</span>
            <button
              v-if="(app.status || 'pending') === 'pending'"
              class="text-[12px] rounded-full px-3 py-1 border border-[color:var(--color-main)] text-[color:var(--color-main)] bg-white hover:bg-[#EFF6FF] transition"
              @click="openApplicantReview(app)"
            >
              Review Now
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-[14px] text-[#64748B]">No application data yet.</div>
    </div>
  </section>
</template>
