<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const route = useRoute()
const navRef = ref(null)
const contentRef = ref(null)
const mobileDrawerOpen = ref(false)
const drawerRef = ref(null)
const overlayRef = ref(null)

const menuItems = [
  { name: 'Dashboard', path: '/worker/dashboard', icon: 'heroicons:home' },
  { name: 'Manage Job', path: '/worker/jobs', icon: 'heroicons:briefcase' },
  { name: 'My Resume', path: '/worker/resume', icon: 'heroicons:document-text' },
  { name: 'Study Plan', path: '/worker/study-plan', icon: 'heroicons:academic-cap' },
  { name: 'CarrepathAI', path: '/worker/ai', icon: 'heroicons:sparkles' },
  { name: 'Applications', path: '/worker/applications', icon: 'heroicons:paper-airplane' },
  { name: 'Saved Jobs', path: '/worker/saved-companies', icon: 'heroicons:bookmark' },
  { name: 'My Account', path: '/worker/account', icon: 'heroicons:user' },
  { name: 'Transactions', path: '/worker/transactions', icon: 'heroicons:banknotes' },
  { name: 'Upgrade', path: '/worker/upgrade', icon: 'heroicons:arrow-trending-up' }
]

const toggleDrawer = () => {
  mobileDrawerOpen.value = !mobileDrawerOpen.value
}

const closeDrawer = () => {
  mobileDrawerOpen.value = false
}

// Auto-close drawer on route change
watch(() => route.path, () => {
  closeDrawer()
})

onMounted(() => {
  if (navRef.value && contentRef.value) {
    gsap.fromTo(navRef.value, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' })
    gsap.fromTo(contentRef.value, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.1 })
  }
})

const handleLogout = () => {
  useCookie('access_token').value = null
  useCookie('user_role').value = null
  navigateTo('/auth/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FA] font-['Outfit'] text-[color:var(--color-dark)] lg:flex">
    <!-- Desktop Sidebar (unchanged) -->
    <aside ref="navRef" class="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-[#E2E8F0] z-40">
      <div class="px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
        <NuxtLink to="/worker/dashboard" class="font-semibold text-[24px] tracking-tight whitespace-nowrap">
          Carre<span class="text-[color:var(--color-main)]">path.</span>
        </NuxtLink>
        <p class="text-[13px] text-[#64748B] mt-2">Worker menu navigation</p>
      </div>

      <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition',
            route.path === item.path || route.path.startsWith(`${item.path}/`)
              ? 'bg-[color:var(--color-main)] text-white shadow-sm'
              : 'text-[#64748B] hover:bg-[#EEF2FF] hover:text-[color:var(--color-main)]'
          ]"
        >
          <Icon :name="item.icon" class="h-5 w-5 shrink-0" />
          <span>{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-[#E2E8F0]">
        <button
          @click="handleLogout"
          class="w-full px-4 py-3 rounded-[12px] text-[14px] font-medium text-[#6B7280] bg-[#F8FAFC] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition"
        >
          Log out
        </button>
      </div>
    </aside>

    <!-- Mobile Drawer Overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="mobileDrawerOpen"
          ref="overlayRef"
          class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[998]"
          @click="closeDrawer"
        />
      </Transition>
      <Transition name="slide-left">
        <aside
          v-if="mobileDrawerOpen"
          ref="drawerRef"
          class="lg:hidden fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white shadow-2xl z-[999] flex flex-col"
        >
          <!-- Drawer Header -->
          <div class="px-6 pt-6 pb-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <NuxtLink to="/worker/dashboard" class="font-semibold text-[22px] tracking-tight whitespace-nowrap" @click="closeDrawer">
              Carre<span class="text-[color:var(--color-main)]">path.</span>
            </NuxtLink>
            <button
              @click="closeDrawer"
              class="p-2 rounded-[10px] text-[color:var(--color-dark)] hover:bg-[#F1F5F9] hover:text-[color:var(--color-main)] transition-colors"
              aria-label="Close menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Drawer Nav -->
          <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.path"
              :to="item.path"
              :class="[
                'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition-all duration-200',
                route.path === item.path || route.path.startsWith(`${item.path}/`)
                  ? 'bg-[color:var(--color-main)] text-white shadow-sm'
                  : 'text-[#64748B] hover:bg-[#EEF2FF] hover:text-[color:var(--color-main)]'
              ]"
            >
              <Icon :name="item.icon" class="h-5 w-5 shrink-0" />
              <span>{{ item.name }}</span>
            </NuxtLink>
          </nav>

          <!-- Drawer Footer -->
          <div class="p-4 border-t border-[#E2E8F0]">
            <button
              @click="handleLogout"
              class="w-full px-4 py-3 rounded-[12px] text-[14px] font-medium text-[#6B7280] bg-[#F8FAFC] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition"
            >
              Log out
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>

    <div class="flex-1 lg:pl-[280px] min-w-0">
      <!-- Mobile Header with Hamburger -->
      <header class="lg:hidden bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] sticky top-0 z-40">
        <div class="px-4 py-3 flex items-center justify-between">
          <button
            @click="toggleDrawer"
            class="p-2 -ml-1 rounded-[10px] text-[color:var(--color-dark)] hover:bg-[#F1F5F9] hover:text-[color:var(--color-main)] transition-colors"
            aria-label="Open menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          </button>
          <NuxtLink to="/worker/dashboard" class="font-semibold text-[20px] tracking-tight whitespace-nowrap">
            Carre<span class="text-[color:var(--color-main)]">path.</span>
          </NuxtLink>
        </div>
      </header>

      <main ref="contentRef" class="min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-left transition for drawer */
.slide-left-enter-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-left-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
