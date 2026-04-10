<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Settings' })
definePageMeta({ layout: 'company' })

const { get, post, put } = useApi()
const tokenCookie = useCookie('access_token')

const loading = ref(true)
const error = ref('')
const packages = ref([])
const selectedPackage = ref(null)
const paymentMethod = ref('qris')
const transaction = ref(null)
const openModal = ref(false)
const userId = ref('')

onMounted(async () => {
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub
    const res = await get('/payment/packages?target_role=company')
    packages.value = res.data || []
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load packages'
  } finally {
    loading.value = false
  }
})

const choosePackage = (pkg) => {
  selectedPackage.value = pkg
  paymentMethod.value = 'qris'
  transaction.value = null
  openModal.value = true
}

const createInvoice = async () => {
  try {
    const res = await post('/payment/transaction', {
      user_id: userId.value,
      package_id: selectedPackage.value.id,
      payment_method: paymentMethod.value
    })
    transaction.value = res.data?.[0] || res.data
  } catch (e) {
    alert(e?.data?.error || 'Failed to create invoice')
  }
}

const confirmPayment = async () => {
  if (!transaction.value?.id) return
  try {
    await put(`/payment/transaction/${transaction.value.id}/confirm`, {})
    alert('Company premium activated.')
    openModal.value = false
  } catch (e) {
    alert(e?.data?.error || 'Failed to confirm payment')
  }
}
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Company Premium</h1>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-[220px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <PaymentPackageCard v-for="pkg in packages" :key="pkg.id" :pkg="pkg" @buy="choosePackage" />
    </div>

    <Modal :open="openModal" title="Select Payment Method" @close="openModal = false">
      <div class="space-y-3">
        <p class="text-[14px]">Package: {{ selectedPackage?.name }}</p>
        <select v-model="paymentMethod" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
          <option value="va">Virtual Account</option>
        </select>
        <p class="text-[13px] text-[#64748B]">Dummy payment flow for now.</p>
        <div class="flex gap-3">
          <button class="bg-[color:var(--color-main)] text-white rounded-[5px] px-4 py-2" @click="createInvoice">Create Invoice</button>
          <button :disabled="!transaction" class="border border-[#CBD5E1] rounded-[5px] px-4 py-2 disabled:opacity-40" @click="confirmPayment">Konfirmasi Bayar</button>
        </div>
      </div>
    </Modal>
  </section>
</template>
