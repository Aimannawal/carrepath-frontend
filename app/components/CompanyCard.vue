<script setup>
import { computed, toRefs } from 'vue'

const emit = defineEmits(['view-jobs', 'unsave'])

const props = defineProps({
  company: { type: Object, required: true }
})
const { company } = toRefs(props)

const isPremium = computed(() => {
  return Boolean(
    props.company?.is_premium ||
      props.company?.premium_active ||
      props.company?.premium_until ||
      props.company?.premium_expires_at
  )
})

const premiumUntil = computed(() => {
  return props.company?.premium_until || props.company?.premium_expires_at || ''
})
</script>

<template>
  <article class="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm hover:shadow-md transition">
    <!-- Header with logo and company info -->
    <div class="flex items-start gap-3 mb-4">
      <div class="flex-shrink-0">
        <div class="w-12 h-12 overflow-hidden bg-white flex items-center justify-center">
          <img 
            v-if="company.logo_url"
            :src="company.logo_url" 
            alt="Company" 
            class="w-full h-full object-contain"
          />
          <Icon v-else name="mdi:office-building" class="w-6 h-6 text-[#64748B]" />
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-[16px] font-semibold text-[color:var(--color-dark)] truncate">{{ company.company_name || '-' }}</h3>
        <p class="text-[13px] text-[#64748B] truncate">{{ company.category || '-' }}</p>
        <div v-if="isPremium" class="mt-1 flex items-center gap-1">
          <span class="text-[11px] px-2 py-1 rounded-full bg-[#DBEAFE] text-[#1D4ED8] font-medium">Premium</span>
        </div>
      </div>
    </div>

    <!-- Company description -->
    <div v-if="company.description" class="mb-4">
      <p class="text-[13px] text-[#475569] line-clamp-3">{{ company.description }}</p>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button 
        class="flex-1 bg-[color:var(--color-main)] text-white text-[14px] px-3 py-2 rounded-[5px] font-medium hover:opacity-90 transition"
        @click="emit('view-jobs', company)"
      >
        View Jobs
      </button>
      <button 
        class="flex-1 border border-[#CBD5E1] text-[#334155] text-[14px] px-3 py-2 rounded-[5px] font-medium hover:bg-[#F8FAFC] transition"
        @click="emit('unsave', company)"
      >
        Unsave
      </button>
    </div>
  </article>
</template>
