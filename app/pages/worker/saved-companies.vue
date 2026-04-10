<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Saved Companies' })
definePageMeta({ layout: 'worker' })

const { get, del } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const tokenCookie = useCookie('access_token')
const loading = ref(true)
const error = ref('')
const success = ref('')
const items = ref([])
const userId = ref('')
const deletingId = ref('')
const pendingUnsave = ref(null)

const fetchData = async () => {
  loading.value = true
  try {
    if (!tokenCookie.value) throw new Error('Missing access token')
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub || ''
    if (!userId.value) throw new Error('Invalid user id')
    const res = await get(`/saved/companies/${userId.value}`)
    items.value = toArray(getData(res))
    success.value = ''
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to fetch saved companies')
  } finally {
    loading.value = false
  }
}

const askUnsave = (company) => {
  pendingUnsave.value = company
}

const cancelUnsave = () => {
  pendingUnsave.value = null
}

const unsave = async () => {
  if (!pendingUnsave.value || deletingId.value) return
  error.value = ''
  success.value = ''
  deletingId.value = pendingUnsave.value.id
  try {
    await del(`/saved/company/${pendingUnsave.value.id}`)
    items.value = items.value.filter((x) => x.id !== pendingUnsave.value.id)
    success.value = 'Company removed from saved list.'
    pendingUnsave.value = null
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to unsave')
  } finally {
    deletingId.value = ''
  }
}

const viewJobs = (company) => navigateTo(`/worker/jobs?q=${encodeURIComponent(company.company_name || '')}`)
onMounted(fetchData)
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Saved Companies</h1>
    <div v-if="pendingUnsave" class="mb-4 rounded-[10px] border border-[#E2E8F0] bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <p class="text-[14px] text-[#334155]">Remove {{ pendingUnsave.company_name || 'this company' }} from your saved list?</p>
      <div class="flex gap-2">
        <button class="border border-[#CBD5E1] rounded-[5px] px-3 py-2 text-[13px]" :disabled="Boolean(deletingId)" @click="cancelUnsave">Cancel</button>
        <button class="bg-red-600 text-white rounded-[5px] px-3 py-2 text-[13px] disabled:opacity-50" :disabled="Boolean(deletingId)" @click="unsave">{{ deletingId ? 'Removing...' : 'Yes, Remove' }}</button>
      </div>
    </div>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <p v-if="success" class="text-[14px] text-green-600 mb-4">{{ success }}</p>
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-[170px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else-if="items.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <CompanyCard v-for="company in items" :key="company.id" :company="company" @view-jobs="viewJobs" @unsave="askUnsave" />
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 text-[14px] text-[#64748B]">No saved company yet.</div>
  </section>
</template>
