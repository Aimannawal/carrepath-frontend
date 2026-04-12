<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Saved Jobs' })
definePageMeta({ layout: 'worker' })

const { get, del } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const { success, confirm } = useModal()
const tokenCookie = useCookie('access_token')
const loading = ref(true)
const error = ref('')
const items = ref([])
const userId = ref('')
const deletingId = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    if (!tokenCookie.value) throw new Error('Missing access token')
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub || ''
    if (!userId.value) throw new Error('Invalid user id')

    const [savedRes, appRes] = await Promise.all([
      get(`/saved/jobs/${userId.value}`),
      get(`/applications/worker/${userId.value}`)
    ])

    const savedJobs = toArray(getData(savedRes))
    const applications = toArray(getData(appRes))
    const appliedJobIds = new Set(
      applications
        .map((app) => app?.job_id || app?.job?.id)
        .filter((id) => typeof id === 'string' && id.trim().length)
    )

    items.value = savedJobs.filter((job) => !appliedJobIds.has(job?.id))
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to fetch saved jobs')
  } finally {
    loading.value = false
  }
}

const unsaveJob = (job) => {
  confirm(
    'Remove Job',
    `Apakah kamu yakin ingin menghapus ${job.title || 'this job'} dari saved list?`,
    async () => {
      if (deletingId.value) return
      deletingId.value = job.saved_id
      try {
        await del(`/saved/company/${job.saved_id}`)
        items.value = items.value.filter((x) => x.saved_id !== job.saved_id)
        success('Success', 'Job removed from saved list')
      } catch (e) {
        error.value = getErrorMessage(e, 'Failed to unsave job')
      } finally {
        deletingId.value = ''
      }
    }
  )
}

const openDetail = (job) => navigateTo(`/worker/jobs/${job.id}`)

onMounted(fetchData)
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[30px] font-semibold">Saved Jobs</h1>
      <p v-if="items.length" class="text-[13px] text-[#64748B]">{{ items.length }} job {{ items.length === 1 ? 'saved' : 'saved' }}</p>
    </div>

    <p v-if="error" class="mb-4 text-[14px] text-red-600">{{ error }}</p>

    <div v-if="loading" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div v-for="i in 6" :key="i" class="h-[200px] bg-white border border-[#E2E8F0] rounded-[12px] animate-pulse"></div>
    </div>
    <div v-else-if="items.length" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div v-for="job in items" :key="job.saved_id || job.id" class="space-y-2">
        <JobCard :job="job" @view="openDetail" @apply="openDetail" />
        <button
          class="w-full border border-[#CBD5E1] text-[#334155] text-[13px] px-3 py-2 rounded-[8px] font-medium hover:bg-[#F8FAFC] transition"
          :disabled="deletingId === job.saved_id"
          @click="unsaveJob(job)"
        >
          {{ deletingId === job.saved_id ? 'Removing...' : 'Remove from saved' }}
        </button>
      </div>
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[12px] p-8 text-center">
      <Icon name="mdi:bookmark-off" class="w-12 h-12 text-[#CBD5E1] mx-auto mb-2" />
      <p class="text-[15px] font-medium text-[#475569]">No saved jobs yet</p>
      <p class="text-[13px] text-[#64748B] mt-1">Save jobs you want to apply later</p>
      <NuxtLink to="/worker/jobs" class="inline-block mt-4 px-4 py-2 rounded-[8px] bg-[color:var(--color-main)] text-white text-[13px] font-medium hover:opacity-90 transition">
        Explore Jobs
      </NuxtLink>
    </div>
  </section>
</template>
