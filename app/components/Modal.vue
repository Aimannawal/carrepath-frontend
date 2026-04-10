<script setup>
const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Dialog' }
})

const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" @click="emit('close')"></div>
      <div class="relative w-full max-w-xl bg-white rounded-[10px] shadow-xl border border-[#E2E8F0]">
        <div class="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <h3 class="text-[18px] font-semibold text-[color:var(--color-dark)]">{{ title }}</h3>
          <button class="text-[#64748B] hover:text-[#0F172A]" @click="emit('close')">X</button>
        </div>
        <div class="p-5">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>
