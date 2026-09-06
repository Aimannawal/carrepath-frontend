<script setup>
import { ref, computed, onMounted, watch } from 'vue'

useHead({ title: 'CarrePath | Find Bootcamp' })
definePageMeta({ layout: 'worker' })

const { get, post, del } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const { userId } = useAuth()

const loading = ref(true)
const error = ref('')
const allBootcamps = ref([])
const savedBootcampMap = ref({})
const savingId = ref('')

const q = ref('')
const category = ref('')
const level = ref('')
const page = ref(1)
const pageSize = 10

const categories = computed(() => {
  return Array.from(
    new Set(
      allBootcamps.value
        .map((bc) => String(bc?.category || '').trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
})

const levels = ['beginner', 'intermediate', 'advanced', 'all']

const filtered = computed(() => {
  const key = q.value.toLowerCase().trim()
  return allBootcamps.value.filter((bc) => {
    const providerName = bc.provider_profiles?.provider_name || ''
    const hitQ = !key || `${bc.title || ''} ${bc.description || ''} ${providerName}`.toLowerCase().includes(key)
    const hitCat = !category.value || (bc.category || '').toLowerCase() === category.value.toLowerCase()
    const hitLevel = !level.value || bc.level === level.value
    return hitQ && hitCat && hitLevel
  })
})

const totalPage = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const list = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

watch([q, category, level], () => {
  page.value = 1
})

const fetchBootcamps = async () => {
  loading.value = true
  error.value = ''
  try {
    const [res, savedRes] = await Promise.all([
      get('/bootcamps'),
      get(`/saved/bootcamps/${userId.value}`).catch(() => null)
    ])
    allBootcamps.value = toArray(getData(res))

    const savedList = toArray(getData(savedRes))
    savedBootcampMap.value = savedList.reduce((acc, bc) => {
      if (bc?.id && bc?.saved_id) acc[bc.id] = bc.saved_id
      return acc
    }, {})
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to fetch bootcamps')
  } finally {
    loading.value = false
  }
}

const toggleSave = async (bc) => {
  if (!bc?.id || savingId.value) return
  savingId.value = bc.id

  try {
    const savedId = savedBootcampMap.value[bc.id]
    if (savedId) {
      await del(`/saved/bootcamp/${savedId}`)
      const next = { ...savedBootcampMap.value }
      delete next[bc.id]
      savedBootcampMap.value = next
      return
    }

    const res = await post('/saved/bootcamp', {
      worker_id: userId.value,
      bootcamp_id: bc.id
    })

    const first = toArray(getData(res))[0]
    if (first?.id) {
      savedBootcampMap.value = { ...savedBootcampMap.value, [bc.id]: first.id }
    }
  } catch (e) {
    console.error('Failed to save bootcamp:', e)
  } finally {
    savingId.value = ''
  }
}

onMounted(fetchBootcamps)
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[28px] font-semibold mb-5">Find Bootcamp</h1>

    <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-4 grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 shadow-sm">
      <input v-model="q" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Search by title, description, or provider" />
      <select v-model="category" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
        <option value="">All Category</option>
        <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="level" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px] capitalize">
        <option value="">All Level</option>
        <option v-for="item in levels" :key="item" :value="item">{{ item }}</option>
      </select>
    </div>

    <p v-if="error" class="text-[14px] text-red-600 bg-red-50 border border-red-100 rounded-[10px] p-3 mb-4">{{ error }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 6" :key="i" class="h-[100px] bg-white border border-[#E2E8F0] rounded-[16px] animate-pulse"></div>
    </div>
    <div v-else-if="list.length" class="space-y-3">
      <article
        v-for="bc in list"
        :key="bc.id"
        class="bg-white border border-[#E2E8F0] rounded-[12px] p-5 shadow-sm hover:shadow-md transition h-full"
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
              <!-- Save button -->
              <button
                class="shrink-0 w-[38px] h-[38px] rounded-[8px] border border-[#CBD5E1] flex items-center justify-center transition disabled:opacity-50"
                :class="savedBootcampMap[bc.id] ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]' : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'"
                :disabled="savingId === bc.id"
                @click="toggleSave(bc)"
              >
                <Icon v-if="savingId === bc.id" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                <Icon v-else :name="savedBootcampMap[bc.id] ? 'heroicons:bookmark-solid' : 'heroicons:bookmark'" class="w-4 h-4" />
              </button>
            </div>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2 mb-3">
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium capitalize">{{ bc.level || 'All' }}</span>
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-[#F1F5F9] text-[#334155] font-medium">{{ bc.category || 'Umum' }}</span>
            </div>

            <!-- Bottom row -->
            <div class="flex items-center justify-between gap-3">
              <div class="text-[12px] text-[#475569] space-y-1">
                <p class="font-medium text-[#059669]">{{ bc.price > 0 ? `Rp ${Number(bc.price).toLocaleString('id-ID')}` : 'Gratis' }}</p>
              </div>
              <div class="flex gap-2">
                <NuxtLink
                  :to="`/worker/bootcamps/${bc.id}`"
                  class="border border-[#CBD5E1] text-[#334155] text-[13px] px-3 py-2 rounded-[8px] font-medium hover:bg-[#F8FAFC] transition"
                >
                  Detail
                </NuxtLink>
                <a
                  :href="bc.link_url"
                  target="_blank"
                  class="bg-[color:var(--color-main)] text-white text-[13px] px-3 py-2 rounded-[8px] font-medium hover:opacity-90 transition"
                >
                  Kunjungi
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="bg-white border border-[#E2E8F0] rounded-[16px] p-10 text-center shadow-sm">
      <Icon name="heroicons:magnifying-glass" class="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
      <p class="text-[16px] font-medium text-[#334155]">Tidak ada bootcamp yang ditemukan</p>
      <p class="text-[14px] text-[#64748B] mt-1">Coba sesuaikan filter pencarian Anda.</p>
    </div>

    <div v-if="filtered.length > 0" class="mt-6 flex items-center gap-2">
      <button :disabled="page <= 1" class="border border-[#CBD5E1] rounded-[5px] px-3 py-2 text-[14px] disabled:opacity-40" @click="page--">Sebelumnnya</button>
      <p class="text-[14px]">Halaman {{ page }} / {{ totalPage }}</p>
      <button :disabled="page >= totalPage" class="border border-[#CBD5E1] rounded-[5px] px-3 py-2 text-[14px] disabled:opacity-40" @click="page++">Selanjutnya</button>
    </div>
  </section>
</template>
