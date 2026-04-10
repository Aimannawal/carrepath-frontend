<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Worker Transactions' })
definePageMeta({ layout: 'worker' })

const { get } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const { userId } = useAuth()

const loading = ref(true)
const error = ref('')
const items = ref([])

const parseToken = () => {
  if (!userId.value) throw new Error('User not authenticated')
}

onMounted(async () => {
  try {
    parseToken()
    const res = await get(`/payment/transactions/${userId.value}`)
    items.value = toArray(getData(res))
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load transactions')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="flex items-center justify-between gap-3 mb-5">
      <h1 class="text-[28px] font-semibold">Transaction History</h1>
      <NuxtLink to="/worker/upgrade" class="text-[14px] text-[color:var(--color-main)]">Buy package</NuxtLink>
    </div>

    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-[72px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else-if="items.length" class="space-y-3">
      <div v-for="item in items" :key="item.id" class="bg-white border border-[#E2E8F0] rounded-[10px] p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p class="text-[15px] font-medium">{{ item.payment_packages?.name || item.payment_packages?.package_name || 'Package' }}</p>
          <p class="text-[13px] text-[#64748B]">Amount: Rp {{ Number(item.amount || item.payment_packages?.price || 0).toLocaleString('id-ID') }}</p>
        </div>
        <div class="text-left md:text-right">
          <p class="text-[13px] font-medium capitalize">{{ item.status || 'pending' }}</p>
          <p class="text-[12px] text-[#64748B]">{{ new Date(item.created_at || Date.now()).toLocaleString('id-ID') }}</p>
        </div>
      </div>
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 text-[14px] text-[#64748B]">No transaction history yet.</div>
  </section>
</template>
