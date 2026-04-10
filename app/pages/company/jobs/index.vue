<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Jobs' })
definePageMeta({ layout: 'company' })

const { get, post, put, del } = useApi()
const tokenCookie = useCookie('access_token')
const loading = ref(true)
const error = ref('')
const companyId = ref('')
const jobs = ref([])

const showCreate = ref(false)
const createForm = ref({
  title: '',
  description: '',
  category: '',
  type: 'full-time',
  location_type: 'onsite',
  salary_min: 0,
  salary_max: 0,
  expires_at: ''
})

const loadJobs = async () => {
  loading.value = true
  try {
    const res = await get(`/companies/${companyId.value}/jobs`)
    jobs.value = res.data || []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    companyId.value = payload.sub
    await loadJobs()
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load jobs'
    loading.value = false
  }
})

const createJob = async () => {
  try {
    await post('/jobs', { company_id: companyId.value, ...createForm.value })
    showCreate.value = false
    createForm.value = { title: '', description: '', category: '', type: 'full-time', location_type: 'onsite', salary_min: 0, salary_max: 0, expires_at: '' }
    await loadJobs()
  } catch (e) {
    alert(e?.data?.error || 'Failed to create job')
  }
}

const toggleStatus = async (job) => {
  try {
    const next = job.status === 'open' ? 'closed' : 'open'
    await put(`/jobs/${job.id}`, { status: next })
    await loadJobs()
  } catch (e) {
    alert(e?.data?.error || 'Failed to update status')
  }
}

const removeJob = async (job) => {
  if (!confirm('Delete this job?')) return
  try {
    await del(`/jobs/${job.id}`)
    jobs.value = jobs.value.filter((x) => x.id !== job.id)
  } catch (e) {
    alert(e?.data?.error || 'Failed to delete job')
  }
}

const toApplicants = (job) => navigateTo(`/company/jobs/${job.id}/applicants`)
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-[28px] font-semibold">Company Jobs</h1>
      <button class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px]" @click="showCreate = true">+ Post Job</button>
    </div>

    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-[84px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else class="space-y-3">
      <div v-for="job in jobs" :key="job.id" class="bg-white border border-[#E2E8F0] rounded-[10px] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-[17px] font-semibold">{{ job.title }}</p>
          <p class="text-[13px] text-[#64748B] mt-1">Created: {{ new Date(job.created_at || Date.now()).toLocaleDateString() }}</p>
          <span :class="['inline-block mt-2 text-[12px] px-3 py-1 rounded-full capitalize', job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700']">{{ job.status || 'draft' }}</span>
        </div>
        <div class="flex gap-2">
          <button class="border border-[#CBD5E1] rounded-[5px] px-3 py-2 text-[13px]" @click="toggleStatus(job)">Toggle Status</button>
          <button class="border border-[#CBD5E1] rounded-[5px] px-3 py-2 text-[13px]" @click="toApplicants(job)">Lihat Pelamar</button>
          <button class="border border-red-200 text-red-600 rounded-[5px] px-3 py-2 text-[13px]" @click="removeJob(job)">Delete</button>
        </div>
      </div>
    </div>

    <Modal :open="showCreate" title="Post New Job" @close="showCreate = false">
      <div class="space-y-3">
        <input v-model="createForm.title" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Job title" />
        <textarea v-model="createForm.description" rows="4" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Description"></textarea>
        <input v-model="createForm.category" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Category" />
        <div class="grid grid-cols-2 gap-3">
          <select v-model="createForm.type" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
            <option value="full-time">full-time</option>
            <option value="part-time">part-time</option>
            <option value="internship">internship</option>
            <option value="contract">contract</option>
          </select>
          <select v-model="createForm.location_type" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
            <option value="onsite">onsite</option>
            <option value="remote">remote</option>
            <option value="hybrid">hybrid</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <input v-model.number="createForm.salary_min" type="number" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Salary min" />
          <input v-model.number="createForm.salary_max" type="number" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Salary max" />
        </div>
        <input v-model="createForm.expires_at" type="date" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" />
        <button class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px]" @click="createJob">Create Job</button>
      </div>
    </Modal>
  </section>
</template>
