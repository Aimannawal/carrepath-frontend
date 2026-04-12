<script setup>
import { ref } from 'vue'

useHead({ title: 'CarrePath | Name of Company' })

const companyName = ref('')
const isLoading = ref(false)
const error = ref('')
const { put } = useApi()
const tokenCookie = useCookie('access_token')

const submit = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    await put(`/companies/profile/${payload.sub}`, { company_name: companyName.value })
    navigateTo('/company-category')
  } catch (e) {
    error.value = e?.data?.error || 'Failed to save company name'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="bg-[#F8F9FA] w-full min-h-screen flex items-center justify-center font-['Outfit']">
    <div class="flex flex-col items-start text-start gap-6">
      <h1 class="text-[24px] font-medium">What is your Company Name ?</h1>
      <form class="w-full flex flex-col items-end gap-6" @submit.prevent="submit">
        <div class="flex flex-col gap-3 w-full">
          <label for="companyName" class="text-[14px]">Company Name</label>
          <input id="companyName" v-model="companyName" type="text" autocomplete="off" placeholder="Your Company Name" class="w-[420px] border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" />
          <p v-if="error" class="text-[12px] text-red-600">{{ error }}</p>
        </div>

        <button :disabled="!companyName || isLoading" class="cursor-pointer transition-all w-fit bg-[color:var(--color-main)] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] disabled:opacity-50">
          {{ isLoading ? 'Saving...' : 'Next' }}
        </button>
      </form>
    </div>
  </section>
</template>
