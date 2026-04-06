<template>
  <div class="min-h-screen bg-white text-gray-900 overflow-x-hidden">
    <!-- Navbar -->
    <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
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

      <div class="flex items-center space-x-[50px]">
        <a href="#" class="text-sm font-normal text-[#1E1E1E] hover:text-[#2B4DB6] transition">
          Login
        </a>

        <button
          class="bg-[#2B4DB6] text-white text-sm font-normal flex items-center gap-2 px-[30px] py-[15px] rounded-lg hover:bg-blue-800 transition">
          <img src="/files/hero/sign-button.svg" alt="upload icon" class="w-4 h-4" />
          Upload your CV
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <main
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left Content -->
      <div class="z-10 relative">
        <h1 class="text-5xl lg:text-[64px] font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-[30px]">
          <span class="relative inline-block">
            <span class="relative z-10">Discover</span>
            <img src="/files/hero/circle.svg" alt="circle highlight"
              class="absolute top-10 left-21 w-[120%] h-[135%] max-w-none -translate-x-[48%] -translate-y-[45%] object-fill pointer-events-none z-0" />
          </span>&nbsp;<span class="text-[#2B4DB6]">careers</span><br />
          that align with<br />
          your <span class="text-[#2B4DB6]">passion</span>
        </h1>

        <p class="mt-[20px] mb-[32px] lg:mt-[30px] lg:mb-[30px] text-base text-[#8F8F8F] font-medium max-w-md">
          From where you are to where you want to be
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-8 pt-4 relative">
          <div class="relative">
            <button
              class="bg-[#2B4DB6] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal hover:bg-blue-800 transition shadow-lg shadow-blue-500/30 flex items-center gap-4 w-full sm:w-auto justify-between">
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
