<template>
  <div class="min-h-screen bg-white text-gray-900">
    <!-- Navbar -->
    <header class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
      <div class="text-2xl font-bold tracking-tight">
        <span>Carre</span><span class="text-[#2B4DB6]">path.</span>
      </div>
      
      <nav class="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
        <a href="#" class="text-gray-900 font-semibold hover:text-[#2B4DB6]">Home</a>
        <a href="#" class="hover:text-[#2B4DB6] transition">About</a>
        <a href="#" class="hover:text-[#2B4DB6] transition">Explore</a>
        <a href="#" class="hover:text-[#2B4DB6] transition">Blog</a>
        <a href="#" class="hover:text-[#2B4DB6] transition">Contact</a>
      </nav>

      <div class="flex items-center space-x-6">
        <a href="#" class="text-sm font-medium text-gray-700 hover:text-[#2B4DB6] transition">Login</a>
        <button class="bg-[#2B4DB6] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition flex items-center gap-2 shadow-sm">
          <Icon name="lucide:upload" class="w-4 h-4" />
          Upload your CV
        </button>
      </div>
    </header>

    <!-- Hero Section -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left Content -->
      <div class="space-y-8 z-10 relative">
        <h1 class="text-5xl lg:text-[5rem] font-extrabold leading-[1.1] tracking-tight text-gray-900">
          <span class="relative inline-block">
            <span class="relative z-10">Discover</span>
            <img src="/files/hero/Vector.svg" alt="circle highlight" class="absolute top-1/2 left-25 w-[120%] h-[135%] max-w-none -translate-x-[48%] -translate-y-[45%] object-fill pointer-events-none z-0" />
          </span>
          <span class="text-[#2B4DB6]">careers</span><br />
          that align with<br />
          your <span class="text-[#2B4DB6]">passion</span>
        </h1>
        
        <p class="text-lg text-gray-500 font-medium max-w-md">
          From where you are to where you want to be
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-8 pt-4 relative">
          <div class="relative">
             <button class="bg-[#2B4DB6] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-blue-800 transition shadow-lg shadow-blue-500/30 flex items-center gap-4 w-full sm:w-auto justify-between">
               Start now <Icon name="lucide:arrow-up-right" class="w-5 h-5" />
             </button>
             <img src="/files/hero/arrow22.svg" alt="Arrow pointing" class="absolute -bottom-18 left-90 w-[4.5rem] h-auto pointer-events-none hidden sm:block" />
          </div>
          
          <div class="flex items-center gap-3">
            <img src="/files/hero/talents.webp" alt="Talents" class="h-10 w-auto object-contain" />
            <div class="text-xs font-semibold leading-tight text-gray-800">
              <span class="text-[#2B4DB6]">100K+</span> Talents Found<br />
              Their Dream Job!
            </div>
          </div>
        </div>
      </div>

      <!-- Right Image/Illustration Area -->
      <div class="relative w-full flex items-center justify-center lg:justify-end">
        <img src="/files/hero/right-hero.webp" alt="Hero Illustration" class="w-full max-w-[600px] h-auto object-contain drop-shadow-sm" />
      </div>
    </main>
  </div>
</template>

<style>
/* Nuxt akan mengambil font 'Outfit' otomatis berkat @nuxtjs/google-fonts */
html, body {
  font-family: 'Outfit', sans-serif;
}
</style>
