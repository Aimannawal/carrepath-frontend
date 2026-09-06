<script setup>
import { computed } from 'vue'

const props = defineProps({
  job: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  showSave: { type: Boolean, default: false },
  isSaved: { type: Boolean, default: false },
  saveLoading: { type: Boolean, default: false }
})

const emit = defineEmits(['apply', 'view', 'save'])

const isPremiumCompany = computed(() => {
  const company = props.job?.company_profiles || {}
  return Boolean(company.is_premium || company.premium_active || company.premium_until || company.premium_expires_at)
})

const companyName = computed(() => {
  return props.job?.company_profiles?.company_name || props.job?.company_name || 'Unknown Company'
})

const salaryText = computed(() => {
  if (!props.job?.salary_min && !props.job?.salary_max) {
    return 'Salary: Negotiable'
  }
  const min = props.job.salary_min ? `Rp ${Number(props.job.salary_min).toLocaleString('id-ID')}` : '-'
  const max = props.job.salary_max ? `Rp ${Number(props.job.salary_max).toLocaleString('id-ID')}` : '-'
  return `Salary: ${min} - ${max}`
})

const jobLevel = computed(() => {
  const level = props.job?.level || props.job?.experience_level || 'Entry Level'
  return level.charAt(0).toUpperCase() + level.slice(1)
})
</script>

<template>
  <article class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition h-full flex flex-col">
    <div class="flex items-start justify-between gap-4 mb-4">
      <div class="flex-1 min-w-0">
        <h3 class="text-[16px] font-semibold text-[color:var(--color-dark)] line-clamp-2">{{ job.title || 'Untitled Job' }}</h3>
        <p class="text-[13px] text-[#64748B] mt-1 truncate">{{ companyName }}</p>
        <div v-if="isPremiumCompany" class="mt-1 inline-flex text-[11px] px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-medium">
          Recommended Company
        </div>
      </div>
      <div v-if="job.company_profiles?.logo_url" class="flex-shrink-0 w-12 h-12 overflow-hidden bg-white">
        <img :src="job.company_profiles.logo_url" alt="Company logo" class="w-full h-full object-cover" />
      </div>
      <div v-else class="flex-shrink-0 w-12 h-12 bg-white flex items-center justify-center">
        <Icon name="mdi:briefcase" class="w-6 h-6 text-[#64748B]" />
      </div>
    </div>

    <!-- Job tags -->
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium">{{ job.location_type || 'Onsite' }}</span>
      <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#334155] font-medium">{{ job.type || 'Full-time' }}</span>
    </div>



    <!-- Quick info -->
    <div class="space-y-2 mb-4 text-[12px] text-[#475569]">
      <p class="font-medium">{{ salaryText }}</p>
      <p v-if="job.location_city" class="text-[#64748B]">📍 {{ job.location_city }}</p>
      <p v-if="job.posted_at" class="text-[#94A3B8] text-[11px]">Posted {{ formatDate(job.posted_at) }}</p>
    </div>

    <!-- Actions -->
    <div class="flex gap-2 mt-auto pt-3 border-t border-[#E2E8F0]">
      <button
        v-if="showSave"
        class="shrink-0 w-[38px] h-[38px] rounded-[8px] border border-[#CBD5E1] flex items-center justify-center transition disabled:opacity-50"
        :class="isSaved ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'"
        :disabled="saveLoading"
        @click="emit('save', job)"
      >
        <Icon :name="isSaved ? 'heroicons:bookmark-solid' : 'heroicons:bookmark'" class="w-4 h-4" />
      </button>
      <button 
        class="flex-1 bg-[color:var(--color-main)] text-white text-[13px] px-3 py-2 rounded-[8px] font-medium hover:opacity-90 transition"
        @click="emit('apply', job)"
      >
        Apply
      </button>
      <button 
        class="flex-1 border border-[#CBD5E1] text-[#334155] text-[13px] px-3 py-2 rounded-[8px] font-medium hover:bg-[#F8FAFC] transition"
        @click="emit('view', job)"
      >
        Details
      </button>
    </div>
  </article>
</template>
