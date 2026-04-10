<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Saved Companies' })
definePageMeta({ layout: 'worker' })

const { get, del } = useApi()
const tokenCookie = useCookie('access_token')
const loading = ref(true)
const error = ref('')
const items = ref([])
const userId = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub
    const res = await get(`/saved/companies/${userId.value}`)
    items.value = res.data || []
  } catch (e) {
    error.value = e?.data?.error || 'Failed to fetch saved companies'
  } finally {
    loading.value = false
  }
}

const unsave = async (company) => {
  try {
    await del(`/saved/company/${company.id}`)
    items.value = items.value.filter((x) => x.id !== company.id)
  } catch (e) {
    alert(e?.data?.error || 'Failed to unsave')
  }
}

const viewJobs = (company) => navigateTo(`/worker/jobs?q=${encodeURIComponent(company.company_name || '')}`)
onMounted(fetchData)
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Saved Companies</h1>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="h-[170px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else-if="items.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <CompanyCard v-for="company in items" :key="company.id" :company="company" @view-jobs="viewJobs" @unsave="unsave" />
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 text-[14px] text-[#64748B]">No saved company yet.</div>
  </section>
</template>
