<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Worker Upgrade' })
definePageMeta({ layout: 'worker' })

const { get, post, put } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const loading = ref(true)
const error = ref('')
const success = ref('')
const packages = ref([])
const openModal = ref(false)
const selectedPackage = ref(null)
const paymentMethod = ref('qris')
const pendingTransaction = ref(null)
const invoiceLoading = ref(false)
const confirmLoading = ref(false)
const workerProfile = ref(null)

const loadWorkerProfile = async () => {
  if (!userId.value) return
  try {
    const res = await get(`/workers/profile/${userId.value}`)
    const payload = asObject(getData(res))
    workerProfile.value = asObject(payload.profile || payload)
  } catch {
    workerProfile.value = null
  }
}

onMounted(async () => {
  try {
    if (!userId.value) throw new Error('User not authenticated')
    const res = await get('/payment/packages?target_role=worker')
    packages.value = toArray(getData(res))
    await loadWorkerProfile()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load packages')
  } finally {
    loading.value = false
  }
})

const openBuy = (pkg) => {
  selectedPackage.value = pkg
  paymentMethod.value = 'qris'
  pendingTransaction.value = null
  openModal.value = true
}

const createInvoice = async () => {
  if (invoiceLoading.value || !selectedPackage.value?.id) return
  error.value = ''
  success.value = ''
  invoiceLoading.value = true
  try {
    const res = await post('/payment/transaction', {
      user_id: userId.value,
      package_id: selectedPackage.value.id,
      payment_method: paymentMethod.value
    })
    const payload = getData(res)
    pendingTransaction.value = Array.isArray(payload) ? payload[0] : payload
    success.value = 'Invoice created. Complete payment then confirm.'
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to create transaction')
  } finally {
    invoiceLoading.value = false
  }
}

const confirmPayment = async () => {
  if (confirmLoading.value) return
  if (!pendingTransaction.value?.id) return
  error.value = ''
  success.value = ''
  confirmLoading.value = true
  try {
    await put(`/payment/transaction/${pendingTransaction.value.id}/confirm`, {})
    await loadWorkerProfile()
    success.value = 'Payment confirmed. Your package is active.'
    openModal.value = false
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to confirm payment')
  } finally {
    confirmLoading.value = false
  }
}
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Worker Token Packages</h1>
    <div v-if="workerProfile" class="mb-4 rounded-[10px] border border-[#E2E8F0] bg-white p-4">
      <p class="text-[13px] text-[#64748B]">Current AI Quota</p>
      <p class="text-[16px] font-semibold text-[color:var(--color-dark)] mt-1">{{ Number(workerProfile.ai_generate_quota || 0) - Number(workerProfile.ai_generate_used || 0) }} remaining</p>
    </div>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <p v-if="success" class="text-[14px] text-green-600 mb-4">{{ success }}</p>

    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="h-[230px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <PaymentPackageCard v-for="pkg in packages" :key="pkg.id" :pkg="pkg" @buy="openBuy" />
    </div>

    <Modal :open="openModal" title="Payment" @close="openModal = false">
      <div class="space-y-3">
        <p class="text-[14px]">Package: {{ selectedPackage?.name }}</p>
        <select v-model="paymentMethod" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
          <option value="qris">QRIS</option>
          <option value="transfer">Transfer</option>
          <option value="va">Virtual Account</option>
        </select>
        <p class="text-[13px] text-[#64748B]">Dummy payment instruction: complete payment then click confirm.</p>
        <div class="flex gap-3">
          <button :disabled="invoiceLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-4 py-2 disabled:opacity-40" @click="createInvoice">{{ invoiceLoading ? 'Creating...' : 'Create Invoice' }}</button>
          <button :disabled="!pendingTransaction || confirmLoading" class="border border-[#CBD5E1] rounded-[5px] px-4 py-2 disabled:opacity-40" @click="confirmPayment">{{ confirmLoading ? 'Confirming...' : 'Konfirmasi Bayar' }}</button>
        </div>
      </div>
    </Modal>
  </section>
</template>
