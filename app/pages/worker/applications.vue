<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | My Applications' })
definePageMeta({ layout: 'worker' })

const { get } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const { error: showError, info } = useModal()

const loading = ref(true)
const error = ref('')
const items = ref([])

/**
 * Fetch applications history for this worker
 */
const fetchApplications = async () => {
  loading.value = true
  error.value = ''
  
  try {
    if (!userId.value) {
      const msg = 'User not authenticated. Please log in again.'
      error.value = msg
      showError('Authentication Error', msg)
      return
    }
    
    const res = await get(`/applications/worker/${userId.value}`)
    items.value = toArray(getData(res))
    if (!items.value.length) {
      console.log('No applications found')
    }
  } catch (e) {
    const msg = getErrorMessage(e, 'Failed to load applications')
    error.value = msg
    showError('Load Error', msg)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchApplications()
})
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-2">My Applications</h1>
    <p class="text-[14px] text-[#64748B] mb-6">Track all your job applications and their status</p>

    <!-- Error State -->
    <div v-if="error && !loading" class="mb-4 bg-red-50 border border-red-200 rounded-[10px] p-4">
      <p class="text-red-700 text-[14px]">{{ error }}</p>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="h-[76px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>

    <!-- Applications List -->
    <div v-else-if="items.length" class="space-y-3">
      <ApplicationItem v-for="item in items" :key="item.id" :item="item" />
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[10px] p-8 text-center">
      <p class="text-[16px] font-medium text-[#1E293B] mb-2">No applications yet</p>
      <p class="text-[14px] text-[#64748B] mb-4">Start exploring jobs and submit your applications</p>
      <NuxtLink
        to="/worker/jobs"
        class="inline-block bg-[color:var(--color-main)] text-white rounded-[5px] px-6 py-2.5 text-[14px] font-medium hover:opacity-90 transition-opacity"
      >
        Browse Jobs
      </NuxtLink>
    </div>
  </section>
</template>
