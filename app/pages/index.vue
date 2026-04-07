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
const section3Ref = ref(null)

onMounted(() => {
  if (process.client) {
    gsap.registerPlugin(ScrollTrigger)

    // Navbar Animation
    const navElems = headerRef.value?.querySelectorAll('.nav-elem')
    if (navElems && navElems.length) {
      gsap.fromTo(navElems,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      )
    }

    // Hero Section Animation (Plays instantly on load)
    const heroElements = heroSection.value?.querySelectorAll('.hero-elem')
    const heroImg = heroSection.value?.querySelector('.hero-img')
    const heroArrow = heroSection.value?.querySelector('.hero-arrow')

    if (heroElements && heroImg) {
      const heroTl = gsap.timeline({ delay: 0.1 }) // Delay dikurangi
      heroTl.fromTo(heroElements,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      ).fromTo(heroImg,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        "-=0.4"
      )

      if (heroArrow) {
        // Arrow di hero muncul dari kanan bawah (x: positif, y: positif) ke posisi asal
        heroTl.fromTo(heroArrow,
          { opacity: 0, x: 15, y: 15 },
          { opacity: 1, x: 0, y: 0, duration: 0.6, ease: 'back.out(2)' },
          "-=0.3"
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

    // Section 3 Animation
    const s3TitleDec = section3Ref.value?.querySelectorAll('.s3-title-dec')
    const s3Arrow = section3Ref.value?.querySelector('.s3-main-arrow')
    const s3Boxes = section3Ref.value?.querySelectorAll('.s3-box')
    const s3Card = section3Ref.value?.querySelector('.s3-card')

    if (section3Ref.value) {
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: section3Ref.value,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      })

      // Animate Main Text
      if (s3TitleDec && s3TitleDec.length) {
        tl3.fromTo(s3TitleDec,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out' }
        )
      }

      // Animate Left Arrow
      if (s3Arrow) {
        tl3.fromTo(s3Arrow,
          { opacity: 0, x: 30, y: 30, scale: 0.8 },
          { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.6, ease: 'back.out(2)' },
          "-=0.4"
        )
      }

      // Animate Boxes using stagger
      if (s3Boxes && s3Boxes.length) {
        tl3.fromTo(s3Boxes,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
          "-=0.3"
        )
      }

      // Animate Right Card
      if (s3Card) {
        tl3.fromTo(s3Card,
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
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

        <div
          class="hero-elem opacity-0 flex flex-wrap items-center justify-center sm:justify-start gap-5 sm:gap-8 pt-2 sm:pt-4 relative">
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
    <section ref="section2" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-[40px] md:mb-[100px] font-['Outfit']">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 overflow-hidden md:overflow-visible">

        <!-- Step 1 -->
        <div class="relative mt-0 flex md:block items-start gap-4 md:gap-0 step-item opacity-0">
          <div
            class="inline-block bg-[#2B4DB6] rounded-[5px] py-[10px] px-[15px] md:px-[20px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">1</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[6px] md:mb-[10px]">
              Drop your CV and let us do the heavy lifting
            </h3>
            <p class="text-[14px] text-[#1E1E1E] opacity-60 leading-relaxed font-normal">
              We analyze your experience, skills, and background using AI to understand where you stand today.
            </p>
          </div>

          <!-- Next Arrow Desktop -->
          <div class="hidden md:block absolute -right-[125px] top-[140px] z-10 step-arrow opacity-0">
            <img src="/files/hero/arrow3.svg" alt="Arrow to next step" class="w-full h-auto object-contain" />
          </div>
        </div>

        <!-- Step 2 -->
        <div class="relative mt-0 md:mt-75 flex md:block items-start gap-4 md:gap-0 step-item opacity-0">
          <div
            class="inline-block bg-[#2B4DB6] rounded-[5px] py-[10px] px-[15px] md:px-[20px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">2</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[6px] md:mb-[10px]">
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
          <div
            class="inline-block bg-[#2B4DB6] rounded-[5px] py-[10px] px-[15px] md:px-[25px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">3</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[6px] md:mb-[10px]">
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
          <div
            class="inline-block bg-[#2B4DB6] rounded-[5px] py-[10px] px-[15px] md:px-[30px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">4</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[#1E1E1E] font-normal leading-tight mb-[6px] md:mb-[10px]">
              Find jobs that actually match you
            </h3>
            <p class="text-[14px] text-[#1E1E1E] opacity-60 leading-relaxed font-normal">
              Explore job recommendations based on your skills, interests, and growth path.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- Section 3: Explore by Categories -->
    <section ref="section3Ref" class="w-full bg-[#F4F6FB] mb-[120px] font-['Outfit'] relative overflow-hidden">
      <!-- Background Decorations -->
      <img src="/files/hero/Ellipse2.svg" alt="Decoration Left"
        class="absolute -left-55 top-70 -translate-y-1/2 hidden lg:block z-0 pointer-events-none select-none" />
      <img src="/files/hero/Ellipse3.svg" alt="Decoration Right"
        class="absolute -right-25 top-90 hidden lg:block z-0 pointer-events-none select-none" />

      <div
        class="relative max-w-[1280px] w-full mx-auto lg:h-[700px] flex flex-col lg:flex-row items-center justify-center lg:justify-between px-4 sm:px-6 lg:px-8 py-12 lg:py-0 gap-[40px] lg:gap-[120px]">
        
        <!-- Scribble Decoration pinned to the container -->
        <img src="/files/hero/scribbleline06.svg" alt="Scribble Top Right"
          class="absolute right-4 lg:-right-4 top-30 hidden lg:block z-0 pointer-events-none select-none" />

        <!-- Left Content -->
        <div class="relative z-10 w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
          <img src="/files/hero/arrow.svg" alt="Arrow pointing"
            class="s3-main-arrow opacity-0 absolute -right-8 top-18 hidden lg:block z-0 pointer-events-none w-20" />
          <h2 class="s3-title-dec opacity-0 text-[32px] md:text-[42px] font-semibold text-[#1E1E1E] leading-tight">
            Explore by Categories
          </h2>
          <p
            class="s3-title-dec opacity-0 mt-[15px] md:mt-[20px] text-[14px] font-normal text-[#1E1E1E] opacity-50 max-w-[450px] leading-relaxed">
            We provide many categories, choose a category according to your expertise to make it easier to find a job.
          </p>

          <div
            class="mt-[40px] md:mt-[80px] grid grid-cols-2 gap-x-[10px] sm:gap-x-[20px] gap-y-[15px] w-full max-w-[550px] place-items-center lg:place-items-start">
            <!-- Box 1 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[#2B4DB6] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/business.svg" alt="Business Development" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span class="text-[12px] sm:text-[14px] font-medium text-[#1E1E1E] leading-tight">Business<br />Development</span>
            </div>
            <!-- Box 2 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[#2B4DB6] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/web.svg" alt="Web Developer" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span class="text-[12px] sm:text-[14px] font-medium text-[#1E1E1E] leading-tight">Web<br />Developer</span>
            </div>
            <!-- Box 3 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[#2B4DB6] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/human.svg" alt="Human Resource" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span class="text-[12px] sm:text-[14px] font-medium text-[#1E1E1E] leading-tight">Human<br />Resource</span>
            </div>
            <!-- Box 4 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[#2B4DB6] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/data.svg" alt="Data Analyst" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span class="text-[12px] sm:text-[14px] font-medium text-[#1E1E1E] leading-tight">Data Analyst</span>
            </div>
          </div>
        </div>

        <!-- Right Content (Card) -->
        <div class="s3-card opacity-0 relative z-10 w-full lg:w-[530px] shrink-0">
          <div
            class="bg-white rounded-[10px] w-full min-h-[355px] p-6 lg:p-[30px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-left">
            <div class="flex items-center justify-between mb-[30px]">
              <h3 class="text-[20px] font-medium text-[#1E1E1E]">Popular Categories</h3>
              <button
                class="flex items-center gap-2 text-[#1E1E1E] opacity-50 text-[14px] font-medium hover:opacity-100 transition cursor-pointer">
                See all categories
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875" stroke="#1E1E1E"
                    stroke-opacity="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <div class="flex flex-col">
              <!-- Item 1 -->
              <div class="flex flex-wrap items-center justify-between border-b border-[#1E1E1E]/10 pb-[15px] mb-[15px]">
                <span class="text-[14px] font-medium text-[#1E1E1E] flex-1 min-w-[150px]">Fullstack Developer</span>
                <div
                  class="bg-[#2B4DB6]/[0.08] text-[#2B4DB6] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  23
                </div>
              </div>
              <!-- Item 2 -->
              <div class="flex flex-wrap items-center justify-between border-b border-[#1E1E1E]/10 pb-[15px] mb-[15px]">
                <span class="text-[14px] font-medium text-[#1E1E1E] flex-1 min-w-[150px]">Quality Assurance</span>
                <div
                  class="bg-[#2B4DB6]/[0.08] text-[#2B4DB6] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  43
                </div>
              </div>
              <!-- Item 3 -->
              <div class="flex flex-wrap items-center justify-between border-b border-[#1E1E1E]/10 pb-[15px] mb-[15px]">
                <span class="text-[14px] font-medium text-[#1E1E1E] flex-1 min-w-[150px]">Financial Accounting</span>
                <div
                  class="bg-[#2B4DB6]/[0.08] text-[#2B4DB6] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  81
                </div>
              </div>
              <!-- Item 4 -->
              <div class="flex flex-wrap items-center justify-between border-b-0 pb-[15px]">
                <span class="text-[14px] font-medium text-[#1E1E1E] flex-1 min-w-[150px]">DevOps Developer</span>
                <div
                  class="bg-[#2B4DB6]/[0.08] text-[#2B4DB6] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  91
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
</template>