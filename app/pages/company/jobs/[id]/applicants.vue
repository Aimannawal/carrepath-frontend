<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Job Applicants' })
definePageMeta({ layout: 'company' })

const route = useRoute()
const { get, put } = useApi()
const loading = ref(true)
const error = ref('')
const items = ref([])

const loadData = async () => {
  loading.value = true
  try {
    const res = await get(`/applications/job/${route.params.id}`)
    items.value = res.data || []
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load applicants'
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

const updateStatus = async (item, status) => {
  try {
    await put(`/applications/${item.id}/status`, { status })
    await loadData()
  } catch (e) {
    alert(e?.data?.error || 'Failed to update status')
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
      <div v-for="item in items" :key="item.id" class="bg-white border border-[#E2E8F0] rounded-[10px] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-[16px] font-semibold">{{ item.worker_profiles?.full_name || item.worker_name || '-' }}</p>
          <p class="text-[13px] text-[#64748B]">{{ item.worker_profiles?.field_of_work || '-' }}</p>
          <p class="text-[12px] text-[#94A3B8]">Applied: {{ new Date(item.created_at || Date.now()).toLocaleDateString() }}</p>
          <a :href="item.cv_url" target="_blank" class="text-[13px] text-[color:var(--color-main)] mt-2 inline-block">Lihat Resume</a>
        </div>
        <div class="flex gap-2">
          <span class="text-[12px] rounded-full px-3 py-1 bg-[#F1F5F9] capitalize">{{ item.status || 'pending' }}</span>
          <button class="border border-green-300 text-green-700 rounded-[5px] px-3 py-2 text-[13px]" @click="updateStatus(item, 'accepted')">Terima</button>
          <button class="border border-red-300 text-red-700 rounded-[5px] px-3 py-2 text-[13px]" @click="updateStatus(item, 'rejected')">Tolak</button>
        </div>
      </div>
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 text-[14px] text-[#64748B]">No applicants yet.</div>
  </section>
</template>
