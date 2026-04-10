<script setup>
import { ref, computed } from 'vue'

const selected = ref(null)
const loading = ref(false)
const error = ref('')
const { put } = useApi()
const tokenCookie = useCookie('access_token')

const fields = [
  { label: 'Finance & Banking', icon: '/icons/finance.svg' },
  { label: 'Construction & Real Estate', icon: '/icons/building.svg' },
  { label: 'Healthcare & Medical Services', icon: '/icons/healthcare.svg' },
  { label: 'Consulting', icon: '/icons/consulting.svg' },
  { label: 'Information Technology & Software', icon: '/icons/chip.svg' },
  { label: 'Retail & E-commerce', icon: '/icons/shop.svg' },
  { label: 'Agriculture, Food & Beverage', icon: '/icons/farm.svg' },
  { label: 'Accounting & Auditing', icon: '/icons/accounting.svg' },
  { label: 'Others', icon: '/icons/others.svg' }
]

useHead({ title: 'CarrePath | Category of Worker' })

const isDisabled = computed(() => selected.value === null || loading.value)

const submit = async () => {
  if (selected.value === null) return
  loading.value = true
  error.value = ''
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    await put(`/workers/profile/${payload.sub}`, { field_of_work: fields[selected.value].label })
    navigateTo('/worker/dashboard')
  } catch (e) {
    error.value = e?.data?.error || 'Failed to save category'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="bg-[#F8F9FA] w-full min-h-screen flex items-center justify-center font-['Outfit']">
    <div class="flex flex-col items-start text-start gap-12">
      <h1 class="text-[24px] font-medium text-[#292929]">Choose your field of work</h1>
      <form class="w-full flex flex-col items-end gap-12" @submit.prevent="submit">
        <div class="flex flex-row flex-wrap items-center gap-x-2.5 gap-y-4 max-w-[700px]">
          <div v-for="(item, index) in fields" :key="index" @click="selected = index" class="cursor-pointer transition-all duration-200 ease-in-out px-5 py-[15px] gap-[10px] rounded-[10px] flex items-center w-fit bg-white hover:shadow-sm" :class="selected === index && 'ring-2 ring-[#2B4DB6]'">
            <div class="p-2.5 bg-[#2B4DB6]/10 rounded-[5px]">
              <img :src="item.icon" :alt="item.label" class="w-5 h-5" />
            </div>
            <span class="text-[12px] text-[#292929]/80">{{ item.label }}</span>
          </div>
        </div>

        <p v-if="error" class="text-[12px] text-red-600 self-start">{{ error }}</p>

        <button type="submit" :disabled="isDisabled" class="transition-all duration-200 cursor-pointer ease-in-out w-fit px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal" :class="isDisabled ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-[#2B4DB6] text-white hover:bg-blue-800 shadow-lg shadow-blue-500/30'">
          {{ loading ? 'Saving...' : 'Continue to Dashboard' }}
        </button>
      </form>
    </div>
  </section>
</template>
