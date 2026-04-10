<script setup>
const roleCookie = useCookie('user_role')

const normalizeRole = (rawRole) => {
  if (!rawRole) return ''
  if (rawRole === 'user') return 'worker'
  if (rawRole === 'superadmin') return 'admin'
  return rawRole
}

const role = normalizeRole(roleCookie.value)
if (role && role !== roleCookie.value) {
  roleCookie.value = role
}

if (!role) {
  navigateTo('/onboarding')
} else {
  navigateTo(`/${role}/dashboard`)
}
</script>

<template>
  <section class="min-h-screen flex items-center justify-center bg-[#F8F9FA] font-['Outfit']">
    <p class="text-[14px] text-[#64748B]">Redirecting...</p>
  </section>
</template>
