<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Jobs' })
definePageMeta({ layout: 'company' })

const { get, post, put, del } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const companyProfileId = ref('')
const jobs = ref([])

const buildCreateForm = () => ({
  title: '',
  description: '',
  category: '',
  type: 'full-time',
  location_type: 'onsite',
  salary_min: 0,
  salary_max: 0,
  status: 'open',
  expires_at: new Date().toISOString()
})

const showCreate = ref(false)
const createForm = ref(buildCreateForm())
const showEdit = ref(false)
const editingJobId = ref('')
const editForm = ref(buildCreateForm())

const loading = ref(true)
const profileLoading = ref(true)
const error = ref('')
const createLoading = ref(false)
const createError = ref('')
const createSuccess = ref('')
const editLoading = ref(false)
const editError = ref('')
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

const openCreateModal = () => {
  createForm.value = buildCreateForm()
  showCreate.value = true
}

const openEditModal = (job) => {
  editingJobId.value = String(job?.id || '')
  editForm.value = {
    title: String(job?.title || ''),
    description: String(job?.description || ''),
    category: String(job?.category || ''),
    type: String(job?.type || 'full-time'),
    location_type: String(job?.location_type || 'onsite'),
    salary_min: Number(job?.salary_min || 0),
    salary_max: Number(job?.salary_max || 0),
    status: String(job?.status || 'open'),
    expires_at: formatExpiresAt(job?.expires_at || new Date().toISOString()) || new Date().toISOString()
  }
  editError.value = ''
  showEdit.value = true
}

const getJobStatusLabel = (status) => {
  if (status === 'open') return 'Open'
  if (status === 'closed') return 'Closed'
  return status || 'Draft'
}

const getJobStatusClasses = (status) => {
  if (status === 'open') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_10px_25px_rgba(16,185,129,0.12)]'
  }
  if (status === 'closed') {
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

const getJobCardClasses = (job) => [
  'rounded-[18px] border p-5 md:p-6 flex flex-col gap-5 transition-shadow shadow-[0_10px_24px_rgba(15,23,42,0.04)]',
  job.status === 'open' ? 'bg-gradient-to-br from-white to-emerald-50/40 border-emerald-100' : 'bg-white border-[#E2E8F0]'
]

const getMetaPillClass = (variant) => {
  const variants = {
    type: 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]',
    location: 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]',
    salaryMin: 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]',
    salaryMax: 'bg-[#F8FAFC] text-[#334155] border-[#E2E8F0]'
  }

  return variants[variant] || 'bg-slate-50 text-slate-700 border-slate-100'
}

const validateJobForm = (formValue, setError) => {
  const required = ['title', 'description', 'category', 'type', 'location_type']
  const missing = required.find((key) => !String(formValue?.[key] || '').trim())
  if (missing) {
    setError(`${missing.replace('_', ' ')} is required.`)
    return false
  }

  const min = Number(formValue?.salary_min || 0)
  const max = Number(formValue?.salary_max || 0)
  if (min < 0 || max < 0) {
    setError('Salary cannot be negative.')
    return false
  }
  if (min > max) {
    setError('Salary min must be less than or equal to salary max.')
    return false
  }

  if (formValue?.expires_at && !formatExpiresAt(formValue.expires_at)) {
    setError('Invalid expires_at format. Use valid date format.')
    return false
  }

  return true
}

const validateCreateForm = () => validateJobForm(createForm.value, (msg) => { createError.value = msg })
const validateEditForm = () => validateJobForm(editForm.value, (msg) => { editError.value = msg })

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
  const payload = asObject(getData(profileRes))
  const profile = asObject(payload.profile || payload)
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
    createForm.value = buildCreateForm()
    createSuccess.value = 'Job posted successfully.'
    await loadJobs()
  } catch (e) {
    createError.value = getErrorMessage(e, 'Failed to create job')
  } finally {
    createLoading.value = false
  }
}

const updateJob = async () => {
  if (editLoading.value) return
  if (!editingJobId.value) {
    editError.value = 'Job id is missing.'
    return
  }

  if (!validateEditForm()) return

  editLoading.value = true
  editError.value = ''
  createSuccess.value = ''

  try {
    const payload = {
      title: String(editForm.value.title).trim(),
      description: String(editForm.value.description).trim(),
      category: String(editForm.value.category).trim(),
      type: editForm.value.type,
      location_type: editForm.value.location_type,
      salary_min: Number(editForm.value.salary_min || 0),
      salary_max: Number(editForm.value.salary_max || 0),
      status: editForm.value.status || 'open'
    }

    const formattedExpiresAt = formatExpiresAt(editForm.value.expires_at)
    if (formattedExpiresAt) {
      payload.expires_at = formattedExpiresAt
    }

    await put(`/jobs/${editingJobId.value}`, payload)
    showEdit.value = false
    editingJobId.value = ''
    createSuccess.value = 'Job updated successfully.'
    await loadJobs()
  } catch (e) {
    editError.value = getErrorMessage(e, 'Failed to update job')
  } finally {
    editLoading.value = false
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
    <div class="mb-5 rounded-[24px] border border-[#E2E8F0] bg-gradient-to-r from-white via-[#F8FAFC] to-[#EFF6FF] p-5 md:p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-[13px] uppercase tracking-[0.24em] text-[#64748B]">Company Jobs</p>
          <h1 class="text-[28px] font-semibold mt-2">Manage active openings</h1>
          <p class="text-[14px] text-[#64748B] mt-1">Post a vacancy, track its status, and review applicants in a cleaner layout.</p>
        </div>
        <button class="bg-[color:var(--color-main)] text-white rounded-full px-5 py-3 text-[14px] font-medium shadow-[0_12px_24px_rgba(29,78,216,0.18)] disabled:opacity-50" :disabled="profileLoading || loading" @click="openCreateModal">+ Post Job</button>
      </div>
    </div>

    <p v-if="profileLoading" class="text-[14px] text-[#64748B] mb-4">Loading company profile...</p>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <p v-if="createSuccess" class="text-[14px] text-green-600 mb-4">{{ createSuccess }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-[110px] bg-white border border-[#E2E8F0] rounded-[18px] animate-pulse"></div>
    </div>
    <div v-else class="space-y-3">
      <div v-for="job in jobs" :key="job.id" :class="getJobCardClasses(job)">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[18px] font-semibold text-[#0F172A]">{{ job.title }}</p>
              <span :class="['text-[12px] px-3 py-1 rounded-full border capitalize', getJobStatusClasses(job.status)]">{{ getJobStatusLabel(job.status) }}</span>
            </div>
            <p class="text-[13px] text-[#64748B]">Created: {{ new Date(job.created_at || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) }}</p>
            <p class="text-[14px] text-[#475569] line-clamp-2">{{ job.description || 'No description available.' }}</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] text-[#475569]">
            <span :class="['flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2 font-medium', getMetaPillClass('type')]">
              {{ job.type || 'type' }}
            </span>
            <span :class="['flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2 font-medium', getMetaPillClass('location')]">
              {{ job.location_type || 'location' }}
            </span>
            <span :class="['flex items-center justify-center rounded-[5px] border px-3 py-2 font-medium whitespace-nowrap tabular-nums', getMetaPillClass('salaryMin')]">
              <span class="whitespace-nowrap">Rp {{ Number(job.salary_min || 0).toLocaleString('id-ID') }}</span>
            </span>
            <span :class="['flex items-center justify-center rounded-[5px] border px-3 py-2 font-medium whitespace-nowrap tabular-nums', getMetaPillClass('salaryMax')]">
              <span class="whitespace-nowrap">Rp {{ Number(job.salary_max || 0).toLocaleString('id-ID') }}</span>
            </span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition duration-150 hover:-translate-y-[1px] hover:border-[color:var(--color-main)] hover:text-[color:var(--color-main)]" @click="openEditModal(job)">
            Edit
          </button>
          <button class="rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] shadow-sm transition duration-150 hover:-translate-y-[1px] hover:border-[color:var(--color-main)] hover:text-[color:var(--color-main)]" @click="toggleStatus(job)">
            {{ job.status === 'open' ? 'Tutup Lowongan' : 'Buka Lowongan' }}
          </button>
          <button class="rounded-[5px] border border-[color:var(--color-main)] bg-[color:var(--color-main)] px-4 py-2 text-[13px] font-medium text-white shadow-[0_10px_22px_rgba(29,78,216,0.16)] transition duration-150 hover:-translate-y-[1px]" @click="toApplicants(job)">Lihat Pelamar</button>
          <button class="rounded-[5px] border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition duration-150 hover:-translate-y-[1px] hover:bg-red-50" @click="removeJob(job)">{{ deleteConfirmId === job.id ? 'Confirm Delete' : 'Delete' }}</button>
        </div>
      </div>
    </div>

    <Modal :open="showCreate" title="Post New Job" @close="showCreate = false">
      <div class="space-y-3">
        <input v-model="createForm.title" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Job title" />
        <textarea v-model="createForm.description" rows="4" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Description"></textarea>
        <input v-model="createForm.category" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Category" />
        <input v-model="createForm.expires_at" type="hidden" />
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
        <p v-if="createError" class="text-[13px] text-red-600">{{ createError }}</p>
        <button :disabled="createLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px] disabled:opacity-50" @click="createJob">{{ createLoading ? 'Creating...' : 'Create Job' }}</button>
      </div>
    </Modal>

    <Modal :open="showEdit" title="Edit Job" @close="showEdit = false">
      <div class="space-y-3">
        <input v-model="editForm.title" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Job title" />
        <textarea v-model="editForm.description" rows="4" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Description"></textarea>
        <input v-model="editForm.category" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Category" />
        <input v-model="editForm.expires_at" type="hidden" />
        <div class="grid grid-cols-2 gap-3">
          <select v-model="editForm.type" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
            <option value="full-time">full-time</option>
            <option value="part-time">part-time</option>
            <option value="internship">internship</option>
            <option value="contract">contract</option>
          </select>
          <select v-model="editForm.location_type" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
            <option value="onsite">onsite</option>
            <option value="remote">remote</option>
            <option value="hybrid">hybrid</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <input v-model.number="editForm.salary_min" type="number" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Salary min" />
          <input v-model.number="editForm.salary_max" type="number" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Salary max" />
        </div>
        <select v-model="editForm.status" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
          <option value="open">open</option>
          <option value="closed">closed</option>
          <option value="draft">draft</option>
        </select>
        <p v-if="editError" class="text-[13px] text-red-600">{{ editError }}</p>
        <button :disabled="editLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px] disabled:opacity-50" @click="updateJob">{{ editLoading ? 'Updating...' : 'Save Changes' }}</button>
      </div>
    </Modal>
  </section>
</template>
