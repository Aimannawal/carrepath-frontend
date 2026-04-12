<script setup>
import { computed, ref, watch } from 'vue'
import { jsPDF } from 'jspdf'

useHead({ title: 'CarrePath | My Resume' })
definePageMeta({ layout: 'worker' })

const { get, post } = useApi()
const { getData, getErrorMessage, getQuota } = useApiResponse()
const { userId } = useAuth()
const { success, error } = useModal()

const loadingInitial = ref(true)
const loadingGenerate = ref(false)
const pageError = ref('')
const pageSuccess = ref('')
const quotaState = ref(null)

const cvFiles = ref([])
const cvFileNames = ref([])
const cvFileError = ref('')
const generateResult = ref(null)

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
  hard_skills: [],
  certificates: [],
  education: [{ school: '', degree: '', year: '' }],
  experiences: [{ company: '', role: '', start_date: '', end_date: '', tasks: '', impact: '' }]
})

const hardSkillInput = ref('')
const certificateInput = ref('')

// ─── Computed ────────────────────────────────────────────────────────────────

const quotaDisplayText = computed(() => {
  if (!quotaState.value) return 'Quota akan tampil setelah generate berhasil.'
  return `${quotaState.value.remaining}x tersisa dari ${quotaState.value.quota}x kuota bulanan`
})

const parsedResume = computed(() => {
  if (!generateResult.value) return null
  const source = Array.isArray(generateResult.value)
    ? (generateResult.value[0] || {})
    : generateResult.value
  const raw = source.raw_data || source.resume_data || source
  if (!raw) return null

  return {
    name: raw.full_name || createForm.value.full_name || '',
    headline: raw.headline || createForm.value.headline || '',
    summary: raw.summary || createForm.value.summary || '',
    contact: {
      email: raw.contact?.email || raw.email || createForm.value.email || '',
      phone: raw.contact?.phone || raw.phone || createForm.value.phone || '',
      location: raw.contact?.city
        ? [raw.contact.city, raw.contact.country].filter(Boolean).join(', ')
        : [createForm.value.city, createForm.value.province, createForm.value.country].filter(Boolean).join(', '),
      website: raw.contact?.website || raw.website || createForm.value.website || ''
    },
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    core_competencies: Array.isArray(raw.core_competencies) ? raw.core_competencies : [],
    experiences: Array.isArray(raw.experiences) ? raw.experiences.map(exp => ({
      role: exp.role || '',
      company: exp.company_name || exp.company || '',
      period: [exp.start_date, exp.end_date].filter(Boolean).join(' – '),
      bullets: Array.isArray(exp.achievement_bullets) ? exp.achievement_bullets : []
    })) : [],
    education: Array.isArray(raw.education) ? raw.education.map(edu => ({
      school: edu.institution || edu.school || '',
      degree: [edu.degree, edu.major].filter(Boolean).join(', '),
      year: [edu.start_year, edu.end_year].filter(Boolean).join(' – ')
    })) : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    projects: Array.isArray(raw.projects) ? raw.projects : []
  }
})

const hasPreview = computed(() => {
  return parsedResume.value && (parsedResume.value.name || parsedResume.value.skills.length > 0)
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clearMessages = () => {
  pageError.value = ''
  pageSuccess.value = ''
  cvFileError.value = ''
}

const updateQuotaFromResponse = (response) => {
  const nextQuota = getQuota(response)
  if (nextQuota) quotaState.value = nextQuota
}

// ─── Skills / Certs / Experience / Education ─────────────────────────────────

const addTag = () => {
  const clean = hardSkillInput.value.trim()
  if (!clean || createForm.value.hard_skills.includes(clean)) return
  createForm.value.hard_skills.push(clean)
  hardSkillInput.value = ''
}
const removeTag = (index) => createForm.value.hard_skills.splice(index, 1)

const addCertificate = () => {
  const clean = certificateInput.value.trim()
  if (!clean || createForm.value.certificates.includes(clean)) return
  createForm.value.certificates.push(clean)
  certificateInput.value = ''
}
const removeCertificate = (index) => createForm.value.certificates.splice(index, 1)

const addExperience = () => {
  createForm.value.experiences.push({ company: '', role: '', start_date: '', end_date: '', tasks: '', impact: '' })
}
const removeExperience = (index) => {
  if (createForm.value.experiences.length > 1) createForm.value.experiences.splice(index, 1)
}
const addEducation = () => createForm.value.education.push({ school: '', degree: '', year: '' })

// ─── File Upload ──────────────────────────────────────────────────────────────

const handleCvFileUpload = (event) => {
  cvFileError.value = ''
  const files = Array.from(event.target.files || [])
  if (!files.length) {
    cvFiles.value = []
    cvFileNames.value = []
    return
  }
  const validTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/webp']
  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      cvFileError.value = 'File harus PDF, TXT, JPG, PNG, atau WEBP'
      event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      cvFileError.value = 'Ukuran file maksimal 10MB per file'
      event.target.value = ''
      return
    }
  }
  cvFiles.value = files
  cvFileNames.value = files.map((f) => f.name)
}

// ─── OCR: run backend Vision API on uploaded files ───────────────────────────

const runBackendOCR = async () => {
  if (!cvFiles.value.length) return null
  try {
    const ocrForm = new FormData()
    ocrForm.append('prompt', 'Extract complete resume details including all experiences, education, skills, certifications, and contact info.')
    cvFiles.value.forEach((file) => ocrForm.append('files[]', file))
    const response = await post('/ai/ocr-extract', ocrForm)
    return getData(response) || null
  } catch {
    return null
  }
}

// Merge Gemini-parsed OCR data back into the form fields
const mergeOcrIntoForm = (ocrData) => {
  if (!ocrData || typeof ocrData !== 'object') return

  const isGarbage = (val) => {
    const t = String(val || '').trim().toLowerCase()
    if (!t) return true
    return ['<rdf:rdf', 'endobj', 'startxref', 'xpacket', 'http://www.w3.org', 'xmlns:'].some(token => t.includes(token))
  }

  if (ocrData.full_name && !isGarbage(ocrData.full_name)) createForm.value.full_name = String(ocrData.full_name)
  if (ocrData.email && !isGarbage(ocrData.email)) createForm.value.email = String(ocrData.email)
  if (ocrData.phone && !isGarbage(ocrData.phone)) createForm.value.phone = String(ocrData.phone)
  if (ocrData.website && !isGarbage(ocrData.website)) createForm.value.website = String(ocrData.website)
  if (ocrData.location && !isGarbage(ocrData.location)) createForm.value.city = String(ocrData.location)
  if (ocrData.summary && !isGarbage(ocrData.summary)) createForm.value.summary = String(ocrData.summary)

  if (Array.isArray(ocrData.skills) && ocrData.skills.length) {
    const cleaned = ocrData.skills.map(s => String(s || '').trim()).filter(s => s && !isGarbage(s))
    if (cleaned.length) createForm.value.hard_skills = Array.from(new Set(cleaned))
  }

  if (Array.isArray(ocrData.experiences) && ocrData.experiences.length) {
    const mapped = ocrData.experiences
      .map(exp => ({
        company: String(exp.company_name || exp.company || '').trim(),
        role: String(exp.role || '').trim(),
        start_date: String(exp.start_date || '').trim(),
        end_date: String(exp.end_date || '').trim(),
        tasks: String(exp.description || '').trim(),
        impact: ''
      }))
      .filter(exp => [exp.company, exp.role, exp.tasks].some(v => v && !isGarbage(v)))
    if (mapped.length) createForm.value.experiences = mapped
  }

  if (Array.isArray(ocrData.education) && ocrData.education.length) {
    const mapped = ocrData.education
      .map(edu => ({
        school: String(edu.institution || edu.school || '').trim(),
        degree: [edu.degree, edu.major].map(v => String(v || '').trim()).filter(Boolean).join(' – '),
        year: [edu.start_year, edu.end_year].map(v => String(v || '').trim()).filter(Boolean).join(' – ')
      }))
      .filter(edu => [edu.school, edu.degree, edu.year].some(v => v && !isGarbage(v)))
    if (mapped.length) createForm.value.education = mapped
  }
}

// ─── Main generate flow ───────────────────────────────────────────────────────

const runGenerateFromCreate = async () => {
  if (loadingGenerate.value) return
  clearMessages()

  if (!createForm.value.full_name || !createForm.value.email || !createForm.value.summary) {
    pageError.value = 'Full name, email, dan summary wajib diisi.'
    return
  }

  loadingGenerate.value = true
  try {
    // ── Step 1: Run Gemini Vision OCR on uploaded files ──────────────────────
    // This is the ONLY place files are sent to AI — not again in generate.
    let ocrData = null
    let ocrRawText = ''

    if (cvFiles.value.length) {
      ocrData = await runBackendOCR()
      if (ocrData) {
        // Merge parsed OCR fields into the form so user can see what was extracted
        mergeOcrIntoForm(ocrData)
        // Use the full raw_text from Gemini as our rich cv_text
        ocrRawText = String(ocrData.raw_text || '').trim()
      }
    }

    // ── Step 2: Build cv_text ────────────────────────────────────────────────
    // Priority: Gemini Vision raw_text > form summary
    // We intentionally do NOT re-extract PDFs on frontend — Gemini already did it.
    const cvText = ocrRawText || createForm.value.summary || ''

    // ── Step 3: Build FormData for /ai/generate-resume ───────────────────────
    // Files are NOT appended here — OCR already processed them.
    // We pass ocr_extracted_data so backend can use it without re-processing.
    const formData = new FormData()
    formData.append('worker_id', userId.value)
    formData.append('cv_text', cvText)
    formData.append('cv_payload', JSON.stringify(createForm.value))

    // Flat fields (backward compat)
    formData.append('full_name', createForm.value.full_name)
    formData.append('email', createForm.value.email)
    formData.append('phone', createForm.value.phone)
    formData.append('city', createForm.value.city)
    formData.append('province', createForm.value.province)
    formData.append('country', createForm.value.country)
    formData.append('website', createForm.value.website)
    formData.append('headline', createForm.value.headline)
    formData.append('summary', createForm.value.summary)
    formData.append('hard_skills', JSON.stringify(createForm.value.hard_skills))
    formData.append('certificates', JSON.stringify(createForm.value.certificates))
    formData.append('education', JSON.stringify(createForm.value.education))
    formData.append('experiences', JSON.stringify(createForm.value.experiences))

    // Send OCR result to backend so it doesn't need to re-process files
    if (ocrData) {
      formData.append('ocr_extracted_data', JSON.stringify(ocrData))
    }

    // ── Step 4: Generate ─────────────────────────────────────────────────────
    const response = await post('/ai/generate-resume', formData)
    generateResult.value = getData(response)
    updateQuotaFromResponse(response)

    const debug = response?.debug || {}
    const source = debug.file_content_source || 'none'
    const chars = Number(debug.extracted_text_chars || 0)
    const fallbackUsed = Boolean(debug.fallback_used)

    pageSuccess.value = `Resume berhasil dibuat!${ocrData ? ' File dibaca via Gemini Vision.' : ''} Chars: ${chars}. Source: ${source}.${fallbackUsed ? ' (AI fallback aktif)' : ''}`
    success('Generate CV Berhasil', 'Resume dibuat berhasil.')
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Generate resume gagal.')
    error('Generate CV Gagal', pageError.value)
  } finally {
    loadingGenerate.value = false
  }
}

// ─── PDF Download ─────────────────────────────────────────────────────────────

const downloadCvPdf = () => {
  if (!hasPreview.value) {
    pageError.value = 'Belum ada hasil resume untuk di-download.'
    return
  }
  const data = parsedResume.value
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 44
  const width = pageWidth - margin * 2
  let cursorY = margin

  const addLine = (text, bold = false, size = 10) => {
    const wrapped = doc.splitTextToSize(text || ' ', width)
    if (cursorY + wrapped.length * 14 > pageHeight - margin) {
      doc.addPage()
      cursorY = margin
    }
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.text(wrapped, margin, cursorY)
    cursorY += wrapped.length * 14 + (bold ? 6 : 2)
  }

  addLine(data.name, true, 16)
  addLine(data.headline, false, 11)
  addLine([data.contact.email, data.contact.phone, data.contact.location, data.contact.website].filter(Boolean).join('  |  '), false, 9)
  cursorY += 8

  if (data.summary) {
    addLine('SUMMARY', true, 11)
    addLine(data.summary)
    cursorY += 6
  }

  if (data.skills.length) {
    addLine('SKILLS', true, 11)
    addLine(data.skills.join('  ·  '))
    cursorY += 6
  }

  if (data.experiences.length) {
    addLine('EXPERIENCE', true, 11)
    data.experiences.forEach((exp) => {
      addLine(`${exp.role}  —  ${exp.company}  |  ${exp.period}`, true, 10)
      exp.bullets.forEach((b) => addLine(`• ${b}`))
      cursorY += 4
    })
    cursorY += 4
  }

  if (data.education.length) {
    addLine('EDUCATION', true, 11)
    data.education.forEach((edu) => addLine(`${edu.school}  |  ${edu.degree}  |  ${edu.year}`))
    cursorY += 6
  }

  if (data.certifications.length) {
    addLine('CERTIFICATIONS', true, 11)
    addLine(data.certifications.join('  ·  '))
  }

  doc.save(`CV-${(data.name || 'worker').replace(/\s+/g, '-')}.pdf`)
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const loadInitialData = async () => {
  if (!userId.value) return
  loadingInitial.value = true
  clearMessages()
  try {
    const res = await get(`/workers/profile/${userId.value}`)
    const payload = getData(res) || {}
    const profile = payload.profile || payload || {}
    const user = payload.user || {}

    createForm.value.full_name = profile.full_name || user.full_name || ''
    createForm.value.email = profile.email || user.email || ''
    createForm.value.phone = profile.phone || ''
    createForm.value.city = profile.city || ''
    createForm.value.province = profile.province || ''
    createForm.value.country = profile.country || ''
    createForm.value.website = profile.website || ''
    createForm.value.headline = profile.field_of_work || ''
    createForm.value.summary = profile.bio || ''
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Gagal memuat halaman resume.')
  } finally {
    loadingInitial.value = false
  }
}

watch(() => userId.value, (next) => { if (next) loadInitialData() }, { immediate: true })
</script>

<template>
  <section class="p-4 md:p-6 lg:p-8 space-y-6">
    <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6">

      <!-- Header -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 class="text-[30px] font-semibold">My Resume</h1>
          <p class="text-[14px] text-[#64748B] mt-1">Buat CV profesional dengan bantuan AI</p>
        </div>
        <div class="rounded-[12px] bg-[#EEF2FF] border-l-2 border-[color:var(--color-main)] px-4 py-3 min-w-[250px]">
          <p class="text-[12px] uppercase tracking-[0.18em] text-[#64748B]">Quota Status</p>
          <p class="text-[15px] font-semibold text-[color:var(--color-dark)] mt-1">{{ quotaDisplayText }}</p>
        </div>
      </div>

      <!-- Messages -->
      <p v-if="pageError" class="mt-4 text-[14px] text-red-600">{{ pageError }}</p>
      <p v-if="pageSuccess" class="mt-3 text-[14px] text-green-700">{{ pageSuccess }}</p>

      <!-- Skeleton -->
      <div v-if="loadingInitial" class="mt-6 space-y-3">
        <div v-for="i in 3" :key="i" class="h-[84px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] animate-pulse" />
      </div>

      <div v-else class="mt-6 space-y-6">

        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Full Name *</label>
            <input v-model="createForm.full_name" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Your Full Name" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Email *</label>
            <input v-model="createForm.email" type="email" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Your Email" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Phone</label>
            <input v-model="createForm.phone" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Your Phone" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Headline</label>
            <input v-model="createForm.headline" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="e.g. Backend Engineer" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">City</label>
            <input v-model="createForm.city" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="City" />
          </div>
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Country</label>
            <input v-model="createForm.country" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Country" />
          </div>
        </div>

        <!-- Summary -->
        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Summary / Description *</label>
          <textarea v-model="createForm.summary" rows="4" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Ringkasan profesional kamu" />
        </div>

        <!-- Hard Skills -->
        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Hard Skills</label>
          <div class="flex gap-2">
            <input v-model="hardSkillInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Vue.js" @keyup.enter="addTag" />
            <button class="px-4 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8] text-[13px] font-medium" @click="addTag">Add</button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="(skill, idx) in createForm.hard_skills" :key="idx" class="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]" @click="removeTag(idx)">{{ skill }} ×</button>
          </div>
        </div>

        <!-- Certificates -->
        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Certificates</label>
          <div class="flex gap-2">
            <input v-model="certificateInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Certificate name" @keyup.enter="addCertificate" />
            <button class="px-4 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8] text-[13px] font-medium" @click="addCertificate">Add</button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="(cert, idx) in createForm.certificates" :key="idx" class="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]" @click="removeCertificate(idx)">{{ cert }} ×</button>
          </div>
        </div>

        <!-- Experience -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-[18px] font-semibold">Experience</h2>
            <button class="text-[13px] px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8]" @click="addExperience">+ Add</button>
          </div>
          <div v-for="(exp, idx) in createForm.experiences" :key="idx" class="border border-[#E2E8F0] rounded-[10px] p-4 space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <input v-model="exp.company" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Company" />
              <input v-model="exp.role" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Role" />
              <input v-model="exp.start_date" type="date" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" />
              <input v-model="exp.end_date" type="date" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" />
            </div>
            <textarea v-model="exp.tasks" rows="2" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Tasks & responsibilities" />
            <textarea v-model="exp.impact" rows="2" class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Impact & achievements" />
            <button v-if="createForm.experiences.length > 1" class="text-[12px] px-3 py-1.5 border border-red-200 text-red-600 rounded-[8px]" @click="removeExperience(idx)">Remove</button>
          </div>
        </div>

        <!-- Education -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-[18px] font-semibold">Education</h2>
            <button class="text-[13px] px-3 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8]" @click="addEducation">+ Add</button>
          </div>
          <div v-for="(edu, idx) in createForm.education" :key="idx" class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input v-model="edu.school" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="School / University" />
            <input v-model="edu.degree" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Degree & Major" />
            <input v-model="edu.year" class="border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="Year (e.g. 2019 – 2023)" />
          </div>
        </div>

        <!-- CV File Upload -->
        <!-- <div class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-4">
          <label class="text-[12px] font-medium text-[#64748B] block mb-1">Upload CV Document (Optional)</label>
          <p class="text-[11px] text-[#94A3B8] mb-3">
            PDF atau gambar akan dibaca langsung oleh Gemini Vision — hasilnya otomatis mengisi form di atas.
          </p>
          <input
            type="file" multiple
            accept=".pdf,.txt,.jpg,.jpeg,.png,.webp"
            class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]"
            @change="handleCvFileUpload"
          />
          <p v-if="cvFileError" class="text-[12px] text-red-600 mt-2">{{ cvFileError }}</p>
          <p v-if="cvFileNames.length" class="text-[12px] text-[#1D4ED8] mt-2">✓ {{ cvFileNames.join(', ') }}</p>
        </div> -->

        <!-- Generate Button -->
        <button
          class="w-full bg-[color:var(--color-main)] text-white rounded-[8px] px-5 py-3 text-[15px] font-medium disabled:opacity-50"
          :disabled="loadingGenerate"
          @click="runGenerateFromCreate"
        >
          <span v-if="loadingGenerate" class="inline-flex items-center gap-2">
            <Icon name="heroicons:arrow-path" class="h-4 w-4 animate-spin" />
            Generating...
          </span>
          <span v-else class="inline-flex items-center gap-2">
            <Icon name="heroicons:sparkles" class="h-4 w-4" />
            Generate CV
          </span>
        </button>

        <!-- Preview -->
        <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-6">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2 class="text-[19px] font-semibold">CV Preview</h2>
            <button v-if="hasPreview" class="bg-[color:var(--color-main)] text-white rounded-[8px] px-4 py-2 text-[14px]" @click="downloadCvPdf">
              Download PDF
            </button>
          </div>

          <div v-if="hasPreview && parsedResume" class="space-y-5">
            <!-- Header -->
            <div>
              <h3 class="text-[23px] font-semibold">{{ parsedResume.name }}</h3>
              <p class="text-[14px] text-[#334155]">{{ parsedResume.headline }}</p>
              <p class="text-[13px] text-[#64748B] mt-1">
                {{ [parsedResume.contact.email, parsedResume.contact.phone, parsedResume.contact.location, parsedResume.contact.website].filter(Boolean).join('  ·  ') }}
              </p>
            </div>

            <!-- Summary -->
            <div v-if="parsedResume.summary">
              <p class="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8] font-semibold mb-2">Summary</p>
              <p class="text-[14px]">{{ parsedResume.summary }}</p>
            </div>

            <!-- Skills -->
            <div v-if="parsedResume.skills.length">
              <p class="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8] font-semibold mb-2">Skills</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="(skill, idx) in parsedResume.skills" :key="idx" class="text-[12px] px-3 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">{{ skill }}</span>
              </div>
            </div>

            <!-- Core Competencies -->
            <div v-if="parsedResume.core_competencies.length">
              <p class="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8] font-semibold mb-2">Core Competencies</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="(c, idx) in parsedResume.core_competencies" :key="idx" class="text-[12px] px-3 py-1 rounded-full bg-[#F0FDF4] text-[#15803D]">{{ c }}</span>
              </div>
            </div>

            <!-- Experience -->
            <div v-if="parsedResume.experiences.length">
              <p class="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8] font-semibold mb-2">Experience</p>
              <div class="space-y-3">
                <div v-for="(exp, idx) in parsedResume.experiences" :key="idx" class="border border-[#E2E8F0] rounded-[8px] p-3">
                  <p class="text-[14px] font-semibold">{{ exp.role }}</p>
                  <p class="text-[13px] text-[#64748B]">{{ exp.company }}  ·  {{ exp.period }}</p>
                  <ul v-if="exp.bullets.length" class="list-disc ml-5 mt-2 space-y-1">
                    <li v-for="(b, bIdx) in exp.bullets" :key="bIdx" class="text-[12px] text-[#334155]">{{ b }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Education -->
            <div v-if="parsedResume.education.length">
              <p class="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8] font-semibold mb-2">Education</p>
              <div class="space-y-2">
                <div v-for="(edu, idx) in parsedResume.education" :key="idx" class="border border-[#E2E8F0] rounded-[8px] p-3">
                  <p class="text-[14px] font-semibold">{{ edu.school }}</p>
                  <p class="text-[13px] text-[#64748B]">{{ edu.degree }}  ·  {{ edu.year }}</p>
                </div>
              </div>
            </div>

            <!-- Certifications -->
            <div v-if="parsedResume.certifications.length">
              <p class="text-[11px] uppercase tracking-[0.16em] text-[#94A3B8] font-semibold mb-2">Certifications</p>
              <p class="text-[14px]">{{ parsedResume.certifications.join('  ·  ') }}</p>
            </div>
          </div>

          <p v-else class="text-[14px] text-[#64748B]">Isi form dan klik "Generate CV" untuk melihat preview</p>
        </div>

      </div>
    </div>
  </section>
</template>