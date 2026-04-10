<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Admin Stats' })
definePageMeta({ layout: 'admin' })

const { get } = useApi()
const loading = ref(true)
const error = ref('')
const revenue = ref(0)
const stats = ref({ total_users: 0, total_companies: 0, total_jobs: 0, total_transactions: 0 })

onMounted(async () => {
  try {
    const [revRes, statsRes] = await Promise.all([
      get('/admin/revenue'),
      get('/admin/stats')
    ])

    revenue.value = revRes.data?.total_revenue || 0
    stats.value = statsRes.data || stats.value
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load admin stats'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[30px] font-semibold mb-5">Platform Stats</h1>
    <p v-if="error" class="text-[14px] text-red-500 mb-4">{{ error }}</p>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="h-[90px] bg-[#111827] rounded-[10px] animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <div class="bg-[#111827] border border-[#1F2937] rounded-[10px] p-5">
        <p class="text-[13px] text-[#9CA3AF]">Total Revenue</p>
        <p class="text-[24px] font-semibold mt-1 text-white">Rp {{ Number(revenue).toLocaleString('id-ID') }}</p>
      </div>
      <div class="bg-[#111827] border border-[#1F2937] rounded-[10px] p-5">
        <p class="text-[13px] text-[#9CA3AF]">Total Users</p>
        <p class="text-[24px] font-semibold mt-1 text-white">{{ stats.total_users || 0 }}</p>
      </div>
      <div class="bg-[#111827] border border-[#1F2937] rounded-[10px] p-5">
        <p class="text-[13px] text-[#9CA3AF]">Total Companies</p>
        <p class="text-[24px] font-semibold mt-1 text-white">{{ stats.total_companies || 0 }}</p>
      </div>
      <div class="bg-[#111827] border border-[#1F2937] rounded-[10px] p-5">
        <p class="text-[13px] text-[#9CA3AF]">Total Jobs</p>
        <p class="text-[24px] font-semibold mt-1 text-white">{{ stats.total_jobs || 0 }}</p>
      </div>
      <div class="bg-[#111827] border border-[#1F2937] rounded-[10px] p-5">
        <p class="text-[13px] text-[#9CA3AF]">Total Transactions</p>
        <p class="text-[24px] font-semibold mt-1 text-white">{{ stats.total_transactions || 0 }}</p>
      </div>
    </div>
  </section>
</template>
