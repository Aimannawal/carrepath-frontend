<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const route = useRoute()
const navRef = ref(null)
const contentRef = ref(null)

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
  { name: 'Platform Stats', path: '/admin/stats', icon: 'chart' },
  { name: 'Transactions', path: '/admin/transactions', icon: 'list' }
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
    <header ref="navRef" class="bg-[#0F172A] border-b border-[#1E293B] sticky top-0 z-40">
      <div class="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <NuxtLink to="/admin/dashboard" class="font-semibold text-[24px] tracking-tight whitespace-nowrap text-white">
          Carre<span class="text-[#60A5FA]">path.</span>
        </NuxtLink>

        <nav class="flex items-center gap-2 overflow-x-auto">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'px-3 py-2 rounded-[8px] text-[13px] font-medium whitespace-nowrap transition',
              route.path === item.path || route.path.startsWith(`${item.path}/`)
                ? 'bg-[#1D4ED8] text-white'
                : 'text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white'
            ]"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>

        <button
          @click="handleLogout"
          class="px-3 py-2 rounded-[8px] text-[13px] font-medium text-[#9CA3AF] hover:bg-[#7F1D1D] hover:text-white whitespace-nowrap"
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
