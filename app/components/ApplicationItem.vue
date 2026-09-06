<script setup>
import { ref } from 'vue'

const props = defineProps({
  item: { type: Object, required: true }
})

const showDetails = ref(false)

const statusClass = (status) => {
  const statusMap = {
    accepted: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    pending: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
  return statusMap[status] || 'bg-blue-100 text-blue-700 border-blue-200'
}

const statusIcon = (status) => {
  const iconMap = {
    accepted: 'mdi:check-circle',
    rejected: 'mdi:close-circle',
    pending: 'mdi:clock-outline'
  }
  return iconMap[status] || 'mdi:information'
}

const statusLabel = (status) => {
  const labelMap = {
    accepted: 'Accepted',
    rejected: 'Rejected',
    pending: 'Pending Review'
  }
  return labelMap[status] || 'Unknown'
}
</script>

<template>
  <div class="bg-white border border-[#E2E8F0] rounded-[12px] p-4 hover:shadow-sm transition">
    <div class="flex items-start justify-between gap-4 mb-3">
      <div class="flex-1 min-w-0">
        <p class="text-[15px] font-semibold text-[color:var(--color-dark)] truncate">{{ item.job?.title || item.jobs?.title || item.job_title || 'Job' }}</p>
        <p class="text-[13px] text-[#64748B] truncate">{{ item.company?.company_name || item.job?.company_profiles?.company_name || item.jobs?.company_profiles?.company_name || item.company_name || '-' }}</p>
      </div>
      <div :class="['flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-medium border', statusClass(item.status)]">
        <Icon :name="statusIcon(item.status)" class="w-4 h-4" />
        <span>{{ statusLabel(item.status) }}</span>
      </div>
    </div>

    <p class="text-[12px] text-[#94A3B8]">Applied {{ formatDate(item.applied_at || item.created_at || Date.now()) }}</p>

    <!-- Show feedback/message if available -->
    <div v-if="item.feedback || item.message || item.rejection_reason" class="mt-3 p-2 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0]">
      <p class="text-[11px] font-medium text-[#64748B] mb-1">💬 Feedback:</p>
      <p class="text-[12px] text-[#475569]">{{ item.feedback || item.message || item.rejection_reason || 'No feedback yet' }}</p>
    </div>

    <!-- Additional info toggle -->
    <button 
      v-if="item.job?.description || item.jobs?.description || item.notes"
      class="mt-3 text-[12px] text-[#1D4ED8] hover:underline font-medium"
      @click="showDetails = !showDetails"
    >
      {{ showDetails ? '▼ Hide details' : '▶ Show details' }}
    </button>

    <!-- Expandable details -->
    <Transition name="fade">
      <div v-if="showDetails" class="mt-3 space-y-2 pt-3 border-t border-[#E2E8F0]">
        <div v-if="item.job?.description || item.jobs?.description" class="text-[12px] text-[#475569]">
          <p class="font-medium text-[#64748B] mb-1">Job Description:</p>
          <p class="line-clamp-3">{{ item.job?.description || item.jobs?.description }}</p>
        </div>
        <div v-if="item.notes" class="text-[12px] text-[#475569]">
          <p class="font-medium text-[#64748B] mb-1">Your Notes:</p>
          <p>{{ item.notes }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
