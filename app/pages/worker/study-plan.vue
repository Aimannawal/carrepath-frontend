<script setup>
import { computed, onMounted, ref } from 'vue'

useHead({ title: 'CarrePath | Study Plan' })
definePageMeta({ layout: 'worker' })

const { get, post } = useApi()
const { getData, toArray, getErrorMessage, getQuota } = useApiResponse()
const { userId } = useAuth()
const { success, error } = useModal()

const loading = ref(false)
const generating = ref(false)
const extractingText = ref(false)
const pageError = ref('')
const pageSuccess = ref('')
const quotaState = ref(null)
const history = ref([])
const allJobs = ref([])
const studyPlanResult = ref(null)
const AI_DRAFT_KEY = 'cp_ai_study_plan_draft'

const targetRole = ref('')
const cvText = ref('')
const cvFiles = ref([])
const cvFileNames = ref([])

const normalizeList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const toRecord = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value
  return {}
}

const normalizeHistoryPayload = (value) => {
  const payload = Array.isArray(value) ? toRecord(value[0]) : toRecord(value)

  if (payload.study_plan && typeof payload.study_plan === 'object') {
    return normalizeHistoryPayload(payload.study_plan)
  }

  if (Array.isArray(payload.data)) {
    return normalizeHistoryPayload(payload.data[0])
  }

  if (payload.plan_data && typeof payload.plan_data === 'object') return payload.plan_data
  if (payload.raw_data && typeof payload.raw_data === 'object') return payload.raw_data
  if (payload.data && typeof payload.data === 'object') return payload.data
  return payload
}

const latestRaw = computed(() => {
  if (studyPlanResult.value) return normalizeHistoryPayload(studyPlanResult.value)
  if (history.value.length) return normalizeHistoryPayload(history.value[0])
  return {}
})

const parsedPlan = computed(() => {
  const raw = latestRaw.value
  const planList = normalizeList(raw.study_plan || raw.weeks || raw.plan_data?.study_plan || raw.data?.study_plan)
  const careerList = normalizeList(raw.most_relevant_careers || raw.careers)

  const weeks = planList.map((item, index) => {
    const row = toRecord(item)
    return {
      title: row.week_label || row.title || `Week ${index + 1}`,
      objectives: normalizeList(row.objectives),
      topics: normalizeList(row.topics),
      handsOnTasks: normalizeList(row.hands_on_tasks || row.hands_on),
      outputPortfolio: normalizeList(row.output_portfolio || row.portfolio),
      estHours: row.est_hours || row.estimated_hours || '-'
    }
  })

  return {
    reason: raw.recommendation_reason || raw.reason || '',
    strengths: normalizeList(raw.strengths),
    gaps: normalizeList(raw.gaps || raw.skill_gaps),
    finalProjectIdeas: normalizeList(raw.final_project_ideas || raw.project_ideas),
    careers: careerList.map((item) => {
      const row = toRecord(item)
      return {
        title: row.title || row.role || '-',
        percentage: Number(row.percentage || row.fit_score || 0),
        reason: row.reason || row.insight || 'Rekomendasi dihasilkan dari skill profile terbaru.'
      }
    }),
    weeks
  }
})

const recommendedCareerTitles = computed(() => parsedPlan.value.careers.map((x) => String(x.title || '').toLowerCase().trim()).filter(Boolean))

const recommendedJobs = computed(() => {
  if (!recommendedCareerTitles.value.length || !allJobs.value.length) return []

  const scoreJob = (job) => {
    const title = String(job?.title || '').toLowerCase()
    const category = String(job?.category || '').toLowerCase()
    const companyName = String(job?.company_profiles?.company_name || job?.company_name || '').toLowerCase()
    const stack = `${title} ${category} ${companyName}`
    return recommendedCareerTitles.value.reduce((score, keyword) => {
      if (!keyword) return score
      if (stack.includes(keyword)) return score + 3
      const keywordTokens = keyword.split(/\s+/).filter(Boolean)
      const partial = keywordTokens.some((token) => token.length >= 4 && stack.includes(token))
      return partial ? score + 1 : score
    }, 0)
  }

  return allJobs.value
    .map((job) => ({ ...job, _score: scoreJob(job) }))
    .filter((job) => job._score > 0)
    .sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score
      return new Date(b?.created_at || 0).getTime() - new Date(a?.created_at || 0).getTime()
    })
    .slice(0, 6)
})

const quotaDisplayText = computed(() => {
  if (!quotaState.value) return 'Quota akan tampil setelah generate berhasil.'
  return `${quotaState.value.remaining}x tersisa dari ${quotaState.value.quota}x kuota bulanan`
})

const fetchHistory = async () => {
  loading.value = true
  pageError.value = ''
  try {
    const response = await get(`/ai/study-plans/${userId.value}`)
    history.value = toArray(getData(response)).sort((a, b) => {
      const aTime = new Date(a?.created_at || 0).getTime()
      const bTime = new Date(b?.created_at || 0).getTime()
      return bTime - aTime
    })
    const quota = getQuota(response)
    if (quota) quotaState.value = quota
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Gagal memuat data study plan.')
  } finally {
    loading.value = false
  }
}

const fetchJobs = async () => {
  try {
    const response = await get('/jobs')
    allJobs.value = toArray(getData(response))
  } catch {
    allJobs.value = []
  }
}

const sanitizeDraftText = (value) => {
  if (typeof value !== 'string') return ''

  let cleaned = value
    .replace(/\b(?:[A-Za-z]\s+){4,}[A-Za-z]\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleaned.length > 5000) cleaned = cleaned.slice(0, 5000)
  return cleaned
}

const loadDraft = () => {
  if (!process.client) return
  const raw = localStorage.getItem(AI_DRAFT_KEY)
  if (!raw) return

  try {
    const parsed = JSON.parse(raw)
    const normalizedText = sanitizeDraftText(String(parsed?.cv_text || ''))
    if (!cvText.value.trim() && normalizedText) cvText.value = normalizedText
    if (parsed?.target_role) targetRole.value = String(parsed.target_role)

    localStorage.setItem(
      AI_DRAFT_KEY,
      JSON.stringify({
        target_role: String(parsed?.target_role || '').trim(),
        cv_text: normalizedText,
        updated_at: new Date().toISOString()
      })
    )
  } catch {
    // ignore malformed draft
  }
}

const saveDraft = (textValue) => {
  if (!process.client) return

  const normalizedText = sanitizeDraftText(textValue)
  localStorage.setItem(
    AI_DRAFT_KEY,
    JSON.stringify({
      target_role: targetRole.value,
      cv_text: normalizedText,
      updated_at: new Date().toISOString()
    })
  )
}

const parseTextFromPdf = async (file) => {
  try {
    const pdfjs = await import('pdfjs-dist/build/pdf.mjs')
    const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdfjs.GlobalWorkerOptions.workerSrc = workerModule.default

    const buffer = await file.arrayBuffer()
    const document = await pdfjs.getDocument({ data: buffer }).promise
    const pageTexts = []

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const fragments = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
      if (fragments.length) pageTexts.push(fragments.join(' '))
    }

    return pageTexts.join('\n').trim()
  } catch {
    return ''
  }
}

const extractSupportDataWithBackendOCR = async () => {
  if (!cvFiles.value.length) return null

  const ocrForm = new FormData()
  ocrForm.append('prompt', 'Extract complete resume details from all files.')
  cvFiles.value.forEach((file) => {
    ocrForm.append('files[]', file)
  })

  const response = await post('/ai/ocr-extract', ocrForm)
  return getData(response) || null
}

const handleCvFileChange = (event) => {
  pageError.value = ''
  const files = Array.from(event.target.files || [])

  if (!files.length) {
    cvFiles.value = []
    cvFileNames.value = []
    return
  }

  const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']
  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      pageError.value = 'File pendukung harus PDF, TXT, JPG, PNG, atau WEBP.'
      cvFiles.value = []
      cvFileNames.value = []
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      pageError.value = 'Ukuran file maksimal 10MB per file.'
      cvFiles.value = []
      cvFileNames.value = []
      event.target.value = ''
      return
    }
  }

  cvFiles.value = files
  cvFileNames.value = files.map((f) => f.name)
}

const generateStudyPlan = async () => {
  if (generating.value) return
  pageError.value = ''
  pageSuccess.value = ''

  if (!cvText.value.trim() && !cvFiles.value.length) {
    pageError.value = 'Isi CV text atau upload file CV (PDF) dulu.'
    return
  }

  generating.value = true
  try {
    let ocrRawText = ''
    try {
      const ocrData = await extractSupportDataWithBackendOCR()
      if (ocrData) {
        ocrRawText = String(ocrData.raw_text || '').trim()
      }
    } catch {
      // Keep study-plan generation running even if OCR endpoint fails.
    }

    let finalCvText = cvText.value.trim()
    if (cvFiles.value.length) {
      extractingText.value = true
      let extractedAll = ''
      for (const file of cvFiles.value) {
        if (file.type === 'application/pdf') {
          const extracted = await parseTextFromPdf(file)
          if (extracted) {
            extractedAll = extractedAll ? `${extractedAll}\n\n${extracted}` : extracted
          }
        }
      }
      if (!extractedAll && !finalCvText) {
        throw new Error('Teks CV dari PDF tidak terbaca. Coba upload PDF lain atau isi CV text manual.')
      }
      if (extractedAll) {
        finalCvText = finalCvText ? `${finalCvText}\n\n${extractedAll}` : extractedAll
      }
    }

    if (ocrRawText) {
      finalCvText = finalCvText ? `${finalCvText}\n\n${ocrRawText}` : ocrRawText
    }

    const formData = new FormData()
    formData.append('worker_id', userId.value)
    formData.append('target_role', targetRole.value.trim() || 'Generalist')
    formData.append('cv_text', finalCvText)

    if (cvFiles.value.length) {
      cvFiles.value.forEach((file, index) => {
        if (index === 0) formData.append('cv_file', file)
        formData.append(`additional_file_${index}`, file)
      })
    }

    const response = await post('/ai/study-plan', formData)

    studyPlanResult.value = getData(response)
    const quota = getQuota(response)
    if (quota) quotaState.value = quota
    saveDraft(cvText.value)

    pageSuccess.value = 'Study plan berhasil dibuat dari data CV terbaru.'
    success('Study Plan Berhasil', 'Study plan berhasil dibuat beserta rekomendasi jobs.')

    await Promise.all([fetchHistory(), fetchJobs()])
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Generate study plan gagal.')
    error('Generate Study Plan Gagal', pageError.value)
  } finally {
    extractingText.value = false
    generating.value = false
  }
}

const openJobDetail = (job) => {
  if (!job?.id) return
  navigateTo(`/worker/jobs/${job.id}`)
}

onMounted(() => {
  loadDraft()
  fetchHistory()
  fetchJobs()
})
</script>

<template>
  <section class="p-4 md:p-6 lg:p-8 space-y-6">
    <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6 space-y-5">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 class="text-[30px] font-semibold">Study Plan</h1>
          <p class="text-[14px] text-[#64748B] mt-1">Generate learning roadmap dan rekomendasi jobs yang relevan dengan CV kamu.</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <button class="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-medium bg-[#F1F5F9] text-[#475569] hover:bg-[#EEF2FF]" @click="navigateTo('/worker/resume')">
              <Icon name="heroicons:document-text" class="h-4 w-4" />
              <span>Resume Page</span>
            </button>
            <button class="inline-flex items-center gap-2 px-4 py-2 rounded-[8px] text-[14px] font-medium bg-[color:var(--color-main)] text-white">
              <Icon name="heroicons:academic-cap" class="h-4 w-4" />
              <span>Study Plan Page</span>
            </button>
          </div>
        </div>
        <div class="rounded-[12px] bg-[#EEF2FF] border-l-2 border-[color:var(--color-main)] px-4 py-3 min-w-[250px]">
          <p class="text-[12px] uppercase tracking-[0.18em] text-[#64748B]">Quota Status</p>
          <p class="text-[15px] font-semibold text-[color:var(--color-dark)] mt-1">{{ quotaDisplayText }}</p>
        </div>
      </div>

      <p v-if="pageError" class="text-[14px] text-red-600">{{ pageError }}</p>
      <p v-if="pageSuccess" class="text-[14px] text-green-700">{{ pageSuccess }}</p>

      <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4 space-y-3">
        <input
          v-model="targetRole"
          class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]"
          placeholder="What role do you want?"
        />
        <label class="block rounded-[10px] border border-dashed border-[#CBD5E1] bg-white p-4 text-center cursor-pointer hover:bg-[#F8FAFC] transition">
          <input class="hidden" type="file" multiple accept=".pdf,.txt,.jpg,.jpeg,.png,.webp" @change="handleCvFileChange" />
          <p class="text-[13px] text-[#64748B]">Upload CV / file pendukung</p>
          <p v-if="cvFileNames.length" class="text-[12px] text-[#334155] font-medium mt-1">{{ cvFileNames.join(', ') }}</p>
        </label>
        <textarea
          v-model="cvText"
          rows="8"
          class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]"
          placeholder="Ada perlu tambahan?"
        ></textarea>
        <button
          class="w-full md:w-auto px-5 py-2.5 rounded-[8px] bg-[color:var(--color-main)] text-white text-[14px] font-medium disabled:opacity-50"
          :disabled="generating || extractingText"
          @click="generateStudyPlan"
        >
          {{ extractingText ? 'Extracting CV...' : generating ? 'Generating...' : 'Generate Study Plan' }}
        </button>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-[84px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
      </div>

      <div v-else class="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
        <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4">
          <h2 class="text-[19px] font-semibold">Analysis Result</h2>
          <p v-if="parsedPlan.reason" class="text-[13px] text-[#334155] mt-2">{{ parsedPlan.reason }}</p>

          <div v-if="parsedPlan.careers.length" class="space-y-3 mt-3">
            <div v-for="(career, idx) in parsedPlan.careers" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-3 bg-white">
              <div class="flex items-center justify-between gap-3">
                <p class="text-[14px] font-semibold">{{ career.title }}</p>
                <p class="text-[12px] text-[#1D4ED8] font-medium">{{ career.percentage }}%</p>
              </div>
              <div class="h-2 bg-[#E2E8F0] rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-[#2563EB] rounded-full" :style="{ width: `${Math.min(100, Math.max(0, career.percentage))}%` }"></div>
              </div>
              <p class="text-[12px] text-[#64748B] mt-2">{{ career.reason }}</p>
            </div>
          </div>
          <p v-else class="text-[13px] text-[#64748B] mt-3">Belum ada rekomendasi. Generate study plan dulu.</p>

          <div class="mt-4 pt-4 border-t border-[#E2E8F0] text-[13px] space-y-3">
            <div>
              <p class="font-semibold text-[#475569] mb-1">Strengths</p>
              <p class="text-[#64748B]">{{ parsedPlan.strengths.length ? parsedPlan.strengths.join(', ') : '-' }}</p>
            </div>
            <div>
              <p class="font-semibold text-[#475569] mb-1">Skill Gaps</p>
              <p class="text-[#64748B]">{{ parsedPlan.gaps.length ? parsedPlan.gaps.join(', ') : '-' }}</p>
            </div>
            <div>
              <p class="font-semibold text-[#475569] mb-1">Final Project Ideas</p>
              <p class="text-[#64748B]">{{ parsedPlan.finalProjectIdeas.length ? parsedPlan.finalProjectIdeas.join(', ') : '-' }}</p>
            </div>
          </div>
        </div>

        <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4">
          <h2 class="text-[19px] font-semibold">Recommendation Job for You</h2>
          <div v-if="recommendedJobs.length" class="mt-3 space-y-3">
            <div v-for="job in recommendedJobs" :key="job.id" class="rounded-[10px] border border-[#E2E8F0] bg-white p-3">
              <div class="flex items-start gap-3">
                  <div class="w-10 h-10 overflow-hidden bg-[#F8FAFC] shrink-0 flex items-center justify-center">
                  <img v-if="job.company_profiles?.logo_url" :src="job.company_profiles.logo_url" alt="Company logo" class="w-full h-full object-cover" />
                  <Icon v-else name="mdi:office-building" class="w-5 h-5 text-[#94A3B8]" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-[14px] font-semibold text-[#0F172A] line-clamp-1">{{ job.title || '-' }}</p>
                  <p class="text-[12px] text-[#64748B] line-clamp-1">{{ job.company_profiles?.company_name || '-' }}</p>
                  <p class="text-[12px] text-[#94A3B8] mt-1">{{ job.location_type || '-' }} • {{ job.type || '-' }}</p>
                </div>
                <button class="px-3 py-1.5 rounded-[8px] border border-[color:var(--color-main)] text-[color:var(--color-main)] text-[12px] font-medium hover:bg-[#EEF2FF] transition" @click="openJobDetail(job)">Apply</button>
              </div>
            </div>
          </div>
          <p v-else class="text-[13px] text-[#64748B] mt-3">Belum ada lowongan yang cocok ditemukan.</p>
        </div>
      </div>

      <div v-if="!loading" class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4">
        <h2 class="text-[19px] font-semibold">Study Plan ({{ parsedPlan.weeks.length }} Weeks)</h2>
        <div v-if="parsedPlan.weeks.length" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="(week, idx) in parsedPlan.weeks" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-4 bg-white">
            <div class="flex items-center justify-between gap-2 mb-2">
              <p class="text-[15px] font-semibold text-[#1e293b]">{{ week.title }}</p>
              <span class="text-[12px] px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-medium">{{ week.estHours }} hours</span>
            </div>
            <p class="text-[12px] text-[#64748B]" v-if="week.objectives.length">Objectives: {{ week.objectives.join(', ') }}</p>
            <p class="text-[12px] text-[#64748B]" v-if="week.topics.length">Topics: {{ week.topics.join(', ') }}</p>
            <p class="text-[12px] text-[#64748B]" v-if="week.handsOnTasks.length">Hands-on: {{ week.handsOnTasks.join(', ') }}</p>
            <p class="text-[12px] text-[#64748B]" v-if="week.outputPortfolio.length">Output: {{ week.outputPortfolio.join(', ') }}</p>
          </div>
        </div>
        <p v-else class="text-[13px] text-[#64748B] mt-3">Belum ada week plan. Generate study plan dulu.</p>
      </div>
    </div>
  </section>
</template>
