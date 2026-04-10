<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Jobs' })
definePageMeta({ layout: 'company' })

const { get, post, put, del } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const companyProfileId = ref('')
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
  status: 'open',
  expires_at: ''
})

const loading = ref(true)
const profileLoading = ref(true)
const error = ref('')
const createLoading = ref(false)
const createError = ref('')
const createSuccess = ref('')
const deleteConfirmId = ref('')

const formatExpiresAt = (value) => {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  const hasTime = raw.includes('T')
  if (hasTime) {
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw
  }
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const validateCreateForm = () => {
  const required = ['title', 'description', 'category', 'type', 'location_type']
  const missing = required.find((key) => !String(createForm.value[key] || '').trim())
  if (missing) {
    createError.value = `${missing.replace('_', ' ')} is required.`
    return false
  }

  const min = Number(createForm.value.salary_min || 0)
  const max = Number(createForm.value.salary_max || 0)
  if (min < 0 || max < 0) {
    createError.value = 'Salary cannot be negative.'
    return false
  }
  if (min > max) {
    createError.value = 'Salary min must be less than or equal to salary max.'
    return false
  }

  if (createForm.value.expires_at && !formatExpiresAt(createForm.value.expires_at)) {
    createError.value = 'Invalid expires_at format. Use valid date format.'
    return false
  }

  return true
}

const loadJobs = async () => {
  loading.value = true
  try {
    const scopeId = companyProfileId.value || userId.value
    if (!scopeId) throw new Error('Company profile is not ready')
    const res = await get(`/companies/${scopeId}/jobs`)
    jobs.value = toArray(getData(res))
    error.value = ''
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load jobs')
  } finally {
    loading.value = false
  }
}

const refreshCompanyProfileId = async () => {
  const profileRes = await get(`/companies/profile/${userId.value}`)
  const profile = asObject(getData(profileRes))
  companyProfileId.value = profile.id || profile.company_profile_id || userId.value
}

onMounted(async () => {
  try {
    if (!userId.value) {
      error.value = 'User not authenticated'
      profileLoading.value = false
      return
    }
    
    await refreshCompanyProfileId()
    profileLoading.value = false
    await loadJobs()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load jobs')
    profileLoading.value = false
    loading.value = false
  }
})

const createJob = async () => {
  if (createLoading.value) return
  if (!validateCreateForm()) return

  createLoading.value = true
  createError.value = ''
  createSuccess.value = ''
  try {
    const submit = async () => {
      const scopeId = companyProfileId.value || userId.value
      if (!scopeId) throw new Error('Company profile is not ready')
      const payload = {
        company_id: scopeId,
        title: String(createForm.value.title).trim(),
        description: String(createForm.value.description).trim(),
        category: String(createForm.value.category).trim(),
        type: createForm.value.type,
        location_type: createForm.value.location_type,
        salary_min: Number(createForm.value.salary_min || 0),
        salary_max: Number(createForm.value.salary_max || 0)
      }

      if (createForm.value.status) {
        payload.status = createForm.value.status
      }

      const formattedExpiresAt = formatExpiresAt(createForm.value.expires_at)
      if (formattedExpiresAt) {
        payload.expires_at = formattedExpiresAt
      }

      await post('/jobs', payload)
    }

    try {
      await submit()
    } catch (e) {
      const message = e?.data?.error || ''
      const shouldRetry = String(message).toLowerCase().includes('invalid company_id')
      if (!shouldRetry) throw e
      await refreshCompanyProfileId()
      await submit()
    }

    showCreate.value = false
    createForm.value = { title: '', description: '', category: '', type: 'full-time', location_type: 'onsite', salary_min: 0, salary_max: 0, status: 'open', expires_at: '' }
    createSuccess.value = 'Job posted successfully.'
    await loadJobs()
  } catch (e) {
    createError.value = getErrorMessage(e, 'Failed to create job')
  } finally {
    createLoading.value = false
  }
}

const toggleStatus = async (job) => {
  try {
    const next = job.status === 'open' ? 'closed' : 'open'
    await put(`/jobs/${job.id}`, { status: next })
    await loadJobs()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to update status')
  }
}

const removeJob = async (job) => {
  if (deleteConfirmId.value !== job.id) {
    deleteConfirmId.value = job.id
    createSuccess.value = 'Click delete again to confirm removal.'
    return
  }

  try {
    await del(`/jobs/${job.id}`)
    jobs.value = jobs.value.filter((x) => x.id !== job.id)
    deleteConfirmId.value = ''
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to delete job')
  }
}

const toApplicants = (job) => navigateTo(`/company/jobs/${job.id}/applicants`)
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-[28px] font-semibold">Company Jobs</h1>
      <button class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px]" :disabled="profileLoading || loading" @click="showCreate = true">+ Post Job</button>
    </div>

    <p v-if="profileLoading" class="text-[14px] text-[#64748B] mb-4">Loading company profile...</p>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <p v-if="createSuccess" class="text-[14px] text-green-600 mb-4">{{ createSuccess }}</p>

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
          <button class="border border-red-200 text-red-600 rounded-[5px] px-3 py-2 text-[13px]" @click="removeJob(job)">{{ deleteConfirmId === job.id ? 'Confirm Delete' : 'Delete' }}</button>
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
        <p v-if="createError" class="text-[13px] text-red-600">{{ createError }}</p>
        <button :disabled="createLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px] disabled:opacity-50" @click="createJob">{{ createLoading ? 'Creating...' : 'Create Job' }}</button>
      </div>
    </Modal>
  </section>
</template>
