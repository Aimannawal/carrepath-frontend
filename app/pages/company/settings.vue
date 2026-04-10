<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Settings' })
definePageMeta({ layout: 'company' })

const { get, post, put } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
const tokenCookie = useCookie('access_token')

const loading = ref(true)
const error = ref('')
const success = ref('')
const packages = ref([])
const selectedPackage = ref(null)
const paymentMethod = ref('qris')
const transaction = ref(null)
const openModal = ref(false)
const userId = ref('')
const invoiceLoading = ref(false)
const confirmLoading = ref(false)
const companyProfile = ref(null)

const loadCompanyProfile = async () => {
  if (!userId.value) return
  try {
    const res = await get(`/companies/profile/${userId.value}`)
    companyProfile.value = asObject(getData(res))
  } catch {
    companyProfile.value = null
  }
}

onMounted(async () => {
  try {
    if (!tokenCookie.value) throw new Error('Missing access token')
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub || ''
    if (!userId.value) throw new Error('Invalid user id')
    const res = await get('/payment/packages?target_role=company')
    packages.value = toArray(getData(res))
    await loadCompanyProfile()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load packages')
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
    transaction.value = Array.isArray(payload) ? payload[0] : payload
    success.value = 'Invoice created. Complete payment then confirm.'
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to create invoice')
  } finally {
    invoiceLoading.value = false
  }
}

const confirmPayment = async () => {
  if (confirmLoading.value) return
  if (!transaction.value?.id) return
  error.value = ''
  success.value = ''
  confirmLoading.value = true
  try {
    await put(`/payment/transaction/${transaction.value.id}/confirm`, {})
    await loadCompanyProfile()
    success.value = 'Company premium activated.'
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
    <h1 class="text-[28px] font-semibold mb-5">Company Premium</h1>
    <div v-if="companyProfile" class="mb-4 rounded-[10px] border border-[#E2E8F0] bg-white p-4">
      <p class="text-[13px] text-[#64748B]">Premium Status</p>
      <p class="text-[16px] font-semibold text-[color:var(--color-dark)] mt-1">
        {{ companyProfile.premium_active || companyProfile.is_premium ? 'Active' : 'Inactive' }}
      </p>
      <p v-if="companyProfile.premium_until || companyProfile.premium_expires_at" class="text-[13px] text-[#64748B] mt-1">
        Premium active until {{ new Date(companyProfile.premium_until || companyProfile.premium_expires_at).toLocaleDateString('id-ID') }}
      </p>
    </div>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <p v-if="success" class="text-[14px] text-green-600 mb-4">{{ success }}</p>

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
          <button :disabled="invoiceLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-4 py-2 disabled:opacity-40" @click="createInvoice">{{ invoiceLoading ? 'Creating...' : 'Create Invoice' }}</button>
          <button :disabled="!transaction || confirmLoading" class="border border-[#CBD5E1] rounded-[5px] px-4 py-2 disabled:opacity-40" @click="confirmPayment">{{ confirmLoading ? 'Confirming...' : 'Konfirmasi Bayar' }}</button>
        </div>
      </div>
    </Modal>
  </section>
</template>
