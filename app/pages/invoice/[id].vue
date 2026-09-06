<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

useHead({ title: 'CarrePath | Invoice' })
definePageMeta({ layout: 'empty' })

const route = useRoute()
const router = useRouter()
const { get } = useApi()

const loading = ref(true)
const error = ref('')
const tx = ref(null)

onMounted(async () => {
  try {
    const id = route.params.id
    if (!id) throw new Error('Invoice ID not found')
    
    const res = await get(`/payment/transaction/${id}`)
    tx.value = res.data
  } catch (e) {
    error.value = e?.data?.error || e.message || 'Failed to load invoice'
  } finally {
    loading.value = false
  }
})

const printInvoice = () => {
  window.print()
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-[#F1F5F9] p-4 md:p-8 flex items-center justify-center font-outfit print:bg-white print:p-0">
    <div class="max-w-[800px] w-full mx-auto space-y-6">
      
      <!-- Action Bar (Hidden when printing) -->
      <div class="flex items-center justify-between print:hidden">
        <button @click="goBack" class="flex items-center gap-2 text-[#64748B] hover:text-[#1E293B] transition font-medium">
          <Icon name="mdi:arrow-left" class="w-5 h-5" />
          Back
        </button>
        <button @click="printInvoice" class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
          <Icon name="mdi:printer" class="w-5 h-5" />
          Print Invoice
        </button>
      </div>

      <div v-if="loading" class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[#E2E8F0] space-y-6 animate-pulse">
        <div class="h-10 bg-slate-200 rounded w-1/3"></div>
        <div class="h-32 bg-slate-100 rounded w-full"></div>
        <div class="h-64 bg-slate-50 rounded w-full"></div>
      </div>

      <div v-else-if="error" class="bg-white p-8 text-center rounded-2xl shadow-sm border border-red-200">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="mdi:close-circle" class="w-8 h-8" />
        </div>
        <h2 class="text-xl font-bold text-slate-800 mb-2">Failed to load invoice</h2>
        <p class="text-slate-600">{{ error }}</p>
        <button @click="goBack" class="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition">Go Back</button>
      </div>

      <!-- Invoice Paper -->
      <div v-else-if="tx" class="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-[#E2E8F0] print:border-none print:shadow-none print:p-0 print:rounded-none">
        
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <h1 class="text-3xl font-bold text-[#1E293B] flex items-center gap-2 mb-2">
              <Icon name="mdi:briefcase-check" class="text-blue-600" />
              CarrePath
            </h1>
            <p class="text-slate-500 text-sm">Empowering Your Career Journey.</p>
          </div>
          <div class="text-left md:text-right">
            <h2 class="text-4xl font-bold text-[#0F172A] tracking-tight uppercase">Invoice</h2>
            <p class="text-slate-500 font-medium mt-1">#{{ tx.id?.split('-')[0].toUpperCase() || 'INV-000' }}</p>
          </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-slate-200">
          <div>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Billed To</p>
            <p class="font-semibold text-slate-800 text-lg">{{ tx.users?.full_name || 'Customer' }}</p>
            <p class="text-slate-600 mt-1">{{ tx.users?.email || '-' }}</p>
            <p class="text-sm font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-md inline-block mt-3 capitalize">
              Role: {{ tx.users?.role || '-' }}
            </p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Invoice Date</p>
              <p class="font-semibold text-slate-800">{{ formatDate(tx.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Payment Method</p>
              <p class="font-semibold text-slate-800 uppercase">{{ tx.payment_method || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase"
                :class="{
                  'bg-emerald-100 text-emerald-700': tx.status === 'success',
                  'bg-amber-100 text-amber-700': tx.status === 'pending',
                  'bg-red-100 text-red-700': tx.status === 'failed',
                }">
                <Icon :name="tx.status === 'success' ? 'mdi:check-circle' : tx.status === 'pending' ? 'mdi:clock-outline' : 'mdi:close-circle'" />
                {{ tx.status }}
              </span>
            </div>
            <div v-if="tx.status === 'success' && tx.paid_at">
              <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Paid At</p>
              <p class="font-semibold text-slate-800">{{ formatDate(tx.paid_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div class="py-8">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b-2 border-slate-200">
                <th class="py-3 text-xs text-slate-400 font-bold uppercase tracking-wider">Item Description</th>
                <th class="py-3 text-xs text-slate-400 font-bold uppercase tracking-wider text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-100">
                <td class="py-5">
                  <p class="font-bold text-slate-800 text-lg">{{ tx.payment_packages?.name || tx.payment_packages?.package_name || 'Package Subscription' }}</p>
                  <p class="text-slate-500 text-sm mt-1">{{ tx.payment_packages?.description || 'CarrePath premium services.' }}</p>
                </td>
                <td class="py-5 text-right font-semibold text-slate-800 text-lg">
                  Rp {{ Number(tx.amount || 0).toLocaleString('id-ID') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals & Barcode -->
        <div class="flex flex-col-reverse md:flex-row justify-between items-end pt-4 pb-8 gap-8">
          
          <!-- Barcode (Left) -->
          <div class="w-full md:w-5/12 flex flex-col justify-end">
            <p class="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Invoice Reference</p>
            <div class="w-full h-24 overflow-hidden rounded-md flex items-end">
              <img :src="`https://bwipjs-api.metafloor.com/?bcid=code128&text=INV-${tx.id.split('-')[0].toUpperCase()}&scale=4&height=15&textsize=10`" alt="Invoice Barcode" class="w-full h-full object-cover mix-blend-multiply opacity-75 grayscale" />
            </div>
          </div>

          <!-- Totals (Right) -->
          <div class="w-full md:w-1/2 space-y-3">
            <div class="flex justify-between text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>Rp {{ Number(tx.amount || 0).toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-slate-500 font-medium">
              <span>Tax (0%)</span>
              <span>Rp 0</span>
            </div>
            <div class="flex justify-between items-center pt-4 border-t border-slate-200">
              <span class="text-lg font-bold text-slate-800">Total Amount</span>
              <span class="text-2xl font-black text-blue-600">Rp {{ Number(tx.amount || 0).toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-8 border-t border-slate-200 text-center text-slate-500 text-sm space-y-1">
          <p class="font-medium text-slate-700">Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact support@carrepath.com</p>
        </div>
      </div>
      
    </div>
  </div>
</template>
