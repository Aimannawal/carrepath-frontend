<script setup>
import { computed, ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Admin Dashboard' })
definePageMeta({ layout: 'admin' })

const { get } = useApi()
const loading = ref(true)
const error = ref('')
const revenue = ref(0)
const stats = ref({ total_users: 0, total_companies: 0, total_jobs: 0, total_transactions: 0 })
const transactions = ref([])
const premiumCompanies = ref([])
const premiumUsers = ref([])
const revenueTrend = ref({})
const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Monthly Revenue',
    data: [],
    borderColor: '#2B4DB6',
    backgroundColor: 'rgba(43, 77, 182, 0.1)',
    borderWidth: 2,
    fill: true,
    tension: 0.4,
    pointRadius: 5,
    pointBackgroundColor: '#2B4DB6',
    pointHoverRadius: 7
  }]
})
const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: { color: '#475569', font: { size: 12 } }
    }
  },
  scales: {
    y: {
      ticks: { color: '#64748B' },
      grid: { color: '#E2E8F0' }
    },
    x: {
      ticks: { color: '#64748B' },
      grid: { color: '#E2E8F0' }
    }
  }
}

const successTransactions = computed(() =>
  transactions.value.filter((tx) => String(tx?.status || '').toLowerCase() === 'success').length
)

const successRate = computed(() => {
  const total = transactions.value.length
  if (!total) return 0
  return Math.round((successTransactions.value / total) * 100)
})

const activeUsers = computed(() => {
  const userIds = new Set(
    transactions.value
      .map((tx) => tx?.user_id)
      .filter((id) => typeof id === 'string' && id.trim().length > 0)
  )
  return userIds.size
})

const monthlyRevenue = computed(() => {
  const total = Object.values(revenueTrend.value || {}).reduce((sum, v) => sum + Number(v || 0), 0)
  return Math.round(total / 6)
})

const getTransactionActor = (tx) => {
  const usersField = tx?.users
  if (Array.isArray(usersField) && usersField.length > 0) {
    return usersField[0]?.full_name || usersField[0]?.email || usersField[0]?.id || 'Unknown user'
  }
  if (usersField && typeof usersField === 'object') {
    return usersField.full_name || usersField.email || usersField.id || 'Unknown user'
  }
  if (tx?.user_id) {
    return `User ${String(tx.user_id).slice(0, 8)}`
  }
  return 'Unknown user'
}

const getTransactionTitle = (tx) => {
  const pkg = tx?.payment_packages
  if (Array.isArray(pkg) && pkg.length > 0) {
    return pkg[0]?.package_name || 'Payment'
  }
  if (pkg && typeof pkg === 'object') {
    return pkg.package_name || 'Payment'
  }
  return tx?.type || 'Payment'
}

const updateChartData = () => {
  const months = Object.keys(revenueTrend.value).sort()
  chartData.value = {
    labels: months,
    datasets: [{
      label: 'Monthly Revenue',
      data: months.map(m => revenueTrend.value[m] || 0),
      borderColor: '#2B4DB6',
      backgroundColor: 'rgba(43, 77, 182, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#2B4DB6',
      pointHoverRadius: 7
    }]
  }
}

onMounted(async () => {
  try {
    const [revRes, statsRes, txRes, premCompRes, premUsersRes, trendRes] = await Promise.all([
      get('/admin/revenue'),
      get('/admin/stats'),
      get('/admin/transactions'),
      get('/admin/premium-companies'),
      get('/admin/premium-users'),
      get('/admin/revenue-trend')
    ])
    revenue.value = revRes.data?.total_revenue || 0
    stats.value = statsRes.data || stats.value
    transactions.value = txRes.data || []
    premiumCompanies.value = premCompRes.data || []
    premiumUsers.value = premUsersRes.data || []
    revenueTrend.value = trendRes.data || {}
    updateChartData()
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load admin dashboard'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
    <h1 class="text-[30px] font-semibold mb-2 text-[#1E293B]">Admin Dashboard</h1>
    <p class="text-[14px] text-[#64748B] mb-6">Welcome to the admin control panel</p>
    <p v-if="error" class="mb-4 text-[14px] text-red-600 bg-red-50 p-3 rounded-[8px] border border-red-200">{{ error }}</p>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B] font-medium">Total Revenue</p>
        <p class="text-[24px] font-semibold mt-2 text-[#1E293B]">Rp {{ Number(revenue).toLocaleString('id-ID') }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B] font-medium">Total Users</p>
        <p class="text-[24px] font-semibold mt-2 text-[#1E293B]">{{ stats.total_users || 0 }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B] font-medium">Total Companies</p>
        <p class="text-[24px] font-semibold mt-2 text-[#1E293B]">{{ stats.total_companies || 0 }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B] font-medium">Total Jobs</p>
        <p class="text-[24px] font-semibold mt-2 text-[#1E293B]">{{ stats.total_jobs || 0 }}</p>
      </div>
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition">
        <p class="text-[13px] text-[#64748B] font-medium">Total Transactions</p>
        <p class="text-[24px] font-semibold mt-2 text-[#1E293B]">{{ stats.total_transactions || 0 }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div class="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-sm">
        <h2 class="text-[18px] font-semibold mb-4 text-[#1E293B]">Revenue Trend (Last 6 Months)</h2>
        <div v-if="loading" class="h-[300px] bg-[#F1F5F9] rounded-[8px] animate-pulse"></div>
        <div v-else class="h-[300px]">
          <RevenueChart :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Top Stats Box -->
      <div class="bg-gradient-to-br from-[#2B4DB6] to-[#1E3A8A] border border-[#2563EB] rounded-[12px] p-6 shadow-sm text-white">
        <h2 class="text-[18px] font-semibold mb-4">Dashboard Overview</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center text-[13px]">
            <span class="text-blue-100">Active Users (Transactions):</span>
            <span class="font-semibold">{{ activeUsers }}</span>
          </div>
          <div class="flex justify-between items-center text-[13px]">
            <span class="text-blue-100">Premium Companies:</span>
            <span class="font-semibold">{{ premiumCompanies.length }}</span>
          </div>
          <div class="flex justify-between items-center text-[13px]">
            <span class="text-blue-100">Top Up Users:</span>
            <span class="font-semibold">{{ premiumUsers.length }}</span>
          </div>
          <div class="border-t border-blue-400 my-3"></div>
          <div class="flex justify-between items-center text-[13px] font-medium">
            <span>Avg Monthly Revenue:</span>
            <span>Rp {{ Number(monthlyRevenue).toLocaleString('id-ID') }}</span>
          </div>
          <div class="flex justify-between items-center text-[14px] font-semibold">
            <span>Transactions Success Rate:</span>
            <span>{{ successRate }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Premium Companies & Users -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Premium Companies -->
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-sm">
        <h2 class="text-[18px] font-semibold mb-4 text-[#1E293B]">Premium Companies</h2>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-[60px] bg-[#F1F5F9] rounded-[8px] animate-pulse"></div>
        </div>
        <div v-else-if="premiumCompanies.length" class="space-y-3">
          <div v-for="company in premiumCompanies.slice(0, 5)" :key="company.id" class="flex items-center gap-3 p-3 rounded-[8px] bg-[#F8FAFC] hover:bg-[#EFF6FF] transition border border-[#E2E8F0]">
              <div class="w-10 h-10 overflow-hidden bg-white flex-shrink-0">
              <img v-if="company.logo_url" :src="company.logo_url" alt="Logo" class="w-full h-full object-cover" />
              <Icon v-else name="mdi:office-building" class="w-6 h-6 text-[#94A3B8]" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium text-[#1E293B] truncate">{{ company.company_name }}</p>
              <p class="text-[11px] text-[#64748B]">Until: {{ new Date(company.premium_until).toLocaleDateString('id-ID') }}</p>
            </div>
            <span class="text-[11px] px-2 py-1 rounded-full bg-[#FFFBEA] text-[#F59E0B] font-medium flex-shrink-0">Premium</span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-[14px] text-[#94A3B8]">No premium companies</div>
      </div>

      <!-- Top Up Users -->
      <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-sm">
        <h2 class="text-[18px] font-semibold mb-4 text-[#1E293B]">Top Up Users</h2>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-[60px] bg-[#F1F5F9] rounded-[8px] animate-pulse"></div>
        </div>
        <div v-else-if="premiumUsers.length" class="space-y-3">
          <div v-for="user in premiumUsers.slice(0, 5)" :key="user.id" class="flex items-center gap-3 p-3 rounded-[8px] bg-[#F8FAFC] hover:bg-[#EFF6FF] transition border border-[#E2E8F0]">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-white flex-shrink-0">
              <NuxtImg v-if="user.profile_url" :src="user.profile_url" alt="Profile" class="w-full h-full object-cover" />
              <Icon v-else name="mdi:account" class="w-6 h-6 text-[#94A3B8]" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium text-[#1E293B] truncate">{{ user.full_name }}</p>
              <p class="text-[11px] text-[#64748B]">Last top up: {{ user.last_topup_at ? new Date(user.last_topup_at).toLocaleDateString('id-ID') : '-' }}</p>
            </div>
            <span class="text-[11px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium flex-shrink-0">{{ Number(user.total_amount || 0).toLocaleString('id-ID') }}</span>
          </div>
        </div>
        <div v-else class="text-center py-8 text-[14px] text-[#94A3B8]">No top up users</div>
      </div>
    </div>

    <!-- Latest Transactions -->
    <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-6 shadow-sm">
      <h2 class="text-[18px] font-semibold mb-4 text-[#1E293B]">Latest Transactions</h2>
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 6" :key="i" class="h-[56px] bg-[#F1F5F9] rounded-[8px] animate-pulse"></div>
      </div>
      <div v-else-if="transactions.length" class="space-y-2">
        <div v-for="tx in transactions.slice(0, 10)" :key="tx.id" class="p-4 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] transition flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-3 mb-2 md:mb-0">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="tx.status === 'success' ? 'bg-emerald-100' : 'bg-amber-100'">
              <Icon :name="tx.status === 'success' ? 'mdi:check-circle' : 'mdi:clock-outline'" :class="tx.status === 'success' ? 'text-emerald-600' : 'text-amber-600'" />
            </div>
            <div>
              <p class="text-[14px] font-medium text-[#1E293B]">{{ getTransactionTitle(tx) }}</p>
              <p class="text-[12px] text-[#475569]">By: {{ getTransactionActor(tx) }}</p>
              <p class="text-[12px] text-[#64748B]">Rp {{ Number(tx.amount || 0).toLocaleString('id-ID') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[11px] px-2.5 py-1 rounded-full" :class="tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">{{ tx.status }}</span>
            <p class="text-[12px] text-[#64748B] text-right">{{ new Date(tx.created_at || Date.now()).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-8 text-[14px] text-[#94A3B8]">No transaction data</div>
    </div>
  </section>
</template>
