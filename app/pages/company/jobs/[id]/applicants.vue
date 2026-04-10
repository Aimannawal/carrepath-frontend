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
const getApplicantName = (item) => item?.worker_user?.full_name || item?.application?.worker_user?.full_name || item?.worker_profiles?.full_name || item?.worker_name || '-'
const getApplicantField = (item) => item?.worker_user?.field_of_work || item?.application?.worker_user?.field_of_work || item?.worker_profiles?.field_of_work || '-'

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
    <h1 class="text-[28px] font-semibold mb-5">Applicants</h1>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-[110px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else-if="items.length" class="space-y-3">
      <div v-for="item in items" :key="getApplicantId(item) || `${item.worker_name || 'worker'}-${item.created_at || ''}`" class="bg-white border border-[#E2E8F0] rounded-[10px] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-[16px] font-semibold">{{ getApplicantName(item) }}</p>
          <p class="text-[13px] text-[#64748B]">{{ getApplicantField(item) }}</p>
          <p class="text-[12px] text-[#94A3B8]">Applied: {{ new Date(item.created_at || Date.now()).toLocaleDateString() }}</p>
          <div v-if="getApplicantCvUrl(item)" class="mt-2 flex items-center gap-3">
            <a :href="getApplicantCvUrl(item)" target="_blank" class="text-[13px] text-[color:var(--color-main)] inline-block">View CV</a>
            <a :href="getApplicantCvUrl(item)" target="_blank" download class="text-[13px] text-[#1D4ED8] inline-block">Download CV</a>
          </div>
          <p v-else class="text-[12px] text-[#94A3B8] mt-2">CV belum diupload oleh applicant.</p>
        </div>
        <div class="flex gap-2">
          <span class="text-[12px] rounded-full px-3 py-1 bg-[#F1F5F9] capitalize">{{ getApplicantStatus(item) }}</span>
          <button class="border border-green-300 text-green-700 rounded-[5px] px-3 py-2 text-[13px] disabled:opacity-40" :disabled="actionLoading || !getApplicantId(item)" @click="updateStatus(item, 'accepted')">Terima</button>
          <button class="border border-red-300 text-red-700 rounded-[5px] px-3 py-2 text-[13px] disabled:opacity-40" :disabled="actionLoading || !getApplicantId(item)" @click="updateStatus(item, 'rejected')">Tolak</button>
        </div>
      </div>
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 text-[14px] text-[#64748B]">No applicants yet.</div>
  </section>
</template>
