<script setup>
import { ref } from 'vue'

useHead({ title: 'CarrePath | Name of Worker' })

const { post } = useApi()
const tokenCookie = useCookie('access_token')
const userRoleCookie = useCookie('user_role')

const fullName = ref('')
const loading = ref(false)
const error = ref('')

const submit = async () => {
  loading.value = true
  error.value = ''
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    await post('/users/set-role', {
      id: payload.sub,
      role: userRoleCookie.value || 'worker',
      full_name: fullName.value,
      email: payload.email
    })
    navigateTo('/worker-category')
  } catch (e) {
    error.value = e?.data?.error || 'Failed to save name'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="bg-[#F8F9FA] w-full min-h-screen flex items-center justify-center font-['Outfit']">
    <div class="flex flex-col items-start text-start gap-6">
      <h1 class="text-[24px] font-medium">What is your Full Name ?</h1>
      <form class="w-full flex flex-col items-end gap-6" @submit.prevent="submit">
        <div class="flex flex-col gap-3 w-full">
          <label for="workerName" class="text-[14px]">Full Name</label>
          <input id="workerName" v-model="fullName" type="text" autocomplete="off" placeholder="Muhammad Rizal Ramzi" class="w-[420px] border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" />
          <p v-if="error" class="text-[12px] text-red-600">{{ error }}</p>
        </div>

        <button :disabled="!fullName || loading" class="cursor-pointer transition-all w-fit bg-[color:var(--color-main)] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] disabled:opacity-50">
          {{ loading ? 'Saving...' : 'Next' }}
        </button>
      </form>
    </div>
  </section>
</template>
