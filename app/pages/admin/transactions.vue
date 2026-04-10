<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Admin Transactions' })
definePageMeta({ layout: 'admin' })

const { get } = useApi()
const loading = ref(true)
const error = ref('')
const transactions = ref([])

onMounted(async () => {
  try {
    const txRes = await get('/admin/transactions')
    transactions.value = txRes.data || []
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load transactions'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[30px] font-semibold mb-5">Admin Transactions</h1>
    <p v-if="error" class="text-[14px] text-red-500 mb-4">{{ error }}</p>

    <div class="bg-[#0F172A] border border-[#1E293B] rounded-[10px] p-5">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 8" :key="i" class="h-[56px] bg-[#1E293B] rounded-[10px] animate-pulse"></div>
      </div>

      <div v-else-if="transactions.length" class="space-y-3">
        <div v-for="tx in transactions" :key="tx.id" class="p-3 rounded-[10px] bg-[#111827] border border-[#1F2937] flex flex-col md:flex-row md:items-center md:justify-between">
          <p class="text-[14px] text-white">{{ tx.type || 'payment' }} - Rp {{ Number(tx.amount || 0).toLocaleString('id-ID') }}</p>
          <p class="text-[13px] text-[#9CA3AF]">{{ tx.status || '-' }} | {{ new Date(tx.created_at || Date.now()).toLocaleString() }}</p>
        </div>
      </div>

      <div v-else class="text-[14px] text-[#94A3B8]">No transaction data.</div>
    </div>
  </section>
</template>
