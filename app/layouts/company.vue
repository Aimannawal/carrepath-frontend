<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const route = useRoute()
const navRef = ref(null)
const contentRef = ref(null)

const menuItems = [
  { name: 'Dashboard', path: '/company/dashboard', icon: 'dashboard' },
  { name: 'Manage Job', path: '/company/jobs', icon: 'briefcase' },
  { name: 'My Account', path: '/company/account', icon: 'user' },
  { name: 'Settings', path: '/company/settings', icon: 'settings' }
]

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
  <div class="min-h-screen bg-[#F8F9FA] font-['Outfit'] text-[color:var(--color-dark)]">
    <header ref="navRef" class="bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
      <div class="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <NuxtLink to="/company/dashboard" class="font-semibold text-[24px] tracking-tight whitespace-nowrap">
          Carre<span class="text-[color:var(--color-main)]">path.</span>
        </NuxtLink>

        <nav class="flex items-center gap-2 overflow-x-auto">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'px-3 py-2 rounded-[8px] text-[13px] font-medium whitespace-nowrap transition',
              route.path === item.path || route.path.startsWith(`${item.path}/`)
                ? 'bg-[color:var(--color-main)] text-white'
                : 'text-[#64748B] hover:bg-[#EEF2FF] hover:text-[color:var(--color-main)]'
            ]"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>

        <button
          @click="handleLogout"
          class="px-3 py-2 rounded-[8px] text-[13px] font-medium text-[#6B7280] hover:bg-[#FEE2E2] hover:text-[#DC2626] whitespace-nowrap"
        >
          Log out
        </button>
      </div>
    </header>

    <main ref="contentRef" class="min-w-0">
      <slot />
    </main>
  </div>
</template>
