<script setup>
import { computed, onMounted, ref } from 'vue'
import { jsPDF } from 'jspdf'

useHead({ title: 'CarrePath | My Resume' })
definePageMeta({ layout: 'worker' })

const { get, post } = useApi()
const { getData, toArray, asObject, getErrorMessage, getQuota } = useApiResponse()
const { userId } = useAuth()
const { uploadPdfCv, uploadError, uploading, clearUploadState } = useFileUpload()

const mode = ref('study')
const loadingInitial = ref(true)
const loadingGenerate = ref(false)
const loadingOptimize = ref(false)
const loadingStudyPlan = ref(false)
const loadingHistory = ref(false)

const pageError = ref('')
const pageWarning = ref('')
const pageSuccess = ref('')
const quotaState = ref(null)

const optimizeInput = ref('')
const targetRole = ref('Backend Engineer')
const uploadedPdfName = ref('')
const uploadedPdfUrl = ref('')
const pdfWarning = ref('')

const createForm = ref({
  full_name: '',
  headline: '',
  email: '',
  phone: '',
  country: '',
  province: '',
  city: '',
  website: '',
  summary: '',
  certificates: [],
  hard_skills: [],
  soft_skills: [],
  education: [
    { school: '', degree: '', year: '' }
  ],
  experiences: [
    {
      company: '',
      role: '',
      start_date: '',
      end_date: '',
      tasks: '',
      impact: ''
    }
  ],
  projects: [
    { name: '', description: '', tech_stack: '' }
  ]
})

const hardSkillInput = ref('')
const softSkillInput = ref('')
const certificateInput = ref('')

const optimizeResult = ref(null)
const generateResult = ref(null)
const studyPlanResult = ref(null)
const resumeHistory = ref([])
const studyPlanHistory = ref([])

const isBusy = computed(() => {
  return loadingGenerate.value || loadingOptimize.value || loadingStudyPlan.value || uploading.value
})

const quotaDisplayText = computed(() => {
  if (!quotaState.value) return 'Quota akan tampil setelah Generate/Optimize berhasil.'
  return `${quotaState.value.remaining}x tersisa dari ${quotaState.value.quota}x kuota bulanan`
})

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

  if (payload.resume && typeof payload.resume === 'object') {
    return normalizeHistoryPayload(payload.resume)
  }

  if (payload.study_plan && typeof payload.study_plan === 'object' && !Array.isArray(payload.study_plan)) {
    return normalizeHistoryPayload(payload.study_plan)
  }

  if (Array.isArray(payload.data)) {
    return normalizeHistoryPayload(payload.data[0])
  }

  if (payload.raw_data && typeof payload.raw_data === 'object') return payload.raw_data
  if (payload.resume_data && typeof payload.resume_data === 'object') return payload.resume_data
  if (payload.data && typeof payload.data === 'object') return payload.data
  if (payload.result && typeof payload.result === 'object') return payload.result
  return payload
}

const latestResumeRaw = computed(() => {
  if (optimizeResult.value) return normalizeHistoryPayload(optimizeResult.value)
  if (generateResult.value) return normalizeHistoryPayload(generateResult.value)
  if (resumeHistory.value.length) return normalizeHistoryPayload(resumeHistory.value[0])
  return {}
})

const latestStudyPlanRaw = computed(() => {
  if (studyPlanResult.value) return normalizeHistoryPayload(studyPlanResult.value)
  if (studyPlanHistory.value.length) return normalizeHistoryPayload(studyPlanHistory.value[0])
  return {}
})

const parsedResume = computed(() => {
  const raw = latestResumeRaw.value
  const contact = toRecord(raw.contact)

  const skills = [
    ...normalizeList(raw.skills || raw.top_skills),
    ...normalizeList(raw.hard_skills),
    ...normalizeList(raw.soft_skills)
  ]

  const experiences = normalizeList(raw.experiences || raw.experience || raw.work_experience).map((item) => {
    const row = toRecord(item)
    return {
      role: row.role || row.position || '-',
      company: row.company || row.company_name || '-',
      period: [row.start_date, row.end_date].filter(Boolean).join(' - ') || '-',
      bullets: normalizeList(row.impact || row.impacts || row.tasks || row.description)
    }
  })

  const educations = normalizeList(raw.education || raw.educations).map((item) => {
    const row = toRecord(item)
    return {
      school: row.school || row.institution || '-',
      degree: row.degree || row.major || '-',
      year: row.year || row.graduation_year || '-'
    }
  })

  const projects = normalizeList(raw.projects).map((item) => {
    const row = toRecord(item)
    return {
      name: row.name || row.project_name || '-',
      description: row.description || '-',
      tech: normalizeList(row.tech_stack || row.technologies)
    }
  })

  return {
    name: raw.full_name || raw.name || createForm.value.full_name || '-',
    headline: raw.headline || raw.professional_title || createForm.value.headline || '-',
    summary: raw.summary || raw.professional_summary || createForm.value.summary || '-',
    contact: {
      email: contact.email || raw.email || createForm.value.email || '-',
      phone: contact.phone || raw.phone || createForm.value.phone || '-',
      location:
        contact.location ||
        [createForm.value.city, createForm.value.province, createForm.value.country].filter(Boolean).join(', ') ||
        '-',
      website: contact.website || raw.website || createForm.value.website || '-'
    },
    skills,
    competencies: normalizeList(raw.core_competencies || raw.competencies),
    experiences,
    education: educations,
    projects,
    certifications: normalizeList(raw.certifications || raw.certificate),
    atsKeywords: normalizeList(raw.ats_keywords || raw.keywords),
    improvementNotes: normalizeList(raw.improvement_notes || raw.notes)
  }
})

const parsedStudyPlan = computed(() => {
  const raw = latestStudyPlanRaw.value
  const planList = normalizeList(raw.study_plan || raw.weeks || raw.plan_data?.study_plan || raw.data?.study_plan)
  const careerList = normalizeList(raw.most_relevant_careers || raw.careers)

  const normalizedWeeks = planList.map((item, index) => {
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

  while (normalizedWeeks.length < 9) {
    const index = normalizedWeeks.length + 1
    normalizedWeeks.push({
      title: `Week ${index}`,
      objectives: [],
      topics: [],
      handsOnTasks: [],
      outputPortfolio: [],
      estHours: '-'
    })
  }

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
    weeks: normalizedWeeks
  }
})

const hasPreview = computed(() => {
  const data = parsedResume.value
  return Boolean(
    data.summary !== '-' ||
      data.skills.length ||
      data.experiences.length ||
      data.education.length ||
      data.projects.length ||
      data.certifications.length ||
      data.atsKeywords.length
  )
})

const clearMessages = () => {
  pageError.value = ''
  pageWarning.value = ''
  pageSuccess.value = ''
}

const updateQuotaFromResponse = (response) => {
  const nextQuota = getQuota(response)
  if (nextQuota) {
    quotaState.value = nextQuota
  }
}

const addTag = (kind) => {
  const source = kind === 'hard' ? hardSkillInput.value : softSkillInput.value
  const clean = source.trim()
  if (!clean) return

  const list = kind === 'hard' ? createForm.value.hard_skills : createForm.value.soft_skills
  if (!list.includes(clean)) list.push(clean)

  if (kind === 'hard') hardSkillInput.value = ''
  else softSkillInput.value = ''
}

const removeTag = (kind, index) => {
  if (kind === 'hard') createForm.value.hard_skills.splice(index, 1)
  else createForm.value.soft_skills.splice(index, 1)
}

const addCertificate = () => {
  const clean = certificateInput.value.trim()
  if (!clean) return
  if (!createForm.value.certificates.includes(clean)) {
    createForm.value.certificates.push(clean)
  }
  certificateInput.value = ''
}

const removeCertificate = (index) => {
  createForm.value.certificates.splice(index, 1)
}

const addExperience = () => {
  createForm.value.experiences.push({
    company: '',
    role: '',
    start_date: '',
    end_date: '',
    tasks: '',
    impact: ''
  })
}

const removeExperience = (index) => {
  if (createForm.value.experiences.length <= 1) return
  createForm.value.experiences.splice(index, 1)
}

const addEducation = () => {
  createForm.value.education.push({ school: '', degree: '', year: '' })
}

const addProject = () => {
  createForm.value.projects.push({ name: '', description: '', tech_stack: '' })
}

const composeCreateText = () => {
  const form = createForm.value
  const experienceText = form.experiences
    .map((item) => `${item.role} at ${item.company} (${item.start_date} - ${item.end_date})\nTasks: ${item.tasks}\nImpact: ${item.impact}`)
    .join('\n\n')

  const educationText = form.education.map((item) => `${item.school} - ${item.degree} (${item.year})`).join('\n')
  const projectsText = form.projects
    .filter((item) => item.name || item.description || item.tech_stack)
    .map((item) => `${item.name}\n${item.description}\nTech: ${item.tech_stack}`)
    .join('\n\n')

  return [
    `${form.full_name} - ${form.headline}`,
    `Email: ${form.email} | Phone: ${form.phone}`,
    `Location: ${form.city}, ${form.province}, ${form.country}`,
    `Website: ${form.website}`,
    '',
    `Summary: ${form.summary}`,
    '',
    `Hard Skills: ${form.hard_skills.join(', ')}`,
    `Soft Skills: ${form.soft_skills.join(', ')}`,
    `Certificates: ${form.certificates.join(', ')}`,
    '',
    'Experience:',
    experienceText,
    '',
    'Education:',
    educationText,
    '',
    'Projects:',
    projectsText
  ]
    .filter(Boolean)
    .join('\n')
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
      if (fragments.length) {
        pageTexts.push(fragments.join(' '))
      }
    }

    return pageTexts.join('\n').trim()
  } catch {
    const buffer = await file.arrayBuffer()
    const decoder = new TextDecoder('latin1')
    const raw = decoder.decode(buffer)

    // Lightweight extraction fallback for plain-text chunks inside PDF stream.
    const cleaned = raw
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
      .replace(/\s+/g, ' ')
      .match(/[A-Za-z0-9@.,:;()\-_/+ ]{20,}/g)

    return (cleaned || []).slice(0, 300).join('\n').trim()
  }
}

const handleUploadPdfToWorkspace = async (event) => {
  clearMessages()
  clearUploadState()
  pdfWarning.value = ''

  const file = event.target.files?.[0]
  if (!file) {
    uploadedPdfName.value = ''
    uploadedPdfUrl.value = ''
    return
  }

  if (file.type !== 'application/pdf') {
    pageError.value = 'File CV harus PDF.'
    event.target.value = ''
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    pageError.value = 'Ukuran PDF maksimal 5MB.'
    event.target.value = ''
    return
  }

  uploadedPdfName.value = file.name

  try {
    const result = await uploadPdfCv(file, userId.value)
    if (result?.publicUrl) {
      uploadedPdfUrl.value = result.publicUrl
      if (result.warning) pdfWarning.value = result.warning
    }

    // Optional fallback extraction when OCR backend is unavailable.
    const extracted = await parseTextFromPdf(file)
    if (extracted) {
      optimizeInput.value = extracted
      pageSuccess.value = 'Text CV berhasil diprefill dari file. Kamu masih bisa edit manual.'
    } else {
      pageWarning.value = 'PDF sudah diupload, tapi text tidak bisa diekstrak penuh di client. Silakan paste manual untuk hasil terbaik.'
    }
  } catch (e) {
    pageWarning.value = getErrorMessage(e, 'PDF upload gagal diproses untuk workspace.')
  }
}

const refreshHistory = async () => {
  if (!userId.value || loadingHistory.value) return

  loadingHistory.value = true
  try {
    const [resumeRes, planRes] = await Promise.allSettled([
      get(`/ai/resumes/${userId.value}`),
      get(`/ai/study-plans/${userId.value}`)
    ])

    if (resumeRes.status === 'fulfilled') {
      resumeHistory.value = toArray(getData(resumeRes.value))
    }

    if (planRes.status === 'fulfilled') {
      studyPlanHistory.value = toArray(getData(planRes.value))
    }
  } finally {
    loadingHistory.value = false
  }
}

const loadInitialData = async () => {
  loadingInitial.value = true
  clearMessages()

  try {
    const [profileRes] = await Promise.allSettled([
      get(`/workers/profile/${userId.value}`),
      refreshHistory()
    ])

    if (profileRes.status === 'fulfilled') {
      const profile = asObject(getData(profileRes.value))
      createForm.value.full_name = profile.full_name || ''
      createForm.value.email = profile.email || ''
      createForm.value.phone = profile.phone || ''
      createForm.value.city = profile.city || ''
      createForm.value.province = profile.province || ''
      createForm.value.country = profile.country || ''
      createForm.value.website = profile.website || ''
      createForm.value.headline = profile.field_of_work || ''
    }
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Gagal memuat halaman resume.')
  } finally {
    loadingInitial.value = false
  }
}

const runGenerateFromCreate = async () => {
  if (isBusy.value) return

  clearMessages()
  if (!createForm.value.full_name || !createForm.value.email || !createForm.value.summary) {
    pageError.value = 'Full name, email, dan summary wajib diisi.'
    return
  }

  loadingGenerate.value = true
  try {
    const cvText = composeCreateText()
    const response = await post('/ai/generate-resume', {
      worker_id: userId.value,
      target_role: targetRole.value,
      cv_text: cvText,
      cv_payload: createForm.value,
      certificates: createForm.value.certificates
    })

    generateResult.value = getData(response)
    updateQuotaFromResponse(response)
    pageSuccess.value = 'Resume berhasil dibuat dari Create Mode.'
    mode.value = 'preview'
    optimizeInput.value = cvText

    await refreshHistory()
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Generate resume gagal.')
  } finally {
    loadingGenerate.value = false
  }
}

const runOptimizeResume = async () => {
  if (isBusy.value) return

  clearMessages()
  if (!optimizeInput.value.trim()) {
    pageError.value = 'Masukkan CV text terlebih dahulu.'
    return
  }

  loadingOptimize.value = true
  try {
    const response = await post('/ai/optimize-resume', {
      worker_id: userId.value,
      target_role: targetRole.value.trim() || 'Backend Engineer',
      cv_text: optimizeInput.value.trim(),
      cv_url: uploadedPdfUrl.value || ''
    })

    optimizeResult.value = getData(response)
    updateQuotaFromResponse(response)
    pageSuccess.value = 'Resume berhasil dioptimize dengan struktur ATS yang lebih kaya.'

    await refreshHistory()
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Optimize resume gagal.')
  } finally {
    loadingOptimize.value = false
  }
}

const runStudyPlan = async () => {
  if (isBusy.value) return

  clearMessages()
  if (!optimizeInput.value.trim()) {
    pageError.value = 'Masukkan CV text untuk membuat study plan.'
    return
  }

  loadingStudyPlan.value = true
  try {
    const response = await post('/ai/study-plan', {
      worker_id: userId.value,
      target_role: targetRole.value.trim() || 'Backend Engineer',
      cv_text: optimizeInput.value.trim(),
      cv_url: uploadedPdfUrl.value || ''
    })

    studyPlanResult.value = getData(response)
    pageSuccess.value = 'Study plan berhasil dibuat.'

    await refreshHistory()
  } catch (e) {
    pageWarning.value = getErrorMessage(e, 'Study plan belum tersedia dari backend.')
  } finally {
    loadingStudyPlan.value = false
  }
}

const runAutoGenerate = async () => {
  clearMessages()
  loadingGenerate.value = true
  try {
    const response = await post('/ai/generate-resume', {
      worker_id: userId.value,
      target_role: targetRole.value.trim() || 'Backend Engineer',
      cv_text: optimizeInput.value.trim(),
      cv_url: uploadedPdfUrl.value || ''
    })

    generateResult.value = getData(response)
    updateQuotaFromResponse(response)
    pageSuccess.value = 'Auto generate CV selesai.'

    await refreshHistory()
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Auto generate gagal.')
  } finally {
    loadingGenerate.value = false
  }
}

const toPdfLines = () => {
  const data = parsedResume.value
  const lines = []

  lines.push(data.name)
  lines.push(data.headline)
  lines.push(`${data.contact.email} | ${data.contact.phone}`)
  lines.push(`${data.contact.location} | ${data.contact.website}`)
  lines.push('')
  lines.push('SUMMARY')
  lines.push(data.summary)
  lines.push('')
  lines.push('SKILLS MATRIX')
  lines.push(data.skills.join(', ') || '-')
  lines.push('')
  lines.push('CORE COMPETENCIES')
  lines.push(data.competencies.join(', ') || '-')
  lines.push('')

  lines.push('EXPERIENCE')
  data.experiences.forEach((exp) => {
    lines.push(`${exp.role} | ${exp.company} | ${exp.period}`)
    exp.bullets.forEach((bullet) => lines.push(`- ${bullet}`))
    lines.push('')
  })

  lines.push('EDUCATION')
  data.education.forEach((edu) => lines.push(`${edu.school} | ${edu.degree} | ${edu.year}`))
  lines.push('')

  lines.push('PROJECTS')
  data.projects.forEach((project) => {
    lines.push(project.name)
    lines.push(project.description)
    lines.push(`Tech: ${project.tech.join(', ') || '-'}`)
    lines.push('')
  })

  lines.push('CERTIFICATIONS')
  lines.push(data.certifications.join(', ') || '-')
  lines.push('')

  lines.push('ATS KEYWORDS')
  lines.push(data.atsKeywords.join(', ') || '-')
  lines.push('')

  lines.push('IMPROVEMENT NOTES')
  data.improvementNotes.forEach((item) => lines.push(`- ${item}`))

  return lines
}

const downloadCvPdf = () => {
  if (!hasPreview.value) {
    pageError.value = 'Belum ada hasil resume untuk di-download.'
    return
  }

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 44
  const width = pageWidth - margin * 2
  let cursorY = margin

  const lines = toPdfLines()

  lines.forEach((line) => {
    const isHeading = /^[A-Z\s]+$/.test(line) && line.length <= 28
    const wrapped = doc.splitTextToSize(line || ' ', width)

    if (cursorY + wrapped.length * 14 > pageHeight - margin) {
      doc.addPage()
      cursorY = margin
    }

    doc.setFont('helvetica', isHeading ? 'bold' : 'normal')
    doc.setFontSize(isHeading ? 11 : 10)
    doc.text(wrapped, margin, cursorY)
    cursorY += wrapped.length * 14 + 4
  })

  const safeName = (parsedResume.value.name || 'worker').replace(/\s+/g, '-')
  doc.save(`CV-${safeName}.pdf`)
}

onMounted(loadInitialData)
</script>

<template>
  <section class="p-4 md:p-6 lg:p-8 space-y-6">
    <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="text-[30px] font-semibold">My Resume</h1>
          <p class="text-[14px] text-[#64748B] mt-1">Create mode untuk bangun CV profesional, optimize mode untuk workspace AI dan study plan.</p>
        </div>

        <div class="rounded-[12px] bg-[#EEF2FF] border-l-2 border-[color:var(--color-main)] px-4 py-3 min-w-[250px]">
          <p class="text-[12px] uppercase tracking-[0.18em] text-[#64748B]">Quota Status</p>
          <p class="text-[15px] font-semibold text-[color:var(--color-dark)] mt-1">{{ quotaDisplayText }}</p>
          <p class="text-[12px] text-[#64748B] mt-1">Quota update hanya dari Generate/Optimize.</p>
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-2">
        <button :class="['px-4 py-2 rounded-[8px] text-[14px] font-medium', mode === 'study' ? 'bg-[color:var(--color-main)] text-white' : 'bg-[#F1F5F9] text-[#475569]']" @click="mode = 'study'">Study Plan Workspace</button>
        <button :class="['px-4 py-2 rounded-[8px] text-[14px] font-medium', mode === 'preview' ? 'bg-[color:var(--color-main)] text-white' : 'bg-[#F1F5F9] text-[#475569]']" @click="mode = 'preview'">CV ATS Preview</button>
      </div>

      <p v-if="pageError" class="mt-4 text-[14px] text-red-600">{{ pageError }}</p>
      <p v-if="pageSuccess" class="mt-3 text-[14px] text-green-700">{{ pageSuccess }}</p>
      <p v-if="pageWarning" class="mt-2 text-[14px] text-amber-700">{{ pageWarning }}</p>
      <p v-if="uploadError" class="mt-2 text-[14px] text-red-600">{{ uploadError }}</p>
      <p v-if="pdfWarning" class="mt-2 text-[13px] text-amber-700">{{ pdfWarning }}</p>

      <div v-if="loadingInitial" class="mt-6 space-y-3">
        <div v-for="i in 4" :key="i" class="h-[84px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
      </div>

      <div v-else-if="mode === 'study'" class="mt-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Full Name *</label>
            <input v-model="createForm.full_name" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Muhammad Rizal Ramzi" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Email *</label>
            <input v-model="createForm.email" type="email" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="rizal@gmail.com" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Phone *</label>
            <input v-model="createForm.phone" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="+62 812 0000 111" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Headline</label>
            <input v-model="createForm.headline" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Senior Frontend Engineer" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Country</label>
            <input v-model="createForm.country" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Indonesia" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Province / State</label>
            <input v-model="createForm.province" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="East Java" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">City</label>
            <input v-model="createForm.city" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Surabaya" />
          </div>
          <div class="md:col-span-2">
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Personal Website / Portfolio</label>
            <input v-model="createForm.website" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="https://portfolio.dev" />
          </div>
        </div>

        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Summary / Description *</label>
          <textarea v-model="createForm.summary" rows="4" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Tuliskan ringkasan profesional dan impact utama kamu."></textarea>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Hard Skills</label>
            <div class="flex gap-2">
              <input v-model="hardSkillInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Vue.js" @keyup.enter.prevent="addTag('hard')" />
              <button class="px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8] text-[13px]" @click="addTag('hard')">Add</button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button v-for="(item, idx) in createForm.hard_skills" :key="item + idx" class="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]" @click="removeTag('hard', idx)">{{ item }} ×</button>
            </div>
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Soft Skills</label>
            <div class="flex gap-2">
              <input v-model="softSkillInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Communication" @keyup.enter.prevent="addTag('soft')" />
              <button class="px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8] text-[13px]" @click="addTag('soft')">Add</button>
            </div>
            <div class="mt-2 flex flex-wrap gap-2">
              <button v-for="(item, idx) in createForm.soft_skills" :key="item + idx" class="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]" @click="removeTag('soft', idx)">{{ item }} ×</button>
            </div>
          </div>
        </div>

        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Certificates</label>
          <div class="flex gap-2">
            <input v-model="certificateInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Google Cloud Associate" @keyup.enter.prevent="addCertificate" />
            <button class="px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8] text-[13px]" @click="addCertificate">Add</button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="(item, idx) in createForm.certificates" :key="item + idx" class="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]" @click="removeCertificate(idx)">{{ item }} ×</button>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-[18px] font-semibold">Experience</h2>
            <button class="text-[13px] px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8]" @click="addExperience">+ Add Experience</button>
          </div>

          <div v-for="(exp, idx) in createForm.experiences" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <input v-model="exp.company" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Company" />
              <input v-model="exp.role" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Role" />
              <input v-model="exp.start_date" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Start date" />
              <input v-model="exp.end_date" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="End date" />
            </div>
            <textarea v-model="exp.tasks" rows="2" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Tasks & responsibilities"></textarea>
            <textarea v-model="exp.impact" rows="2" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Impact / measurable results"></textarea>
            <button v-if="createForm.experiences.length > 1" class="text-[12px] px-3 py-1.5 rounded-[8px] border border-red-200 text-red-600" @click="removeExperience(idx)">Remove</button>
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-[18px] font-semibold">Education</h2>
            <button class="text-[13px] px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8]" @click="addEducation">+ Add Education</button>
          </div>

          <div v-for="(edu, idx) in createForm.education" :key="idx" class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input v-model="edu.school" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="School / Institution" />
            <input v-model="edu.degree" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Degree / Major" />
            <input v-model="edu.year" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Graduation year" />
          </div>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-[18px] font-semibold">Projects (Optional)</h2>
            <button class="text-[13px] px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8]" @click="addProject">+ Add Project</button>
          </div>

          <div v-for="(project, idx) in createForm.projects" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-4 space-y-3">
            <input v-model="project.name" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Project name" />
            <textarea v-model="project.description" rows="2" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Project description"></textarea>
            <input v-model="project.tech_stack" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Tech stack (comma separated)" />
          </div>
        </div>

        <button class="bg-[color:var(--color-main)] text-white rounded-[8px] px-5 py-2.5 text-[14px] disabled:opacity-50" :disabled="isBusy" @click="runGenerateFromCreate">
          {{ loadingGenerate ? 'Generating...' : 'Generate' }}
        </button>
      </div>

      <div v-else-if="mode === 'study'" class="mt-6 space-y-6">
        <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4 space-y-3">
          <label class="text-[13px] font-medium text-[#475569] block">Upload CV PDF (opsional, untuk convert ke text)</label>
          <input type="file" accept="application/pdf" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" @change="handleUploadPdfToWorkspace" />
          <p v-if="uploadedPdfName" class="text-[12px] text-[#1D4ED8]">PDF selected: {{ uploadedPdfName }}</p>

          <textarea v-model="optimizeInput" rows="10" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Paste CV text di sini untuk hasil optimize yang lengkap."></textarea>

          <input v-model="targetRole" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Target role sebelum optimize / study plan" />

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button class="bg-[color:var(--color-main)] text-white rounded-[8px] px-3 py-2.5 text-[14px] disabled:opacity-50" :disabled="isBusy" @click="runOptimizeResume">{{ loadingOptimize ? 'Optimizing...' : 'Optimize Resume' }}</button>
            <button class="border border-[#CBD5E1] rounded-[8px] px-3 py-2.5 text-[14px] disabled:opacity-50" :disabled="isBusy" @click="runStudyPlan">{{ loadingStudyPlan ? 'Generating...' : 'Create Study Plan' }}</button>
            <button class="border border-[#CBD5E1] rounded-[8px] px-3 py-2.5 text-[14px] disabled:opacity-50" :disabled="isBusy" @click="runAutoGenerate">{{ loadingGenerate ? 'Generating...' : 'Auto Generate CV' }}</button>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-[19px] font-semibold">CV ATS Preview</h2>
              <button class="bg-[color:var(--color-main)] text-white rounded-[8px] px-4 py-2 text-[14px] disabled:opacity-50" :disabled="!hasPreview" @click="downloadCvPdf">Download PDF</button>
            </div>

            <div v-if="hasPreview" class="mt-4 space-y-5">
              <div>
                <h3 class="text-[23px] font-semibold">{{ parsedResume.name }}</h3>
                <p class="text-[14px] text-[#334155]">{{ parsedResume.headline }}</p>
                <p class="text-[13px] text-[#64748B] mt-1">{{ parsedResume.contact.email }} | {{ parsedResume.contact.phone }}</p>
                <p class="text-[13px] text-[#64748B]">{{ parsedResume.contact.location }} | {{ parsedResume.contact.website }}</p>
              </div>

              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Summary</p>
                <p class="text-[14px] mt-2">{{ parsedResume.summary }}</p>
              </div>

              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Skills Matrix</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="(skill, idx) in parsedResume.skills" :key="skill + idx" class="text-[12px] px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">{{ skill }}</span>
                  <span v-if="!parsedResume.skills.length" class="text-[14px] text-[#64748B]">-</span>
                </div>
              </div>

              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Core Competencies</p>
                <p class="text-[14px] mt-2">{{ parsedResume.competencies.length ? parsedResume.competencies.join(', ') : '-' }}</p>
              </div>

              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Experience</p>
                <div class="space-y-3 mt-2">
                  <div v-for="(exp, idx) in parsedResume.experiences" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-3 bg-white">
                    <p class="text-[14px] font-semibold">{{ exp.role }}</p>
                    <p class="text-[13px] text-[#64748B]">{{ exp.company }} | {{ exp.period }}</p>
                    <ul class="list-disc ml-5 mt-2 text-[13px] space-y-1">
                      <li v-for="(bullet, bIdx) in exp.bullets" :key="bullet + bIdx">{{ bullet }}</li>
                    </ul>
                  </div>
                  <p v-if="!parsedResume.experiences.length" class="text-[14px] text-[#64748B]">-</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Education</p>
                  <div class="space-y-2 mt-2">
                    <div v-for="(edu, idx) in parsedResume.education" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-3 bg-white">
                      <p class="text-[14px] font-medium">{{ edu.school }}</p>
                      <p class="text-[13px] text-[#64748B]">{{ edu.degree }}</p>
                      <p class="text-[12px] text-[#94A3B8]">{{ edu.year }}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Projects & Certifications</p>
                  <div class="space-y-2 mt-2">
                    <div v-for="(project, idx) in parsedResume.projects" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-3 bg-white">
                      <p class="text-[14px] font-medium">{{ project.name }}</p>
                      <p class="text-[13px] text-[#64748B]">{{ project.description }}</p>
                      <p class="text-[12px] text-[#94A3B8]">Tech: {{ project.tech.length ? project.tech.join(', ') : '-' }}</p>
                    </div>
                  </div>
                  <p class="text-[13px] mt-3 text-[#475569]">Certifications: {{ parsedResume.certifications.length ? parsedResume.certifications.join(', ') : '-' }}</p>
                </div>
              </div>

              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">ATS Keywords</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <span v-for="(keyword, idx) in parsedResume.atsKeywords" :key="keyword + idx" class="text-[12px] px-3 py-1 rounded-full bg-[#E2E8F0] text-[#334155]">{{ keyword }}</span>
                  <span v-if="!parsedResume.atsKeywords.length" class="text-[14px] text-[#64748B]">-</span>
                </div>
              </div>

              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Improvement Notes</p>
                <ul class="list-disc ml-5 mt-2 text-[13px] space-y-1">
                  <li v-for="(note, idx) in parsedResume.improvementNotes" :key="note + idx">{{ note }}</li>
                </ul>
                <p v-if="!parsedResume.improvementNotes.length" class="text-[14px] text-[#64748B] mt-2">-</p>
              </div>
            </div>

            <p v-else class="mt-3 text-[14px] text-[#64748B]">Belum ada hasil CV. Jalankan optimize atau auto-generate terlebih dahulu.</p>
          </div>

          <div class="space-y-4">
            <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4">
              <h2 class="text-[19px] font-semibold">Career Recommendation</h2>
              <p v-if="parsedStudyPlan.reason" class="text-[13px] text-[#334155] mt-2">{{ parsedStudyPlan.reason }}</p>

              <div v-if="parsedStudyPlan.careers.length" class="space-y-3 mt-3">
                <div v-for="(career, idx) in parsedStudyPlan.careers" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-3 bg-white">
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
            </div>

            <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4">
              <h2 class="text-[19px] font-semibold">Study Plan Workspace</h2>

              <div class="mt-3 grid grid-cols-1 gap-3">
                <div v-for="(week, idx) in parsedStudyPlan.weeks" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-3 bg-white">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-[14px] font-semibold">{{ week.title }}</p>
                    <span class="text-[12px] px-2 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">{{ week.estHours }} jam</span>
                  </div>
                  <p class="text-[12px] mt-2"><span class="font-semibold">Objectives:</span> {{ week.objectives.length ? week.objectives.join(', ') : '-' }}</p>
                  <p class="text-[12px] mt-1"><span class="font-semibold">Topics:</span> {{ week.topics.length ? week.topics.join(', ') : '-' }}</p>
                  <p class="text-[12px] mt-1"><span class="font-semibold">Hands-on tasks:</span> {{ week.handsOnTasks.length ? week.handsOnTasks.join(', ') : '-' }}</p>
                  <p class="text-[12px] mt-1"><span class="font-semibold">Portfolio output:</span> {{ week.outputPortfolio.length ? week.outputPortfolio.join(', ') : '-' }}</p>
                </div>
              </div>

              <div class="mt-4 text-[13px] text-[#334155] space-y-2">
                <p><span class="font-semibold">Strengths:</span> {{ parsedStudyPlan.strengths.length ? parsedStudyPlan.strengths.join(', ') : '-' }}</p>
                <p><span class="font-semibold">Gaps:</span> {{ parsedStudyPlan.gaps.length ? parsedStudyPlan.gaps.join(', ') : '-' }}</p>
                <p><span class="font-semibold">Final project ideas:</span> {{ parsedStudyPlan.finalProjectIdeas.length ? parsedStudyPlan.finalProjectIdeas.join(', ') : '-' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="mode === 'preview'" class="mt-6">
        <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-4">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-[19px] font-semibold">CV ATS Preview</h2>
            <button class="bg-[color:var(--color-main)] text-white rounded-[8px] px-4 py-2 text-[14px] disabled:opacity-50" :disabled="!hasPreview" @click="downloadCvPdf">Download PDF</button>
          </div>

          <div v-if="hasPreview" class="mt-4 space-y-5">
            <div>
              <h3 class="text-[23px] font-semibold">{{ parsedResume.name }}</h3>
              <p class="text-[14px] text-[#334155]">{{ parsedResume.headline }}</p>
              <p class="text-[13px] text-[#64748B] mt-1">{{ parsedResume.contact.email }} | {{ parsedResume.contact.phone }}</p>
              <p class="text-[13px] text-[#64748B]">{{ parsedResume.contact.location }} | {{ parsedResume.contact.website }}</p>
            </div>

            <div>
              <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Summary</p>
              <p class="text-[14px] mt-2">{{ parsedResume.summary }}</p>
            </div>

            <div>
              <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Skills</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="(skill, idx) in parsedResume.skills" :key="skill + idx" class="text-[12px] px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">{{ skill }}</span>
              </div>
            </div>

            <div>
              <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Experience</p>
              <div class="space-y-2 mt-2">
                <div v-for="(exp, idx) in parsedResume.experiences" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-3 bg-white">
                  <p class="text-[14px] font-semibold">{{ exp.role }}</p>
                  <p class="text-[13px] text-[#64748B]">{{ exp.company }} | {{ exp.period }}</p>
                </div>
                <p v-if="!parsedResume.experiences.length" class="text-[14px] text-[#64748B]">-</p>
              </div>
            </div>
          </div>

          <p v-else class="mt-3 text-[14px] text-[#64748B]">Belum ada hasil CV. Jalankan optimize atau auto-generate terlebih dahulu.</p>
        </div>
      </div>

      <div v-else class="mt-6 text-[14px] text-[#64748B]">Pilih mode resume workspace terlebih dahulu.</div>

      <details class="mt-6 border border-[#E2E8F0] rounded-[10px] p-4 bg-[#F8FAFC]">
        <summary class="cursor-pointer text-[13px] text-[#64748B]">Debug JSON (opsional)</summary>
        <pre class="mt-3 text-[12px] overflow-x-auto text-[#334155] whitespace-pre-wrap">{{ JSON.stringify({ resume: latestResumeRaw, studyPlan: latestStudyPlanRaw, quota: quotaState }, null, 2) }}</pre>
      </details>
    </div>
  </section>
</template>
