<script setup>
import { ref, computed, onMounted, watch } from 'vue'

useHead({ title: 'CarrePath | Worker Jobs' })
definePageMeta({ layout: 'worker' })

const { get } = useApi()
const loading = ref(true)
const error = ref('')
const allJobs = ref([])

const q = ref('')
const category = ref('')
const type = ref('')
const locationType = ref('')
const page = ref(1)
const pageSize = 8

const categories = ['Information Technology', 'Finance', 'Healthcare', 'Marketing', 'Operations']
const types = ['full-time', 'part-time', 'internship', 'contract']
const locationTypes = ['remote', 'onsite', 'hybrid']

const filtered = computed(() => {
  const key = q.value.toLowerCase().trim()
  return allJobs.value.filter((j) => {
    const hitQ = !key || `${j.title || ''} ${j.description || ''} ${j.company_name || ''}`.toLowerCase().includes(key)
    const hitCat = !category.value || (j.category || '').toLowerCase() === category.value.toLowerCase()
    const hitType = !type.value || j.type === type.value
    const hitLoc = !locationType.value || j.location_type === locationType.value
    return hitQ && hitCat && hitType && hitLoc
  })
})

const totalPage = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const list = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch([q, category, type, locationType], () => {
  page.value = 1
})

const fetchJobs = async () => {
  loading.value = true
  error.value = ''
  try {
    const query = new URLSearchParams()
    if (q.value) query.set('q', q.value)
    if (category.value) query.set('category', category.value)
    if (type.value) query.set('type', type.value)
    if (locationType.value) query.set('location_type', locationType.value)
    const suffix = query.toString() ? `?${query.toString()}` : ''
    const res = await get(`/jobs${suffix}`)
    allJobs.value = res.data || []
  } catch (e) {
    error.value = e?.data?.error || 'Failed to fetch jobs'
  } finally {
    loading.value = false
  }
}

onMounted(fetchJobs)
const openDetail = (job) => navigateTo(`/worker/jobs/${job.id}`)
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Browse Jobs</h1>

    <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-4 grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      <input v-model="q" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Search jobs" />
      <select v-model="category" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
        <option value="">All Category</option>
        <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="type" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
        <option value="">All Type</option>
        <option v-for="item in types" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="locationType" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
        <option value="">All Location</option>
        <option v-for="item in locationTypes" :key="item" :value="item">{{ item }}</option>
      </select>
      <button class="md:col-span-4 bg-[color:var(--color-main)] text-white rounded-[5px] py-[12px] text-[14px]" @click="fetchJobs">Apply Filter</button>
    </div>

    <p v-if="error" class="text-[14px] text-red-600 bg-red-50 border border-red-100 rounded-[10px] p-3 mb-4">{{ error }}</p>

    <div v-if="loading" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div v-for="i in 6" :key="i" class="h-[170px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <JobCard v-for="job in list" :key="job.id" :job="job" @view="openDetail" @apply="openDetail" />
    </div>

    <div class="mt-6 flex items-center gap-2">
      <button :disabled="page <= 1" class="border border-[#CBD5E1] rounded-[5px] px-3 py-2 text-[14px] disabled:opacity-40" @click="page--">Prev</button>
      <p class="text-[14px]">Page {{ page }} / {{ totalPage }}</p>
      <button :disabled="page >= totalPage" class="border border-[#CBD5E1] rounded-[5px] px-3 py-2 text-[14px] disabled:opacity-40" @click="page++">Next</button>
    </div>
  </section>
</template>
