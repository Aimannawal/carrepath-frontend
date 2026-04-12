<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'

const route = useRoute()
const navRef = ref(null)
const contentRef = ref(null)

const menuItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: 'heroicons:home' },
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
  <div class="min-h-screen bg-[#F8FAFC] font-['Outfit'] text-[#0F172A] lg:flex">
    <aside ref="navRef" class="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 bg-white border-r border-[#E2E8F0] z-40 shadow-sm">
      <div class="px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
        <NuxtLink to="/admin/dashboard" class="font-semibold text-[24px] tracking-tight whitespace-nowrap text-[#0F172A]">
          Carre<span class="text-[color:var(--color-main)]">path.</span>
        </NuxtLink>
        <p class="text-[13px] text-[#64748B] mt-2">Superadmin menu navigation</p>
      </div>

      <nav class="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-medium transition',
            route.path === item.path || route.path.startsWith(`${item.path}/`)
              ? 'bg-[#EEF2FF] text-[#1E3A8A] shadow-sm border border-[#BFDBFE]'
              : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
          ]"
        >
          <Icon :name="item.icon" class="h-5 w-5 shrink-0" />
          <span>{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-[#E2E8F0]">
        <button
          @click="handleLogout"
          class="w-full px-4 py-3 rounded-[12px] text-[14px] font-medium text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#FEE2E2] hover:text-[#991B1B] hover:border-[#FCA5A5] transition"
        >
          Log out
        </button>
      </div>
    </aside>

    <div class="flex-1 lg:pl-[280px] min-w-0">
      <header class="lg:hidden bg-white border-b border-[#E2E8F0] sticky top-0 z-40">
        <div class="px-4 py-3 flex items-center justify-between gap-4">
          <NuxtLink to="/admin/dashboard" class="font-semibold text-[22px] tracking-tight whitespace-nowrap text-[#0F172A]">
            Carre<span class="text-[color:var(--color-main)]">path.</span>
          </NuxtLink>
          <button
            @click="handleLogout"
            class="px-3 py-2 rounded-[8px] text-[13px] font-medium text-[#475569] border border-[#E2E8F0] hover:bg-[#FEE2E2] hover:text-[#991B1B] hover:border-[#FCA5A5] whitespace-nowrap"
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
                ? 'bg-[#EEF2FF] text-[#1E3A8A] border border-[#BFDBFE]'
                : 'text-[#475569] border border-[#E2E8F0] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
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
