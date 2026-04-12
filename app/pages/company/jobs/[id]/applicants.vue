<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Job Applicants' })
definePageMeta({ layout: 'company' })

const route = useRoute()
const { get, put } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const loading = ref(true)
const error = ref('')
const items = ref([])
const actionLoading = ref(false)

const getApplicantId = (item) => item?.id || item?.application?.id || ''
const getApplicantStatus = (item) => item?.status || item?.application?.status || 'pending'
const getApplicantCvUrl = (item) => item?.cv_url || item?.application?.cv_url || ''
const getApplicantName = (item) => item?.worker_user?.full_name || item?.application?.worker_user?.full_name || item?.worker_profile?.full_name || item?.worker_name || '-'
const getApplicantField = (item) => item?.worker_user?.field_of_work || item?.application?.worker_user?.field_of_work || item?.worker_profile?.field_of_work || '-'
const getAppliedAt = (item) => item?.applied_at || item?.application?.applied_at || item?.created_at || null

const getStatusBadgeClass = (status) => {
  if (status === 'accepted') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

const isReviewable = (item) => getApplicantStatus(item) === 'pending'

const loadData = async () => {
  loading.value = true
  try {
    const res = await get(`/applications/job/${route.params.id}`)
    items.value = toArray(getData(res))
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load applicants')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const updateStatus = async (item, status) => {
  const applicantId = getApplicantId(item)
  if (!applicantId) {
    error.value = 'Applicant id is missing'
    return
  }

  if (actionLoading.value) return
  actionLoading.value = true
  error.value = ''
  try {
    await put(`/applications/${applicantId}/status`, { status })
    await loadData()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to update status')
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="mb-5 rounded-[24px] border border-[#E2E8F0] bg-gradient-to-r from-white via-[#F8FAFC] to-[#FFF7ED] p-5 md:p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
      <h1 class="text-[28px] font-semibold">Applicants</h1>
      <p class="text-[14px] text-[#64748B] mt-1">Review applicants from a cleaner card layout. Status buttons disappear once the application has been processed.</p>
    </div>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-[128px] bg-white border border-[#E2E8F0] rounded-[18px] animate-pulse"></div>
    </div>
    <div v-else-if="items.length" class="space-y-3">
      <div v-for="item in items" :key="getApplicantId(item) || `${item.worker_name || 'worker'}-${item.created_at || ''}`" class="rounded-[18px] border border-[#E2E8F0] bg-gradient-to-br from-white to-slate-50 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] flex flex-col gap-4">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-[17px] font-semibold text-[#0F172A]">{{ getApplicantName(item) }}</p>
              <span :class="['text-[12px] rounded-full px-3 py-1 border capitalize', getStatusBadgeClass(getApplicantStatus(item))]">{{ getApplicantStatus(item) }}</span>
            </div>
            <p class="text-[13px] text-[#64748B]">{{ getApplicantField(item) }}</p>
            <p class="text-[12px] text-[#94A3B8]">Applied: {{ new Date(getAppliedAt(item) || Date.now()).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <a v-if="getApplicantCvUrl(item)" :href="getApplicantCvUrl(item)" target="_blank" class="rounded-full border border-[color:var(--color-main)] bg-[color:var(--color-main)] px-4 py-2 text-[13px] font-medium text-white shadow-[0_10px_22px_rgba(29,78,216,0.16)] inline-block">View CV</a>
            <a v-if="getApplicantCvUrl(item)" :href="getApplicantCvUrl(item)" target="_blank" download class="rounded-full border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] inline-block">Download CV</a>
          </div>
        </div>
        <p v-if="!getApplicantCvUrl(item)" class="text-[12px] text-[#94A3B8]">CV belum diupload oleh applicant.</p>
        <div v-if="isReviewable(item)" class="flex flex-wrap gap-2 pt-1">
          <button class="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[13px] font-medium text-emerald-700 transition duration-150 hover:-translate-y-[1px] hover:bg-emerald-100 hover:border-emerald-300 disabled:opacity-40 disabled:hover:translate-y-0" :disabled="actionLoading || !getApplicantId(item)" @click="updateStatus(item, 'accepted')">Terima</button>
          <button class="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[13px] font-medium text-rose-700 transition duration-150 hover:-translate-y-[1px] hover:bg-rose-100 hover:border-rose-300 disabled:opacity-40 disabled:hover:translate-y-0" :disabled="actionLoading || !getApplicantId(item)" @click="updateStatus(item, 'rejected')">Tolak</button>
        </div>
      </div>
    </div>
    <div v-else class="rounded-[18px] border border-[#E2E8F0] bg-white p-6 text-[14px] text-[#64748B] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">No applicants yet.</div>
  </section>
</template>
