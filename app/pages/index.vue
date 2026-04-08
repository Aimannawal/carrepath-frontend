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
const section4Ref = ref(null)
const section5Ref = ref(null)
const footerRef = ref(null)

const emailInput = ref('')
const showToast = ref(false)

const scrollToTop = () => {
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleSubscribe = () => {
  if (emailInput.value.trim() !== '') {
    showToast.value = true
    emailInput.value = ''
    // Auto close toast after 3.5 seconds
    setTimeout(() => {
      showToast.value = false
    }, 3500)
  }
}

const scrollToSection = (id) => {
  isMobileMenuOpen.value = false // Tutup popup menu di mobile saat diklik
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const jobs = [
  { logo: '/logos/google.svg', title: 'Junior Software Developer', location: 'Singapore', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' },
  { logo: '/logos/microsoft.svg', title: 'Electrical Engineering', location: 'Indonesia', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' },
  { logo: '/logos/google.svg', title: 'Junior Software Developer', location: 'Singapore', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' },
  { logo: '/logos/google.svg', title: 'Junior Software Developer', location: 'Singapore', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' },
  { logo: '/logos/google.svg', title: 'Junior Software Developer', location: 'Singapore', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' },
  { logo: '/logos/google.svg', title: 'Junior Software Developer', location: 'Singapore', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' },
  { logo: '/logos/google.svg', title: 'Junior Software Developer', location: 'Singapore', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' },
  { logo: '/logos/google.svg', title: 'Junior Software Developer', location: 'Singapore', type: 'On Site', type2: 'Internship', company: 'Google. inc', time: '1 Days ago' }
]

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

    // Section 4 Animation
    const s4Titles = section4Ref.value?.querySelectorAll('.s4-title-dec')
    const s4Cards = section4Ref.value?.querySelectorAll('.s4-card')

    if (section4Ref.value) {
      const tl4 = gsap.timeline({
        scrollTrigger: {
          trigger: section4Ref.value,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      })

      if (s4Titles && s4Titles.length) {
        tl4.fromTo(s4Titles,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out' }
        )
      }

      if (s4Cards && s4Cards.length) {
        tl4.fromTo(s4Cards,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
          "-=0.3"
        )
      }
    }

    // Section 5 Animation
    const s5Elems = section5Ref.value?.querySelectorAll('.s5-elem')
    if (section5Ref.value && s5Elems && s5Elems.length) {
      gsap.fromTo(s5Elems,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: {
            trigger: section5Ref.value,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )
    }

    // Footer Animation
    const footerElems = footerRef.value?.querySelectorAll('.footer-elem')
    if (footerRef.value && footerElems && footerElems.length) {
      gsap.fromTo(footerElems,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.value,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      )
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
  <div class="min-h-screen bg-white text-[color:var(--color-dark)] overflow-x-hidden">
    <!-- Navbar -->
    <header ref="headerRef"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-50 bg-white">
      <div class="nav-elem opacity-0 text-[20px] font-semibold tracking-tight">
        <span>Carre</span><span class="text-[color:var(--color-main)]">path.</span>
      </div>

      <nav class="nav-elem opacity-0 hidden md:flex space-x-[45px] text-sm font-normal text-[color:var(--color-dark)]">
        <a href="#home" @click.prevent="scrollToSection('home')" class="hover:text-[color:var(--color-main)]">Home</a>
        <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')" class="hover:text-[color:var(--color-main)]">How it
          Works</a>
        <a href="#job-categories" @click.prevent="scrollToSection('job-categories')" class="hover:text-[color:var(--color-main)]">Job by
          Categories</a>
        <a href="#latest-jobs" @click.prevent="scrollToSection('latest-jobs')" class="hover:text-[color:var(--color-main)]">Latest
          Jobs</a>
        <a href="#contact" @click.prevent="scrollToSection('contact')" class="hover:text-[color:var(--color-main)]">Contact</a>
      </nav>

      <div class="nav-elem opacity-0 hidden md:flex items-center space-x-[50px]">
        <NuxtLink to="/auth/login" class="text-sm font-normal text-[color:var(--color-dark)] hover:text-[color:var(--color-main)] transition">
          Login
        </NuxtLink>

        <NuxtLink to="/auth/login"
          class="bg-[color:var(--color-main)] text-white text-sm font-normal flex items-center gap-2 px-[30px] py-[15px] rounded-lg hover:bg-blue-800 transition">
          <img src="/files/hero/sign-button.svg" alt="upload icon" class="w-4 h-4" />
          Upload your CV
        </NuxtLink>
      </div>

      <!-- Mobile Menu Hamburger Button -->
      <button @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="nav-elem opacity-0 md:hidden text-[color:var(--color-dark)] hover:text-[color:var(--color-main)] focus:outline-none transition-colors p-2 -mr-2">
        <svg v-if="!isMobileMenuOpen" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="12" x2="20" y2="12"></line>
          <line x1="4" y1="6" x2="20" y2="6"></line>
          <line x1="4" y1="18" x2="20" y2="18"></line>
        </svg>
        <svg v-else width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>

      <!-- Mobile Menu Panel -->
      <div v-if="isMobileMenuOpen"
        class="absolute top-[85px] left-4 right-4 bg-white/95 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] border border-gray-100 md:hidden flex flex-col p-6 space-y-5 z-[100] rounded-3xl ring-1 ring-black/5">
        <a href="#home" @click.prevent="scrollToSection('home')"
          class="text-[15px] font-medium text-gray-800 hover:text-[color:var(--color-main)] transition-colors">Home</a>
        <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')"
          class="text-[15px] font-medium text-gray-800 hover:text-[color:var(--color-main)] transition-colors">How it Works</a>
        <a href="#job-categories" @click.prevent="scrollToSection('job-categories')"
          class="text-[15px] font-medium text-gray-800 hover:text-[color:var(--color-main)] transition-colors">Job by Categories</a>
        <a href="#latest-jobs" @click.prevent="scrollToSection('latest-jobs')"
          class="text-[15px] font-medium text-gray-800 hover:text-[color:var(--color-main)] transition-colors">Latest Jobs</a>
        <a href="#contact" @click.prevent="scrollToSection('contact')"
          class="text-[15px] font-medium text-gray-800 hover:text-[color:var(--color-main)] transition-colors">Contact</a>
        <hr class="border-gray-100 my-2" />
        <div class="flex flex-col gap-3 pt-2">
          <NuxtLink to="/auth/login"
            class="text-[15px] font-medium text-gray-800 hover:text-[color:var(--color-main)] transition-colors text-center py-2">Login
          </NuxtLink>
          <NuxtLink to="/auth/login"
            class="bg-[color:var(--color-main)] text-white text-[15px] font-medium flex items-center justify-center gap-2 px-[30px] py-[15px] rounded-[5px] hover:bg-blue-800 transition w-full shadow-md shadow-blue-500/20">
            <img src="/files/hero/sign-button.svg" alt="upload icon" class="w-4 h-4" />
            Upload your CV
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main ref="heroSection" id="home"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Left Content -->
      <div class="z-10 relative">
        <h1
          class="hero-elem opacity-0 text-[42px] lg:text-[64px] font-semibold leading-[1.2] lg:leading-[1.1] tracking-normal lg:tracking-tight text-[color:var(--color-dark)] mb-[16px] lg:mb-[30px] text-center sm:text-left">
          <span class="relative inline-block">
            <span class="relative z-10">Discover</span>
            <img src="/files/hero/circle.svg" alt="circle highlight"
              class="absolute top-6 left-15 lg:top-10 lg:left-21  w-[120%] h-[135%] max-w-none -translate-x-[52%] -translate-y-[50%] md:-translate-x-[48%] md:-translate-y-[45%] object-fill pointer-events-none z-0" />
          </span>&nbsp;<span class="text-[color:var(--color-main)]">careers</span><br />
          that align with<br />
          your <span class="text-[color:var(--color-main)]">passion</span>
        </h1>

        <p
          class="hero-elem opacity-0 mt-[16px] mb-[24px] lg:mt-[30px] lg:mb-[30px] text-base text-[#8F8F8F] font-medium max-w-md text-center sm:text-left mx-auto sm:mx-0">
          From where you are to where you want to be
        </p>

        <div
          class="hero-elem opacity-0 flex flex-wrap items-center justify-center sm:justify-start gap-5 sm:gap-8 pt-2 sm:pt-4 relative">
          <div class="relative">
            <NuxtLink to="/auth/login"
              class="bg-[color:var(--color-main)] text-white px-[30px] py-[15px] rounded-[5px] text-[14px] font-normal hover:bg-blue-800 transition shadow-lg shadow-blue-500/30 flex items-center justify-center gap-4">
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
            <div class="text-xs font-normal leading-tight text-[color:var(--color-dark)]">
              <span class="text-[color:var(--color-main)]">100K+</span> Talents Found<br />
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
    <section ref="section2" id="how-it-works"
      class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-[40px] md:mb-[100px] font-['Outfit']">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 overflow-hidden md:overflow-visible">

        <!-- Step 1 -->
        <div class="relative mt-0 flex md:block items-start gap-4 md:gap-0 step-item opacity-0">
          <div
            class="inline-block bg-[color:var(--color-main)] rounded-[5px] py-[10px] px-[15px] md:px-[20px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">1</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[color:var(--color-dark)] font-normal leading-tight mb-[6px] md:mb-[10px]">
              Drop your CV and let us do the heavy lifting
            </h3>
            <p class="text-[14px] text-[color:var(--color-dark)] opacity-60 leading-relaxed font-normal">
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
            class="inline-block bg-[color:var(--color-main)] rounded-[5px] py-[10px] px-[15px] md:px-[20px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">2</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[color:var(--color-dark)] font-normal leading-tight mb-[6px] md:mb-[10px]">
              See your strengths and skill gaps instantly
            </h3>
            <p class="text-[14px] text-[color:var(--color-dark)] opacity-60 leading-relaxed font-normal">
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
            class="inline-block bg-[color:var(--color-main)] rounded-[5px] py-[10px] px-[15px] md:px-[25px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">3</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[color:var(--color-dark)] font-normal leading-tight mb-[6px] md:mb-[10px]">
              Receive a personalized roadmap
            </h3>
            <p class="text-[14px] text-[color:var(--color-dark)] opacity-60 leading-relaxed font-normal">
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
            class="inline-block bg-[color:var(--color-main)] rounded-[5px] py-[10px] px-[15px] md:px-[30px] mb-0 md:mb-[10px] shrink-0 text-center w-auto">
            <span class="text-[32px] md:text-[40px] text-[#FFFFFF] font-normal leading-none block">4</span>
          </div>
          <div>
            <h3 class="text-[20px] md:text-[24px] text-[color:var(--color-dark)] font-normal leading-tight mb-[6px] md:mb-[10px]">
              Find jobs that actually match you
            </h3>
            <p class="text-[14px] text-[color:var(--color-dark)] opacity-60 leading-relaxed font-normal">
              Explore job recommendations based on your skills, interests, and growth path.
            </p>
          </div>
        </div>

      </div>
    </section>

    <!-- Section 3: Explore by Categories -->
    <section ref="section3Ref" id="job-categories"
      class="w-full bg-[#F4F6FB] mb-0 md:mb-10 font-['Outfit'] relative overflow-hidden">
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
          <h2 class="s3-title-dec opacity-0 text-[32px] md:text-[42px] font-semibold text-[color:var(--color-dark)] leading-tight">
            Explore by Categories
          </h2>
          <p
            class="s3-title-dec opacity-0 mt-[15px] md:mt-[20px] text-[14px] font-normal text-[color:var(--color-dark)] opacity-50 max-w-[450px] leading-relaxed">
            We provide many categories, choose a category according to your expertise to make it easier to find a job.
          </p>

          <div
            class="mt-[40px] md:mt-[80px] grid grid-cols-2 gap-x-[10px] sm:gap-x-[20px] gap-y-[15px] w-full max-w-[550px] place-items-center lg:place-items-start">
            <!-- Box 1 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[color:var(--color-main)] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/business.svg" alt="Business Development"
                  class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span
                class="text-[12px] sm:text-[14px] font-medium text-[color:var(--color-dark)] leading-tight">Business<br />Development</span>
            </div>
            <!-- Box 2 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[color:var(--color-main)] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/web.svg" alt="Web Developer" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span
                class="text-[12px] sm:text-[14px] font-medium text-[color:var(--color-dark)] leading-tight">Web<br />Developer</span>
            </div>
            <!-- Box 3 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[color:var(--color-main)] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/human.svg" alt="Human Resource" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span
                class="text-[12px] sm:text-[14px] font-medium text-[color:var(--color-dark)] leading-tight">Human<br />Resource</span>
            </div>
            <!-- Box 4 -->
            <div
              class="s3-box opacity-0 bg-white rounded-[10px] p-[8px] sm:p-[10px] sm:pr-4 flex items-center gap-[10px] sm:gap-[15px] shadow-[0_4px_10px_rgba(0,0,0,0.03)] cursor-pointer hover:-translate-y-1 transition duration-300 w-full sm:w-[200px] h-[75px]">
              <div
                class="bg-[color:var(--color-main)] p-[8px] sm:p-[10px] rounded-[5px] text-white shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
                <img src="/files/hero/data.svg" alt="Data Analyst" class="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
              </div>
              <span class="text-[12px] sm:text-[14px] font-medium text-[color:var(--color-dark)] leading-tight">Data Analyst</span>
            </div>
          </div>
        </div>

        <!-- Right Content (Card) -->
        <div class="s3-card opacity-0 relative z-10 w-full lg:w-[530px] shrink-0">
          <div
            class="bg-white rounded-[10px] w-full min-h-[355px] p-6 lg:p-[30px] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-left">
            <div class="flex items-center justify-between mb-[30px]">
              <h3 class="text-[20px] font-medium text-[color:var(--color-dark)]">Popular Categories</h3>
              <button
                class="flex items-center gap-2 text-[color:var(--color-dark)] opacity-50 text-[14px] font-medium hover:opacity-100 transition cursor-pointer">
                See all categories
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875" stroke="var(--color-dark)"
                    stroke-opacity="1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>

            <div class="flex flex-col">
              <!-- Item 1 -->
              <div class="flex flex-wrap items-center justify-between border-b border-[color:var(--color-dark)]/10 pb-[15px] mb-[15px]">
                <span class="text-[14px] font-medium text-[color:var(--color-dark)] flex-1 min-w-[150px]">Fullstack Developer</span>
                <div
                  class="bg-[color:var(--color-main)]/[0.08] text-[color:var(--color-main)] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  23
                </div>
              </div>
              <!-- Item 2 -->
              <div class="flex flex-wrap items-center justify-between border-b border-[color:var(--color-dark)]/10 pb-[15px] mb-[15px]">
                <span class="text-[14px] font-medium text-[color:var(--color-dark)] flex-1 min-w-[150px]">Quality Assurance</span>
                <div
                  class="bg-[color:var(--color-main)]/[0.08] text-[color:var(--color-main)] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  43
                </div>
              </div>
              <!-- Item 3 -->
              <div class="flex flex-wrap items-center justify-between border-b border-[color:var(--color-dark)]/10 pb-[15px] mb-[15px]">
                <span class="text-[14px] font-medium text-[color:var(--color-dark)] flex-1 min-w-[150px]">Financial Accounting</span>
                <div
                  class="bg-[color:var(--color-main)]/[0.08] text-[color:var(--color-main)] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  81
                </div>
              </div>
              <!-- Item 4 -->
              <div class="flex flex-wrap items-center justify-between border-b-0 pb-[15px]">
                <span class="text-[14px] font-medium text-[color:var(--color-dark)] flex-1 min-w-[150px]">DevOps Developer</span>
                <div
                  class="bg-[color:var(--color-main)]/[0.08] text-[color:var(--color-main)] p-[8px] rounded-[5px] text-[12px] font-semibold leading-none ml-4">
                  91
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Section 4: Newest Jobs -->
    <section ref="section4Ref" id="latest-jobs"
      class="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 mb-[40px] md:mb-[120px] font-['Outfit'] relative overflow-hidden flex flex-col items-center">

      <!-- Text & Arrow header -->
      <div class="relative flex flex-col items-center text-center max-w-[600px] w-full">
        <h2 class="s4-title-dec opacity-0 text-[32px] md:text-[42px] font-semibold text-[color:var(--color-dark)] leading-tight">
          Newest jobs for you
        </h2>
        <div class="relative mt-[10px] md:mt-[20px] w-full flex justify-center">
          <p class="s4-title-dec opacity-0 text-[14px] font-normal text-[color:var(--color-dark)] opacity-50 max-w-[450px]">
            Get the fastest applications so that your name is above other applicants.
          </p>
          <img src="/files/hero/arrow4.svg" alt="Arrow pointing"
            class="s4-title-dec opacity-0 absolute -right-6 -top-8 hidden lg:block w-[78px] h-[78px] pointer-events-none" />
        </div>
      </div>

      <!-- Grid Cards -->
      <div
        class="mt-[60px] md:mt-[100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-[40px] md:gap-y-[87px] gap-x-[87px] place-items-center w-full">
        <div v-for="(job, index) in jobs" :key="index"
          :class="['s4-card opacity-0 bg-white w-full max-w-[280px] flex flex-col items-start transition duration-300 hover:-translate-y-2', index > 3 ? 'hidden lg:flex' : 'flex']">

          <!-- Top row -->
          <div class="flex items-center justify-between w-full">
            <img :src="job.logo" alt="Company Logo" class="w-[30px] h-[30px] object-contain" />
            <button
              class="w-[94px] h-[35px] border border-[color:var(--color-main)] bg-white hover:bg-[#EEF1FA] text-[color:var(--color-main)] text-[14px] font-normal rounded-[5px] flex items-center justify-center gap-[6px] transition-colors duration-300 cursor-pointer">
              Apply
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.625 11.375L11.375 2.625M11.375 2.625H4.8125M11.375 2.625V9.1875" stroke="currentColor"
                  stroke-width="0.875" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>

          <!-- Job Title -->
          <h4 class="mt-[15px] font-normal text-[16px] text-[color:var(--color-dark)]">
            {{ job.title }}
          </h4>

          <!-- Tags -->
          <div class="mt-[14px] flex items-center text-[12px] font-light text-[color:var(--color-dark)] opacity-60">
            <span>{{ job.location }}</span>
            <span class="mx-[10px]">-</span>
            <span>{{ job.type }}</span>
            <span class="mx-[10px]">-</span>
            <span>{{ job.type2 }}</span>
          </div>

          <!-- Divider -->
          <hr class="mt-[60px] w-full border-[color:var(--color-dark)] opacity-10" />

          <!-- Bottom row -->
          <div class="mt-[10px] flex items-center justify-between w-full text-[12px] font-light">
            <span class="text-[color:var(--color-dark)]">{{ job.company }}</span>
            <span class="text-[color:var(--color-dark)] opacity-60">{{ job.time }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: Get Latest Job Updates -->
    <section ref="section5Ref" id="contact" class="w-full mt-10 md:mt-32 mb-20 font-['Outfit'] relative bg-[#3154C4]">

      <!-- Background Decorations (overflow hidden to prevent ellipses from expanding page) -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <img src="/files/hero/Ellipse6.svg" alt="ellipse"
          class="s5-elem absolute top-0 left-[10%] w-[200px] md:w-[315px] opacity-60" />
        <img src="/files/hero/Ellipse7.svg" alt="ellipse"
          class="s5-elem absolute -bottom-[0%] right-[40%] w-[200px] md:w-[315px] opacity-60 hidden md:block" />

        <!-- Scribbles Swapped -->
        <img src="/files/hero/scribbleline08.svg" alt="scribble"
          class="s5-elem absolute top-[58%] right-[15%] 2xl:right-[27%] w-[30px] md:w-[47px] hidden md:block" />
        <img src="/files/hero/scribbleline07.svg" alt="scribble"
          class="s5-elem absolute bottom-[22%] left-[14%] w-[40px] md:w-[57px] hidden md:block" />

        <img src="/files/hero/arrow22.svg" alt="arrow"
          class="s5-elem absolute top-[40%] left-[38%] w-[35px] md:w-[54px] hidden md:block" />
        <img src="/files/hero/arrow23.svg" alt="arrow"
          class="s5-elem absolute bottom-[70%] right-[10%] 2xl:right-[20%] w-[35px] md:w-[58px] hidden md:block" />
      </div>

      <!-- Container -->
      <div
        class="max-w-[1280px] w-full h-[350px] mx-auto px-4 sm:px-6 lg:px-8 relative flex md:items-center py-10 md:py-0">

        <!-- Content -->
        <div class="relative z-20 w-full md:w-[500px] flex flex-col justify-center mt-6 md:mt-0">
          <h2 class="s5-elem text-white font-semibold text-[32px] md:text-[42px] leading-[1.2] mb-[37px]">
            Get Latest Job<br />Updates
          </h2>

          <div
            class="s5-elem w-full max-w-[469px] h-[53px] bg-white rounded-lg pl-[20px] pr-[10px] py-[10px] flex items-center justify-between shadow-lg">
            <input v-model="emailInput" @keyup.enter="handleSubscribe" type="email" placeholder="Enter your email"
              class="flex-1 bg-transparent outline-none text-[color:var(--color-dark)] text-[12px] font-light placeholder:text-gray-400 h-full" />
            <button @click="handleSubscribe"
              class="w-[104px] h-[33px] bg-[#3154C4] text-white text-[12px] font-light rounded-md flex items-center justify-center gap-[6px] hover:bg-[#2545A8] transition-colors whitespace-nowrap">
              Send Email
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 13L13 1M13 1H3M13 1V11" stroke="white" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Human image pointing up -->
        <img src="/files/hero/mascot.png" alt="Person Pointing"
          class="s5-elem absolute bottom-0 right-[5%] md:right-[15%] h-[85%] md:h-[450px] object-cover object-bottom pointer-events-none z-30 hidden md:block" />

      </div>
    </section>

    <!-- Footer -->
    <footer ref="footerRef"
      class="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 font-['Outfit'] relative">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

        <!-- Logo -->
        <div class="md:col-span-3 footer-elem">
          <div class="text-[24px] font-semibold tracking-tight text-center md:text-left">
            <span class="text-[color:var(--color-dark)]">Carre</span><span class="text-[color:var(--color-main)]">path.</span>
          </div>
        </div>

        <!-- Contact Info -->
        <div
          class="md:col-span-4 footer-elem flex flex-col md:pl-4 items-center md:items-start text-center md:text-left">
          <div class="text-[18px] font-normal leading-relaxed text-[color:var(--color-dark)] mb-[32px] md:mb-[120px]">
            5123 Market St. #22B<br />
            Jakarta, Indonesia 44635
          </div>
          <div class="mb-[16px] w-full flex justify-center md:justify-start">
            <a href="tel:4345464356"
              class="text-[14px] font-normal text-[color:var(--color-dark)] border-b border-[color:var(--color-main)] pb-1 w-fit inline-block hover:text-[color:var(--color-main)] transition-colors">
              (434) 546-4356
            </a>
          </div>
          <div class="mb-[24px] md:mb-0 w-full flex justify-center md:justify-start">
            <a href="mailto:contact@carrepath.com"
              class="text-[14px] font-normal text-[color:var(--color-dark)] border-b border-[color:var(--color-main)] pb-1 w-fit inline-block hover:text-[color:var(--color-main)] transition-colors">
              contact@carrepath.com
            </a>
          </div>
        </div>

        <!-- Links -->
        <div class="md:col-span-2 footer-elem flex flex-col gap-4 md:gap-6 md:items-start items-center">
          <a href="#home" @click.prevent="scrollToSection('home')"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Home</a>
          <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">How
            it Works</a>
          <a href="#job-categories" @click.prevent="scrollToSection('job-categories')"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Job
            by Categories</a>
          <a href="#latest-jobs" @click.prevent="scrollToSection('latest-jobs')"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Latest
            Jobs</a>
          <a href="#contact" @click.prevent="scrollToSection('contact')"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Contact</a>
        </div>

        <!-- Socials -->
        <div class="md:col-span-2 footer-elem flex flex-col gap-4 md:gap-6 md:items-start items-center">
          <a href="https://www.instagram.com/rzlrmziiiii?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Facebook</a>
          <a href="https://www.instagram.com/rzlrmziiiii?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Twitter</a>
          <a href="https://www.instagram.com/rzlrmziiiii?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Linkedin</a>
          <a href="https://www.instagram.com/rzlrmziiiii?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
            target="_blank"
            class="text-[12px] font-normal text-[color:var(--color-dark)] opacity-70 hover:opacity-100 transition-opacity w-fit inline-block">Instagram</a>
        </div>

        <!-- Back to Top -->
        <div class="md:col-span-1 footer-elem flex justify-center md:justify-end items-start mt-4 md:mt-0">
          <button @click="scrollToTop"
            class="bg-[color:var(--color-main)] hover:bg-[#2545A8] rounded-full p-[14px] transition-colors shadow-lg shadow-blue-500/20 group">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              class="group-hover:-translate-y-1 transition duration-300">
              <path d="M12 5L12 21" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M18 11L12.4096 4.1978C12.3585 4.13563 12.2955 4.08584 12.225 4.05174C12.1544 4.01764 12.0779 4 12.0005 4C11.9232 4 11.8467 4.01764 11.7761 4.05174C11.7056 4.08584 11.6426 4.13563 11.5915 4.1978L6 11"
                stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Copyright Bottom -->
      <div class="mt-8 md:-mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end footer-elem">
        <div class="md:col-span-3 hidden md:block"></div>
        <div class="md:col-span-4 hidden md:block"></div>
        <div class="md:col-span-5 flex justify-center md:justify-start md:pl-0">
          <p class="text-[12px] leading-[20px] font-normal text-[color:var(--color-dark)] opacity-60">
            © 2026 Carrepath. All rights reserved.
          </p>
        </div>
      </div>
    </footer>

    <!-- Custom Toast Notification -->
    <div
      :class="['fixed bottom-8 right-4 sm:right-8 bg-[color:var(--color-main)] text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-500 z-[9999]', showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none']">
      <div class="bg-white/20 p-2 rounded-full hidden sm:block">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h4 class="font-semibold text-[15px] leading-tight">Subscribed Successfully!</h4>
        <p class="text-[12px] opacity-90 mt-0.5 font-light">Get ready for the latest job updates straight to your inbox.
        </p>
      </div>
    </div>

  </div>
</template>

