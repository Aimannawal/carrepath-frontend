<script setup>
import { ref, computed } from 'vue'

const selected = ref(null)

const companies = [
  { label: 'Finance & Banking', icon: '/icons/finance.svg' },
  { label: 'Construction & Real Estate', icon: '/icons/building.svg' },
  { label: 'Healthcare & Medical Services', icon: '/icons/healthcare.svg' },
  { label: 'Consulting', icon: '/icons/consulting.svg' },
  { label: 'Information Technology & Software', icon: '/icons/chip.svg' },
  { label: 'Retail & E-commerce', icon: '/icons/shop.svg' },
  { label: 'Agriculture, Food & Beverage', icon: '/icons/farm.svg' },
  { label: 'Accounting & Auditing', icon: '/icons/accounting.svg' },
  { label: 'Others', icon: '/icons/others.svg' },
]

const isDisabled = computed(() => selected.value === null)

useHead({
  title: 'CarrePath | Category of Worker',
})
</script>

<template>
  <section class="bg-[#F8F9FA] w-full min-h-screen flex items-center justify-center">

    <div class="flex flex-col items-start text-start gap-12">
      
      <!-- Title -->
      <h1 class="text-[24px] font-medium text-[#292929]">
        Choose the type of Company you currently work for
      </h1>

      <!-- Form -->
      <form class="w-full flex flex-col items-end gap-12">

        <!-- List -->
        <div class="flex flex-row flex-wrap items-center gap-x-2.5 gap-y-4 max-w-[700px]">
    
          <div
            v-for="(item, index) in companies"
            :key="index"
            @click="selected = index"
            class="cursor-pointer transition-all duration-200 ease-in-out px-5 py-[15px] gap-[10px] rounded-[10px] flex items-center w-fit bg-white hover:shadow-sm"
            :class="selected === index && 'ring-2 ring-[#2B4DB6]'"
          >
            <!-- Icon -->
            <div class="p-2.5 bg-[#2B4DB6]/10 rounded-[5px]">
              <img :src="item.icon" :alt="item.label" class="w-5 h-5">
            </div>

            <!-- Label -->
            <span class="text-[12px] text-[#292929]/80">
              {{ item.label }}
            </span>
          </div>

        </div>
    
        <!-- Button -->
        <button
          type="button"
          :disabled="isDisabled"
          class="transition-all duration-200 cursor-pointer ease-in-out w-fit px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal flex items-center justify-center gap-4"
          :class="isDisabled
            ? 'bg-gray-300 text-white cursor-not-allowed'
            : 'bg-[#2B4DB6] text-white hover:bg-blue-800 shadow-lg shadow-blue-500/30'"
        >
          Continue to Dashboard 
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="rotate-45">
            <path 
              d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875"
              stroke="white"
              stroke-width="0.875"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

      </form>

    </div>

  </section>
</template>