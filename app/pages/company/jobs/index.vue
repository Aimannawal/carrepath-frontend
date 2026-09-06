<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Jobs & Recommendations' })
definePageMeta({ layout: 'company' })

const { get, post, put, del } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const companyProfileId = ref('')

// Tabs
const activeTab = ref('jobs') // 'jobs' or 'bootcamps'

// --- Jobs State ---
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

// --- Recommended Bootcamps State ---
const recommendedBootcamps = ref([])
const allBootcamps = ref([])
const showAddBootcamp = ref(false)
const addBootcampLoading = ref(false)
const addBootcampError = ref('')
const deleteBootcampConfirmId = ref('')

// --- Helper Functions ---
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

const getJobStatusLabel = (status) => {
  if (status === 'open') return 'Open'
  if (status === 'closed') return 'Closed'
  return status || 'Draft'
}

const getJobStatusClasses = (status) => {
  if (status === 'open') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'closed') return 'bg-slate-100 text-slate-700 border-slate-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

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

// --- Data Loading ---
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

const loadRecommendedBootcamps = async () => {
  loading.value = true
  try {
    const scopeId = companyProfileId.value || userId.value
    if (!scopeId) throw new Error('Company profile is not ready')
    const res = await get(`/companies/${scopeId}/recommended-bootcamps`)
    recommendedBootcamps.value = toArray(getData(res))
    error.value = ''
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load recommended bootcamps')
  } finally {
    loading.value = false
  }
}

const loadAllBootcamps = async () => {
  try {
    const res = await get('/bootcamps')
    allBootcamps.value = toArray(getData(res))
  } catch (e) {
    console.error('Failed to load bootcamps:', e)
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
    await loadRecommendedBootcamps()
    await loadAllBootcamps()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load initial data')
    profileLoading.value = false
    loading.value = false
  }
})

// --- Job Actions ---
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

const createJob = async () => {
  if (createLoading.value) return
  if (!validateCreateForm()) return

  createLoading.value = true
  createError.value = ''
  createSuccess.value = ''
  try {
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

    if (createForm.value.status) payload.status = createForm.value.status
    const formattedExpiresAt = formatExpiresAt(createForm.value.expires_at)
    if (formattedExpiresAt) payload.expires_at = formattedExpiresAt

    await post('/jobs', payload)

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
    if (formattedExpiresAt) payload.expires_at = formattedExpiresAt

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

// --- Bootcamp Recommendation Actions ---
const openAddBootcampModal = () => {
  addBootcampError.value = ''
  showAddBootcamp.value = true
}

const addRecommendedBootcamp = async (bootcampId) => {
  if (addBootcampLoading.value) return
  addBootcampLoading.value = true
  addBootcampError.value = ''
  createSuccess.value = ''

  try {
    const scopeId = companyProfileId.value || userId.value
    await post('/companies/recommended-bootcamp', {
      company_id: scopeId,
      bootcamp_id: bootcampId
    })
    showAddBootcamp.value = false
    createSuccess.value = 'Bootcamp recommended successfully.'
    await loadRecommendedBootcamps()
  } catch (e) {
    addBootcampError.value = getErrorMessage(e, 'Failed to add recommended bootcamp')
  } finally {
    addBootcampLoading.value = false
  }
}

const removeRecommendedBootcamp = async (item) => {
  if (deleteBootcampConfirmId.value !== item.id) {
    deleteBootcampConfirmId.value = item.id
    createSuccess.value = 'Click remove again to confirm.'
    return
  }

  try {
    await del(`/companies/recommended-bootcamp/${item.id}`)
    recommendedBootcamps.value = recommendedBootcamps.value.filter((x) => x.id !== item.id)
    deleteBootcampConfirmId.value = ''
    createSuccess.value = 'Bootcamp recommendation removed.'
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to remove bootcamp')
  }
}

</script>

<template>
  <section class="p-6 md:p-8">
    <div class="mb-6 bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p class="text-[13px] uppercase tracking-[0.24em] text-[#64748B]">Company Workspace</p>
          <h1 class="text-[28px] font-semibold mt-2">Manage Jobs & Bootcamps</h1>
          <p class="text-[14px] text-[#64748B] mt-1">Post vacancies and recommend bootcamps to potential applicants.</p>
        </div>
        <div class="flex gap-3">
          <button v-if="activeTab === 'jobs'" class="bg-[color:var(--color-main)] hover:bg-blue-700 text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-50" :disabled="profileLoading || loading" @click="openCreateModal">+ Post Job</button>
          <button v-if="activeTab === 'bootcamps'" class="bg-[color:var(--color-main)] hover:bg-blue-700 text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-50" :disabled="profileLoading || loading" @click="openAddBootcampModal">+ Recommend Bootcamp</button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="flex gap-6 mt-6 border-b border-[#E2E8F0]">
        <button 
          class="pb-3 text-[15px] font-medium transition-colors relative" 
          :class="activeTab === 'jobs' ? 'text-[color:var(--color-main)]' : 'text-[#64748B] hover:text-[#334155]'"
          @click="activeTab = 'jobs'"
        >
          Job Postings
          <div v-if="activeTab === 'jobs'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--color-main)] rounded-t-full"></div>
        </button>
        <button 
          class="pb-3 text-[15px] font-medium transition-colors relative" 
          :class="activeTab === 'bootcamps' ? 'text-[color:var(--color-main)]' : 'text-[#64748B] hover:text-[#334155]'"
          @click="activeTab = 'bootcamps'"
        >
          Recommended Bootcamps
          <div v-if="activeTab === 'bootcamps'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--color-main)] rounded-t-full"></div>
        </button>
      </div>
    </div>

    <p v-if="profileLoading" class="text-[14px] text-[#64748B] mb-4">Loading company profile...</p>
    <p v-if="error" class="text-[14px] text-red-600 mb-4 bg-red-50 p-3 rounded-[8px]">{{ error }}</p>
    <p v-if="createSuccess" class="text-[14px] text-green-600 mb-4 bg-green-50 p-3 rounded-[8px]">{{ createSuccess }}</p>

    <!-- JOBS TAB -->
    <div v-if="activeTab === 'jobs'">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-[110px] bg-white border border-[#E2E8F0] rounded-[18px] animate-pulse"></div>
      </div>
      <div v-else-if="jobs.length" class="space-y-3">
        <div v-for="job in jobs" :key="job.id" class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6 flex flex-col gap-5 shadow-sm hover:shadow-md transition-all duration-200">
          <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-[18px] font-semibold text-[#0F172A]">{{ job.title }}</p>
                <span :class="['text-[12px] px-3 py-1 rounded-full border capitalize', getJobStatusClasses(job.status)]">{{ getJobStatusLabel(job.status) }}</span>
              </div>
              <p class="text-[13px] text-[#64748B]">Created: {{ formatDate(job.created_at || Date.now(), true) }}</p>
              <p class="text-[14px] text-[#475569] line-clamp-2">{{ job.description || 'No description available.' }}</p>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-[12px] text-[#475569] shrink-0 mt-2 md:mt-0">
              <span :class="['flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2 font-medium', getMetaPillClass('type')]">{{ job.type || 'type' }}</span>
              <span :class="['flex items-center justify-center gap-2 rounded-[5px] border px-3 py-2 font-medium', getMetaPillClass('location')]">{{ job.location_type || 'location' }}</span>
              <span :class="['flex items-center justify-center rounded-[5px] border px-3 py-2 font-medium whitespace-nowrap tabular-nums', getMetaPillClass('salaryMin')]">
                <span class="whitespace-nowrap">Rp {{ Number(job.salary_min || 0).toLocaleString('id-ID') }}</span>
              </span>
              <span :class="['flex items-center justify-center rounded-[5px] border px-3 py-2 font-medium whitespace-nowrap tabular-nums', getMetaPillClass('salaryMax')]">
                <span class="whitespace-nowrap">Rp {{ Number(job.salary_max || 0).toLocaleString('id-ID') }}</span>
              </span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button class="rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition hover:border-[color:var(--color-main)] hover:text-[color:var(--color-main)]" @click="openEditModal(job)">Edit</button>
            <button class="rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition hover:border-[color:var(--color-main)] hover:text-[color:var(--color-main)]" @click="toggleStatus(job)">{{ job.status === 'open' ? 'Tutup Lowongan' : 'Buka Lowongan' }}</button>
            <button class="rounded-[5px] border border-[color:var(--color-main)] bg-[color:var(--color-main)] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-blue-700" @click="toApplicants(job)">Lihat Pelamar</button>
            <button class="rounded-[5px] border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition hover:bg-red-50" @click="removeJob(job)">{{ deleteConfirmId === job.id ? 'Confirm Delete' : 'Delete' }}</button>
          </div>
        </div>
      </div>
      <div v-else class="bg-white border border-[#E2E8F0] rounded-[16px] p-10 text-center">
        <Icon name="heroicons:briefcase" class="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
        <p class="text-[16px] font-medium text-[#334155]">Belum ada lowongan pekerjaan</p>
        <p class="text-[14px] text-[#64748B] mt-1">Klik "+ Post Job" untuk membuat lowongan pertama Anda.</p>
      </div>
    </div>

    <!-- BOOTCAMPS TAB -->
    <div v-if="activeTab === 'bootcamps'">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-[90px] bg-white border border-[#E2E8F0] rounded-[18px] animate-pulse"></div>
      </div>
      <div v-else-if="recommendedBootcamps.length" class="space-y-3">
        <div v-for="item in recommendedBootcamps" :key="item.id" class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm flex items-center justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
                <div class="w-12 h-12 bg-white flex items-center justify-center flex-shrink-0 border border-[#E2E8F0] p-1">
                  <img v-if="item.bootcamps?.provider_profiles?.logo_url" :src="item.bootcamps.provider_profiles.logo_url" class="w-full h-full object-cover" />
                  <Icon v-else name="mdi:domain" class="w-6 h-6 text-[#94A3B8]" />
                </div>
            <div class="min-w-0">
              <h3 class="text-[16px] font-semibold text-[#0F172A] truncate">{{ item.bootcamps?.title || 'Unknown Bootcamp' }}</h3>
              <p class="text-[13px] text-[#64748B] truncate">{{ item.bootcamps?.provider_profiles?.provider_name || 'Unknown Provider' }} • {{ item.bootcamps?.level || 'All' }}</p>
            </div>
          </div>
          <div class="flex flex-shrink-0 gap-2">
            <NuxtLink :to="`/company/bootcamps/${item.bootcamp_id}`" class="flex-shrink-0 rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition hover:border-[#3B82F6] hover:text-[#3B82F6]">
              Detail
            </NuxtLink>
            <button class="flex-shrink-0 rounded-[5px] border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition hover:bg-red-50" @click="removeRecommendedBootcamp(item)">
              {{ deleteBootcampConfirmId === item.id ? 'Confirm Remove' : 'Remove' }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="bg-white border border-[#E2E8F0] rounded-[16px] p-10 text-center">
        <Icon name="heroicons:academic-cap" class="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
        <p class="text-[16px] font-medium text-[#334155]">Belum ada bootcamp yang direkomendasikan</p>
        <p class="text-[14px] text-[#64748B] mt-1">Klik "+ Recommend Bootcamp" untuk menambahkan bootcamp.</p>
      </div>
    </div>

    <!-- Modals -->
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

    <!-- Add Bootcamp Recommendation Modal -->
    <Modal :open="showAddBootcamp" title="Recommend Bootcamp" @close="showAddBootcamp = false">
      <div class="space-y-4">
        <p class="text-[14px] text-[#475569]">Select a bootcamp from our partners to recommend to your applicants.</p>
        <div class="max-h-[300px] overflow-y-auto space-y-2 pr-1 border border-[#E2E8F0] rounded-[8px] p-2 bg-[#F8FAFC]">
          <div 
            v-for="bc in allBootcamps" 
            :key="bc.id"
            class="flex items-center justify-between p-3 rounded-[8px] bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] transition"
          >
            <div class="min-w-0 pr-3">
              <p class="text-[14px] font-semibold text-[#1E293B] truncate">{{ bc.title }}</p>
              <p class="text-[12px] text-[#64748B]">{{ bc.provider_profiles?.provider_name || 'Unknown Provider' }}</p>
            </div>
            <div class="flex gap-2 shrink-0">
              <a 
                :href="`/company/bootcamps/${bc.id}`"
                target="_blank"
                class="flex-shrink-0 border border-[#CBD5E1] text-[#334155] hover:border-[#3B82F6] hover:text-[#3B82F6] px-3 py-1.5 rounded-[5px] text-[12px] font-medium transition flex items-center justify-center"
              >
                Detail
              </a>
              <button 
                class="flex-shrink-0 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] px-3 py-1.5 rounded-[5px] text-[12px] font-medium transition"
                @click="addRecommendedBootcamp(bc.id)"
                :disabled="addBootcampLoading"
              >
                Select
              </button>
            </div>
          </div>
          <p v-if="!allBootcamps.length" class="text-center text-[13px] text-[#64748B] py-4">No bootcamps available.</p>
        </div>
        <p v-if="addBootcampError" class="text-[13px] text-red-600">{{ addBootcampError }}</p>
      </div>
    </Modal>
  </section>
</template>
