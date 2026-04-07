<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const isMobileMenuOpen = ref(false)
const router = useRouter()
const section2 = ref(null)
const heroSection = ref(null)
const headerRef = ref(null)

onMounted(() => {
  if (process.client) {
    gsap.registerPlugin(ScrollTrigger)

    // Navbar Animation
    const navElems = headerRef.value?.querySelectorAll('.nav-elem')
    if (navElems && navElems.length) {
      gsap.fromTo(navElems, 
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      )
    }

    // Hero Section Animation (Plays instantly on load)
    const heroElements = heroSection.value?.querySelectorAll('.hero-elem')
    const heroImg = heroSection.value?.querySelector('.hero-img')
    const heroArrow = heroSection.value?.querySelector('.hero-arrow')
    
    if (heroElements && heroImg) {
      const heroTl = gsap.timeline({ delay: 0.3 }) // delay agar navbar main lebih dulu
      heroTl.fromTo(heroElements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
      ).fromTo(heroImg,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        "-=0.6"
      )

      if (heroArrow) {
        // Arrow di hero muncul paling akhir setelah gambar/text dengan delay
        heroTl.fromTo(heroArrow,
          { opacity: 0, x: -10, y: -10 },
          { opacity: 1, x: 0, y: 0, duration: 0.6, ease: 'back.out(2)' },
          "-=0.1" 
        )
      }
    }

    const steps = section2.value?.querySelectorAll('.step-item')
    const arrows = section2.value?.querySelectorAll('.step-arrow')
    
    if (steps) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section2.value,
          start: 'top 80%',
          toggleActions: 'play none none none' // Play once
        }
      })

      // Animasi smooth masuk ke atas untuk masing-masing step
      tl.fromTo(steps, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
      )
      
      // Animasi muncul untuk arrow dengan sedikit overlap (agar terkesan mengalir)
      if (arrows && arrows.length > 0) {
        tl.fromTo(arrows,
          { opacity: 0, scale: 0.8, x: -10 },
          { opacity: 1, scale: 1, x: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out' },
          "-=0.6" 
        )
      }
    }
  }

  // Tangkap Token dari URL Hash (Google OAuth Redirect)
  if (process.client) {
    const hash = window.location.hash
    if (hash && hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')

      if (accessToken) {
        // Simpan token ke Cookie
        const tokenCookie = useCookie('access_token')
        tokenCookie.value = accessToken

        // Hapus hash dari URL supaya rapi (security/ux)
        window.location.hash = ''

        // Langsung lemparkan user ke Dashboard
        router.push('/dashboard')
      }
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-white text-gray-900 overflow-x-hidden">
    <!-- Navbar -->
    <header ref="headerRef"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-50 bg-white">
      <div class="nav-elem opacity-0 text-[20px] font-semibold tracking-tight">
        <span>Carre</span><span class="text-[#2B4DB6]">path.</span>
      </div>

      <nav class="nav-elem opacity-0 hidden md:flex space-x-[45px] text-sm font-normal text-[#1E1E1E]">
        <a href="#" class="hover:text-[#2B4DB6]">Home</a>
        <a href="#" class="hover:text-[#2B4DB6]">About</a>
        <a href="#" class="hover:text-[#2B4DB6]">Explore</a>
        <a href="#" class="hover:text-[#2B4DB6]">Blog</a>
        <a href="#" class="hover:text-[#2B4DB6]">Contact</a>
      </nav>

      <div class="nav-elem opacity-0 hidden md:flex items-center space-x-[50px]">
        <NuxtLink to="/auth/login" class="text-sm font-normal text-[#1E1E1E] hover:text-[#2B4DB6] transition">
          Login
        </NuxtLink>

        <NuxtLink to="/auth/login"
          class="bg-[#2B4DB6] text-white text-sm font-normal flex items-center gap-2 px-[30px] py-[15px] rounded-lg hover:bg-blue-800 transition">
          <img src="/files/hero/sign-button.svg" alt="upload icon" class="w-4 h-4" />
          Upload your CV
        </NuxtLink>
      </div>

      <!-- Mobile Menu Hamburger Button -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="nav-elem opacity-0 md:hidden bg-gray-50 hover:bg-gray-100 p-2.5 rounded-full text-[#1E1E1E] focus:outline-none transition-colors">
        <svg v-if="!isMobileMenuOpen" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
        <svg v-else width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Mobile Menu Panel -->
      <div v-if="isMobileMenuOpen"
        class="absolute top-[85px] left-4 right-4 bg-white/95 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-100 md:hidden flex flex-col p-6 space-y-5 z-[100] rounded-3xl ring-1 ring-black/5">
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Home</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">About</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Explore</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Blog</a>
        <a href="#" class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors">Contact</a>
        <hr class="border-gray-100 my-2" />
        <div class="flex flex-col gap-3 pt-2">
          <NuxtLink to="/auth/login"
            class="text-[15px] font-medium text-gray-800 hover:text-[#2B4DB6] transition-colors text-center py-2">Login
          </NuxtLink>
          <NuxtLink to="/auth/login"
            class="bg-[#2B4DB6] text-white text-[15px] font-medium flex items-center justify-center gap-2 px-[30px] py-[15px] rounded-[5px] hover:bg-blue-800 transition w-full shadow-md shadow-blue-500/20">
            <img src="/files/hero/sign-button.svg" alt="upload icon" class="w-4 h-4" />
            Upload your CV
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main ref="heroSection"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left Content -->
      <div class="z-10 relative">
        <h1
          class="hero-elem opacity-0 text-[42px] lg:text-[64px] font-semibold leading-[1.2] lg:leading-[1.1] tracking-normal lg:tracking-tight text-gray-900 mb-[16px] lg:mb-[30px] text-center sm:text-left">
          <span class="relative inline-block">
            <span class="relative z-10">Discover</span>
            <img src="/files/hero/circle.svg" alt="circle highlight"
              class="absolute top-6 left-15 lg:top-10 lg:left-21  w-[120%] h-[135%] max-w-none -translate-x-[52%] -translate-y-[50%] md:-translate-x-[48%] md:-translate-y-[45%] object-fill pointer-events-none z-0" />
          </span>&nbsp;<span class="text-[#2B4DB6]">careers</span><br />
          that align with<br />
          your <span class="text-[#2B4DB6]">passion</span>
        </h1>

        <p
          class="hero-elem opacity-0 mt-[16px] mb-[24px] lg:mt-[30px] lg:mb-[30px] text-base text-[#8F8F8F] font-medium max-w-md text-center sm:text-left mx-auto sm:mx-0">
          From where you are to where you want to be
        </p>

        <div class="hero-elem opacity-0 flex flex-wrap items-center justify-center sm:justify-start gap-5 sm:gap-8 pt-2 sm:pt-4 relative">
          <div class="relative">
            <NuxtLink to="/auth/login"
              class="bg-[#2B4DB6] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal hover:bg-blue-800 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-4">
              Start now
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875" stroke="white"
                  stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </NuxtLink>
            <img src="/files/hero/arrow.svg" alt="Arrow pointing"
              class="hero-arrow opacity-0 absolute -bottom-17 left-85 w-[4.5rem] h-auto pointer-events-none hidden sm:block" />
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
          class="hero-img opacity-0 w-full max-w-[500px] lg:max-w-none h-auto object-contain lg:translate-x-24 xl:translate-x-40 rounded-[5px]" />
      </div>
    </main>

    <!-- How it Works / Steps Section -->
    <section ref="section2" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-[100px] font-['Outfit']">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 overflow-hidden md:overflow-visible">
        
        <!-- Step 1 -->
        <div class="relative mt-0 flex md:block items-start gap-4 md:gap-0 step-item opacity-0">
          <div class="inline-block bg-[#2B4DB6] rounded-[5px] p-[10px] md:py-[10px] md:px-[20px] mb-[10px] shrink-0 text-center w-[60px] md:w-auto">
            <span class="text-[40px] text-[#FFFFFF] font-normal leading-none block">1</span>
          </div>
          <div>
            <h3 class="text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[10px]">
              Drop your CV and let us do the heavy lifting
            </h3>
            <p class="text-[14px] text-[#1E1E1E] opacity-60 leading-relaxed font-normal">
              We analyze your experience, skills, and background using AI to understand where you stand today.
            </p>
          </div>
          
          <!-- Next Arrow Desktop -->
          <div class="hidden md:block absolute -right-[125px] top-[140px] z-10 step-arrow opacity-0">
            <img src="/files/hero/arrow1.svg" alt="Arrow to next step" class="w-full h-auto object-contain" />
          </div>
        </div>

        <!-- Step 2 -->
        <div class="relative mt-0 md:mt-75 flex md:block items-start gap-4 md:gap-0 step-item opacity-0">
          <div class="inline-block bg-[#2B4DB6] rounded-[5px] p-[10px] md:py-[10px] md:px-[20px] mb-[10px] shrink-0 text-center w-[60px] md:w-auto">
            <span class="text-[40px] text-[#FFFFFF] font-normal leading-none block">2</span>
          </div>
          <div>
            <h3 class="text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[10px]">
              See your strengths and skill gaps instantly
            </h3>
            <p class="text-[14px] text-[#1E1E1E] opacity-60 leading-relaxed font-normal">
              Understand what you already have and what you're missing to reach your desired career.
            </p>
          </div>

          <!-- Next Arrow Desktop -->
          <div class="hidden md:block absolute -right-[90px] -top-[50px] z-10 step-arrow opacity-0">
            <img src="/files/hero/arrow2.svg" alt="Arrow to next step" class="w-full h-auto object-contain" />
          </div>
        </div>

        <!-- Step 3 -->
        <div class="relative mt-0 md:mt-0 flex md:block items-start gap-4 md:gap-0 step-item opacity-0">
          <div class="inline-block bg-[#2B4DB6] rounded-[5px] p-[10px] md:py-[10px] md:px-[25px] mb-[10px] shrink-0 text-center w-[60px] md:w-auto">
            <span class="text-[40px] text-[#FFFFFF] font-normal leading-none block">3</span>
          </div>
          <div>
            <h3 class="text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[10px]">
              Receive a personalized roadmap
            </h3>
            <p class="text-[14px] text-[#1E1E1E] opacity-60 leading-relaxed font-normal">
              Get curated learning paths, courses, and certifications tailored to your goals.
            </p>
          </div>

          <!-- Next Arrow Desktop -->
          <div class="hidden md:block absolute -right-[100px] top-[120px] z-10 step-arrow opacity-0">
            <img src="/files/hero/arrow3.svg" alt="Arrow to next step" class="w-full h-auto object-contain" />
          </div>
        </div>

        <!-- Step 4 -->
        <div class="relative mt-0 md:mt-75 flex md:block items-start gap-4 md:gap-0 step-item opacity-0">
          <div class="inline-block bg-[#2B4DB6] rounded-[5px] p-[10px] md:py-[10px] md:px-[30px] mb-[10px] shrink-0 text-center w-[60px] md:w-auto">
            <span class="text-[40px] text-[#FFFFFF] font-normal leading-none block">4</span>
          </div>
          <div>
            <h3 class="text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[10px]">
              Find jobs that actually match you
            </h3>
            <p class="text-[14px] text-[#1E1E1E] opacity-60 leading-relaxed font-normal">
              Explore job recommendations based on your skills, interests, and growth path.
            </p>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>