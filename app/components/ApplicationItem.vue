<script setup>
defineProps({
  item: { type: Object, required: true }
})

const statusClass = (status) => {
  if (status === 'accepted') return 'bg-green-100 text-green-700'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}
</script>

<template>
  <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-4 flex items-center justify-between gap-4">
    <div>
      <p class="text-[16px] font-semibold text-[color:var(--color-dark)]">{{ item.jobs?.title || item.job_title || 'Job' }}</p>
      <p class="text-[14px] text-[#64748B]">{{ item.jobs?.company_profiles?.company_name || item.company_name || '-' }}</p>
      <p class="text-[12px] text-[#94A3B8] mt-1">{{ new Date(item.created_at || item.applied_at || Date.now()).toLocaleDateString() }}</p>
    </div>
    <span :class="['text-[12px] px-3 py-1 rounded-full font-medium capitalize', statusClass(item.status)]">{{ item.status || 'pending' }}</span>
  </div>
</template>
