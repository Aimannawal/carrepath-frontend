<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const route = useRoute()
const navRef = ref(null)
const contentRef = ref(null)

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'heroicons:home' },
  { name: 'Platform Stats', path: '/admin/stats', icon: 'heroicons:chart-bar-square' },
  { name: 'Transactions', path: '/admin/transactions', icon: 'heroicons:credit-card' }
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
  <div class="min-h-screen bg-[#0B1220] font-['Outfit'] text-white lg:flex">
    <aside ref="navRef" class="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-[#0F172A] border-r border-[#1E293B] z-40">
      <div class="px-6 pt-6 pb-4 border-b border-[#1E293B]">
        <NuxtLink to="/admin/dashboard" class="font-semibold text-[24px] tracking-tight whitespace-nowrap text-white">
          Carre<span class="text-[#60A5FA]">path.</span>
        </NuxtLink>
        <p class="text-[13px] text-[#94A3B8] mt-2">Superadmin menu navigation</p>
      </div>

      <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition',
            route.path === item.path || route.path.startsWith(`${item.path}/`)
              ? 'bg-[#1D4ED8] text-white shadow-sm'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          ]"
        >
          <Icon :name="item.icon" class="h-5 w-5 shrink-0" />
          <span>{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-[#1E293B]">
        <button
          @click="handleLogout"
          class="w-full px-4 py-3 rounded-[12px] text-[14px] font-medium text-[#94A3B8] bg-[#111827] hover:bg-[#7F1D1D] hover:text-white transition"
        >
          Log out
        </button>
      </div>
    </aside>

    <div class="flex-1 lg:pl-[280px] min-w-0">
      <header class="lg:hidden bg-[#0F172A] border-b border-[#1E293B] sticky top-0 z-40">
        <div class="px-4 py-3 flex items-center justify-between gap-4">
          <NuxtLink to="/admin/dashboard" class="font-semibold text-[22px] tracking-tight whitespace-nowrap text-white">
            Carre<span class="text-[#60A5FA]">path.</span>
          </NuxtLink>
          <button
            @click="handleLogout"
            class="px-3 py-2 rounded-[8px] text-[13px] font-medium text-[#94A3B8] hover:bg-[#7F1D1D] hover:text-white whitespace-nowrap"
          >
            Log out
          </button>
        </div>
        <div class="px-4 pb-3 flex gap-2 overflow-x-auto">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-[13px] font-medium whitespace-nowrap transition',
              route.path === item.path || route.path.startsWith(`${item.path}/`)
                ? 'bg-[#1D4ED8] text-white'
                : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
            ]"
          >
            <Icon :name="item.icon" class="h-4 w-4 shrink-0" />
            {{ item.name }}
          </NuxtLink>
        </div>
      </header>

      <main ref="contentRef" class="min-w-0">
        <slot />
      </main>
    </div>
  </div>
</template>
