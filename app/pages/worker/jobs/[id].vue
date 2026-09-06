<script setup>
import { ref, computed, onMounted } from 'vue'

useHead({ title: 'CarrePath | Job Detail' })
definePageMeta({ layout: 'worker' })

const route = useRoute()
const { get, post, del } = useApi()
const { getData, asObject, toArray, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const { uploadPdfCv, uploadError, uploading, clearUploadState } = useFileUpload()

const loading = ref(true)
const error = ref('')
const job = ref(null)
const company = ref(null)
const companyJobs = ref([])
const isSaved = ref(false)
const savedJobId = ref('')
const recommendedBootcamps = ref([])
const saveLoading = ref(false)
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

const companyLogo = computed(() => {
  return company.value?.logo_url || company.value?.photo_url || job.value?.company_profiles?.logo_url || ''
})

const companyInitial = computed(() => {
  return (resolvedCompanyName.value || '?')[0].toUpperCase()
})

const isPremiumCompany = computed(() => {
  if (!company.value) return false
  return Boolean(company.value.is_premium || company.value.premium_active || company.value.premium_until)
})

const companyDescription = computed(() => {
  return company.value?.description || job.value?.company_profiles?.description || ''
})

const companyCategory = computed(() => {
  return company.value?.category || job.value?.company_profiles?.category || ''
})

const companyAddress = computed(() => {
  return company.value?.address || job.value?.company_profiles?.address || ''
})

const companyEmail = computed(() => {
  return company.value?.company_email || job.value?.company_profiles?.company_email || ''
})

const otherJobs = computed(() => {
  if (!job.value?.id) return companyJobs.value
  return companyJobs.value.filter(j => j.id !== job.value.id).slice(0, 4)
})

const salaryDisplay = computed(() => {
  if (!job.value) return 'Loading...'
  const min = job.value.salary_min
  const max = job.value.salary_max
  if (!min && !max) return 'Negotiable'
  const minText = min ? `Rp ${Number(min).toLocaleString('id-ID')}` : '-'
  const maxText = max ? `Rp ${Number(max).toLocaleString('id-ID')}` : '-'
  return `${minText} - ${maxText}`
})

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
  if (!userId.value || !job.value?.id || saveLoading.value) {
    return
  }
  
  formError.value = ''
  formSuccess.value = ''
  saveLoading.value = true
  
  try {
    if (isSaved.value && savedJobId.value) {
      // Unsave
      await del(`/saved/company/${savedJobId.value}`)
      isSaved.value = false
      savedJobId.value = ''
      formSuccess.value = 'Job removed from saved list.'
    } else {
      // Save
      const payload = {
        worker_id: userId.value,
        job_id: String(job.value.id)
      }
      const res = await post('/saved/company', payload)
      
      const message = String(res?.message || '').toLowerCase()
      if (message.includes('already saved')) {
        formSuccess.value = 'Job already saved.'
        isSaved.value = true
      } else {
        formSuccess.value = 'Job saved successfully.'
        isSaved.value = true
        // Assuming the response returns the new saved record in data
        const first = toArray(getData(res))[0]
        if (first?.id) {
          savedJobId.value = first.id
        }
      }
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      formSuccess.value = ''
    }, 3000)
  } catch (e) {
    const errMsg = getErrorMessage(e, 'Failed to update saved job')
    if (errMsg.toLowerCase().includes('already saved')) {
      formSuccess.value = 'Job already saved.'
      isSaved.value = true
      setTimeout(() => {
        formSuccess.value = ''
      }, 2000)
    } else {
      formError.value = errMsg
    }
  } finally {
    saveLoading.value = false
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

    // Fetch other jobs from same company
    const compId = company.value?.id || payload.company_id
    if (compId) {
      try {
        const compJobsRes = await get(`/companies/${compId}/jobs`)
        companyJobs.value = toArray(getData(compJobsRes))
      } catch {
        companyJobs.value = []
      }
      
      // Fetch recommended bootcamps
      try {
        const recommendedRes = await get(`/companies/${compId}/recommended-bootcamps`)
        recommendedBootcamps.value = toArray(getData(recommendedRes))
      } catch {
        recommendedBootcamps.value = []
      }
    }

    // Check if this job is saved
    try {
      const savedRes = await get(`/saved/jobs/${userId.value}`)
      const savedJobs = toArray(getData(savedRes))
      const savedMatch = savedJobs.find(s => String(s?.id) === String(job.value.id))
      if (savedMatch) {
        isSaved.value = true
        savedJobId.value = savedMatch.saved_id
      }
    } catch {
      // Ignore error for saved jobs fetch
    }
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load job detail')
    job.value = null
    company.value = null
  } finally {
    loading.value = false
  }
}

const goToJob = (jobItem) => {
  navigateTo(`/worker/jobs/${jobItem.id}`)
}

onMounted(() => {
  fetchJobDetail()
})
</script>

<template>
  <section class="p-4 md:p-6 lg:p-8">
    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-[14px] p-5">
      <p class="text-red-700 text-[14px]">{{ error }}</p>
    </div>

    <!-- Loading Skeleton State -->
    <div v-else-if="loading" class="space-y-6">
      <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4">
        <div class="flex items-start gap-5">
          <div class="w-16 h-16 bg-[#F1F5F9] rounded-[12px] animate-pulse"></div>
          <div class="flex-1 space-y-3">
            <div class="h-8 bg-[#F1F5F9] rounded-[8px] w-2/3 animate-pulse"></div>
            <div class="h-5 bg-[#F1F5F9] rounded-[8px] w-1/3 animate-pulse"></div>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <div class="h-7 bg-[#F1F5F9] rounded-full w-24 animate-pulse"></div>
          <div class="h-7 bg-[#F1F5F9] rounded-full w-24 animate-pulse"></div>
        </div>
        <div class="h-32 bg-[#F1F5F9] rounded-[8px] mt-4 animate-pulse"></div>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-6 h-40 animate-pulse"></div>
    </div>

    <!-- Success Messages -->
    <div v-if="formSuccess" class="mb-4 bg-green-50 border border-green-200 rounded-[14px] p-4">
      <p class="text-green-700 text-[14px]">{{ formSuccess }}</p>
    </div>

    <!-- Error Messages (from form submits, not page load) -->
    <div v-if="formError" class="mb-4 bg-red-50 border border-red-200 rounded-[14px] p-4">
      <p class="text-red-700 text-[14px]">{{ formError }}</p>
    </div>

    <!-- Job Detail Content -->
    <div v-if="isJobReady" class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      <!-- ═══ LEFT COLUMN: Job Detail ═══ -->
      <div class="lg:col-span-2 space-y-6 lg:sticky lg:top-8 lg:self-start">

        <!-- Job Header Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-6">
          <div class="flex items-start gap-5">
            <!-- Company Logo -->
            <div class="flex-shrink-0 w-16 h-16 overflow-hidden flex items-center justify-center">
              <img v-if="companyLogo" :src="companyLogo" :alt="resolvedCompanyName" class="w-full h-full object-cover" />
              <span v-else class="text-[24px] font-bold text-[color:var(--color-main)] bg-[#F1F5F9] w-full h-full flex items-center justify-center rounded-[4px]">{{ companyInitial }}</span>
            </div>
            <!-- Job Title & Company -->
            <div class="flex-1 min-w-0">
              <h1 class="text-[26px] font-bold text-[#0F172A] leading-tight">{{ job.title }}</h1>
              <div class="flex items-center gap-2 mt-2">
                <p class="text-[15px] text-[#64748B] font-medium">{{ resolvedCompanyName }}</p>
                <span v-if="isPremiumCompany" class="text-[10px] bg-[#DBEAFE] text-[#1D4ED8] px-2.5 py-0.5 rounded-sm font-bold tracking-wide">Recommended Company</span>
              </div>
            </div>
          </div>

          <!-- Job Tags -->
          <div class="flex flex-wrap gap-2 mt-5">
            <span v-if="job.location_type" class="text-[12px] px-3.5 py-1.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium">
              {{ job.location_type }}
            </span>
            <span v-if="job.type" class="text-[12px] px-3.5 py-1.5 rounded-full bg-[#F0FDF4] text-[#16A34A] font-medium">
              {{ job.type }}
            </span>
            <span v-if="job.category" class="text-[12px] px-3.5 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] font-medium">
              {{ job.category }}
            </span>
          </div>

          <!-- Salary -->
          <div class="mt-5 flex items-center gap-2">
            <Icon name="heroicons:banknotes" class="w-5 h-5 text-[#16A34A]" />
            <p class="text-[15px] text-[#0F172A] font-semibold">{{ salaryDisplay }}</p>
          </div>

          <!-- Description -->
          <div class="mt-6 pt-6 border-t border-[#F1F5F9]">
            <h3 class="text-[16px] font-semibold text-[#0F172A] mb-3">Job Description</h3>
            <p class="text-[14px] text-[#475569] whitespace-pre-line leading-[1.8]">
              {{ job.description || 'No description available.' }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mt-6 pt-6 border-t border-[#F1F5F9]">
            <button
              class="flex-1 sm:flex-none bg-[color:var(--color-main)] text-white rounded-[10px] px-6 py-3 font-semibold text-[14px] hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              @click="openApply = true"
            >
              <Icon name="heroicons:paper-airplane" class="w-4 h-4" />
              Apply Now
            </button>
            <button
              class="flex-1 sm:flex-none border-2 rounded-[10px] px-6 py-3 font-semibold text-[14px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              :class="isSaved ? 'border-[color:var(--color-main)] bg-[#EEF2FF] text-[color:var(--color-main)]' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'"
              :disabled="saveLoading"
              @click="saveJob"
            >
              <Icon :name="isSaved ? 'heroicons:bookmark-solid' : 'heroicons:bookmark'" class="w-4 h-4" />
              {{ isSaved ? 'Saved' : 'Save Job' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT COLUMN: Company Info ═══ -->
      <div class="space-y-6">

        <!-- Company Card -->
        <div v-if="company" class="bg-white border border-[#E2E8F0] rounded-[16px] p-6">
          <!-- Company Header -->
          <div class="flex items-center gap-4 mb-5">
            <div class="flex-shrink-0 w-14 h-14 overflow-hidden flex items-center justify-center">
              <img v-if="companyLogo" :src="companyLogo" :alt="resolvedCompanyName" class="w-full h-full object-cover" />
              <span v-else class="text-[20px] font-bold text-[color:var(--color-main)] bg-[#F1F5F9] w-full h-full flex items-center justify-center rounded-[4px]">{{ companyInitial }}</span>
            </div>
            <div class="min-w-0">
              <h2 class="text-[16px] font-bold text-[#0F172A] truncate">{{ resolvedCompanyName }}</h2>
              <p v-if="companyCategory" class="text-[12px] text-[#64748B] mt-0.5">{{ companyCategory }}</p>
              <span v-if="isPremiumCompany" class="inline-flex mt-1 text-[10px] bg-[#DBEAFE] text-[#1D4ED8] px-2.5 py-0.5 rounded-sm font-bold tracking-wide">Recommended Company</span>
            </div>
          </div>

          <!-- About -->
          <div class="mb-5">
            <h3 class="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">About Company</h3>
            <p class="text-[13px] text-[#475569] leading-[1.7]">
              {{ companyDescription || 'No company description available.' }}
            </p>
          </div>

          <!-- Company Details -->
          <div class="space-y-3 pt-4 border-t border-[#F1F5F9]">
            <div v-if="companyAddress" class="flex items-start gap-3">
              <Icon name="heroicons:map-pin" class="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" />
              <p class="text-[13px] text-[#475569]">{{ companyAddress }}</p>
            </div>
            <div v-if="companyEmail" class="flex items-start gap-3">
              <Icon name="heroicons:envelope" class="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" />
              <p class="text-[13px] text-[#475569]">{{ companyEmail }}</p>
            </div>
            <div v-if="companyCategory" class="flex items-start gap-3">
              <Icon name="heroicons:building-office-2" class="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" />
              <p class="text-[13px] text-[#475569]">{{ companyCategory }}</p>
            </div>
          </div>
        </div>

        <!-- Other Jobs from Same Company -->
        <div v-if="otherJobs.length > 0" class="bg-white border border-[#E2E8F0] rounded-[16px] p-6">
          <h3 class="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-4">Other Jobs at {{ resolvedCompanyName }}</h3>
          <div class="space-y-3">
            <div
              v-for="otherJob in otherJobs"
              :key="otherJob.id"
              class="p-3.5 rounded-[12px] border border-[#F1F5F9] hover:border-[color:var(--color-main)] hover:shadow-sm transition-all cursor-pointer group"
              @click="goToJob(otherJob)"
            >
              <h4 class="text-[14px] font-semibold text-[#0F172A] group-hover:text-[color:var(--color-main)] transition-colors truncate">{{ otherJob.title }}</h4>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span v-if="otherJob.type" class="text-[10px] px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] font-medium">{{ otherJob.type }}</span>
                <span v-if="otherJob.location_type" class="text-[10px] px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium">{{ otherJob.location_type }}</span>
              </div>
              <p class="text-[12px] text-[#94A3B8] mt-2 flex items-center gap-1">
                <Icon name="heroicons:arrow-right" class="w-3 h-3" /> Lihat Detail
              </p>
            </div>
          </div>
        </div>

        <!-- Recommended Bootcamps -->
        <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-6">
          <h3 class="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">Company Recommendation</h3>
          <p class="text-[12px] text-[#475569] mb-4">Miliki sertifikasi bootcamp ini untuk peluang lebih besar di perusahaan ini.</p>
          <div v-if="recommendedBootcamps.length > 0" class="space-y-3">
              <NuxtLink
                v-for="item in recommendedBootcamps"
                :key="item.id"
                :to="`/worker/bootcamps/${item.bootcamp_id}`"
                class="block p-3 rounded-[12px] bg-white border border-[#E2E8F0] hover:border-[#3B82F6] hover:shadow-md transition-all group"
              >
                <div class="flex gap-3 items-center">
                  <div class="w-12 h-12 bg-white flex items-center justify-center flex-shrink-0 border border-[#E2E8F0] p-1">
                    <img v-if="item.bootcamps?.provider_profiles?.logo_url" :src="item.bootcamps.provider_profiles.logo_url" class="w-full h-full object-contain" />
                    <Icon v-else name="mdi:domain" class="w-6 h-6 text-[#94A3B8]" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h4 class="text-[13px] font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">{{ item.bootcamps?.title || 'Bootcamp Partner' }}</h4>
                    <p class="text-[11px] text-[#64748B] truncate mt-0.5">{{ item.bootcamps?.provider_profiles?.provider_name || 'Verified Provider' }}</p>
                  </div>
                  <Icon name="heroicons:chevron-right" class="w-4 h-4 text-[#94A3B8] group-hover:text-[#3B82F6]" />
                </div>
              </NuxtLink>
            </div>
          <div v-else class="text-center py-6 bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0] border-dashed">
            <Icon name="heroicons:academic-cap" class="w-8 h-8 text-[#CBD5E1] mx-auto mb-2" />
            <p class="text-[12px] text-[#64748B]">Belum ada rekomendasi bootcamp dari perusahaan ini.</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && !error" class="bg-white border border-[#E2E8F0] rounded-[16px] p-6 text-[14px] text-[#64748B]">
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
            class="mt-2 w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] file:mr-3 file:rounded-[6px] file:border-0 file:text-[13px] file:font-medium file:bg-[#EEF2FF] file:text-[#4338CA]"
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
            class="mt-2 w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <button
          :disabled="applyLoading || uploading"
          class="w-full bg-[color:var(--color-main)] text-white rounded-[10px] px-5 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          @click="submitApply"
        >
          {{ applyLoading || uploading ? 'Sending...' : 'Submit Application' }}
        </button>
      </div>
    </Modal>
  </section>
</template>
