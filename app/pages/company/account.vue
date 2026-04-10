<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue"

useHead({ title: "CarrePath | Company Account" })
definePageMeta({ layout: "company" })

const { get, put } = useApi()
const { getData, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const { uploadProfileImage, uploadError, uploading, clearUploadState } = useFileUpload()

const loading = ref(false)
const pageError = ref("")
const pageSuccess = ref("")
const uploadWarning = ref("")
const localPreviewUrl = ref("")

const form = ref({
  company_name: "",
  company_email: "",
  phone: "",
  category: "",
  owner_name: "",
  address: "",
  logo_url: ""
})

const password = ref("")
const confirmPassword = ref("")
const logoFileInput = ref(null)

const fetchProfile = async () => {
  if (!userId.value) return
  loading.value = true
  pageError.value = ""
  
  try {
    const res = await get(`/companies/profile/${ userId.value }`)
    const payload = asObject(getData(res))
    form.value = { ...form.value, ...payload }
  } catch (e) {
    if (e?.status !== 404) {
      pageError.value = getErrorMessage(e, "Failed to load profile")
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchProfile() })
onBeforeUnmount(() => {
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
})

const handleLogoFileChange = (event) => {
  const file = event.target.files?.[0]
  pageError.value = ""
  pageSuccess.value = ""
  uploadWarning.value = ""
  clearUploadState()

  if (!file) return

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    pageError.value = "Logo must be JPG, PNG, or WebP"
    logoFileInput.value.value = ""
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    pageError.value = "Logo max size is 2MB"
    logoFileInput.value.value = ""
    return
  }

  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
  localPreviewUrl.value = URL.createObjectURL(file)
}

const handleUploadLogo = async () => {
  const file = logoFileInput.value?.files?.[0]
  if (!file) {
    pageError.value = "Please select a logo first"
    return
  }

  pageError.value = ""
  pageSuccess.value = ""
  uploadWarning.value = ""

  const result = await uploadProfileImage(file, userId.value)
  
  if (!result) {
    pageError.value = uploadError.value
    return
  }

  form.value.logo_url = result.publicUrl
  if (result.warning) uploadWarning.value = result.warning

  pageSuccess.value = "Company logo uploaded successfully"
  logoFileInput.value.value = ""
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value)
    localPreviewUrl.value = ""
  }

  setTimeout(() => { pageSuccess.value = "" }, 3000)
}

const saveProfile = async () => {
  if (loading.value || uploading.value) return
  if (!userId.value) {
    pageError.value = "User ID not available"
    return
  }

  const required = [
    { key: "company_name", label: "Company name" },
    { key: "company_email", label: "Company email" },
    { key: "phone", label: "Phone" },
    { key: "category", label: "Category" }
  ]

  const missing = required.find((item) => !String(form.value[item.key] || "").trim())
  if (missing) {
    pageError.value = `${ missing.label } is required`
    return
  }

  loading.value = true
  pageError.value = ""
  pageSuccess.value = ""

  try {
    const payload = {
      company_name: form.value.company_name,
      company_email: form.value.company_email,
      phone: form.value.phone,
      category: form.value.category,
      owner_name: form.value.owner_name || "",
      address: form.value.address || ""
    }

    if (form.value.logo_url) payload.logo_url = form.value.logo_url

    await put(`/companies/profile/${ userId.value }`, payload)
    pageSuccess.value = "Company profile updated successfully"
    setTimeout(() => { pageSuccess.value = "" }, 3000)
  } catch (e) {
    pageError.value = getErrorMessage(e, "Failed to save profile")
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  pageError.value = ""
  pageSuccess.value = ""

  if (!password.value || !confirmPassword.value) {
    pageError.value = "Both password fields are required"
    return
  }

  if (password.value.length < 8) {
    pageError.value = "Password must be at least 8 characters"
    return
  }

  if (password.value !== confirmPassword.value) {
    pageError.value = "Passwords do not match"
    return
  }

  pageSuccess.value = "Password change functionality coming soon"
  password.value = ""
  confirmPassword.value = ""
  setTimeout(() => { pageSuccess.value = "" }, 3000)
}
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[30px] font-semibold mb-2">Account Center</h1>
    <p class="text-[14px] text-[#64748B] mb-6">Manage your company profile and account settings</p>

    <div class="bg-[#EEF2FF] border-l-4 border-[color:var(--color-main)] rounded-[5px] text-[14px] p-4 mb-6">
      <p class="text-[#4338CA]">Business email and phone number are required to use Carrepath dashboard.</p>
    </div>

    <div v-if="pageError" class="mb-4 bg-red-50 border border-red-200 rounded-[10px] p-4">
      <p class="text-red-700 text-[14px]">{{ pageError }}</p>
    </div>

    <div v-if="pageSuccess" class="mb-4 bg-green-50 border border-green-200 rounded-[10px] p-4">
      <p class="text-green-700 text-[14px]">{{ pageSuccess }}</p>
    </div>

    <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-6">
      <div class="mb-6 pb-6 border-b border-[#E2E8F0]">
        <h2 class="text-[18px] font-semibold mb-4">Company Logo</h2>
        
        <div class="flex flex-col md:flex-row gap-6 md:items-start">
          <div class="flex-shrink-0">
            <div class="h-24 w-24 rounded-lg overflow-hidden bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] border-2 border-[#E2E8F0] flex items-center justify-center">
              <img 
                v-if="localPreviewUrl || form.logo_url"
                :src="localPreviewUrl || form.logo_url"
                alt="Logo preview"
                class="h-full w-full object-cover"
              />
              <span v-else class="text-[12px] text-[#64748B] text-center px-2">No logo</span>
            </div>
          </div>

          <div class="flex-1 space-y-3">
            <div>
              <label class="text-[14px] font-medium text-[#1E293B] block mb-2">Choose Logo</label>
              <input
                ref="logoFileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] file:mr-3 file:rounded-[3px] file:border-0 file:text-[13px] file:font-medium file:bg-[#EEF2FF] file:text-[#4338CA]"
                @change="handleLogoFileChange"
              />
              <p class="text-[12px] text-[#64748B] mt-2">JPG, PNG, or WebP • Max 2MB</p>
            </div>

            <button
              :disabled="uploading || !localPreviewUrl"
              class="bg-[color:var(--color-main)] text-white rounded-[5px] px-4 py-2.5 text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              @click="handleUploadLogo"
            >
              {{ uploading ? "Uploading..." : "Upload Logo" }}
            </button>

            <p v-if="uploadError" class="text-[13px] text-red-600">{{ uploadError }}</p>

            <div v-if="uploadWarning" class="text-[13px] bg-yellow-50 border border-yellow-200 rounded-[5px] p-2 text-yellow-800">
              ⚠️ {{ uploadWarning }}
            </div>

            <p v-if="form.logo_url" class="text-[12px] text-[#64748B]">
              Current: <span class="font-medium truncate">{{ form.logo_url }}</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-[18px] font-semibold mb-4">Company Information</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Company Name *</label>
            <input v-model="form.company_name" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Your company name" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Company Email *</label>
            <input v-model="form.company_email" type="email" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="company@email.com" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Company Phone Number *</label>
            <input v-model="form.phone" type="tel" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="+62 812-345-6789" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Category of Business *</label>
            <input v-model="form.category" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Information Technology & Software" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Owner Name</label>
            <input v-model="form.owner_name" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Company owner name" />
          </div>
        </div>

        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Company Address</label>
          <textarea v-model="form.address" rows="3" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Company address"></textarea>
        </div>

        <button
          :disabled="loading || uploading"
          class="mt-6 bg-[color:var(--color-main)] text-white rounded-[5px] px-6 py-2.5 text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          @click="saveProfile"
        >
          {{ loading ? "Saving..." : "Save Profile" }}
        </button>
      </div>

      <div class="mt-8 pt-6 border-t border-[#E2E8F0]">
        <h2 class="text-[18px] font-semibold mb-4">Change Password</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">New Password</label>
            <input v-model="password" type="password" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="At least 8 characters" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Confirm Password</label>
            <input v-model="confirmPassword" type="password" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Re-enter password" />
          </div>
        </div>

        <button
          class="bg-[color:var(--color-main)] text-white rounded-[5px] px-6 py-2.5 text-[14px] font-medium hover:opacity-90 transition-opacity"
          @click="changePassword"
        >
          Update Password
        </button>
      </div>
    </div>
  </section>
</template>
