<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({ layout: 'company' })

const route = useRoute()
const router = useRouter()
const bootcampId = route.params.id

const { get, post } = useApi()
const { getData, toArray, getErrorMessage } = useApiResponse()
const { userId } = useAuth()

const loading = ref(true)
const error = ref('')
const bootcamp = ref(null)

const fetchDetail = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await get(`/bootcamps/${bootcampId}`)
    bootcamp.value = getData(res)
    useHead({ title: `CarrePath | ${bootcamp.value?.title || 'Bootcamp Detail'}` })
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to fetch bootcamp details')
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <section class="p-4 md:p-6 lg:p-8">
    <div class="mb-4">
      <button @click="router.back()" class="flex items-center gap-2 text-[14px] text-[#64748B] hover:text-[color:var(--color-main)] font-medium transition-colors">
        <Icon name="heroicons:arrow-left" class="w-4 h-4" />
        Kembali
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-[14px] p-5">
      <p class="text-red-700 text-[14px]">{{ error }}</p>
    </div>

    <!-- Loading Skeleton State -->
    <div v-else-if="loading" class="space-y-6">
      <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4">
        <div class="flex items-start gap-5">
          <div class="w-16 h-16 bg-[#F1F5F9] rounded-[12px] animate-pulse"></div>
          <div class="flex-1 space-y-3">
            <div class="h-8 bg-[#F1F5F9] rounded-[8px] w-2/3 animate-pulse"></div>
            <div class="h-5 bg-[#F1F5F9] rounded-[8px] w-1/3 animate-pulse"></div>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <div class="h-7 bg-[#F1F5F9] rounded-full w-24 animate-pulse"></div>
          <div class="h-7 bg-[#F1F5F9] rounded-full w-24 animate-pulse"></div>
        </div>
        <div class="h-32 bg-[#F1F5F9] rounded-[8px] mt-4 animate-pulse"></div>
      </div>
    </div>

    <div v-else-if="bootcamp" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- ═══ LEFT COLUMN: Bootcamp Detail ═══ -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Header Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
          <div class="flex items-start gap-5">
            <!-- Bootcamp Image/Logo -->
            <div class="flex-shrink-0 w-20 h-20 bg-white border border-[#E2E8F0] flex items-center justify-center p-1.5">
              <img v-if="bootcamp.provider_profiles?.logo_url" :src="bootcamp.provider_profiles.logo_url" :alt="bootcamp.provider_profiles.provider_name" class="w-full h-full object-contain" />
              <Icon v-else name="mdi:domain" class="w-10 h-10 text-[#94A3B8]" />
            </div>
            
            <div class="flex-1 min-w-0">
              <h1 class="text-[26px] font-bold text-[#0F172A] leading-tight">{{ bootcamp.title }}</h1>
              <div class="flex items-center gap-2 mt-2">
                <p class="text-[15px] text-[#64748B] font-medium">{{ bootcamp.provider_profiles?.provider_name || 'Unknown Provider' }}</p>
                <span v-if="bootcamp.provider_profiles?.is_premium" class="text-[10px] bg-[#DBEAFE] text-[#1D4ED8] px-2.5 py-0.5 rounded-sm font-bold tracking-wide">Premium Provider</span>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-5">
            <span class="text-[12px] px-3.5 py-1.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] font-medium capitalize">
              {{ bootcamp.level || 'All Levels' }}
            </span>
            <span class="text-[12px] px-3.5 py-1.5 rounded-full bg-[#EEF2FF] text-[#4338CA] font-medium">
              {{ bootcamp.category || 'Uncategorized' }}
            </span>
          </div>

          <!-- Price -->
          <div class="mt-5 flex items-center gap-2">
            <Icon name="heroicons:currency-dollar" class="w-5 h-5 text-[#16A34A]" />
            <p class="text-[15px] text-[#0F172A] font-semibold">{{ bootcamp.price > 0 ? `Rp ${Number(bootcamp.price).toLocaleString('id-ID')}` : 'Gratis' }}</p>
          </div>

          <!-- Description -->
          <div class="mt-6 pt-6 border-t border-[#F1F5F9]">
            <h3 class="text-[16px] font-semibold text-[#0F172A] mb-3">Bootcamp Description</h3>
            <p class="text-[14px] text-[#475569] whitespace-pre-line leading-[1.8]">
              {{ bootcamp.description || 'No description available.' }}
            </p>
          </div>
          
          <!-- Action Buttons -->
          <div class="mt-8 flex gap-3">
            <a
              :href="bootcamp.link_url"
              target="_blank"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-[10px] bg-[color:var(--color-main)] px-8 py-3 font-semibold text-white transition hover:opacity-90"
            >
              Kunjungi Website <Icon name="heroicons:arrow-top-right-on-square" class="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <!-- ═══ RIGHT COLUMN: Provider Info ═══ -->
      <div class="space-y-6">
        <!-- Provider Card -->
        <div class="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-sm">
          <div class="flex items-center gap-4 mb-5">
             <div class="flex-shrink-0 w-14 h-14 overflow-hidden flex items-center justify-center bg-[#F1F5F9] rounded-[4px] border border-[#E2E8F0]">
              <img v-if="bootcamp.provider_profiles?.logo_url" :src="bootcamp.provider_profiles.logo_url" :alt="bootcamp.provider_profiles.provider_name" class="w-full h-full object-cover" />
              <Icon v-else name="mdi:domain" class="w-6 h-6 text-[#94A3B8]" />
            </div>
            <div class="min-w-0">
              <h2 class="text-[16px] font-bold text-[#0F172A] truncate">{{ bootcamp.provider_profiles?.provider_name || 'Unknown Provider' }}</h2>
              <span v-if="bootcamp.provider_profiles?.is_premium" class="inline-flex mt-1 text-[10px] bg-[#DBEAFE] text-[#1D4ED8] px-2.5 py-0.5 rounded-sm font-bold tracking-wide">Premium Provider</span>
            </div>
          </div>

          <!-- About -->
          <div class="mb-5">
            <h3 class="text-[13px] font-bold text-[#94A3B8] uppercase tracking-wider mb-2">About Provider</h3>
            <p class="text-[13px] text-[#475569] leading-[1.7]">
              {{ bootcamp.provider_profiles?.description || 'No provider description available.' }}
            </p>
          </div>
          
           <!-- Provider Details -->
          <div class="space-y-3 pt-4 border-t border-[#F1F5F9]">
            <div v-if="bootcamp.provider_profiles?.website" class="flex items-start gap-3">
              <Icon name="heroicons:globe-alt" class="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" />
              <a :href="bootcamp.provider_profiles.website" target="_blank" class="text-[13px] text-[color:var(--color-main)] hover:underline truncate">{{ bootcamp.provider_profiles.website }}</a>
            </div>
            <div class="flex items-start gap-3">
               <Icon name="heroicons:clock" class="w-4 h-4 text-[#94A3B8] mt-0.5 flex-shrink-0" />
               <p class="text-[13px] text-[#475569]">Dibuat: {{ new Date(bootcamp.created_at).toLocaleDateString('id-ID') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
