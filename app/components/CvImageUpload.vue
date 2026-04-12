<template>
  <div class="space-y-6">
    <!-- Manual Input Section -->
    <div class="rounded-[18px] border border-[#E2E8F0] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <h3 class="text-[16px] font-semibold text-[#0F172A] mb-4">Informasi Dasar</h3>
      <div class="space-y-3">
        <input
          v-model="form.full_name"
          type="text"
          class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)]"
          placeholder="Nama lengkap"
        />
        <div class="grid grid-cols-2 gap-3">
          <input
            v-model="form.email"
            type="email"
            class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)]"
            placeholder="Email"
          />
          <input
            v-model="form.phone"
            type="tel"
            class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)]"
            placeholder="No. Telepon"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <input
            v-model="form.location"
            type="text"
            class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)]"
            placeholder="Kota"
          />
          <input
            v-model="form.website"
            type="url"
            class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)]"
            placeholder="Website/Portfolio"
          />
        </div>
        <textarea
          v-model="form.summary"
          rows="3"
          class="w-full border border-[#E2E8F0] rounded-[8px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)]"
          placeholder="Ringkasan profil / bio singkat"
        />
      </div>
    </div>

    <!-- CV Upload & Generate Section -->
    <div class="rounded-[18px] border border-[#E2E8F0] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <h3 class="text-[16px] font-semibold text-[#0F172A] mb-4">Upload CV & Generate</h3>
      <div class="space-y-4">
        <div class="border-2 border-dashed border-[#CBD5E1] rounded-[12px] p-6 bg-[#F8FAFC] transition hover:border-[#94A3B8]">
          <div class="text-center">
            <p class="text-[13px] text-[#64748B]">Pilih file PDF atau Gambar CV kamu (opsional)</p>
            <p class="text-[12px] text-[#94A3B8] mt-1">Max 2 MB per file</p>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
            class="mt-3 w-full text-[13px]"
            @change="handleFileChange"
          />
          <p v-if="selectedFile" class="mt-2 text-[12px] text-[#334155]">
            ✓ {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
          </p>
        </div>

        <div v-if="ocrError" class="p-3 rounded-[8px] bg-red-50 border border-red-200">
          <p class="text-[13px] text-red-600">{{ ocrError }}</p>
        </div>

        <button
          :disabled="ocrLoading"
          class="w-full bg-[color:var(--color-main)] text-white rounded-[8px] px-4 py-2.5 text-[14px] font-medium disabled:opacity-50 transition"
          @click="generateFromCV"
        >
          {{ ocrLoading ? 'Generating...' : 'Generate dari CV' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue?: {
    full_name?: string
    email?: string
    phone?: string
    location?: string
    website?: string
    summary?: string
    skills?: string[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const ocrLoading = ref(false)
const ocrError = ref('')
const { post } = useApi()

const form = ref({
  full_name: props.modelValue?.full_name || '',
  email: props.modelValue?.email || '',
  phone: props.modelValue?.phone || '',
  location: props.modelValue?.location || '',
  website: props.modelValue?.website || '',
  summary: props.modelValue?.summary || ''
})

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  ocrError.value = ''
  if (!file) {
    selectedFile.value = null
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    ocrError.value = `File terlalu besar. Max 2 MB.`
    target.value = ''
    return
  }

  selectedFile.value = file
}

const generateFromCV = async () => {
  if (ocrLoading.value) return

  ocrLoading.value = true
  ocrError.value = ''

  try {
    if (!selectedFile.value) {
      ocrError.value = 'Pilih file CV terlebih dahulu'
      ocrLoading.value = false
      return
    }

    const formData = new FormData()
    formData.append('prompt', 'Extract resume data from uploaded file. Return clean, structured data.')
    formData.append('files', selectedFile.value)

    const response = await post('/ai/ocr-extract', formData)
    const responseAny = response as any
    const data = responseAny?.data || responseAny || {}

    // Update form dengan hasil
    form.value.full_name = String(data?.full_name || form.value.full_name)
    form.value.email = String(data?.email || form.value.email)
    form.value.phone = String(data?.phone || form.value.phone)
    form.value.location = String(data?.location || form.value.location)
    form.value.website = String(data?.website || form.value.website)
    form.value.summary = String(data?.summary || form.value.summary)

    // Emit hasil
    emit('update:modelValue', form.value)
  } catch (err: any) {
    ocrError.value = err?.message || 'Gagal mengekstrak CV. Coba lagi.'
    console.error('Generate error:', err)
  } finally {
    ocrLoading.value = false
  }
}
</script>
