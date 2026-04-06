<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col text-gray-900 font-['Outfit'] overflow-x-hidden">
    <!-- Error Content (Styled like Landing Page Hero) -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative">
      <div class="z-10 relative text-center flex flex-col items-center">
        <h1 class="text-[120px] lg:text-[180px] font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-[16px] lg:mb-[20px]">
          <span class="relative inline-block">
            <span class="relative z-10 text-[#2B4DB6]">{{ error?.statusCode || 404 }}</span>
          </span>
        </h1>
        
        <h2 class="text-[32px] sm:text-[42px] font-semibold leading-[1.2] tracking-tight text-gray-900 mb-[16px]">
          {{ error?.statusCode === 404 ? 'Page not found' : 'Oops, an error occurred' }}
        </h2>
        
        <p class="mb-[32px] text-base text-[#8F8F8F] font-medium max-w-md">
          {{ error?.statusCode === 404 
             ? "From where you are to where you want to be, but this page isn't part of the journey." 
             : error?.message || "Something went wrong on our end. Please try again later." 
          }}
        </p>

        <div class="flex flex-col items-center gap-5 sm:gap-8 pt-2 relative">
          <div class="relative">
            <button 
              @click="handleError"
              class="bg-[#2B4DB6] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal hover:bg-blue-800 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-4 relative z-10">
              Go back home
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875" stroke="white"
                  stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
