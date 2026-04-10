<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Job Detail' })
definePageMeta({ layout: 'worker' })

const route = useRoute()
const { get, post } = useApi()
const tokenCookie = useCookie('access_token')

const loading = ref(true)
const error = ref('')
const job = ref(null)
const company = ref(null)
const openApply = ref(false)
const applyLoading = ref(false)
const coverLetter = ref('')
const cvUrl = ref('')
const userId = ref('')

onMounted(async () => {
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub
    const res = await get(`/jobs/${route.params.id}`)
    job.value = res.data
    company.value = res.data?.company_profiles || null
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load job detail'
  } finally {
    loading.value = false
  }
})

const submitApply = async () => {
  applyLoading.value = true
  try {
    await post('/applications', {
      job_id: job.value.id,
      worker_id: userId.value,
      cv_url: cvUrl.value,
      cover_letter: coverLetter.value
    })
    openApply.value = false
    coverLetter.value = ''
    cvUrl.value = ''
    alert('Application sent')
  } catch (e) {
    alert(e?.data?.error || 'Failed to apply')
  } finally {
    applyLoading.value = false
  }
}

const saveCompany = async () => {
  try {
    await post('/saved/company', { worker_id: userId.value, company_id: company.value.id })
    alert('Company saved')
  } catch (e) {
    alert(e?.data?.error || 'Failed to save company')
  }
}
</script>

<template>
  <section class="p-6 md:p-8">
    <p v-if="loading" class="text-[14px] text-[#64748B]">Loading...</p>
    <p v-else-if="error" class="text-[14px] text-red-600">{{ error }}</p>

    <div v-else class="space-y-6">
      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-6">
        <h1 class="text-[30px] font-semibold">{{ job.title }}</h1>
        <p class="text-[15px] text-[#64748B] mt-2">{{ company?.company_name }}</p>
        <div class="flex flex-wrap gap-2 mt-4">
          <span class="text-[12px] px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">{{ job.location_type }}</span>
          <span class="text-[12px] px-3 py-1 rounded-full bg-[#F1F5F9] text-[#334155]">{{ job.type }}</span>
          <span class="text-[12px] px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA]">{{ job.category }}</span>
        </div>
        <p class="text-[15px] mt-4 text-[#334155]">Salary: Rp {{ Number(job.salary_min || 0).toLocaleString('id-ID') }} - Rp {{ Number(job.salary_max || 0).toLocaleString('id-ID') }}</p>
        <p class="text-[14px] text-[#475569] mt-4 whitespace-pre-line">{{ job.description }}</p>
        <div class="flex gap-3 mt-6">
          <button class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5" @click="openApply = true">Apply Now</button>
          <button class="border border-[#CBD5E1] rounded-[5px] px-5 py-2.5" @click="saveCompany">Save Company</button>
        </div>
      </div>

      <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-6">
        <h2 class="text-[20px] font-semibold">About Company</h2>
        <p class="text-[14px] text-[#64748B] mt-3">{{ company?.description || 'No company description yet.' }}</p>
      </div>
    </div>

    <Modal :open="openApply" title="Apply to Job" @close="openApply = false">
      <div class="space-y-3">
        <div>
          <label class="text-[14px] font-medium text-[color:var(--color-dark)]">CV URL</label>
          <input v-model="cvUrl" class="mt-1 w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="https://.../cv.pdf" />
        </div>
        <div>
          <label class="text-[14px] font-medium text-[color:var(--color-dark)]">Cover Letter</label>
          <textarea v-model="coverLetter" rows="5" class="mt-1 w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]"></textarea>
        </div>
        <button :disabled="applyLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5" @click="submitApply">{{ applyLoading ? 'Sending...' : 'Submit Application' }}</button>
      </div>
    </Modal>
  </section>
</template>
