<script setup>
import { ref } from 'vue'

const isMobileMenuOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 overflow-x-hidden">
    <!-- Navbar -->
    <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-50 bg-white">
      <div class="text-[20px] font-semibold tracking-tight">
        <span>Carre</span><span class="text-[#2B4DB6]">path.</span>
      </div>

      <nav class="hidden md:flex space-x-[45px] text-sm font-normal text-[#1E1E1E]">
        <a href="#" class="hover:text-[#2B4DB6]">Home</a>
        <a href="#" class="hover:text-[#2B4DB6]">About</a>
        <a href="#" class="hover:text-[#2B4DB6]">Explore</a>
        <a href="#" class="hover:text-[#2B4DB6]">Blog</a>
        <a href="#" class="hover:text-[#2B4DB6]">Contact</a>
      </nav>

      <div class="hidden md:flex items-center space-x-[50px]">
        <a href="#" class="text-sm font-normal text-[#1E1E1E] hover:text-[#2B4DB6] transition">
          Login
        </a>

        <button
          class="bg-[#2B4DB6] text-white text-sm font-normal flex items-center gap-2 px-[30px] py-[15px] rounded-lg hover:bg-blue-800 transition">
          <img src="/files/hero/sign-button.svg" alt="upload icon" class="w-4 h-4" />
          Upload your CV
        </button>
      </div>

      <!-- Mobile Menu Hamburger Button -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full text-[#1E1E1E] focus:outline-none transition-colors">
        <svg v-if="!isMobileMenuOpen" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
        <svg v-else width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Mobile Menu Panel -->
      <div v-if="isMobileMenuOpen" class="absolute top-[85px] left-4 right-4 bg-white/95 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-100 md:hidden flex flex-col p-6 space-y-5 z-[100] rounded-3xl ring-1 ring-black/5">
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Home</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">About</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Explore</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Blog</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Contact</a>
        <hr class="border-gray-100 my-2" />
        <div class="flex flex-col gap-3 pt-2">
          <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors text-center py-2">Login</a>
          <button
            class="bg-[#2B4DB6] text-white text-[15px] font-medium flex items-center justify-center gap-2 px-[30px] py-[15px] rounded-xl hover:bg-blue-800 transition w-full shadow-md shadow-blue-500/20">
            <img src="/files/hero/sign-button.svg" alt="upload icon" class="w-4 h-4" />
            Upload your CV
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left Content -->
      <div class="z-10 relative">
        <h1 class="text-5xl lg:text-[64px] font-extrabold leading-[1.2] lg:leading-[1.1] tracking-normal lg:tracking-tight text-gray-900 mb-[16px] lg:mb-[30px]">
          <span class="relative inline-block">
            <span class="relative z-10">Discover</span>
            <img src="/files/hero/circle.svg" alt="circle highlight"
              class="absolute top-7 left-19 lg:top-10 lg:left-21  w-[120%] h-[135%] max-w-none -translate-x-[52%] -translate-y-[50%] md:-translate-x-[48%] md:-translate-y-[45%] object-fill pointer-events-none z-0" />
          </span>&nbsp;<span class="text-[#2B4DB6]">careers</span><br />
          that align with<br />
          your <span class="text-[#2B4DB6]">passion</span>
        </h1>

        <p class="mt-[16px] mb-[24px] lg:mt-[30px] lg:mb-[30px] text-base text-[#8F8F8F] font-medium max-w-md">
          From where you are to where you want to be
        </p>

        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8 pt-2 sm:pt-4 relative">
          <div class="relative">
            <button
              class="bg-[#2B4DB6] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal hover:bg-blue-800 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-4">
              Start now
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875" stroke="white"
                  stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <img src="/files/hero/arrow.svg" alt="Arrow pointing"
              class="absolute -bottom-17 left-85 w-[4.5rem] h-auto pointer-events-none hidden sm:block" />
          </div>

          <div class="flex items-center gap-3">
            <img src="/files/hero/talents.webp" alt="Talents" class="h-9 w-auto object-contain" />
            <div class="text-xs font-normal leading-tight text-[#1E1E1E]">
              <span class="text-[#2B4DB6]">100K+</span> Talents Found<br />
              Their Dream Job!
            </div>
          </div>
        </div>
      </div>

      <!-- Right Image/Illustration Area -->
      <div class="relative w-full flex items-center justify-center lg:justify-end">
        <img src="/files/hero/right-hero.webp" alt="Hero Illustration"
          class="w-full max-w-[600px] lg:max-w-none lg:w-[100%] xl:w-[100%] lg:scale-110 h-auto object-contain drop-shadow-sm lg:translate-x-16 xl:translate-x-28" />
      </div>
    </main>
  </div>
</template>

<style>
/* Nuxt akan mengambil font 'Outfit' otomatis berkat @nuxtjs/google-fonts */
html,
body {
  font-family: 'Outfit', sans-serif;
}
</style>
