<script setup>
import { ref, onMounted } from 'vue'

definePageMeta({ layout: 'worker' })

const { get, del } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const { userId } = useAuth()

const loading = ref(true)
const error = ref('')
const bootcamps = ref([])
const removingId = ref('')

const fetchSavedBootcamps = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await get(`/saved/bootcamps/${userId.value}`)
    bootcamps.value = toArray(getData(res))
    useHead({ title: `CarrePath | Saved Bootcamps (${bootcamps.value.length})` })
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to fetch saved bootcamps')
  } finally {
    loading.value = false
  }
}

const unsaveBootcamp = async (savedId) => {
  if (!savedId || removingId.value) return
  removingId.value = savedId

  try {
    await del(`/saved/bootcamp/${savedId}`)
    bootcamps.value = bootcamps.value.filter((bc) => bc.saved_id !== savedId)
  } catch (e) {
    console.error('Failed to unsave bootcamp:', e)
  } finally {
    removingId.value = ''
  }
}

onMounted(fetchSavedBootcamps)
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Saved Bootcamps</h1>
    <p class="text-[14px] text-[#64748B] mb-6 -mt-3">Daftar bootcamp yang telah Anda simpan.</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 4" :key="i" class="h-[100px] bg-white border border-[#E2E8F0] rounded-[16px] animate-pulse"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-[12px] p-5">
      <p class="text-[14px] text-red-600 font-medium">{{ error }}</p>
    </div>

    <div v-else-if="bootcamps.length" class="space-y-3">
      <article
        v-for="bc in bootcamps"
        :key="bc.id"
        class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-start gap-4">
          <!-- Provider Logo -->
          <div class="flex-shrink-0 w-14 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center p-1">
            <img v-if="bc.provider_profiles?.logo_url" :src="bc.provider_profiles.logo_url" :alt="bc.provider_profiles.provider_name" class="w-full h-full object-contain" />
            <Icon v-else name="mdi:domain" class="w-7 h-7 text-[#94A3B8]" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-4 mb-2">
              <div class="flex-1 min-w-0">
                <h3 class="text-[16px] font-semibold text-[#0F172A] line-clamp-1">{{ bc.title }}</h3>
                <p class="text-[13px] text-[#64748B] mt-0.5 truncate">
                  {{ bc.provider_profiles?.provider_name || 'Unknown Provider' }}
                  <span v-if="bc.provider_profiles?.is_premium" class="ml-1 inline-flex items-center gap-0.5 text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    <Icon name="heroicons:star-solid" class="w-3 h-3" /> Premium
                  </span>
                </p>
              </div>
              <!-- Unsave button -->
              <button
                class="shrink-0 w-[38px] h-[38px] rounded-[8px] border border-[#CBD5E1] flex items-center justify-center transition bg-white text-[#64748B] hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-50"
                :disabled="removingId === bc.saved_id"
                @click="unsaveBootcamp(bc.saved_id)"
                title="Hapus dari tersimpan"
              >
                <Icon v-if="removingId === bc.saved_id" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                <Icon v-else name="heroicons:bookmark-slash" class="w-4 h-4" />
              </button>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium capitalize">{{ bc.level || 'All' }}</span>
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#334155] font-medium">{{ bc.category || 'Umum' }}</span>
            </div>

            <!-- Bottom row -->
            <div class="flex items-center justify-between gap-3">
              <p class="text-[12px] font-medium text-[#059669]">{{ bc.price > 0 ? `Rp ${Number(bc.price).toLocaleString('id-ID')}` : 'Gratis' }}</p>
              <div class="flex gap-2">
                <NuxtLink
                  :to="`/worker/bootcamps/${bc.id}`"
                  class="border border-[#CBD5E1] text-[#334155] text-[13px] px-3 py-2 rounded-[8px] font-medium hover:bg-[#F8FAFC] transition"
                >
                  Details
                </NuxtLink>
                <a
                  :href="bc.link_url"
                  target="_blank"
                  class="bg-[color:var(--color-main)] text-white text-[13px] px-3 py-2 rounded-[8px] font-medium hover:opacity-90 transition"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="bg-white border border-[#E2E8F0] rounded-[16px] p-12 text-center shadow-sm">
      <Icon name="heroicons:bookmark-square" class="w-16 h-16 text-[#CBD5E1] mx-auto mb-4" />
      <h3 class="text-[18px] font-semibold text-[#0F172A] mb-2">Belum ada bootcamp tersimpan</h3>
      <p class="text-[14px] text-[#64748B] mb-6 max-w-[400px] mx-auto">Simpan bootcamp yang menarik untuk dilihat atau dipelajari kembali nanti.</p>
      <NuxtLink to="/worker/bootcamps" class="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-main)] px-6 py-3 text-[14px] font-semibold text-white hover:opacity-90 transition">
        Cari Bootcamp Sekarang
      </NuxtLink>
    </div>
  </section>
</template>
