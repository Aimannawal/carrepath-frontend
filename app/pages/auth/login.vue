<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const { get, post, baseUrl } = useApi()

const handleLogin = async (e) => {
  e.preventDefault()
  console.log('BASE URL:', baseUrl)
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await post('/auth/login', {
      email: email.value,
      password: password.value
    })

    console.log('Response Backend (Login):', response)

    const token = response?.access_token ||
      response?.data?.access_token ||
      response?.data?.session?.access_token ||
      response?.token;

    if (token) {
      const tokenCookie = useCookie('access_token')
      tokenCookie.value = token

      const payloadBase64 = token.split('.')[1]
      const decodedPayload = JSON.parse(atob(payloadBase64))
      const userId = decodedPayload.sub

      try {

        const profile = await get(`/users/profile/${userId}`)

        if (profile?.data?.role) {
          const roleCookie = useCookie('user_role')
          roleCookie.value = profile.data.role

          const dest = profile.data.role === 'superadmin' ? '/admin/dashboard' : `/${profile.data.role}/dashboard`
          navigateTo(dest)
        } else {
          navigateTo('/onboarding')
        }
      } catch (err) {
        if (err.status === 404) {
          navigateTo('/onboarding')
        } else {
          console.error('Kesalahan memeriksa profile ke server:', err)
          errorMessage.value = 'Gagal mengakses data profil. Coba lagi.'
        }
      }
    } else {
      errorMessage.value = 'Berhasil ke API, tapi Frontend tidak bisa menemukan Access Token.'
    }
  } catch (error) {
    console.error('Login error:', error)
    errorMessage.value = error.data?.message || error.message || 'Login gagal. Periksa kembali email dan password Anda.'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = () => {
  window.location.href = `${baseUrl}/auth/google`
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col text-[color:var(--color-dark)] font-['Outfit']">
    <main class="flex-1 flex flex-col items-center justify-center p-4">
      <div class="w-full max-w-md mb-4">
        <NuxtLink to="/"
          class="inline-flex items-center gap-2 text-[15px] font-medium text-[color:var(--color-dark)] hover:text-[color:var(--color-main)] transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round" />
          </svg>
          Back to Home
        </NuxtLink>
      </div>

      <div
        class="bg-white w-full max-w-md rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-gray-100 p-8 sm:p-10">
        <div class="text-center mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-[color:var(--color-dark)] mb-2">Welcome Back!</h1>
          <p class="text-[15px] text-[#8F8F8F] font-medium">Log in to continue building your career</p>
        </div>

        <div v-if="errorMessage"
          class="mb-5 p-3 rounded-lg bg-red-50 text-red-600 text-[14px] font-medium text-center shadow-sm">
          {{ errorMessage }}
        </div>

        <form @submit="handleLogin" class="space-y-5">
          <button type="button" @click="handleGoogleLogin"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-[8px] hover:bg-gray-50 transition text-[14px] font-medium text-gray-700 bg-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.94 16.79 15.86 17.52V20.25H19.43C21.52 18.32 22.56 15.54 22.56 12.25Z"
                fill="#4285F4" />
              <path
                d="M12 23C14.97 23 17.16 22.01 18.77 20.35L15.35 17.9C14.48 18.49 13.34 18.83 12 18.83C9.4 18.83 6.94 17.07 6.06 14.68H2.41V17.51C4.19 21.05 8.1 23 12 23Z"
                fill="#34A853" />
              <path
                d="M6.06 14.68C5.83 14.02 5.7 13.32 5.7 12.6C5.7 11.88 5.83 11.18 6.06 10.52V7.69H2.41C1.67 9.17 1.25 10.83 1.25 12.6C1.25 14.37 1.67 16.03 2.41 17.51L6.06 14.68Z"
                fill="#FBBC05" />
              <path
                d="M12 6.37C13.62 6.37 15.06 6.93 16.2 7.99L18.86 5.33C17.15 3.73 14.96 2.8 12 2.8C8.1 2.8 4.19 4.75 2.41 8.29L6.06 11.12C6.94 8.73 9.4 6.37 12 6.37Z"
                fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>

          <div class="relative flex items-center py-2">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink-0 mx-4 text-[#8F8F8F] text-[13px] font-normal">Or sign in with email</span>
            <div class="flex-grow border-t border-gray-200"></div>
          </div>

          <div>
            <label for="email" class="block text-[14px] font-medium text-gray-700 mb-1.5">Email Address</label>
            <input id="email" type="email" v-model="email" placeholder="Enter your email"
              class="w-full px-4 py-3 rounded-[8px] bg-gray-50 border border-gray-200 focus:border-[color:var(--color-main)] focus:ring-2 focus:ring-blue-500/20 outline-none transition text-[15px] font-normal"
              required />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="block text-[14px] font-medium text-gray-700">Password</label>
              <a href="#"
                class="text-[13px] font-medium text-[color:var(--color-main)] hover:text-blue-800 transition">Forgot
                Password?</a>
            </div>
            <div class="relative">
              <input id="password" :type="showPassword ? 'text' : 'password'" v-model="password"
                placeholder="Enter your password"
                class="w-full px-4 py-3 rounded-[8px] bg-gray-50 border border-gray-200 focus:border-[color:var(--color-main)] focus:ring-2 focus:ring-blue-500/20 outline-none transition text-[15px] font-normal"
                required />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition">
                <svg v-if="!showPassword" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24">
                  </path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <button type="submit" :disabled="isLoading"
            class="w-full bg-[color:var(--color-main)] text-white text-[15px] font-medium flex items-center justify-center gap-2 px-[30px] py-[15px] rounded-[8px] hover:opacity-90 transition shadow-md shadow-blue-500/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-[14px] text-gray-600 font-normal">
            Don't have an account?
            <NuxtLink to="/auth/register"
              class="text-[color:var(--color-main)] font-medium hover:opacity-90 transition">Sign up now</NuxtLink>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
