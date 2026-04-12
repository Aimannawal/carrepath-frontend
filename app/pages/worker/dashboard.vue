<script setup>
import { ref, computed, onMounted } from 'vue'
import gsap from 'gsap'

useHead({ title: 'CarrePath | Worker Dashboard' })
definePageMeta({ layout: 'worker' })

const { get } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const tokenCookie = useCookie('access_token')
const userId = ref('')
const userName = ref('Worker')
const loading = ref(true)
const error = ref('')
const jobs = ref([])
const applications = ref([])
const resumes = ref([])
const rootRef = ref(null)

const sentCount = computed(() => applications.value.length)
const acceptedCount = computed(() => applications.value.filter((a) => a.status === 'accepted').length)
const rejectedCount = computed(() => applications.value.filter((a) => a.status === 'rejected').length)
const savedCvCount = computed(() => resumes.value.length)

const parseToken = () => {
  if (!tokenCookie.value) return
  const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
  userId.value = payload.sub || ''
  userName.value = payload.user_metadata?.full_name || 'Worker'
}

const fetchData = async () => {
  loading.value = true
  error.value = ''
  try {
    parseToken()
    const [jobsRes, appRes, resumeRes] = await Promise.allSettled([
      get('/jobs'),
      get(`/applications/worker/${userId.value}`),
      get(`/ai/resumes/${userId.value}`)
    ])
    const allJobs = jobsRes.status === 'fulfilled' ? toArray(getData(jobsRes.value)) : []
    applications.value = appRes.status === 'fulfilled' ? toArray(getData(appRes.value)) : []
    resumes.value = resumeRes.status === 'fulfilled' ? toArray(getData(resumeRes.value)) : []

    const appliedJobIds = new Set(
      applications.value
        .map((app) => app?.job_id || app?.job?.id)
        .filter((id) => typeof id === 'string' && id.trim().length)
    )
    jobs.value = allJobs.filter((job) => !appliedJobIds.has(job?.id)).slice(0, 6)

    if (jobsRes.status === 'rejected' || appRes.status === 'rejected' || resumeRes.status === 'rejected') {
      error.value = 'Some dashboard data failed to load. You can still use other menu pages.'
    }
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to fetch dashboard data')
  } finally {
    loading.value = false
    if (rootRef.value) {
      gsap.fromTo(rootRef.value.querySelectorAll('.enter-card'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.45 })
    }
  }
}

const goJob = (job) => navigateTo(`/worker/jobs/${job.id}`)

onMounted(fetchData)
</script>

<template>
  <section ref="rootRef" class="p-6 md:p-8">
    <div class="flex items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-[28px] font-semibold text-[color:var(--color-dark)]">Good morning, {{ userName }}!</h1>
        <p class="text-[14px] text-[#64748B] mt-1">Track your applications and discover new jobs.</p>
      </div>
    </div>

    <p v-if="error" class="enter-card mb-4 text-[14px] text-red-600 bg-red-50 border border-red-100 rounded-[10px] p-3">{{ error }}</p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="enter-card bg-white border border-[#E2E8F0] rounded-[10px] p-5">
        <p class="text-[13px] text-[#64748B]">Applications Sent</p>
        <p class="text-[28px] font-semibold mt-1">{{ sentCount }}</p>
      </div>
      <div class="enter-card bg-white border border-[#E2E8F0] rounded-[10px] p-5">
        <p class="text-[13px] text-[#64748B]">Accepted</p>
        <p class="text-[28px] font-semibold mt-1">{{ acceptedCount }}</p>
      </div>
      <div class="enter-card bg-white border border-[#E2E8F0] rounded-[10px] p-5">
        <p class="text-[13px] text-[#64748B]">Rejected</p>
        <p class="text-[28px] font-semibold mt-1">{{ rejectedCount }}</p>
      </div>
    </div>

    <div class="enter-card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-[20px] font-semibold">Recommended Jobs</h2>
        <NuxtLink to="/worker/jobs" class="text-[14px] text-[color:var(--color-main)]">Browse all</NuxtLink>
      </div>

      <div v-if="loading" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div v-for="i in 4" :key="i" class="h-[170px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
      </div>
      <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <JobCard v-for="job in jobs" :key="job.id" :job="job" @view="goJob" @apply="goJob" />
      </div>
    </div>
  </section>
</template>
