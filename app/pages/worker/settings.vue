<script setup>
useHead({ title: 'CarrePath | Worker Settings' })
definePageMeta({ layout: 'worker' })

const emailNotif = ref(true)
const jobNotif = ref(true)
const promoNotif = ref(false)
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Settings</h1>
    <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-5 space-y-4 max-w-[680px]">
      <label class="flex items-center justify-between text-[14px]">
        <span>Email notifications</span>
        <input v-model="emailNotif" type="checkbox" />
      </label>
      <label class="flex items-center justify-between text-[14px]">
        <span>Job match notifications</span>
        <input v-model="jobNotif" type="checkbox" />
      </label>
      <label class="flex items-center justify-between text-[14px]">
        <span>Promo notifications</span>
        <input v-model="promoNotif" type="checkbox" />
      </label>
    </div>
  </section>
</template>
