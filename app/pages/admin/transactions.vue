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
  <section class="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
    <h1 class="text-[30px] font-semibold mb-2 text-[#1E293B]">Admin Transactions</h1>
    <p class="text-[14px] text-[#64748B] mb-5">Monitor all payment activity and status updates</p>
    <p v-if="error" class="text-[14px] text-red-500 mb-4">{{ error }}</p>

    <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm">
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 8" :key="i" class="h-[56px] bg-[#F1F5F9] rounded-[10px] animate-pulse"></div>
      </div>

      <div v-else-if="transactions.length" class="space-y-3">
        <div v-for="tx in transactions" :key="tx.id" class="p-4 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="tx.status === 'success' ? 'bg-emerald-100' : 'bg-amber-100'">
              <Icon :name="tx.status === 'success' ? 'mdi:check-circle' : 'mdi:clock-outline'" :class="tx.status === 'success' ? 'text-emerald-600' : 'text-amber-600'" />
            </div>
            <div>
              <p class="text-[14px] font-medium text-[#1E293B]">{{ tx.type || 'payment' }}</p>
              <p class="text-[12px] text-[#64748B]">Rp {{ Number(tx.amount || 0).toLocaleString('id-ID') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-[11px] px-2.5 py-1 rounded-full inline-block mb-1" :class="tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">{{ tx.status || '-' }}</span>
              <p class="text-[12px] text-[#64748B]">{{ formatDate(tx.created_at || Date.now(), true) }}</p>
            </div>
            <NuxtLink :to="`/invoice/${tx.id}`" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] transition" title="View Invoice">
              <Icon name="mdi:receipt-text-outline" class="w-4 h-4" />
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="text-[14px] text-[#94A3B8] text-center py-8">No transaction data.</div>
    </div>
  </section>
</template>
