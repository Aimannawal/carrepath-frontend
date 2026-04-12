<script setup>
import { ref, onMounted } from 'vue'

useHead({
  title: 'CarrePath | Choose your Role'
})

const selectedRole = ref('')
const isLoading = ref(false)
const { post } = useApi()
const tokenCookie = useCookie('access_token')
const userRoleCookie = useCookie('user_role')

const userData = ref({ id: '', fullName: '', email: '' })

onMounted(() => {
  if (tokenCookie.value) {
    try {
      const payloadJSON = JSON.parse(atob(tokenCookie.value.split('.')[1]))
      userData.value.id = payloadJSON.sub || ''
      userData.value.email = payloadJSON.email || ''
      userData.value.fullName = payloadJSON.user_metadata?.full_name || ''
    } catch (err) {
      console.error('Failed to parse JWT for onboarding', err)
    }
  }
})

const handleSetRole = async () => {
  if (!selectedRole.value) return
  isLoading.value = true
  try {
    await post('/users/set-role', {
      id: userData.value.id,
      role: selectedRole.value,
      full_name: userData.value.fullName,
      email: userData.value.email
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    userRoleCookie.value = selectedRole.value

    if (selectedRole.value === 'worker') {
      navigateTo('/worker-name')
    } else {
      navigateTo('/company-name')
    }
  } catch (error) {
    alert(error?.data?.error || 'Terjadi kesalahan saat menyimpan role.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 sm:p-6 font-['Outfit']">
    <div class="max-w-4xl w-full text-center flex flex-col items-center">
      <div class="mb-[50px]">
        <h1 class="text-[48px] font-semibold text-[color:var(--color-dark)] leading-tight tracking-tight">What you want
          to be ?</h1>
        <p class="text-[14px] font-normal text-[color:var(--color-dark)] opacity-60 mt-[16px]">Choose the role that best
          suits your goals at Carrepath.</p>
      </div>

      <div class="flex flex-col md:flex-row gap-6 justify-center w-full">
        <div @click="selectedRole = 'worker'" :class="[
          'p-[40px] rounded-[10px] bg-white cursor-pointer transition-all duration-200 ease-in-out text-left border relative w-full max-w-[320px] hover:shadow-sm',
          selectedRole === 'worker'
            ? 'ring-2 ring-[#2B4DB6] border-[#2B4DB6]'
            : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
        ]">
          <div class="flex items-start justify-between">
            <div class="w-[40px] h-[40px] bg-[#F4F6FB] rounded-[5px] flex items-center justify-center text-[color:var(--color-main)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div :class="['w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-all', selectedRole === 'worker' ? 'border-[color:var(--color-main)]' : 'border-[color:var(--color-dark)] border-opacity-20']">
              <div v-if="selectedRole === 'worker'" class="w-[10px] h-[10px] rounded-full bg-[color:var(--color-main)]"></div>
            </div>
          </div>

          <h3 class="text-[20px] font-medium text-[color:var(--color-dark)] mt-[27px]">Find a Job</h3>
          <p class="text-[14px] font-normal text-[color:var(--color-dark)] opacity-60 mt-[20px] leading-relaxed">
            Find your dream job. Build a career, develop a portfolio and get noticed by top companies
          </p>
        </div>

        <div @click="selectedRole = 'company'" :class="[
          'w-full max-w-[320px] p-[40px] rounded-[10px] bg-white cursor-pointer transition-all duration-200 ease-in-out text-left border relative hover:shadow-sm',
          selectedRole === 'company' ? 'ring-2 ring-[#2B4DB6] border-[#2B4DB6]' : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
        ]">
          <div class="flex items-start justify-between">
            <div class="w-[40px] h-[40px] bg-[#F4F6FB] rounded-[5px] flex items-center justify-center text-[color:var(--color-main)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                <path d="M9 22v-4h6v4"></path>
                <path d="M8 6h.01"></path>
                <path d="M16 6h.01"></path>
                <path d="M12 6h.01"></path>
                <path d="M12 10h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 10h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 10h.01"></path>
                <path d="M8 14h.01"></path>
              </svg>
            </div>

            <div :class="['w-[20px] h-[20px] rounded-full border-[1.5px] flex items-center justify-center transition-all', selectedRole === 'company' ? 'border-[color:var(--color-main)]' : 'border-[color:var(--color-dark)] border-opacity-20']">
              <div v-if="selectedRole === 'company'" class="w-[10px] h-[10px] rounded-full bg-[color:var(--color-main)]"></div>
            </div>
          </div>

          <h3 class="text-[20px] font-medium text-[color:var(--color-dark)] mt-[27px]">Find a Worker</h3>
          <p class="text-[14px] font-normal text-[color:var(--color-dark)] opacity-60 mt-[20px] leading-[150%]">
            Recruit the best talent instantly. post vacancies and accelerate the growth of your business now.
          </p>
        </div>
      </div>

      <div class="mt-[50px] flex justify-center">
        <button @click="handleSetRole" :disabled="!selectedRole || isLoading" :class="[
          'px-[30px] py-[15px] rounded-[5px] font-normal text-[14px] transition-all duration-200 ease-in-out flex items-center justify-center gap-[10px]',
          selectedRole && !isLoading
            ? 'bg-[color:var(--color-main)] text-[#FFFFFF] hover:bg-blue-800 shadow-lg shadow-blue-500/30'
            : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none'
        ]">
          <span>{{ isLoading ? 'Menyimpan...' : 'Continue to Dashboard' }}</span>
          <svg v-if="!isLoading" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_213_78)">
              <path d="M3.71231 9.89959H16.0867M16.0867 9.89959L11.4463 5.2592M16.0867 9.89959L11.4463 14.54" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_213_78">
                <rect width="14" height="14" fill="currentColor" transform="translate(9.89949) rotate(45)" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --color-main: #2B4DB6;
  --color-dark: #292929;
}
</style>
