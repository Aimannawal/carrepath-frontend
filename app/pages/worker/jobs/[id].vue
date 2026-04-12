<script setup>
import { ref, computed, onMounted } from 'vue'

useHead({ title: 'CarrePath | Job Detail' })
definePageMeta({ layout: 'worker' })

const route = useRoute()
const { get, post } = useApi()
const { getData, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const { uploadPdfCv, uploadError, uploading, clearUploadState } = useFileUpload()

const loading = ref(true)
const error = ref('')
const job = ref(null)
const company = ref(null)
const openApply = ref(false)
const applyLoading = ref(false)
const uploadWarning = ref('')
const uploadedCvName = ref('')
const formError = ref('')
const formSuccess = ref('')
const coverLetter = ref('')
const cvUrl = ref('')
const cvFile = ref(null)
const workerProfileId = ref('')

const resolvedCompanyName = computed(() => {
  return company.value?.company_name || job.value?.company_profiles?.company_name || job.value?.company_name || 'Company Name'
})

const resolvedCompanyId = computed(() => {
  return (
    company.value?.id ||
    company.value?.company_id ||
    job.value?.company_profiles?.id ||
    job.value?.company_id ||
    ''
  )
})

/**
 * Computed - format salary display safely
 */
const salaryDisplay = computed(() => {
  if (!job.value) return 'Loading...'
  const min = job.value.salary_min
  const max = job.value.salary_max
  
  if (!min && !max) return 'Negotiable'
  const minText = min ? `Rp ${Number(min).toLocaleString('id-ID')}` : '-'
  const maxText = max ? `Rp ${Number(max).toLocaleString('id-ID')}` : '-'
  return `${minText} - ${maxText}`
})

/**
 * Computed - check if job/company data ready for rendering
 */
const isJobReady = computed(() => {
  return !loading.value && !error.value && job.value && job.value.id
})

const handleCvChange = (event) => {
  const file = event.target.files?.[0]
  clearUploadState()
  uploadWarning.value = ''
  formError.value = ''
  formSuccess.value = ''
  cvUrl.value = ''
  
  if (!file) {
    cvFile.value = null
    uploadedCvName.value = ''
    return
  }
  
  if (file.type !== 'application/pdf') {
    uploadError.value = 'Only PDF files are allowed.'
    cvFile.value = null
    uploadedCvName.value = ''
    event.target.value = ''
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'CV PDF max size is 5MB.'
    cvFile.value = null
    uploadedCvName.value = ''
    event.target.value = ''
    return
  }
  
  cvFile.value = file
  uploadedCvName.value = file.name
}

const uploadCvPdf = async () => {
  if (uploading.value) return false
  if (!cvFile.value) {
    return false
  }
  if (!userId.value) {
    uploadError.value = 'Missing worker id.'
    return false
  }

  clearUploadState()
  uploadWarning.value = ''
  const scopeId = workerProfileId.value || userId.value
  const result = await uploadPdfCv(cvFile.value, scopeId)

  if (!result?.publicUrl) {
    return false
  }

  cvUrl.value = result.publicUrl
  if (result.warning) {
    uploadWarning.value = result.warning
  }

  return true
}

const submitApply = async () => {
  if (applyLoading.value || uploading.value) return
  if (!job.value?.id) {
    formError.value = 'Job information not ready'
    return
  }
  
  formError.value = ''
  formSuccess.value = ''

  // Upload CV if worker selected a file
  if (!cvUrl.value && cvFile.value) {
    const uploaded = await uploadCvPdf()
    if (!uploaded) return
  }

  applyLoading.value = true
  try {
    await post('/applications', {
      job_id: job.value.id,
      worker_id: userId.value,
      cv_url: cvUrl.value || '',
      cover_letter: coverLetter.value || ''
    })
    
    openApply.value = false
    coverLetter.value = ''
    cvUrl.value = ''
    cvFile.value = null
    uploadedCvName.value = ''
    formSuccess.value = 'Application sent successfully.'
    
    // Reset after 3 seconds
    setTimeout(() => {
      formSuccess.value = ''
    }, 3000)
  } catch (e) {
    formError.value = getErrorMessage(e, 'Failed to apply')
  } finally {
    applyLoading.value = false
  }
}

const saveJob = async () => {
  if (!userId.value || !job.value?.id) {
    formError.value = 'Worker or job information not ready'
    return
  }
  
  formError.value = ''
  formSuccess.value = ''
  
  try {
    const payload = {
      worker_id: userId.value,
      job_id: String(job.value.id)
    }

    const res = await post('/saved/company', payload)
    const message = String(res?.message || '').toLowerCase()
    
    if (message.includes('already saved')) {
      formSuccess.value = 'Job already saved.'
    } else {
      formSuccess.value = 'Job saved successfully.'
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      formSuccess.value = ''
    }, 3000)
  } catch (e) {
    const errMsg = getErrorMessage(e, 'Failed to save job')
    // Handle idempotent case - "already saved" is success
    if (errMsg.toLowerCase().includes('already saved')) {
      formSuccess.value = 'Job already saved.'
      setTimeout(() => {
        formSuccess.value = ''
      }, 2000)
    } else {
      formError.value = errMsg
    }
  }
}

const fetchJobDetail = async () => {
  loading.value = true
  error.value = ''

  if (!route.params.id) {
    error.value = 'Job id is missing'
    loading.value = false
    return
  }
  
  try {
    // First fetch worker profile for workerProfileId
    try {
      const profileRes = await get(`/workers/profile/${userId.value}`)
      const payloadProfile = asObject(getData(profileRes))
      const profile = asObject(payloadProfile.profile || payloadProfile)
      workerProfileId.value = profile.id || profile.worker_profile_id || ''
    } catch (profileErr) {
      // Profile fetch failure is not critical
      console.warn('Failed to fetch worker profile:', profileErr)
      workerProfileId.value = ''
    }

    // Fetch job detail
    const res = await get(`/jobs/${String(route.params.id)}`)
    const payload = asObject(getData(res))
    
    if (!payload || !payload.id) {
      error.value = 'Job not found'
      return
    }
    
    job.value = payload
    company.value = payload.company_profiles || payload.company || null
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load job detail')
    job.value = null
    company.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchJobDetail()
})
</script>

<template>
  <section class="p-6 md:p-8">
    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-[10px] p-4">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- Loading Skeleton State -->
    <div v-else-if="loading" class="space-y-6">
      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 space-y-3">
        <div class="h-8 bg-[#F1F5F9] rounded-[5px] w-2/3 animate-pulse"></div>
        <div class="h-5 bg-[#F1F5F9] rounded-[5px] w-1/4 animate-pulse"></div>
        <div class="flex gap-2 mt-4">
          <div class="h-6 bg-[#F1F5F9] rounded-full w-20 animate-pulse"></div>
          <div class="h-6 bg-[#F1F5F9] rounded-full w-20 animate-pulse"></div>
        </div>
        <div class="h-24 bg-[#F1F5F9] rounded-[5px] mt-4 animate-pulse"></div>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 h-32 animate-pulse"></div>
    </div>

    <!-- Success Messages -->
    <div v-if="formSuccess" class="mb-4 bg-green-50 border border-green-200 rounded-[10px] p-4">
      <p class="text-green-700">{{ formSuccess }}</p>
    </div>

    <!-- Error Messages (from form submits, not page load) -->
    <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 rounded-[10px] p-4">
      <p class="text-red-700">{{ formError }}</p>
    </div>

    <!-- Job Detail Content - Only render when job is ready -->
    <div v-if="isJobReady" class="space-y-6">
      <!-- Job Header -->
      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-6">
        <h1 class="text-[30px] font-semibold">{{ job.title }}</h1>
        <p class="text-[15px] text-[#64748B] mt-2">{{ resolvedCompanyName }}</p>
        
        <!-- Job Tags -->
        <div class="flex flex-wrap gap-2 mt-4">
          <span v-if="job.location_type" class="text-[12px] px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
            {{ job.location_type }}
          </span>
          <span v-if="job.type" class="text-[12px] px-3 py-1 rounded-full bg-[#F1F5F9] text-[#334155]">
            {{ job.type }}
          </span>
          <span v-if="job.category" class="text-[12px] px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA]">
            {{ job.category }}
          </span>
        </div>

        <!-- Salary -->
        <p class="text-[15px] mt-4 text-[#334155] font-medium">Salary: {{ salaryDisplay }}</p>

        <!-- Description -->
        <p class="text-[14px] text-[#475569] mt-4 whitespace-pre-line leading-relaxed">
          {{ job.description || 'No description available.' }}
        </p>

        <!-- Action Buttons -->
        <div class="flex gap-3 mt-6">
          <button
            class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 font-medium hover:opacity-90 transition-opacity"
            @click="openApply = true"
          >
            Apply Now
          </button>
          <button
            class="border border-[#CBD5E1] rounded-[5px] px-5 py-2.5 font-medium text-[#334155] hover:bg-[#F8FAFC] transition-colors"
            @click="saveJob"
          >
            Save Job
          </button>
        </div>
      </div>

      <!-- Company Info -->
      <div v-if="company" class="bg-white border border-[#E2E8F0] rounded-[10px] p-6">
        <h2 class="text-[20px] font-semibold">About Company</h2>
        <p class="text-[14px] text-[#64748B] mt-3">
          {{ company.description || 'No company description available.' }}
        </p>
      </div>
    </div>

    <div v-else-if="!loading && !error" class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 text-[14px] text-[#64748B]">
      Job detail is not available.
    </div>

    <!-- Apply Modal -->
    <Modal :open="openApply" title="Apply to Job" @close="openApply = false">
      <div class="space-y-4">
        <!-- CV Upload Section -->
        <div>
          <label class="text-[14px] font-medium text-[#1E293B]">Upload CV PDF</label>
          <input
            type="file"
            accept="application/pdf"
            class="mt-2 w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] file:mr-3 file:rounded-[3px] file:border-0 file:text-[13px] file:font-medium file:bg-[#EEF2FF] file:text-[#4338CA]"
            @change="handleCvChange"
          />
          <p class="mt-2 text-[12px] text-[#64748B]">Only PDF format. Max 5MB.</p>
          
          <!-- File validation feedback -->
          <p v-if="uploadError" class="mt-2 text-[13px] text-red-600">{{ uploadError }}</p>
          <p v-if="uploadWarning" class="mt-2 text-[13px] text-amber-700">{{ uploadWarning }}</p>
          <p v-else-if="uploadedCvName" class="mt-2 text-[13px] text-green-600">✓ Selected: {{ uploadedCvName }}</p>
          <p v-else-if="cvUrl" class="mt-2 text-[13px] text-green-600">✓ CV ready to submit</p>
        </div>

        <!-- Cover Letter Section -->
        <div>
          <label class="text-[14px] font-medium text-[#1E293B]">Cover Letter (Optional)</label>
          <textarea
            v-model="coverLetter"
            rows="5"
            placeholder="Tell the employer why you're a great fit..."
            class="mt-2 w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          :disabled="applyLoading || uploading"
          class="w-full bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          @click="submitApply"
        >
          {{ applyLoading || uploading ? 'Sending...' : 'Submit Application' }}
        </button>
      </div>
    </Modal>
  </section>
</template>
