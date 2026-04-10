<script setup>
import { ref, computed, onMounted } from 'vue'

useHead({ title: 'CarrePath | Worker Resume' })
definePageMeta({ layout: 'worker' })

const { get, post, put } = useApi()
const tokenCookie = useCookie('access_token')

const userId = ref('')
const tab = ref('optimize')
const loading = ref(false)
const error = ref('')
const warning = ref('')
const profileMissing = ref(false)

const profile = ref({
  full_name: '',
  email: '',
  phone: '',
  country: '',
  province: '',
  city: '',
  website: '',
  bio: '',
  field_of_work: ''
})

const experiences = ref([{ company_name: '', role: '', start_date: '', end_date: '', tasks: '' }])
const skillInput = ref('')
const skills = ref([])
const cvText = ref('')
const targetRole = ref('Backend Engineer')
const optimizeResult = ref(null)
const generatedResume = ref(null)
const studyPlan = ref([])

const quotaText = computed(() => {
  const used = Number(profile.value.ai_generate_used || 0)
  const quota = Number(profile.value.ai_generate_quota || 3)
  return `${quota - used}x / Month Free Generating`
})

const optimizePayload = computed(() => (Array.isArray(optimizeResult.value) ? optimizeResult.value[0] : optimizeResult.value))
const optimizeData = computed(() => optimizePayload.value?.raw_data || optimizePayload.value?.data || optimizePayload.value || null)

const planPayload = computed(() => (Array.isArray(studyPlan.value) ? studyPlan.value[0] : studyPlan.value))
const planData = computed(() => planPayload.value?.plan_data || planPayload.value?.data?.plan_data || planPayload.value?.data || planPayload.value || null)
const mostRelevantCareers = computed(() => planData.value?.most_relevant_careers || [])
const studyWeeks = computed(() => planData.value?.study_plan || [])
const recommendationReason = computed(() => planData.value?.recommendation_reason || '')

const formatJson = (value) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

const addExperience = () => experiences.value.push({ company_name: '', role: '', start_date: '', end_date: '', tasks: '' })
const addSkill = () => {
  const skill = skillInput.value.trim()
  if (!skill) return
  if (!skills.value.includes(skill)) skills.value.push(skill)
  skillInput.value = ''
}
const removeSkill = (idx) => skills.value.splice(idx, 1)

const fetchProfile = async () => {
  try {
    if (!tokenCookie.value) return
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub
    profile.value.email = payload.email || ''
    profile.value.full_name = payload.user_metadata?.full_name || ''

    const res = await get(`/workers/profile/${userId.value}`)
    const worker = res.data?.profile || {}
    profile.value = { ...profile.value, ...worker }
    experiences.value = res.data?.experiences?.length ? res.data.experiences : experiences.value
    skills.value = Array.from(new Set((res.data?.skills || []).map((item) => item.skill_name).filter(Boolean)))
    profileMissing.value = false
  } catch (e) {
    if (e?.status === 404) {
      profileMissing.value = true
    } else {
      error.value = e?.data?.error || 'Failed to load worker profile'
    }
  }
}

onMounted(fetchProfile)

const generateResume = async () => {
  if (loading.value) return
  loading.value = true
  error.value = ''
  warning.value = ''

  try {
    await put(`/workers/profile/${userId.value}`, {
      phone: profile.value.phone,
      address: profile.value.address,
      province: profile.value.province,
      city: profile.value.city,
      country: profile.value.country,
      website: profile.value.website,
      bio: profile.value.bio,
      field_of_work: profile.value.field_of_work
    })

    for (const experience of experiences.value) {
      if (experience.company_name && experience.role) {
        await post('/workers/experience', { worker_id: userId.value, ...experience })
      }
    }

    for (const skill of skills.value) {
      await post('/workers/skill', { worker_id: userId.value, skill_name: skill })
    }

    const res = await post('/ai/generate-resume', { worker_id: userId.value })
    generatedResume.value = res.data

    if (!profileMissing.value) {
      await fetchProfile()
    }
  } catch (e) {
    error.value = e?.data?.error || 'Failed to generate resume'
  } finally {
    loading.value = false
  }
}

const optimizeResume = async () => {
  if (loading.value) return
  if (!cvText.value.trim()) {
    error.value = 'CV text is required before optimization.'
    return
  }

  loading.value = true
  error.value = ''
  warning.value = ''

  try {
    const optimizeRes = await post('/ai/optimize-resume', { worker_id: userId.value, cv_text: cvText.value })
    optimizeResult.value = optimizeRes.data

    try {
      const studyRes = await post('/ai/study-plan', {
        worker_id: userId.value,
        cv_text: cvText.value,
        target_role: targetRole.value
      })
      studyPlan.value = studyRes.data?.weeks || studyRes.data || []
    } catch (studyErr) {
      warning.value = studyErr?.data?.error || 'Study plan is not available from backend yet.'
      studyPlan.value = []
    }

    if (!profileMissing.value) {
      await fetchProfile()
    }
  } catch (e) {
    error.value = e?.data?.error || 'Failed to optimize resume'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="p-4 md:p-6 lg:p-8">
    <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-[13px] uppercase tracking-[0.18em] text-[#64748B]">My Resume</p>
          <h1 class="text-[26px] md:text-[30px] font-semibold mt-1">Resume Studio</h1>
          <p class="text-[14px] text-[#64748B] mt-2 max-w-2xl">Build your CV, review AI analysis, and generate a study plan from one workspace.</p>
        </div>
        <div class="rounded-[12px] bg-[#EEF2FF] border-l-2 border-[color:var(--color-main)] px-4 py-3 min-w-[220px]">
          <p class="text-[12px] text-[#64748B] uppercase tracking-[0.16em]">Quota</p>
          <p class="text-[16px] font-semibold text-[color:var(--color-dark)] mt-1">{{ quotaText }}</p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-2">
        <button :class="['px-4 py-2 rounded-[8px] text-[14px] font-medium transition', tab === 'optimize' ? 'bg-[color:var(--color-main)] text-white' : 'bg-[#F1F5F9] text-[#64748B]']" @click="tab = 'optimize'">Optimize CV</button>
        <button :class="['px-4 py-2 rounded-[8px] text-[14px] font-medium transition', tab === 'generate' ? 'bg-[color:var(--color-main)] text-white' : 'bg-[#F1F5F9] text-[#64748B]']" @click="tab = 'generate'">Auto-generate CV</button>
      </div>

      <p v-if="error" class="text-[14px] text-red-600 mt-4">{{ error }}</p>
      <p v-if="warning" class="text-[14px] text-amber-700 mt-2">{{ warning }}</p>

      <div v-if="tab === 'generate'" class="mt-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 space-y-5 shadow-sm">
          <div>
            <h2 class="text-[20px] font-semibold">Personal Information</h2>
            <p class="text-[13px] text-[#64748B] mt-1">Fill your data before generating a CV.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input v-model="profile.full_name" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Full Name" />
            <input v-model="profile.email" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Email" />
            <input v-model="profile.phone" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Phone" />
            <input v-model="profile.website" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Website" />
            <input v-model="profile.country" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Country" />
            <input v-model="profile.province" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Province" />
            <input v-model="profile.city" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="City" />
            <input v-model="profile.field_of_work" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Field of Work" />
          </div>

          <textarea v-model="profile.bio" rows="4" class="w-full border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Short description"></textarea>

          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-[16px] font-semibold">Experience</h3>
              <button class="text-[14px] text-[color:var(--color-main)]" @click="addExperience">+ Add Experience</button>
            </div>
            <div v-for="(exp, idx) in experiences" :key="idx" class="border border-[#E2E8F0] rounded-[12px] p-3 mb-3 grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#FAFBFF]">
              <input v-model="exp.company_name" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Company Name" />
              <input v-model="exp.role" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Role" />
              <input v-model="exp.start_date" type="date" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" />
              <input v-model="exp.end_date" type="date" class="border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" />
              <textarea v-model="exp.tasks" rows="3" class="md:col-span-2 border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Tasks"></textarea>
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-[16px] font-semibold">Skills</h3>
              <button class="text-[14px] text-[color:var(--color-main)]" @click="addSkill">+ Add skill</button>
            </div>
            <div class="flex gap-2">
              <input v-model="skillInput" class="flex-1 border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Type skill" @keyup.enter.prevent="addSkill" />
              <button class="bg-[#EEF2FF] text-[#1D4ED8] rounded-[8px] px-4 text-[14px]" @click="addSkill">Add</button>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <button v-for="(item, idx) in skills" :key="item + idx" class="bg-[#EEF2FF] text-[#1D4ED8] text-[13px] px-3 py-1 rounded-full" @click="removeSkill(idx)">{{ item }} x</button>
            </div>
          </div>

          <button class="bg-[color:var(--color-main)] text-white rounded-[8px] px-5 py-2.5 text-[14px]" :disabled="loading" @click="generateResume">{{ loading ? 'Generating...' : 'Generate' }}</button>

          <div v-if="generatedResume" class="border border-[#E2E8F0] rounded-[12px] p-4 bg-[#0F172A] text-[#E2E8F0]">
            <h3 class="text-[16px] font-semibold mb-2">Generated Output</h3>
            <pre class="text-[12px] overflow-auto whitespace-pre-wrap">{{ formatJson(generatedResume) }}</pre>
          </div>
        </div>

        <div class="space-y-5">
          <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm">
            <h2 class="text-[20px] font-semibold">Analysis Result</h2>
            <p class="text-[13px] text-[#64748B] mt-1">Based on your CV and current market fit.</p>

            <div v-if="optimizeData" class="mt-4 space-y-4">
              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Summary</p>
                <p class="text-[14px] mt-1 text-[color:var(--color-dark)]">{{ optimizeData.summary || '-' }}</p>
              </div>

              <div>
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Top Skills</p>
                <div class="flex flex-wrap gap-2 mt-2">
                  <span v-for="(skill, idx) in (optimizeData.skills || [])" :key="skill + idx" class="text-[12px] px-3 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]">{{ skill }}</span>
                </div>
              </div>

              <div v-if="optimizeData.education?.length">
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Education</p>
                <div class="mt-2 space-y-2">
                  <div v-for="(edu, idx) in optimizeData.education" :key="idx" class="p-3 rounded-[12px] bg-[#FAFBFF] border border-[#E2E8F0]">
                    <p class="text-[14px] font-medium">{{ edu.school || edu.institution || '-' }}</p>
                    <p class="text-[13px] text-[#64748B]">{{ edu.major || edu.degree || '-' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="mt-4 text-[14px] text-[#64748B]">Run Optimize CV to see the analysis here.</div>
          </div>

          <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm">
            <h2 class="text-[20px] font-semibold">Recommendation Job for you</h2>
            <p class="text-[13px] text-[#64748B] mt-1">AI selected roles that fit your current profile.</p>

            <div v-if="mostRelevantCareers.length" class="space-y-3 mt-4">
              <div v-for="(career, idx) in mostRelevantCareers" :key="idx" class="flex items-center justify-between border border-[#E2E8F0] rounded-[12px] p-3 bg-[#FAFBFF]">
                <div>
                  <p class="text-[14px] font-medium">{{ career.title }}</p>
                  <p class="text-[12px] text-[#64748B]">Fit score {{ career.percentage }}%</p>
                </div>
              </div>
            </div>
            <div v-else class="mt-4 text-[14px] text-[#64748B]">No recommendation yet.</div>
          </div>
        </div>
      </div>

      <div v-else class="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm">
          <div class="border border-dashed border-[#CBD5E1] rounded-[14px] p-8 text-center text-[14px] text-[#64748B] bg-[#FAFBFF]">Upload CV area (paste CV text below)</div>
          <textarea v-model="cvText" rows="6" class="mt-4 w-full border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Paste CV text"></textarea>
          <input v-model="targetRole" class="mt-3 w-full md:w-[320px] border border-[#E2E8F0] rounded-[8px] px-[14px] py-[12px] text-[14px]" placeholder="Target role" />
          <button class="mt-4 bg-[color:var(--color-main)] text-white rounded-[8px] px-5 py-2.5 text-[14px]" :disabled="loading" @click="optimizeResume">{{ loading ? 'Analyzing...' : 'Optimize' }}</button>
        </div>

        <div class="space-y-5">
          <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm">
            <h2 class="text-[20px] font-semibold">Analysis Result</h2>
            <p class="text-[13px] text-[#64748B] mt-1">{{ recommendationReason || 'CV analysis and recommendation will appear here.' }}</p>

            <div v-if="optimizeData" class="mt-4 space-y-3">
              <div class="p-3 rounded-[12px] bg-[#FAFBFF] border border-[#E2E8F0]">
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Summary</p>
                <p class="text-[14px] mt-1">{{ optimizeData.summary || '-' }}</p>
              </div>
              <div class="p-3 rounded-[12px] bg-[#FAFBFF] border border-[#E2E8F0]">
                <p class="text-[12px] uppercase tracking-[0.16em] text-[#94A3B8]">Skills</p>
                <div class="flex flex-wrap gap-2 mt-2">
                  <span v-for="(skill, idx) in (optimizeData.skills || [])" :key="skill + idx" class="text-[12px] px-3 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]">{{ skill }}</span>
                </div>
              </div>
            </div>

            <div v-else class="mt-4 text-[14px] text-[#64748B]">Run Optimize CV to see the analysis here.</div>
          </div>

          <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-sm">
            <h2 class="text-[20px] font-semibold">Study Plan</h2>
            <p class="text-[13px] text-[#64748B] mt-1">Weekly plan based on target role.</p>

            <div v-if="studyWeeks.length" class="space-y-3 mt-4">
              <div v-for="(week, idx) in studyWeeks" :key="idx" class="p-4 rounded-[12px] border border-[#E2E8F0] bg-[#FAFBFF]">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-[14px] font-semibold">{{ week.week_label || week.title || `Week ${idx + 1}` }}</p>
                  <span v-if="week.percentage" class="text-[12px] px-2 py-1 rounded-full bg-[#EEF2FF] text-[#1D4ED8]">{{ week.percentage }}%</span>
                </div>
                <p v-if="Array.isArray(week.topics)" class="mt-2 text-[13px] text-[#475569]">Topics: {{ week.topics.join(', ') }}</p>
                <pre v-else class="mt-2 text-[12px] text-[#475569] whitespace-pre-wrap">{{ formatJson(week) }}</pre>
              </div>
            </div>
            <div v-else class="mt-4 text-[14px] text-[#64748B]">Run Optimize CV to generate the study plan.</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
