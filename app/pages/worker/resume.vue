<script setup>
import { computed, ref, watch } from 'vue'
import { jsPDF } from 'jspdf'

useHead({ title: 'CarrePath | My Resume' })
definePageMeta({ layout: 'worker' })

const { get, post, put, del } = useApi()
const { getData, getErrorMessage, getQuota } = useApiResponse()
const { userId } = useAuth()
const { success, error, confirm: confirmModal } = useModal()

const loadingInitial = ref(true)
const loadingGenerate = ref(false)
const pageError = ref('')
const pageSuccess = ref('')
const quotaState = ref(null)

const cvFiles = ref([])
const cvFileNames = ref([])
const cvFileError = ref('')
const generateResult = ref(null)
const savedResumes = ref([])
const selectedResumeId = ref(null)
const resumeSearchQuery = ref('')
const savingDraft = ref(false)
const readyToAutosave = ref(false)

// Rename modal state
const showRenameModal = ref(false)
const renameTarget = ref({ id: '', name: '' })
const renameInput = ref('')
const renameSaving = ref(false)
let draftSaveTimer = null

// Added states for Creative CV
const cvType = ref('ats') // 'ats' | 'creative'
const creativeTemplate = ref(1) // 1, 2, 3, 4
const profilePhoto = ref('')
const isGeneratingPdf = ref(false)

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
  soft_skills: [],
  certificates: [],
  education: [{ school: '', degree: '', year: '' }],
  experiences: [{ company: '', role: '', start_date: '', end_date: '', tasks: '', impact: '' }]
})

const hardSkillInput = ref('')
const softSkillInput = ref('')
const certificateInput = ref('')

// ─── Computed ────────────────────────────────────────────────────────────────

const quotaDisplayText = computed(() => {
  if (!quotaState.value) return 'Memuat status kuota...'
  return `${quotaState.value.remaining}x tersisa dari ${quotaState.value.quota}x kuota bulan ini`
})

const getLatestResumeSource = (value) => {
  if (!value) return null
  if (Array.isArray(value)) return value[0] || null
  if (Array.isArray(value?.data)) return value.data[0] || null
  if (value?.data && typeof value.data === 'object') return value.data
  return value
}

const parsedResume = computed(() => {
  const source = getLatestResumeSource(generateResult.value)
  if (!source) return null
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
    hard_skills: (() => {
      // Known soft skills that AI often misclassifies into hard_skills
      const SOFT_SKILL_WORDS = ['problem solving', 'teamwork', 'time management', 'communication',
        'leadership', 'collaboration', 'critical thinking', 'adaptability', 'creativity',
        'agile', 'scrum', 'mentoring', 'mentorship', 'presentation', 'organization']
      const FIELD_BLACKLIST = ['development', 'engineering', ' design', 'collaboration', 'control']

      const rawHard = Array.isArray(raw.hard_skills) ? raw.hard_skills : (Array.isArray(raw.skills) ? raw.skills : [])

      // Parse "Category (item1, item2)" format into individual items
      const expanded = []
      rawHard.forEach(s => {
        const match = s && s.match(/^[^(]+\(([^)]+)\)$/)
        if (match) {
          // Extract the items inside parentheses
          match[1].split(',').forEach(item => expanded.push(item.trim()))
        } else if (s) {
          expanded.push(s.trim())
        }
      })

      // Filter out soft skills & field terms, deduplicate
      return expanded.filter((s, i, arr) => {
        if (!s) return false
        const lower = s.toLowerCase()
        if (SOFT_SKILL_WORDS.some(w => lower.includes(w))) return false
        if (FIELD_BLACKLIST.some(w => lower.endsWith(w) && lower.length > w.length + 3)) return false
        return arr.findIndex(x => x.toLowerCase() === lower) === i
      })
    })(),
    soft_skills: (() => {
      const SOFT_SKILL_WORDS = ['problem solving', 'teamwork', 'time management', 'communication',
        'leadership', 'collaboration', 'critical thinking', 'adaptability', 'creativity',
        'agile', 'scrum', 'mentoring', 'mentorship', 'presentation', 'organization',
        'management', 'fast learner', 'detail', 'proactive', 'initiative']

      // Terms to REMOVE from soft_skills (commonly misclassified by AI)
      const SOFT_BLACKLIST = ['development', 'engineering', 'programming', 'coding',
        'design', 'architecture', 'deployment', 'devops', 'testing', 'qa']

      const rawSoft = Array.isArray(raw.soft_skills) ? raw.soft_skills : (Array.isArray(raw.core_competencies) ? raw.core_competencies : [])
      const rawHard = Array.isArray(raw.hard_skills) ? raw.hard_skills : []

      // Rescue soft skills that were misplaced in hard_skills
      const rescued = rawHard.filter(s => {
        const lower = (s || '').toLowerCase()
        return SOFT_SKILL_WORDS.some(w => lower.includes(w))
      })

      return [...rawSoft, ...rescued].filter((s, i, arr) => {
        if (!s) return false
        const lower = s.toLowerCase()
        // Remove any item that contains blacklisted technical terms
        if (SOFT_BLACKLIST.some(w => lower.includes(w))) return false
        return arr.findIndex(x => x.toLowerCase() === lower) === i
      })
    })(),
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
    certifications: [
      ...(Array.isArray(raw.certifications) ? raw.certifications : []),
      ...(Array.isArray(raw.certificates) ? raw.certificates : []),
    ].filter((c, i, arr) => c && arr.indexOf(c) === i), // deduplicate
    projects: Array.isArray(raw.projects) ? raw.projects : []
  }
})

// ─── Creative CV: Smart 1-page curated version ───────────────────────────────
// Priority order for trimming (what gets cut first if too much content):
// 1. certifications beyond top 4
// 2. soft_skills beyond top 4
// 3. hard_skills beyond top 8
// 4. summary truncated to 2 sentences
// 5. projects beyond top 2 (each with short description)
// 6. experience bullets beyond 2 per entry, and entries beyond 2
// 7. education beyond top 2
const parsedResumeCreative = computed(() => {
  const r = parsedResume.value
  if (!r) return null

  // Truncate summary to 2 sentences max
  const truncateSummary = (text, maxSentences = 2) => {
    if (!text) return ''
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    return sentences.slice(0, maxSentences).join(' ').trim()
  }

  // Truncate a string to max N characters
  const truncateStr = (str, max) => {
    if (!str || str.length <= max) return str || ''
    return str.substring(0, max).trimEnd() + '…'
  }

  return {
    name: r.name,
    headline: r.headline,
    summary: truncateSummary(r.summary, 2),
    contact: r.contact,
    // Hard skills: top 8 most relevant (already filtered by blacklist in component)
    hard_skills: r.hard_skills.slice(0, 8),
    // Soft skills: top 4 only
    soft_skills: r.soft_skills.slice(0, 4),
    // Experiences: max 2 entries, each with max 2 bullets, short company/role
    experiences: r.experiences.slice(0, 2).map(exp => ({
      ...exp,
      bullets: exp.bullets.slice(0, 2).map(b => truncateStr(b, 120))
    })),
    // Education: top 2
    education: r.education.slice(0, 2),
    // Certifications: top 4 (most recent/important first)
    certifications: r.certifications.slice(0, 4),
    // Projects: top 2, with short description
    projects: r.projects.slice(0, 2).map(p => ({
      ...p,
      description: truncateStr(p.description, 100),
      impact: truncateStr(p.impact, 80)
    }))
  }
})

const hasPreview = computed(() => {
  return parsedResume.value && (parsedResume.value.name || parsedResume.value.hard_skills.length > 0)
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clearMessages = () => {
  pageError.value = ''
  pageSuccess.value = ''
  cvFileError.value = ''
}

const normalizeDraftForm = (value) => {
  const base = {
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
    soft_skills: [],
    certificates: [],
    education: [{ school: '', degree: '', year: '' }],
    experiences: [{ company: '', role: '', start_date: '', end_date: '', tasks: '', impact: '' }]
  }
  const raw = value && typeof value === 'object' ? value : {}
  return {
    ...base,
    ...raw,
    hard_skills: Array.isArray(raw.hard_skills) ? raw.hard_skills : [],
    soft_skills: Array.isArray(raw.soft_skills) ? raw.soft_skills : [],
    certificates: Array.isArray(raw.certificates) ? raw.certificates : [],
    education: Array.isArray(raw.education) && raw.education.length ? raw.education : base.education,
    experiences: Array.isArray(raw.experiences) && raw.experiences.length ? raw.experiences : base.experiences
  }
}

const saveResumeDraft = async () => {
  if (!userId.value || !readyToAutosave.value) return
  savingDraft.value = true
  try {
    await post('/ai/resume-draft', {
      worker_id: userId.value,
      draft_data: createForm.value
    })
  } catch {
    // Silent fail to avoid disrupting form flow.
  } finally {
    savingDraft.value = false
  }
}

const fetchResumeDraft = async () => {
  if (!userId.value) return
  try {
    const response = await get(`/ai/resume-draft/${userId.value}`)
    const payload = getData(response) || {}
    const draftData = payload.draft_data && typeof payload.draft_data === 'object' ? payload.draft_data : null
    if (!draftData) return

    const merged = normalizeDraftForm({
      ...createForm.value,
      ...draftData,
      hard_skills: Array.isArray(draftData.hard_skills) ? draftData.hard_skills : createForm.value.hard_skills,
      certificates: Array.isArray(draftData.certificates) ? draftData.certificates : createForm.value.certificates,
      education: Array.isArray(draftData.education) && draftData.education.length ? draftData.education : createForm.value.education,
      experiences: Array.isArray(draftData.experiences) && draftData.experiences.length ? draftData.experiences : createForm.value.experiences
    })

    createForm.value = merged
  } catch {
    // No draft yet or request fails: ignore silently.
  }
}

const loadLatestGeneratedResume = async () => {
  if (!userId.value) return
  try {
    const response = await get(`/ai/resumes/${userId.value}`)
    const records = getData(response)
    if (Array.isArray(records)) {
      savedResumes.value = records
      if (records.length && !selectedResumeId.value) {
        selectedResumeId.value = records[0].id
        generateResult.value = records[0]
      } else if (selectedResumeId.value) {
        const found = records.find(r => r.id === selectedResumeId.value)
        if (found) {
          generateResult.value = found
        }
      }
    }
  } catch {
    // Ignore: user may not have a generated resume yet.
  }
}

const selectSavedResume = (id) => {
  selectedResumeId.value = id
  const found = savedResumes.value.find(r => r.id === id)
  if (found) {
    generateResult.value = found
  }
}

const openRenameModal = (id, currentName) => {
  renameTarget.value = { id, name: currentName || '' }
  renameInput.value = currentName || ''
  showRenameModal.value = true
}

const closeRenameModal = () => {
  showRenameModal.value = false
  renameTarget.value = { id: '', name: '' }
  renameInput.value = ''
  renameSaving.value = false
}

const submitRename = async () => {
  const newName = renameInput.value.trim()
  if (!newName || newName === renameTarget.value.name) {
    closeRenameModal()
    return
  }
  renameSaving.value = true
  try {
    await put(`/ai/resumes/${renameTarget.value.id}`, { name: newName })
    success('Berhasil', 'Nama resume berhasil diubah')
    await loadLatestGeneratedResume()
    closeRenameModal()
  } catch (e) {
    error('Gagal', getErrorMessage(e, 'Gagal mengganti nama resume'))
    renameSaving.value = false
  }
}

const deleteResume = (id) => {
  confirmModal(
    'Hapus Resume',
    'Apakah kamu yakin ingin menghapus resume ini? Tindakan ini tidak bisa dibatalkan.',
    async () => {
      try {
        await del(`/ai/resumes/${id}`)
        success('Berhasil', 'Resume berhasil dihapus')
        if (selectedResumeId.value === id) {
          selectedResumeId.value = null
          generateResult.value = null
        }
        await loadLatestGeneratedResume()
      } catch (e) {
        error('Gagal', getErrorMessage(e, 'Gagal menghapus resume'))
      }
    },
    undefined,
    'Hapus'
  )
}

const filteredResumes = computed(() => {
  const q = resumeSearchQuery.value.trim().toLowerCase()
  let list = [...savedResumes.value]
  // Sort descending by created_at (newest first), with updated_at as tiebreaker
  list.sort((a, b) => {
    const dateA = new Date(a.created_at || a.updated_at || 0).getTime()
    const dateB = new Date(b.created_at || b.updated_at || 0).getTime()
    if (dateB !== dateA) return dateB - dateA
    return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
  })
  if (!q) return list
  return list.filter(r => {
    const name = (r.name || 'Untitled Resume').toLowerCase()
    const date = r.updated_at ? new Date(r.updated_at).toLocaleDateString('id-ID') : ''
    const gen = (r.generated_by || '').toLowerCase()
    return name.includes(q) || date.includes(q) || gen.includes(q)
  })
})

const currentPage = ref(1)
const itemsPerPage = 6

const totalPages = computed(() => {
  return Math.ceil(filteredResumes.value.length / itemsPerPage)
})

const paginatedResumes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredResumes.value.slice(start, start + itemsPerPage)
})

watch(() => resumeSearchQuery.value, () => {
  currentPage.value = 1
})

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

const addSoftTag = () => {
  const clean = softSkillInput.value.trim()
  if (!clean || createForm.value.soft_skills.includes(clean)) return
  createForm.value.soft_skills.push(clean)
  softSkillInput.value = ''
}
const removeSoftTag = (index) => createForm.value.soft_skills.splice(index, 1)

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
  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  for (const file of files) {
    if (!validTypes.includes(file.type)) {
      cvFileError.value = 'File harus PDF, JPG, PNG, atau WEBP'
      event.target.value = ''
      cvFiles.value = []
      cvFileNames.value = []
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      cvFileError.value = 'Ukuran file maksimal 10MB per file'
      event.target.value = ''
      cvFiles.value = []
      cvFileNames.value = []
      return
    }
  }
  cvFiles.value = files
  cvFileNames.value = files.map((f) => f.name)
}

const extractSupportDataWithBackendOCR = async (files = []) => {
  if (!files.length) return null

  const ocrForm = new FormData()
  ocrForm.append('prompt', 'Extract complete resume details from all files.')
  files.forEach((file) => {
    ocrForm.append('files[]', file)
  })

  const response = await post('/ai/ocr-extract', ocrForm)
  return getData(response) || null
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
    return ''
  }
}

const removeCvFile = (index) => {
  cvFiles.value = cvFiles.value.filter((_, i) => i !== index)
  cvFileNames.value = cvFileNames.value.filter((_, i) => i !== index)
}

// ─── Main generate flow ───────────────────────────────────────────────────────
// Logika sederhana:
// 1. Kumpulkan data form
// 2. Kalau ada file, langsung append ke FormData dengan key yang dikenali backend
//    - File pertama → cv_file
//    - File berikutnya → additional_file_1, additional_file_2, dst.
//    Backend (processAdditionalFiles) sudah handle semua key ini via Gemini Vision.
// 3. Kirim ke /ai/generate-resume — backend gabungkan form + file content
// 4. Tidak ada OCR step terpisah, tidak ada autofill form

const runGenerateFromCreate = async () => {
  if (loadingGenerate.value) return
  clearMessages()

  if (!createForm.value.full_name || !createForm.value.email || !createForm.value.summary) {
    pageError.value = 'Full name, email, dan summary wajib diisi.'
    return
  }

  loadingGenerate.value = true
  try {
    const formData = new FormData()

    // ── Data worker ──────────────────────────────────────────────────────────
    formData.append('worker_id', userId.value)
    formData.append('cv_text', createForm.value.summary || '')
    formData.append('cv_payload', JSON.stringify(createForm.value))

    // Flat fields (backward compat dengan backend)
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
    formData.append('soft_skills', JSON.stringify(createForm.value.soft_skills))
    formData.append('certificates', JSON.stringify(createForm.value.certificates))
    formData.append('education', JSON.stringify(createForm.value.education))
    formData.append('experiences', JSON.stringify(createForm.value.experiences))
    formData.append('language', 'en')

    const pdfFiles = cvFiles.value.filter((file) => file.type === 'application/pdf')
    const imageFiles = cvFiles.value.filter((file) => file.type !== 'application/pdf')

    if (pdfFiles.length > 0) {
      const pdfTextParts = []
      for (const file of pdfFiles) {
        const extracted = await parseTextFromPdf(file)
        if (extracted) pdfTextParts.push(extracted)
      }
      if (pdfTextParts.length) {
        const pdfMergedText = pdfTextParts.join('\n\n')
        formData.set('cv_text', formData.get('cv_text') ? `${formData.get('cv_text')}\n\n${pdfMergedText}` : pdfMergedText)
      }
    }

    let imageOcrSuccess = false
    if (imageFiles.length > 0) {
      try {
        const ocrData = await extractSupportDataWithBackendOCR(imageFiles)
        const ocrText = String(ocrData?.raw_text || '').trim()
        if (ocrText) {
          imageOcrSuccess = true
          formData.set('cv_text', formData.get('cv_text') ? `${formData.get('cv_text')}\n\n${ocrText}` : ocrText)
        }
      } catch {
        imageOcrSuccess = false
      }
    }

    // Only send image files back as fallback if OCR extraction failed.
    if (imageFiles.length > 0 && !imageOcrSuccess) {
      formData.append('cv_file', imageFiles[0])
      for (let i = 1; i < imageFiles.length; i++) {
        formData.append(`additional_file_${i}`, imageFiles[i])
      }
    }

    // PDF files are already converted to text locally, so do not upload them again.

    const response = await post('/ai/generate-resume', formData)
    generateResult.value = getData(response)
    if (Array.isArray(generateResult.value) && generateResult.value.length) {
      generateResult.value = generateResult.value[0]
    }
    selectedResumeId.value = generateResult.value?.id || null
    updateQuotaFromResponse(response)

    await loadLatestGeneratedResume()

    success('Generate CV Berhasil', 'Resume kamu sudah siap di-preview dan download.')
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Generate resume gagal.')
    error('Generate CV Gagal', pageError.value)
  } finally {
    loadingGenerate.value = false
  }
}

// ─── PDF Download — Creative Style ────────────────────────────────────────────

const downloadCreativeCvPdf = async () => {
  if (!hasPreview.value) {
    pageError.value = 'Belum ada hasil resume untuk di-download.'
    return
  }

  const element = document.getElementById('creative-cv-export')
  if (!element) {
    pageError.value = 'Elemen CV tidak ditemukan.'
    return
  }

  isGeneratingPdf.value = true

  const safeName = (parsedResume.value?.name || 'resume').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '')

  const printWindow = window.open('', '_blank', 'width=900,height=1200')
  if (!printWindow) {
    pageError.value = 'Popup diblokir oleh browser. Mohon izinkan popup untuk download PDF.'
    isGeneratingPdf.value = false
    return
  }

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CV-Kreatif-${safeName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: white; font-family: 'Inter', sans-serif; }
    @page { size: A4 portrait; margin: 0; }
    @media print {
      html, body { width: 210mm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none !important; }
    }
    #cv-print-root { width: 794px; }
  </style>
</head>
<body>
  <div id="cv-print-root">${element.outerHTML}</div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        document.title = 'CV-Kreatif-${safeName}';
        window.print();
        window.close();
      }, 1200);
    };
  <\/script>
</body>
</html>`)

  printWindow.document.close()
  isGeneratingPdf.value = false
}


// ─── PDF Download — Harvard Style ────────────────────────────────────────────

const downloadCvPdf = () => {
  if (!hasPreview.value) {
    pageError.value = 'Belum ada hasil resume untuk di-download.'
    return
  }

  const data = parsedResume.value
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const mL = 56  // margin left
  const mR = 56  // margin right
  const mT = 52  // margin top
  const mB = 52  // margin bottom
  const contentW = pageW - mL - mR
  let y = mT

  // ── helpers ────────────────────────────────────────────────────────────────

  const checkPage = (needed) => {
    if (y + needed > pageH - mB) {
      doc.addPage()
      y = mT
    }
  }

  const setFont = (style, size) => {
    doc.setFont('times', style)
    doc.setFontSize(size)
  }

  const writeText = (txt, x, maxW, lineHeight, style, size, color) => {
    setFont(style, size)
    if (color) doc.setTextColor(...color)
    const lines = doc.splitTextToSize(String(txt || ''), maxW)
    checkPage(lines.length * lineHeight + 2)
    doc.text(lines, x, y)
    y += lines.length * lineHeight
    if (color) doc.setTextColor(0, 0, 0)
    return lines.length
  }

  const drawHRule = (thickness, color, topGap = 3, bottomGap = 9) => {
    checkPage(topGap + bottomGap + 2)
    y += topGap
    const yLine = Math.round(y) + 0.5
    doc.setDrawColor(...(color || [33, 33, 33]))
    doc.setLineWidth(thickness)
    doc.line(mL, yLine, pageW - mR, yLine)
    y = yLine + bottomGap
    doc.setDrawColor(0, 0, 0)
  }

  const sectionHeading = (label) => {
    y += 11
    checkPage(20)
    setFont('bold', 10)
    doc.setTextColor(0, 0, 0)
    const lines = doc.splitTextToSize(label.toUpperCase(), contentW)
    doc.text(lines, mL, y)
    y += 13
    drawHRule(0.55, [38, 38, 38], 2, 9)
  }

  // ── NAME ──────────────────────────────────────────────────────────────────
  setFont('bold', 17)
  doc.setTextColor(0, 0, 0)
  const nameLines = doc.splitTextToSize(data.name || '', contentW)
  doc.text(nameLines, pageW / 2, y, { align: 'center' })
  y += nameLines.length * 20

  // ── HEADLINE ──────────────────────────────────────────────────────────────
  if (data.headline) {
    setFont('italic', 10.5)
    doc.setTextColor(80, 80, 80)
    const hlLines = doc.splitTextToSize(data.headline, contentW)
    doc.text(hlLines, pageW / 2, y, { align: 'center' })
    y += hlLines.length * 14
    doc.setTextColor(0, 0, 0)
  }

  // ── CONTACT LINE ──────────────────────────────────────────────────────────
  const contactParts = [
    data.contact.email,
    data.contact.phone,
    data.contact.location,
    data.contact.website
  ].filter(Boolean)

  if (contactParts.length) {
    y += 4
    setFont('normal', 9)
    doc.setTextColor(60, 60, 60)
    const contactStr = contactParts.join('   |   ')
    const contactLines = doc.splitTextToSize(contactStr, contentW)
    doc.text(contactLines, pageW / 2, y, { align: 'center' })
    y += contactLines.length * 13
    doc.setTextColor(0, 0, 0)
  }

  y += 6
  drawHRule(1.0, [15, 23, 42], 2, 10)

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  if (data.summary) {
    sectionHeading('Summary')
    setFont('normal', 10)
    doc.setTextColor(30, 30, 30)
    const sumLines = doc.splitTextToSize(data.summary, contentW)
    checkPage(sumLines.length * 14)
    doc.text(sumLines, mL, y)
    y += sumLines.length * 14
    doc.setTextColor(0, 0, 0)
  }

  // ── EXPERIENCE ────────────────────────────────────────────────────────────
  if (data.experiences.length) {
    sectionHeading('Experience')
    data.experiences.forEach((exp) => {
      checkPage(32)

      // Role (bold) + period (right-aligned, same line)
      setFont('bold', 10.5)
      doc.setTextColor(0, 0, 0)
      const roleLines = doc.splitTextToSize(exp.role || '', contentW * 0.72)
      doc.text(roleLines, mL, y)

      if (exp.period) {
        setFont('normal', 9.5)
        doc.setTextColor(80, 80, 80)
        doc.text(exp.period, pageW - mR, y, { align: 'right' })
        doc.setTextColor(0, 0, 0)
      }
      y += roleLines.length * 14

      // Company (italic)
      if (exp.company) {
        setFont('italic', 10)
        doc.setTextColor(60, 60, 60)
        const coLines = doc.splitTextToSize(exp.company, contentW)
        checkPage(coLines.length * 13)
        doc.text(coLines, mL, y)
        y += coLines.length * 13
        doc.setTextColor(0, 0, 0)
      }

      // Bullet points
      if (exp.bullets && exp.bullets.length) {
        y += 3
        exp.bullets.forEach((bullet) => {
          const bulletText = String(bullet || '').trim()
          if (!bulletText) return
          const bulletLines = doc.splitTextToSize(bulletText, contentW - 12)
          checkPage(bulletLines.length * 13 + 2)
          setFont('normal', 10)
          doc.setTextColor(30, 30, 30)
          doc.text('•', mL, y)
          doc.text(bulletLines, mL + 10, y)
          y += bulletLines.length * 13 + 2
        })
        doc.setTextColor(0, 0, 0)
      }

      y += 6
    })
  }

  // ── EDUCATION ─────────────────────────────────────────────────────────────
  if (data.education.length) {
    sectionHeading('Education')
    data.education.forEach((edu) => {
      checkPage(28)

      // School (bold) + year (right)
      setFont('bold', 10.5)
      doc.setTextColor(0, 0, 0)
      const schLines = doc.splitTextToSize(edu.school || '', contentW * 0.72)
      doc.text(schLines, mL, y)

      if (edu.year) {
        setFont('normal', 9.5)
        doc.setTextColor(80, 80, 80)
        doc.text(edu.year, pageW - mR, y, { align: 'right' })
        doc.setTextColor(0, 0, 0)
      }
      y += schLines.length * 14

      // Degree (italic)
      if (edu.degree) {
        setFont('italic', 10)
        doc.setTextColor(60, 60, 60)
        const degLines = doc.splitTextToSize(edu.degree, contentW)
        checkPage(degLines.length * 13)
        doc.text(degLines, mL, y)
        y += degLines.length * 13
        doc.setTextColor(0, 0, 0)
      }
      y += 5
    })
  }

  // ── SKILLS ────────────────────────────────────────────────────────────────
  const allSkills = [
    ...data.hard_skills,
    ...data.soft_skills
  ].filter(Boolean)

  if (allSkills.length) {
    sectionHeading('Skills')
    setFont('normal', 10)
    doc.setTextColor(30, 30, 30)
    const skillStr = allSkills.join('   ·   ')
    const skillLines = doc.splitTextToSize(skillStr, contentW)
    checkPage(skillLines.length * 14)
    doc.text(skillLines, mL, y)
    y += skillLines.length * 14
    doc.setTextColor(0, 0, 0)
  }

  // ── CERTIFICATIONS ────────────────────────────────────────────────────────
  if (data.certifications.length) {
    sectionHeading('Certifications')
    data.certifications.forEach((cert) => {
      const certText = String(cert || '').trim()
      if (!certText) return
      checkPage(16)
      setFont('normal', 10)
      doc.setTextColor(30, 30, 30)
      doc.text('•', mL, y)
      const certLines = doc.splitTextToSize(certText, contentW - 12)
      doc.text(certLines, mL + 10, y)
      y += certLines.length * 14
    })
    doc.setTextColor(0, 0, 0)
  }

  // ── PROJECTS ──────────────────────────────────────────────────────────────
  if (data.projects && data.projects.length) {
    sectionHeading('Projects')
    data.projects.forEach((proj) => {
      checkPage(28)
      if (proj.name) {
        setFont('bold', 10.5)
        doc.setTextColor(0, 0, 0)
        const projLines = doc.splitTextToSize(proj.name, contentW)
        doc.text(projLines, mL, y)
        y += projLines.length * 14
      }
      if (proj.tech_stack && proj.tech_stack.length) {
        setFont('italic', 9.5)
        doc.setTextColor(80, 80, 80)
        const tsLines = doc.splitTextToSize(proj.tech_stack.join(', '), contentW)
        checkPage(tsLines.length * 13)
        doc.text(tsLines, mL, y)
        y += tsLines.length * 13
        doc.setTextColor(0, 0, 0)
      }
      if (proj.description) {
        setFont('normal', 10)
        doc.setTextColor(30, 30, 30)
        const descLines = doc.splitTextToSize(proj.description, contentW)
        checkPage(descLines.length * 13)
        doc.text(descLines, mL, y)
        y += descLines.length * 13
      }
      if (proj.impact) {
        setFont('italic', 10)
        doc.setTextColor(60, 60, 60)
        const impLines = doc.splitTextToSize(`Impact: ${proj.impact}`, contentW)
        checkPage(impLines.length * 13)
        doc.text(impLines, mL, y)
        y += impLines.length * 13
      }
      y += 6
      doc.setTextColor(0, 0, 0)
    })
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = (data.name || 'resume').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '')
  doc.save(`CV-${safeName}.pdf`)
}

// ─── Init ─────────────────────────────────────────────────────────────────────

const loadInitialData = async () => {
  if (!userId.value) return
  loadingInitial.value = true
  readyToAutosave.value = false
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
    profilePhoto.value = profile.photo_url || profile.profile_url || user.photo_url || ''
    
    // Fetch initial quota
    try {
      const quotaRes = await get(`/ai/quota/${userId.value}`)
      const quotaData = getData(quotaRes)
      if (quotaData) quotaState.value = quotaData
    } catch {
      // Ignore quota fetch error
    }

    await fetchResumeDraft()
    await loadLatestGeneratedResume()
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Gagal memuat halaman resume.')
  } finally {
    readyToAutosave.value = true
    loadingInitial.value = false
  }
}

watch(
  () => createForm.value,
  () => {
    if (!readyToAutosave.value) return
    if (draftSaveTimer) clearTimeout(draftSaveTimer)
    draftSaveTimer = setTimeout(() => {
      saveResumeDraft()
    }, 800)
  },
  { deep: true }
)

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
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Hard Skills (Tools, Bahasa Pemrograman)</label>
          <div class="flex gap-2">
            <input v-model="hardSkillInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="e.g. Vue.js, Python, Figma" @keyup.enter="addTag" />
            <button class="px-4 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8] text-[13px] font-medium" @click="addTag">Add</button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="(skill, idx) in createForm.hard_skills" :key="idx" class="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]" @click="removeTag(idx)">{{ skill }} ×</button>
          </div>
        </div>

        <!-- Soft Skills -->
        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Soft Skills (Kemampuan Interpersonal)</label>
          <div class="flex gap-2">
            <input v-model="softSkillInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px]" placeholder="e.g. Teamwork, Problem Solving" @keyup.enter="addSoftTag" />
            <button class="px-4 py-2 rounded-[8px] bg-[#EEF2FF] text-[#1D4ED8] text-[13px] font-medium" @click="addSoftTag">Add</button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <button v-for="(skill, idx) in createForm.soft_skills" :key="idx" class="text-[12px] px-2 py-1 rounded-full bg-[#FAF5FF] text-[#9333EA]" @click="removeSoftTag(idx)">{{ skill }} ×</button>
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
        <div class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-4 space-y-3">
          <div>
            <label class="text-[13px] font-semibold text-[#334155] block mb-1">Upload CV / Dokumen Pendukung</label>
            <p class="text-[11px] text-[#94A3B8]">
              Upload PDF atau gambar CV lama kamu. Isinya akan dibaca AI dan digabungkan dengan data form untuk membuat CV yang lebih lengkap.
            </p>
          </div>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] bg-white"
            @change="handleCvFileUpload"
          />
          <p v-if="cvFileError" class="text-[12px] text-red-600">{{ cvFileError }}</p>
          <div v-if="cvFileNames.length" class="flex flex-wrap gap-2">
            <span
              v-for="(name, idx) in cvFileNames"
              :key="idx"
              class="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#166534]"
            >
              <span>✓ {{ name }}</span>
              <button class="text-[#166534] hover:text-red-600 font-bold leading-none" @click="removeCvFile(idx)">×</button>
            </span>
          </div>
        </div>

        <!-- CV Format & Template Options -->
        <div class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-4 space-y-4">
          <div>
            <label class="text-[13px] font-semibold text-[#334155] block mb-2">Pilih Format CV</label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="cvType" value="ats" class="text-[color:var(--color-main)] focus:ring-[color:var(--color-main)]" />
                <span class="text-[14px]">ATS (Harvard Style)</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" v-model="cvType" value="creative" class="text-[color:var(--color-main)] focus:ring-[color:var(--color-main)]" />
                <span class="text-[14px]">Kreatif (Non-ATS)</span>
              </label>
            </div>
          </div>
          
          <div v-if="cvType === 'creative'" class="pt-2 border-t border-[#E2E8F0]">
            <label class="text-[13px] font-semibold text-[#334155] block mb-2">Pilih Desain Kreatif</label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div @click="creativeTemplate = 1" :class="['cursor-pointer border-2 rounded-[8px] p-2 text-center transition-all', creativeTemplate === 1 ? 'border-[#3B82F6] bg-[#EFF6FF]' : 'border-[#E2E8F0] hover:border-[#93C5FD]']">
                <div class="h-12 w-full rounded-[4px] bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] mb-2"></div>
                <span class="text-[12px] font-medium text-[#1E3A8A]">Modern Blue</span>
              </div>
              <div @click="creativeTemplate = 2" :class="['cursor-pointer border-2 rounded-[8px] p-2 text-center transition-all', creativeTemplate === 2 ? 'border-[#1F2937] bg-[#F3F4F6]' : 'border-[#E2E8F0] hover:border-[#9CA3AF]']">
                <div class="h-12 w-full rounded-[4px] bg-gradient-to-br from-[#111827] to-[#374151] mb-2"></div>
                <span class="text-[12px] font-medium text-[#111827]">Elegant Dark</span>
              </div>
              <div @click="creativeTemplate = 3" :class="['cursor-pointer border-2 rounded-[8px] p-2 text-center transition-all', creativeTemplate === 3 ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#E2E8F0] hover:border-[#FCA5A5]']">
                <div class="h-12 w-full rounded-[4px] bg-gradient-to-br from-[#7F1D1D] to-[#DC2626] mb-2"></div>
                <span class="text-[12px] font-medium text-[#7F1D1D]">Vibrant Red</span>
              </div>
              <div @click="creativeTemplate = 4" :class="['cursor-pointer border-2 rounded-[8px] p-2 text-center transition-all', creativeTemplate === 4 ? 'border-[#10B981] bg-[#ECFDF5]' : 'border-[#E2E8F0] hover:border-[#6EE7B7]']">
                <div class="h-12 w-full rounded-[4px] bg-gradient-to-br from-[#047857] to-[#10B981] mb-2"></div>
                <span class="text-[12px] font-medium text-[#047857]">Minimal Green</span>
              </div>
            </div>
          </div>
        </div>


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

        <!-- Saved Resumes -->
        <div v-if="savedResumes.length > 0" class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-6">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
            <div>
              <h2 class="text-[19px] font-semibold">My Saved Resumes</h2>
              <p class="text-[12px] text-[#94A3B8] mt-0.5">{{ savedResumes.length }} resume tersimpan</p>
            </div>
            <!-- Live Search -->
            <div class="relative w-full md:w-[280px]">
              <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                v-model="resumeSearchQuery"
                type="text"
                placeholder="Cari resume..."
                class="w-full pl-9 pr-3 py-2.5 border border-[#E2E8F0] rounded-[10px] text-[13px] bg-white focus:outline-none focus:border-[color:var(--color-main)] focus:ring-1 focus:ring-[color:var(--color-main)] transition-all"
              />
            </div>
          </div>

          <!-- No search results -->
          <p v-if="filteredResumes.length === 0 && resumeSearchQuery.trim()" class="text-[14px] text-[#94A3B8] text-center py-6">
            Tidak ada resume yang cocok dengan pencarian "{{ resumeSearchQuery }}"
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="resume in paginatedResumes" 
              :key="resume.id" 
              :class="[
                'group border rounded-[12px] p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3',
                selectedResumeId === resume.id 
                  ? 'border-[color:var(--color-main)] bg-gradient-to-br from-[#EEF2FF] to-[#F8FAFF] shadow-[0_2px_12px_rgba(43,77,182,0.10)]' 
                  : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:shadow-sm bg-white'
              ]"
              @click="selectSavedResume(resume.id)"
            >
              <div>
                <div class="flex items-start gap-2">
                  <div class="flex-shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center mt-0.5" :class="selectedResumeId === resume.id ? 'bg-[color:var(--color-main)] text-white' : 'bg-[#F1F5F9] text-[#64748B] group-hover:bg-[#E2E8F0]'">
                    <Icon name="heroicons:document-text" class="w-4 h-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-[14px] truncate text-[#0F172A]">{{ resume.name || 'Untitled Resume' }}</p>
                    <p class="text-[11px] text-[#94A3B8] mt-0.5">
                      {{ resume.updated_at ? new Date(resume.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A' }}
                    </p>
                  </div>
                </div>
                <div class="mt-2 ml-10">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-medium" :class="resume.generated_by === 'optimize' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#DCFCE7] text-[#166534]'">
                    {{ resume.generated_by === 'optimize' ? 'Optimized' : 'Generated' }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2 justify-end mt-1" @click.stop>
                <button 
                  class="text-[12px] px-3 py-1.5 rounded-[8px] border border-[#E2E8F0] text-[#475569] bg-white hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all inline-flex items-center gap-1.5"
                  @click="openRenameModal(resume.id, resume.name)"
                >
                  <Icon name="heroicons:pencil-square" class="w-3.5 h-3.5" />
                  Rename
                </button>
                <button 
                  class="text-[12px] px-3 py-1.5 rounded-[8px] border border-red-100 text-red-500 bg-red-50/50 hover:bg-red-100 hover:text-red-600 transition-all inline-flex items-center gap-1.5"
                  @click="deleteResume(resume.id)"
                >
                  <Icon name="heroicons:trash" class="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-[#E2E8F0] mt-6 pt-4">
            <div class="text-[13px] text-[#64748B]">
              Menampilkan <span class="font-medium text-[#0F172A]">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> - 
              <span class="font-medium text-[#0F172A]">{{ Math.min(currentPage * itemsPerPage, filteredResumes.length) }}</span> dari 
              <span class="font-medium text-[#0F172A]">{{ filteredResumes.length }}</span> resume
            </div>
            <div class="flex items-center gap-2">
              <button 
                :disabled="currentPage === 1" 
                class="p-2 border border-[#E2E8F0] rounded-[8px] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-white text-[#475569] transition-all"
                @click="currentPage--"
              >
                <Icon name="heroicons:chevron-left" class="w-4 h-4" />
              </button>
              <div class="flex items-center gap-1">
                <button 
                  v-for="page in totalPages" 
                  :key="page"
                  :class="[
                    'px-3.5 py-1.5 rounded-[8px] text-[13px] font-medium transition-all',
                    currentPage === page 
                      ? 'bg-[color:var(--color-main)] text-white' 
                      : 'border border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]'
                  ]"
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
              </div>
              <button 
                :disabled="currentPage === totalPages" 
                class="p-2 border border-[#E2E8F0] rounded-[8px] bg-white hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-white text-[#475569] transition-all"
                @click="currentPage++"
              >
                <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Rename Modal -->
        <Teleport to="body">
          <Transition name="modal">
            <div v-if="showRenameModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <!-- Backdrop -->
              <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeRenameModal" />
              <!-- Modal Card -->
              <div class="relative bg-white rounded-[16px] shadow-2xl w-full max-w-[420px] overflow-hidden animate-[modalSlideIn_0.25s_ease-out]">
                <!-- Header -->
                <div class="bg-gradient-to-r from-[#2B4DB6] to-[#3B63D6] px-6 py-4">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 bg-white/20 rounded-[10px] flex items-center justify-center">
                        <Icon name="heroicons:pencil-square" class="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 class="text-[16px] font-semibold text-white">Rename Resume</h3>
                        <p class="text-[11px] text-white/70">Berikan nama yang mudah diingat</p>
                      </div>
                    </div>
                    <button @click="closeRenameModal" class="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors">
                      <Icon name="heroicons:x-mark" class="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                <!-- Body -->
                <div class="px-6 py-5">
                  <label class="text-[12px] font-medium text-[#64748B] block mb-2">Nama Resume</label>
                  <input
                    v-model="renameInput"
                    type="text"
                    placeholder="Contoh: CV Backend Engineer"
                    class="w-full border border-[#E2E8F0] rounded-[10px] px-4 py-3 text-[14px] focus:outline-none focus:border-[color:var(--color-main)] focus:ring-2 focus:ring-[#2B4DB6]/10 transition-all"
                    @keyup.enter="submitRename"
                    autofocus
                  />
                </div>
                <!-- Footer -->
                <div class="px-6 pb-5 flex items-center gap-3 justify-end">
                  <button 
                    @click="closeRenameModal" 
                    class="px-5 py-2.5 text-[13px] font-medium rounded-[10px] border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    @click="submitRename" 
                    :disabled="renameSaving || !renameInput.trim()"
                    class="px-5 py-2.5 text-[13px] font-medium rounded-[10px] bg-[color:var(--color-main)] text-white hover:bg-[#243F99] disabled:opacity-50 transition-all inline-flex items-center gap-2"
                  >
                    <Icon v-if="renameSaving" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                    <span>{{ renameSaving ? 'Menyimpan...' : 'Simpan' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>

        <!-- Preview -->
        <div class="bg-[#FAFBFF] border border-[#E2E8F0] rounded-[12px] p-6">
          <div class="flex items-center justify-between gap-3 mb-4">
            <h2 class="text-[19px] font-semibold">CV Preview</h2>
            <button v-if="hasPreview" class="bg-[color:var(--color-main)] text-white rounded-[8px] px-4 py-2 text-[14px] disabled:opacity-50" @click="cvType === 'ats' ? downloadCvPdf() : downloadCreativeCvPdf()" :disabled="isGeneratingPdf">
              <span v-if="isGeneratingPdf" class="flex items-center gap-2"><Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin"/> Exporting...</span>
              <span v-else>Download PDF</span>
            </button>
          </div>

          <template v-if="hasPreview && parsedResume">
            <div v-if="cvType === 'ats'" class="space-y-5">
            <!-- Header -->
            <div class="text-center border-b border-[#E2E8F0] pb-4">
              <h3 class="text-[22px] font-semibold tracking-wide uppercase">{{ parsedResume.name }}</h3>
              <p v-if="parsedResume.headline" class="text-[13px] text-[#64748B] italic mt-1">{{ parsedResume.headline }}</p>
              <p class="text-[12px] text-[#64748B] mt-1">
                {{ [parsedResume.contact.email, parsedResume.contact.phone, parsedResume.contact.location, parsedResume.contact.website].filter(Boolean).join('   |   ') }}
              </p>
            </div>

            <!-- Summary -->
            <div v-if="parsedResume.summary">
              <p class="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] font-semibold mb-2 border-b border-[#E2E8F0] pb-1">Summary</p>
              <p class="text-[13px] leading-relaxed">{{ parsedResume.summary }}</p>
            </div>

            <!-- Experience -->
            <div v-if="parsedResume.experiences.length">
              <p class="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] font-semibold mb-3 border-b border-[#E2E8F0] pb-1">Experience</p>
              <div class="space-y-4">
                <div v-for="(exp, idx) in parsedResume.experiences" :key="idx">
                  <div class="flex items-baseline justify-between">
                    <p class="text-[14px] font-semibold">{{ exp.role }}</p>
                    <p class="text-[11px] text-[#94A3B8] shrink-0 ml-3">{{ exp.period }}</p>
                  </div>
                  <p class="text-[12px] text-[#64748B] italic">{{ exp.company }}</p>
                  <ul v-if="exp.bullets.length" class="mt-2 space-y-1">
                    <li v-for="(b, bIdx) in exp.bullets" :key="bIdx" class="text-[12px] text-[#334155] flex gap-2">
                      <span class="shrink-0">•</span><span>{{ b }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Education -->
            <div v-if="parsedResume.education.length">
              <p class="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] font-semibold mb-3 border-b border-[#E2E8F0] pb-1">Education</p>
              <div class="space-y-2">
                <div v-for="(edu, idx) in parsedResume.education" :key="idx">
                  <div class="flex items-baseline justify-between">
                    <p class="text-[13px] font-semibold">{{ edu.school }}</p>
                    <p class="text-[11px] text-[#94A3B8] shrink-0 ml-3">{{ edu.year }}</p>
                  </div>
                  <p class="text-[12px] text-[#64748B] italic">{{ edu.degree }}</p>
                </div>
              </div>
            </div>

            <!-- Skills -->
            <div v-if="parsedResume.hard_skills.length || parsedResume.soft_skills.length">
              <p class="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] font-semibold mb-2 border-b border-[#E2E8F0] pb-1">Skills</p>
              
              <div v-if="parsedResume.hard_skills.length" class="mb-3">
                <p class="text-[12px] font-medium text-[#475569] mb-1.5">Hard Skills</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(skill, idx) in parsedResume.hard_skills" :key="'hard'+idx" class="text-[11px] px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">{{ skill }}</span>
                </div>
              </div>

              <div v-if="parsedResume.soft_skills.length">
                <p class="text-[12px] font-medium text-[#475569] mb-1.5">Soft Skills</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(skill, idx) in parsedResume.soft_skills" :key="'soft'+idx" class="text-[11px] px-2.5 py-1 rounded-full bg-[#F3E8FF] text-[#7E22CE]">{{ skill }}</span>
                </div>
              </div>
            </div>

            <!-- Certifications -->
            <div v-if="parsedResume.certifications.length">
              <p class="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] font-semibold mb-2 border-b border-[#E2E8F0] pb-1">Certifications</p>
              <ul class="space-y-1">
                <li v-for="(cert, idx) in parsedResume.certifications" :key="idx" class="text-[12px] text-[#334155] flex gap-2">
                  <span class="shrink-0">•</span><span>{{ cert }}</span>
                </li>
              </ul>
            </div>

            <!-- Projects -->
            <div v-if="parsedResume.projects.length">
              <p class="text-[10px] uppercase tracking-[0.18em] text-[#94A3B8] font-semibold mb-3 border-b border-[#E2E8F0] pb-1">Projects</p>
              <div class="space-y-3">
                <div v-for="(proj, idx) in parsedResume.projects" :key="idx">
                  <p class="text-[13px] font-semibold">{{ proj.name }}</p>
                  <p v-if="proj.tech_stack?.length" class="text-[11px] text-[#64748B] italic">{{ proj.tech_stack.join(', ') }}</p>
                  <p v-if="proj.description" class="text-[12px] text-[#334155] mt-1">{{ proj.description }}</p>
                  <p v-if="proj.impact" class="text-[12px] text-[#64748B] italic mt-0.5">{{ proj.impact }}</p>
                </div>
              </div>
            </div>
            </div>
            
            <div v-else-if="cvType === 'creative'">
              <CreativeCvPreview :data="parsedResumeCreative" :photo-url="profilePhoto" :template-id="creativeTemplate" />
            </div>
          </template>

          <p v-else class="text-[14px] text-[#64748B]">Isi form dan klik "Generate CV" untuk melihat preview</p>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-enter-active {
  transition: opacity 0.2s ease-out;
}
.modal-leave-active {
  transition: opacity 0.15s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>