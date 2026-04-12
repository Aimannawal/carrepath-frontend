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
  <section class="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
    <h1 class="text-[30px] font-semibold mb-2 text-[#1E293B]">Platform Stats</h1>
    <p class="text-[14px] text-[#64748B] mb-5">Realtime snapshot of platform performance</p>
    <p v-if="error" class="text-[14px] text-red-500 mb-4">{{ error }}</p>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <div v-for="i in 5" :key="i" class="h-[90px] bg-white border border-[#E2E8F0] rounded-[12px] animate-pulse"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B]">Total Revenue</p>
        <p class="text-[24px] font-semibold mt-1 text-[#1E293B]">Rp {{ Number(revenue).toLocaleString('id-ID') }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B]">Total Users</p>
        <p class="text-[24px] font-semibold mt-1 text-[#1E293B]">{{ stats.total_users || 0 }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B]">Total Companies</p>
        <p class="text-[24px] font-semibold mt-1 text-[#1E293B]">{{ stats.total_companies || 0 }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B]">Total Jobs</p>
        <p class="text-[24px] font-semibold mt-1 text-[#1E293B]">{{ stats.total_jobs || 0 }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B]">Total Transactions</p>
        <p class="text-[24px] font-semibold mt-1 text-[#1E293B]">{{ stats.total_transactions || 0 }}</p>
      </div>
    </div>
  </section>
</template>
