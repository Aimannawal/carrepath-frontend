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
  <article class="bg-white border border-[#E2E8F0] rounded-[10px] p-5 shadow-sm">
    <div class="flex items-center gap-3">
      <img :src="company.logo_url || '/logos/logo.png'" alt="Company" class="w-12 h-12 rounded-[10px] object-cover border border-[#E2E8F0]" />
      <div>
        <h3 class="text-[16px] font-semibold text-[color:var(--color-dark)]">{{ company.company_name || '-' }}</h3>
        <p class="text-[13px] text-[#64748B]">{{ company.category || '-' }}</p>
        <p v-if="isPremium" class="text-[12px] mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[#DBEAFE] text-[#1D4ED8]">
          Premium active
        </p>
        <p v-if="isPremium && premiumUntil" class="text-[12px] text-[#64748B] mt-1">Premium active until {{ new Date(premiumUntil).toLocaleDateString('id-ID') }}</p>
      </div>
    </div>

    <div class="mt-5 flex gap-3">
      <button class="bg-[color:var(--color-main)] text-white text-[14px] px-4 py-2 rounded-[5px]" @click="emit('view-jobs', company)">View Jobs</button>
      <button class="border border-[#CBD5E1] text-[#334155] text-[14px] px-4 py-2 rounded-[5px]" @click="emit('unsave', company)">Unsave</button>
    </div>
  </article>
</template>
