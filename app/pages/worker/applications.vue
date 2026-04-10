<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Worker Applications' })
definePageMeta({ layout: 'worker' })

const { get } = useApi()
const tokenCookie = useCookie('access_token')
const loading = ref(true)
const error = ref('')
const items = ref([])

onMounted(async () => {
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    const userId = payload.sub
    const res = await get(`/applications/worker/${userId}`)
    items.value = res.data || []
  } catch (e) {
    error.value = e?.data?.error || 'Failed to load applications'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">My Applications</h1>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="h-[76px] bg-white border border-[#E2E8F0] rounded-[10px] animate-pulse"></div>
    </div>
    <div v-else-if="items.length" class="space-y-3">
      <ApplicationItem v-for="item in items" :key="item.id" :item="item" />
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[10px] p-6 text-[14px] text-[#64748B]">No applications yet.</div>
  </section>
</template>
