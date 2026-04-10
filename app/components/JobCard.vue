<script setup>
const props = defineProps({
  job: { type: Object, required: true },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['apply', 'view'])

const isPremiumCompany = computed(() => {
  const company = props.job?.company_profiles || {}
  return Boolean(company.is_premium || company.premium_active || company.premium_until || company.premium_expires_at)
})

const companyName = computed(() => {
  return props.job?.company_profiles?.company_name || props.job?.company_name || 'Unknown Company'
})

const salaryText = computed(() => {
  if (!props.job?.salary_min && !props.job?.salary_max) {
    return 'Negotiable'
  }
  const min = props.job.salary_min ? `Rp ${Number(props.job.salary_min).toLocaleString('id-ID')}` : '-'
  const max = props.job.salary_max ? `Rp ${Number(props.job.salary_max).toLocaleString('id-ID')}` : '-'
  return `${min} - ${max}`
})
</script>

<template>
  <article class="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm hover:shadow-md transition">
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h3 class="text-[18px] font-semibold text-[color:var(--color-dark)] truncate">{{ job.title || 'Untitled Job' }}</h3>
        <p class="text-[14px] text-[#64748B] mt-1 truncate">{{ companyName }}</p>
        <p v-if="isPremiumCompany" class="mt-1 inline-flex text-[11px] px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1D4ED8]">Premium Company</p>
      </div>
      <img v-if="job.company_profiles?.logo_url" :src="job.company_profiles.logo_url" alt="Company logo" class="w-10 h-10 rounded-[5px] object-cover" />
    </div>

    <div class="flex flex-wrap gap-2 mt-4">
      <span class="text-[12px] px-3 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">{{ job.location_type || 'onsite' }}</span>
      <span class="text-[12px] px-3 py-1 rounded-full bg-[#F1F5F9] text-[#334155]">{{ job.type || 'full-time' }}</span>
      <span class="text-[12px] px-3 py-1 rounded-full bg-[#EEF2FF] text-[#4338CA]">{{ job.category || 'General' }}</span>
    </div>

    <p class="text-[14px] text-[#475569] mt-4">{{ salaryText }}</p>

    <div class="flex items-center gap-3 mt-5">
      <button class="bg-[color:var(--color-main)] text-white text-[14px] px-4 py-2 rounded-[5px] hover:bg-blue-700 transition" @click="emit('apply', job)">Apply</button>
      <button class="border border-[#CBD5E1] text-[#334155] text-[14px] px-4 py-2 rounded-[5px] hover:bg-[#F8FAFC] transition" @click="emit('view', job)">View Detail</button>
    </div>
  </article>
</template>
