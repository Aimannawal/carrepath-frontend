<template>
  <NuxtLayout>
    <NuxtPage :transition="{
      name: 'page',
      mode: 'out-in'
    }" />
  </NuxtLayout>

  <!-- Global Modal for notifications -->
  <ConfirmModal
    :is-open="modalState.isOpen"
    :type="modalState.type"
    :title="modalState.title"
    :message="modalState.message"
    :action-text="modalState.actionText"
    :cancel-text="modalState.cancelText"
    :show-cancel="modalState.showCancel"
    :loading="modalState.loading"
    :loading-text="modalState.loadingText"
    :on-confirm="modalState.onConfirm"
    :on-cancel="modalState.onCancel"
    @close="close"
  />
</template>

<script setup lang="ts">
import { useModal } from '~/composables/useModal'

const { getModalState, close } = useModal()
const modalState = getModalState()
</script>

<style>
html,
body {
  font-family: 'Outfit', sans-serif;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.15s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>