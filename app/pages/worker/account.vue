<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue"

useHead({ title: "CarrePath | Worker Account" })
definePageMeta({ layout: "worker" })

const { get, put } = useApi()
const { getData, asObject, getErrorMessage } = useApiResponse()
const { userId } = useAuth()
const { uploadProfileImage, uploadError, uploading, clearUploadState } = useFileUpload()
const { success, error, info } = useModal()

const loading = ref(false)
const pageError = ref("")
const pageSuccess = ref("")
const uploadWarning = ref("")
const localPreviewUrl = ref("")

const form = ref({
  full_name: "",
  email: "",
  field_of_work: "",
  phone: "",
  address: "",
  photo_url: ""
})

const password = ref("")
const confirmPassword = ref("")
const photoFileInput = ref(null)

const safeValue = (value) => {
  if (value === null || value === undefined) return ""
  return String(value)
}

const fetchProfile = async () => {
  if (!userId.value) {
    return
  }
  loading.value = true
  pageError.value = ""

  try {
    const res = await get(`/workers/profile/${userId.value}`)
    const payload = asObject(getData(res))
    const profile = asObject(payload.profile || payload)
    const user = asObject(payload.user)

    const extractedData = {
      full_name: safeValue(profile.full_name || user.full_name),
      email: safeValue(profile.email || user.email),
      field_of_work: safeValue(profile.field_of_work),
      phone: safeValue(profile.phone),
      address: safeValue(profile.address),
      photo_url: safeValue(profile.photo_url || profile.profile_url)
    }

    form.value = { ...form.value, ...extractedData }
  } catch (e) {
    if (e?.status !== 404) {
      const msg = getErrorMessage(e, "Failed to load profile")
      pageError.value = msg
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})

onBeforeUnmount(() => {
  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
})

const handlePhotoFileChange = (event) => {
  const file = event.target.files?.[0]
  pageError.value = ""
  pageSuccess.value = ""
  uploadWarning.value = ""
  clearUploadState()

  if (!file) return

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    pageError.value = "Photo must be JPG, PNG, or WebP"
    error("Invalid File Type", "Photo must be JPG, PNG, or WebP")
    if (photoFileInput.value) photoFileInput.value.value = ""
    return
  }

  if (file.size > 2 * 1024 * 1024) {
    pageError.value = "Photo max size is 2MB"
    error("File Too Large", "Photo max size is 2MB")
    if (photoFileInput.value) photoFileInput.value.value = ""
    return
  }

  if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
  localPreviewUrl.value = URL.createObjectURL(file)
}

const handleUploadProfileImage = async () => {
  const file = photoFileInput.value?.files?.[0]
  if (!file) {
    pageError.value = "Please select a photo first"
    info("Select Photo", "Please select a photo first")
    return
  }

  pageError.value = ""
  pageSuccess.value = ""
  uploadWarning.value = ""

  const result = await uploadProfileImage(file, userId.value)
  if (!result) {
    pageError.value = uploadError.value
    error("Upload Failed", uploadError.value || "Failed to upload photo")
    return
  }

  form.value.photo_url = result.publicUrl
  if (result.warning) uploadWarning.value = result.warning

  success("Upload Complete", "Profile photo uploaded successfully")
  if (photoFileInput.value) photoFileInput.value.value = ""
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value)
    localPreviewUrl.value = ""
  }
}

const saveProfile = async () => {
  if (loading.value || uploading.value) return
  if (!userId.value) {
    error("Error", "User ID not available")
    return
  }

  const required = [
    { key: "full_name", label: "Full name" },
    { key: "email", label: "Email" },
    { key: "field_of_work", label: "Field of work" },
    { key: "phone", label: "Phone" }
  ]

  const missing = required.find((item) => !String(form.value[item.key] || "").trim())
  if (missing) {
    error("Validation Error", `${missing.label} is required`)
    return
  }

  loading.value = true
  pageError.value = ""
  pageSuccess.value = ""

  try {
    const payload = {
      full_name: form.value.full_name,
      email: form.value.email,
      field_of_work: form.value.field_of_work || "",
      phone: form.value.phone,
      address: form.value.address || ""
    }

    if (form.value.photo_url) {
      payload.profile_url = form.value.photo_url
    }

    await put(`/workers/profile/${userId.value}`, payload)

    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
      localPreviewUrl.value = ""
    }
    if (photoFileInput.value) photoFileInput.value.value = ""

    await fetchProfile()
    success("Success", "Profile updated successfully")
  } catch (e) {
    const msg = getErrorMessage(e, "Failed to save profile")
    error("Error", msg)
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (!password.value || !confirmPassword.value) {
    error("Validation Error", "Both password fields are required")
    return
  }

  if (password.value.length < 8) {
    error("Validation Error", "Password must be at least 8 characters")
    return
  }

  if (password.value !== confirmPassword.value) {
    error("Validation Error", "Passwords do not match")
    return
  }

  success("Coming Soon", "Password change functionality coming soon")
  password.value = ""
  confirmPassword.value = ""
}
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[30px] font-semibold mb-2">Account Center</h1>
    <p class="text-[14px] text-[#64748B] mb-6">Manage your profile and account settings</p>

    <div class="bg-[#EEF2FF] border-l-4 border-[color:var(--color-main)] rounded-[5px] text-[14px] p-4 mb-6">
      <p class="text-[#4338CA]">Complete profile information helps you get better job matches.</p>
    </div>

    <div v-if="pageError" class="mb-4 bg-red-50 border border-red-200 rounded-[10px] p-4">
      <p class="text-red-700 text-[14px]">{{ pageError }}</p>
    </div>

    <div v-if="pageSuccess" class="mb-4 bg-green-50 border border-green-200 rounded-[10px] p-4">
      <p class="text-green-700 text-[14px]">{{ pageSuccess }}</p>
    </div>

    <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-6">
      <div class="mb-6 pb-6 border-b border-[#E2E8F0]">
        <h2 class="text-[18px] font-semibold mb-4">Profile Photo</h2>

        <div class="flex flex-col md:flex-row gap-6 md:items-start">
          <div class="flex-shrink-0">
            <div class="h-24 w-24 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <NuxtImg
                v-if="localPreviewUrl || form.photo_url"
                :src="localPreviewUrl || form.photo_url"
                alt="Photo preview"
                class="h-full w-full object-cover"
                :key="form.photo_url"
                loading="lazy"
              />
              <span v-else class="text-[12px] text-[#64748B]">No photo</span>
            </div>
          </div>

          <div class="flex-1 space-y-3">
            <div>
              <label class="text-[14px] font-medium text-[#1E293B] block mb-2">Choose Photo</label>
              <input
                ref="photoFileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] file:mr-3 file:rounded-[3px] file:border-0 file:text-[13px] file:font-medium file:bg-[#EEF2FF] file:text-[#4338CA]"
                @change="handlePhotoFileChange"
              />
              <p class="text-[12px] text-[#64748B] mt-2">JPG, PNG, or WebP • Max 2MB</p>
            </div>

            <button
              :disabled="uploading || !localPreviewUrl"
              class="bg-[color:var(--color-main)] text-white rounded-[5px] px-4 py-2.5 text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              @click="handleUploadProfileImage"
            >
              {{ uploading ? "Uploading..." : "Upload Photo" }}
            </button>

            <p v-if="uploadError" class="text-[13px] text-red-600">{{ uploadError }}</p>
            <div v-if="uploadWarning" class="text-[13px] bg-yellow-50 border border-yellow-200 rounded-[5px] p-2 text-yellow-800">
              ⚠️ {{ uploadWarning }}
            </div>

            <p v-if="form.photo_url" class="text-[12px] text-[#64748B]">
              Current: <span class="font-medium truncate">{{ form.photo_url }}</span>
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-[18px] font-semibold mb-4">Personal Information</h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Full Name *</label>
            <input v-model="form.full_name" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Your full name" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Email *</label>
            <input v-model="form.email" type="email" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="your@email.com" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Phone *</label>
            <input v-model="form.phone" type="tel" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="+62 812-345-6789" />
          </div>

          <div>
            <label class="text-[12px] font-medium text-[#64748B] block mb-2">Field of Work *</label>
            <input v-model="form.field_of_work" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Information Technology & Software" />
          </div>
        </div>

        <div>
          <label class="text-[12px] font-medium text-[#64748B] block mb-2">Address</label>
          <textarea v-model="form.address" rows="3" class="w-full border border-[#E2E8F0] rounded-[5px] px-3 py-2.5 text-[14px] resize-none focus:outline-none focus:ring-2 focus:ring-[color:var(--color-main)] focus:ring-opacity-50" placeholder="Your address"></textarea>
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
