<script setup>
import { ref, onMounted } from 'vue'

useHead({ title: 'CarrePath | Company Account' })
definePageMeta({ layout: 'company' })

const { get, put } = useApi()
const tokenCookie = useCookie('access_token')
const userId = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const form = ref({
  company_name: '',
  company_email: '',
  phone: '',
  category: '',
  owner_name: '',
  address: '',
  logo_url: ''
})

const password = ref('')
const confirmPassword = ref('')

onMounted(async () => {
  try {
    const payload = JSON.parse(atob(tokenCookie.value.split('.')[1]))
    userId.value = payload.sub
    const res = await get(`/companies/profile/${userId.value}`)
    form.value = { ...form.value, ...(res.data || {}) }
  } catch (e) {
    if (e?.status !== 404) {
      error.value = e?.data?.error || 'Failed to load profile'
    }
  }
})

const save = async () => {
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await put(`/companies/profile/${userId.value}`, form.value)
    success.value = 'Company profile updated'
  } catch (e) {
    error.value = e?.data?.error || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

const changePassword = () => {
  if (!password.value || password.value !== confirmPassword.value) {
    error.value = 'Password confirmation mismatch'
    return
  }
  success.value = 'Password change request is ready (connect to auth endpoint).'
}
</script>

<template>
  <section class="p-6 md:p-8">
    <h1 class="text-[30px] font-semibold">Account Center</h1>
    <div class="bg-[#EEF2FF] border-l-2 border-[color:var(--color-main)] text-[14px] mt-4 p-3">Business e-mail and phone number are required to use Carrepath dashboard.</div>

    <p v-if="error" class="mt-4 text-[14px] text-red-600">{{ error }}</p>
    <p v-if="success" class="mt-2 text-[14px] text-green-600">{{ success }}</p>

    <div class="bg-white border border-[#E2E8F0] rounded-[10px] p-5 mt-5">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input v-model="form.logo_url" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Company logo URL" />
        <input v-model="form.company_name" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Company name" />
        <input v-model="form.company_email" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Company email" />
        <input v-model="form.phone" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Phone" />
        <input v-model="form.category" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Category" />
        <input v-model="form.owner_name" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Owner name" />
      </div>
      <textarea v-model="form.address" rows="3" class="mt-3 w-full border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Company address"></textarea>
      <button class="mt-4 bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px]" :disabled="loading" @click="save">{{ loading ? 'Saving...' : 'Save' }}</button>

      <div class="mt-8 pt-6 border-t border-[#E2E8F0]">
        <h2 class="text-[24px] font-semibold mb-3">Change Password</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="password" type="password" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Password" />
          <input v-model="confirmPassword" type="password" class="border border-[#E2E8F0] rounded-[5px] px-[14px] py-[12px] text-[14px]" placeholder="Re-enter Password" />
        </div>
        <button class="mt-4 bg-[color:var(--color-main)] text-white rounded-[5px] px-5 py-2.5 text-[14px]" @click="changePassword">Change Password</button>
      </div>
    </div>
  </section>
</template>
