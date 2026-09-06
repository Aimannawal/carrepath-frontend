<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Manage Bootcamp' })
definePageMeta({ layout: 'provider' })

const { get, post, put, del } = useApi()
const { getData, toArray, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const { uploadFile, uploading, uploadError, clearUploadState } = useFileUpload()
const { success, error: showError, info } = useModal()

const providerProfileId = ref('')
const bootcamps = ref([])

const buildCreateForm = () => ({
  title: '',
  description: '',
  category: '',
  level: 'beginner',
  price: 0,
  link_url: '',
  is_active: true
})

const showCreate = ref(false)
const createForm = ref(buildCreateForm())
const showEdit = ref(false)
const editingBootcampId = ref('')
const editForm = ref(buildCreateForm())

const loading = ref(true)
const profileLoading = ref(true)
const error = ref('')
const createLoading = ref(false)
const createError = ref('')
const createSuccess = ref('')
const editLoading = ref(false)
const editError = ref('')
const deleteConfirmId = ref('')

const openCreateModal = () => {
  createForm.value = buildCreateForm()
  createError.value = ''
  showCreate.value = true
}

const openEditModal = (bc) => {
  editingBootcampId.value = String(bc?.id || '')
  editForm.value = {
    title: String(bc?.title || ''),
    description: String(bc?.description || ''),
    category: String(bc?.category || ''),
    level: String(bc?.level || 'beginner'),
    price: Number(bc?.price || 0),
    link_url: String(bc?.link_url || ''),
    is_active: bc?.is_active !== false
  }
  editError.value = ''
  showEdit.value = true
}



const validateForm = (formValue, setError) => {
  if (!String(formValue?.title || '').trim()) {
    setError('Title is required.')
    return false
  }
  if (!String(formValue?.link_url || '').trim()) {
    setError('Link URL is required.')
    return false
  }
  return true
}

const refreshProviderProfileId = async () => {
  const profileRes = await get(`/providers/profile/${userId.value}`)
  const payload = asObject(getData(profileRes))
  const profile = asObject(payload.profile || payload)
  providerProfileId.value = profile.id || userId.value
}

const loadBootcamps = async () => {
  loading.value = true
  try {
    const scopeId = providerProfileId.value || userId.value
    if (!scopeId) throw new Error('Provider profile is not ready')
    const res = await get(`/providers/${scopeId}/bootcamps`)
    bootcamps.value = toArray(getData(res))
    error.value = ''
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load bootcamps')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    if (!userId.value) {
      error.value = 'User not authenticated'
      profileLoading.value = false
      return
    }

    await refreshProviderProfileId()
    profileLoading.value = false
    await loadBootcamps()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to load bootcamps')
    profileLoading.value = false
    loading.value = false
  }
})

const createBootcamp = async () => {
  if (createLoading.value) return
  if (!validateForm(createForm.value, (msg) => { createError.value = msg })) return

  createLoading.value = true
  createError.value = ''
  createSuccess.value = ''
  try {
    const scopeId = providerProfileId.value || userId.value
    if (!scopeId) throw new Error('Provider profile is not ready')

    const payload = {
      provider_id: scopeId,
      title: String(createForm.value.title).trim(),
      description: String(createForm.value.description).trim(),
      category: String(createForm.value.category).trim(),
      level: createForm.value.level,
      price: Number(createForm.value.price || 0),
      link_url: String(createForm.value.link_url).trim(),
      is_active: createForm.value.is_active
    }

    await post('/bootcamps', payload)

    showCreate.value = false
    createForm.value = buildCreateForm()
    createSuccess.value = 'Bootcamp created successfully.'
    await loadBootcamps()
  } catch (e) {
    createError.value = getErrorMessage(e, 'Failed to create bootcamp')
  } finally {
    createLoading.value = false
  }
}

const updateBootcamp = async () => {
  if (editLoading.value) return
  if (!editingBootcampId.value) {
    editError.value = 'Bootcamp id is missing.'
    return
  }
  if (!validateForm(editForm.value, (msg) => { editError.value = msg })) return

  editLoading.value = true
  editError.value = ''
  createSuccess.value = ''

  try {
    const payload = {
      title: String(editForm.value.title).trim(),
      description: String(editForm.value.description).trim(),
      category: String(editForm.value.category).trim(),
      level: editForm.value.level,
      price: Number(editForm.value.price || 0),
      link_url: String(editForm.value.link_url).trim(),
      is_active: editForm.value.is_active
    }

    await put(`/bootcamps/${editingBootcampId.value}`, payload)
    showEdit.value = false
    editingBootcampId.value = ''
    createSuccess.value = 'Bootcamp updated successfully.'
    await loadBootcamps()
  } catch (e) {
    editError.value = getErrorMessage(e, 'Failed to update bootcamp')
  } finally {
    editLoading.value = false
  }
}

const toggleStatus = async (bc) => {
  try {
    const next = bc.is_active !== false ? false : true
    await put(`/bootcamps/${bc.id}`, { is_active: next })
    await loadBootcamps()
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to update status')
  }
}

const removeBootcamp = async (bc) => {
  if (deleteConfirmId.value !== bc.id) {
    deleteConfirmId.value = bc.id
    createSuccess.value = 'Click delete again to confirm removal.'
    return
  }

  try {
    await del(`/bootcamps/${bc.id}`)
    bootcamps.value = bootcamps.value.filter((x) => x.id !== bc.id)
    deleteConfirmId.value = ''
  } catch (e) {
    error.value = getErrorMessage(e, 'Failed to delete bootcamp')
  }
}
</script>

<template>
  <section class="p-6 md:p-8">
    <div class="mb-5 bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6 shadow-sm">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-[13px] uppercase tracking-[0.24em] text-[#64748B]">Provider Bootcamp</p>
          <h1 class="text-[28px] font-semibold mt-2">Manage Bootcamp</h1>
          <p class="text-[14px] text-[#64748B] mt-1">Buat, edit, dan kelola program bootcamp Anda dari satu tempat.</p>
        </div>
        <button class="bg-[color:var(--color-main)] hover:bg-blue-700 text-white rounded-[10px] px-5 py-2.5 text-[14px] font-semibold transition-colors disabled:opacity-50" :disabled="profileLoading || loading" @click="openCreateModal">+ Add Bootcamp</button>
      </div>
    </div>

    <p v-if="profileLoading" class="text-[14px] text-[#64748B] mb-4">Loading provider profile...</p>
    <p v-if="error" class="text-[14px] text-red-600 mb-4">{{ error }}</p>
    <p v-if="createSuccess" class="text-[14px] text-green-600 mb-4">{{ createSuccess }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-[110px] bg-white border border-[#E2E8F0] rounded-[18px] animate-pulse"></div>
    </div>
    <div v-else class="space-y-3">
      <div v-for="bc in bootcamps" :key="bc.id" class="bg-white border border-[#E2E8F0] rounded-[16px] p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="flex items-start gap-4 flex-1 min-w-0">
            <!-- Provider Logo -->
            <div class="flex-shrink-0 w-14 h-14 bg-white border border-[#E2E8F0] flex items-center justify-center p-1">
              <img v-if="bc.provider_profiles?.logo_url" :src="bc.provider_profiles.logo_url" :alt="bc.provider_profiles.provider_name" class="w-full h-full object-contain" />
              <Icon v-else name="mdi:domain" class="w-7 h-7 text-[#94A3B8]" />
            </div>
            <div class="space-y-1.5 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-[18px] font-semibold text-[#0F172A]">{{ bc.title }}</p>
                <span :class="['text-[12px] px-3 py-1 rounded-full border capitalize', bc.is_active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200']">
                  {{ bc.is_active !== false ? 'Aktif' : 'Non-Aktif' }}
                </span>
              </div>
              <p class="text-[13px] text-[#64748B]">Dibuat: {{ formatDate(bc.created_at || Date.now(), true) }}</p>
              <p class="text-[14px] text-[#475569] line-clamp-2">{{ bc.description || 'Tidak ada deskripsi.' }}</p>
            </div>
          </div>
          <!-- Meta pills -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[12px] text-[#475569] shrink-0">
            <span class="flex items-center justify-center gap-1 rounded-[5px] border bg-[#F8FAFC] border-[#E2E8F0] px-3 py-2 font-medium capitalize">{{ bc.category || 'Umum' }}</span>
            <span class="flex items-center justify-center gap-1 rounded-[5px] border bg-[#F8FAFC] border-[#E2E8F0] px-3 py-2 font-medium capitalize">{{ bc.level || 'All' }}</span>
            <span class="flex items-center justify-center gap-1 rounded-[5px] border bg-[#F8FAFC] border-[#E2E8F0] px-3 py-2 font-medium whitespace-nowrap">{{ bc.price > 0 ? `Rp ${Number(bc.price).toLocaleString('id-ID')}` : 'Gratis' }}</span>
            <a :href="bc.link_url" target="_blank" class="flex items-center justify-center gap-1 rounded-[5px] border border-[color:var(--color-main)] bg-[#EEF2FF] px-3 py-2 font-medium text-[color:var(--color-main)] hover:bg-[#DBEAFE] transition text-center">
              Link →
            </a>
          </div>
        </div>
        <!-- Action buttons -->
        <div class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#F1F5F9]">
          <NuxtLink :to="`/provider/bootcamps/${bc.id}`" class="rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition duration-150 hover:border-[#3B82F6] hover:text-[#3B82F6]">
            Lihat Detail
          </NuxtLink>
          <button class="rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition duration-150 hover:border-[color:var(--color-main)] hover:text-[color:var(--color-main)]" @click="openEditModal(bc)">Edit</button>
          <button class="rounded-[5px] border border-[#CBD5E1] bg-white px-4 py-2 text-[13px] font-medium text-[#334155] transition duration-150 hover:border-[color:var(--color-main)] hover:text-[color:var(--color-main)]" @click="toggleStatus(bc)">
            {{ bc.is_active !== false ? 'Non-Aktifkan' : 'Aktifkan' }}
          </button>
          <button class="rounded-[5px] border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition duration-150 hover:bg-red-50" @click="removeBootcamp(bc)">{{ deleteConfirmId === bc.id ? 'Confirm Delete' : 'Delete' }}</button>
        </div>
      </div>
      <div v-if="!bootcamps.length" class="bg-white border border-[#E2E8F0] rounded-[18px] p-10 text-center">
        <Icon name="heroicons:academic-cap" class="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
        <p class="text-[16px] font-medium text-[#334155]">Belum ada bootcamp</p>
        <p class="text-[14px] text-[#64748B] mt-1">Klik "+ Add Bootcamp" untuk membuat program pertama Anda.</p>
      </div>
    </div>

    <!-- Create Modal -->
    <Modal :open="showCreate" title="Add New Bootcamp" @close="showCreate = false">
      <div class="space-y-3">
        <input v-model="createForm.title" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Bootcamp title *" />
        <textarea v-model="createForm.description" rows="3" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Description"></textarea>
        <input v-model="createForm.link_url" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Link URL (website resmi) *" />

        <div class="grid grid-cols-2 gap-3">
          <input v-model="createForm.category" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Category" />
          <select v-model="createForm.level" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All Levels</option>
          </select>
        </div>
        <input v-model.number="createForm.price" type="number" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Price (0 = free)" />
        <p v-if="createError" class="text-[13px] text-red-600">{{ createError }}</p>
        <button :disabled="createLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px] disabled:opacity-50 w-full" @click="createBootcamp">{{ createLoading ? 'Creating...' : 'Create Bootcamp' }}</button>
      </div>
    </Modal>

    <!-- Edit Modal -->
    <Modal :open="showEdit" title="Edit Bootcamp" @close="showEdit = false">
      <div class="space-y-3">
        <input v-model="editForm.title" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Bootcamp title *" />
        <textarea v-model="editForm.description" rows="3" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Description"></textarea>
        <input v-model="editForm.link_url" class="w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Link URL (website resmi) *" />

        <div class="grid grid-cols-2 gap-3">
          <input v-model="editForm.category" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Category" />
          <select v-model="editForm.level" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All Levels</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <input v-model.number="editForm.price" type="number" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Price (0 = free)" />
          <div class="flex items-center gap-2 px-[14px]">
            <input v-model="editForm.is_active" type="checkbox" id="editActive" class="w-4 h-4" />
            <label for="editActive" class="text-[14px] text-[#334155]">Active</label>
          </div>
        </div>
        <p v-if="editError" class="text-[13px] text-red-600">{{ editError }}</p>
        <button :disabled="editLoading" class="bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px] disabled:opacity-50 w-full" @click="updateBootcamp">{{ editLoading ? 'Updating...' : 'Save Changes' }}</button>
      </div>
    </Modal>
  </section>
</template>
