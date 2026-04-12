<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <!-- Backdrop click to close -->
        <div class="absolute inset-0" @click="close"></div>

        <!-- Modal content -->
        <div class="relative bg-white rounded-[16px] shadow-xl max-w-md w-full mx-4 p-6 space-y-4 z-50">
          <!-- Icon -->
          <div v-if="icon" :class="['w-12 h-12 rounded-full flex items-center justify-center', iconBgClass]">
            <Icon :name="icon" :class="['w-6 h-6', iconColorClass]" />
          </div>

          <!-- Title -->
          <h2 class="text-[20px] font-semibold text-[#1e293b]">{{ title }}</h2>

          <!-- Message -->
          <p class="text-[14px] text-[#475569] leading-relaxed">{{ message }}</p>

          <!-- Actions -->
          <div class="pt-2 flex gap-3">
            <button
              v-if="showCancel"
              class="flex-1 px-4 py-2.5 rounded-[8px] border border-[#CBD5E1] text-[14px] font-medium text-[#475569] hover:bg-[#F1F5F9] transition"
              @click="cancel"
            >
              {{ cancelText }}
            </button>
            <button
              :class="[
                'flex-1 px-4 py-2.5 rounded-[8px] text-[14px] font-medium text-white transition',
                actionButtonClass
              ]"
              :disabled="loading"
              @click="confirm"
            >
              <span v-if="!loading">{{ actionText }}</span>
              <span v-else>{{ loadingText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  isOpen: boolean
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  actionText?: string
  cancelText?: string
  showCancel?: boolean
  loading?: boolean
  loadingText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  actionText: 'OK',
  cancelText: 'Cancel',
  showCancel: true,
  loading: false,
  loadingText: 'Loading...'
})

const emit = defineEmits<{
  close: []
  confirm: []
  cancel: []
}>()

const submitting = ref(false)

const icon = computed(() => {
  const iconMap: Record<string, string> = {
    success: 'mdi:check-circle',
    error: 'mdi:alert-circle',
    warning: 'mdi:alert',
    info: 'mdi:information'
  }
  return iconMap[props.type] || null
})

const iconBgClass = computed(() => {
  const bgMap: Record<string, string> = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100'
  }
  return bgMap[props.type] || 'bg-blue-100'
})

const iconColorClass = computed(() => {
  const colorMap: Record<string, string> = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }
  return colorMap[props.type] || 'text-blue-600'
})

const actionButtonClass = computed(() => {
  const classMap: Record<string, string> = {
    success: 'bg-green-600 hover:bg-green-700 disabled:bg-green-400',
    error: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
    warning: 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400',
    info: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
  }
  return classMap[props.type] || 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
})

const close = () => emit('close')

const confirm = async () => {
  if (submitting.value || props.loading) return
  submitting.value = true
  if (props.onConfirm) {
    await props.onConfirm()
  }
  emit('confirm')
  emit('close')
  submitting.value = false
}

const cancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
  emit('cancel')
  emit('close')
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}
</style>
