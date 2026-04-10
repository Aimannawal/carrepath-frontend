<script setup>
defineProps({
  pkg: { type: Object, required: true }
})

const emit = defineEmits(['buy'])
</script>

<template>
  <article class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 shadow-sm">
    <h3 class="text-[18px] font-semibold text-[color:var(--color-dark)]">{{ pkg.name }}</h3>
    <p class="text-[14px] text-[#64748B] mt-2">{{ pkg.description || '-' }}</p>
    <p class="text-[24px] font-bold text-[color:var(--color-main)] mt-4">Rp {{ Number(pkg.price || 0).toLocaleString('id-ID') }}</p>
    <p class="text-[13px] text-[#94A3B8] mt-1">{{ pkg.duration_days ? `${pkg.duration_days} days` : `${pkg.token_value || 0} token` }}</p>
    <button class="mt-5 w-full bg-[color:var(--color-main)] text-white rounded-[5px] py-2.5 text-[14px]" @click="emit('buy', pkg)">Pilih Paket</button>
  </article>
</template>
