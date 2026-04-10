<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Upgrade' })
definePageMeta({ layout: 'company' })

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
const companyProfile = ref(null)

/**
 * Load company profile to show current status
 */
const loadCompanyProfile = async () => {
  if (!userId.value) return
  try {
    const res = await get(`/companies/profile/${userId.value}`)
    const payload = asObject(getData(res))
    companyProfile.value = asObject(payload.profile || payload)
  } catch {
    companyProfile.value = null
  }
}

/**
 * Load payment packages on mount
 */
onMounted(async () => {
  try {
    if (!userId.value) throw new Error('User not authenticated')
    const res = await get('/payment/packages?target_role=company')
    packages.value = toArray(getData(res))
    await loadCompanyProfile()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load packages')
  } finally {
    loading.value = false
  }
})

/**
 * Open modal to select package
 */
const openBuy = (pkg) => {
  selectedPackage.value = pkg
  paymentMethod.value = 'qris'
  pendingTransaction.value = null
  openModal.value = true
}

/**
 * Create payment invoice
 */
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

/**
 * Confirm payment after completion
 */
const confirmPayment = async () => {
  if (confirmLoading.value) return
  if (!pendingTransaction.value?.id) return
  error.value = ''
  success.value = ''
  confirmLoading.value = true
  try {
    await put(`/payment/transaction/${pendingTransaction.value.id}/confirm`, {})
    await loadCompanyProfile()
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
    <h1 class="text-[28px] font-semibold mb-2">Company Upgrade</h1>
    <p class="text-[14px] text-[#64748B] mb-6">Choose a premium package to boost your company profile</p>

    <!-- Error State -->
    <div v-if="error" class="mb-4 bg-red-50 border border-red-200 rounded-[10px] p-4">
      <p class="text-red-700 text-[14px]">{{ error }}</p>
    </div>

    <!-- Success State -->
    <div v-if="success" class="mb-4 bg-green-50 border border-green-200 rounded-[10px] p-4">
      <p class="text-green-700 text-[14px]">{{ success }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="h-[240px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>

    <!-- Packages Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="pkg in packages" :key="pkg.id" class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 flex flex-col">
        <h3 class="text-[20px] font-semibold text-[#1E293B]">{{ pkg.name }}</h3>
        <p class="text-[14px] text-[#64748B] mt-2">{{ pkg.description }}</p>

        <div class="mt-4 py-4 border-t border-b border-[#E2E8F0]">
          <p class="text-[28px] font-bold text-[#1E293B]">
            Rp{{ Number(pkg.price || 0).toLocaleString('id-ID') }}
          </p>
          <p class="text-[12px] text-[#64748B] mt-1">{{ pkg.duration || 'one-time' }}</p>
        </div>

        <ul class="mt-4 space-y-2 text-[13px] text-[#334155] flex-1">
          <li v-if="pkg.perks" class="flex gap-2">
            <span>✓</span>
            <span>{{ pkg.perks }}</span>
          </li>
          <li class="flex gap-2" v-if="pkg.max_postings">
            <span>✓</span>
            <span>Up to {{ pkg.max_postings }} job postings</span>
          </li>
          <li class="flex gap-2" v-if="pkg.featured">
            <span>✓</span>
            <span>Featured listings</span>
          </li>
        </ul>

        <button
          class="mt-6 w-full bg-[color:var(--color-main)] text-white rounded-[5px] px-4 py-2.5 text-[14px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          :disabled="loading"
          @click="openBuy(pkg)"
        >
          Upgrade Now
        </button>
      </div>
    </div>

    <!-- Links -->
    <div class="mt-8 text-center">
      <NuxtLink
        to="/company/transactions"
        class="text-[14px] text-[color:var(--color-main)] hover:underline"
      >
        View transaction history
      </NuxtLink>
    </div>

    <!-- Payment Modal -->
    <Modal :open="openModal" title="Complete Your Purchase" @close="openModal = false">
      <div class="space-y-4">
        <!-- Package Summary -->
        <div v-if="selectedPackage" class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-4">
          <p class="text-[12px] text-[#64748B] uppercase tracking-wide mb-2">Selected Package</p>
          <p class="text-[16px] font-semibold">{{ selectedPackage.name }}</p>
          <p class="text-[20px] font-bold text-[color:var(--color-main)] mt-2">
            Rp{{ Number(selectedPackage.price || 0).toLocaleString('id-ID') }}
          </p>
        </div>

        <!-- Payment Method Selection -->
        <div v-if="!pendingTransaction">
          <label class="text-[14px] font-medium text-[#1E293B] block mb-2">Payment Method</label>
          <select
            v-model="paymentMethod"
            class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50"
          >
            <option value="qris">QRIS (Recommended)</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="credit_card">Credit Card</option>
            <option value="e_wallet">E-Wallet</option>
          </select>
        </div>

        <!-- Invoice Section -->
        <div v-if="pendingTransaction" class="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] p-4">
          <p class="text-[12px] text-[#64748B] uppercase tracking-wide mb-2">Transaction Details</p>
          <div class="space-y-2 text-[13px]">
            <div class="flex justify-between">
              <span class="text-[#64748B]">Transaction ID:</span>
              <span class="font-medium">{{ pendingTransaction.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#64748B]">Status:</span>
              <span class="font-medium capitalize">{{ pendingTransaction.status }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#64748B]">Amount:</span>
              <span class="font-medium">Rp{{ Number(pendingTransaction.amount || 0).toLocaleString('id-ID') }}</span>
            </div>
          </div>
          <p class="text-[12px] text-[#64748B] mt-4">Complete payment through your chosen method, then click Confirm below.</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            class="flex-1 border border-[#CBD5E1] rounded-[5px] px-4 py-2.5 text-[14px] font-medium hover:bg-[#F8FAFC] transition-colors"
            @click="openModal = false"
          >
            Cancel
          </button>
          <button
            v-if="!pendingTransaction"
            :disabled="invoiceLoading"
            class="flex-1 bg-[color:var(--color-main)] text-white rounded-[5px] px-4 py-2.5 text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            @click="createInvoice"
          >
            {{ invoiceLoading ? 'Creating Invoice...' : 'Create Invoice' }}
          </button>
          <button
            v-else
            :disabled="confirmLoading"
            class="flex-1 bg-green-600 text-white rounded-[5px] px-4 py-2.5 text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            @click="confirmPayment"
          >
            {{ confirmLoading ? 'Confirming...' : 'Confirm Payment' }}
          </button>
        </div>
      </div>
    </Modal>
  </section>
</template>
