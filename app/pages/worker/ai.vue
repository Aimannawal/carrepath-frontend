<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'

useHead({ title: 'CarrePath | CarrepathAI' })
definePageMeta({ layout: 'worker' })

const { post, get } = useApi()
const { getData, getErrorMessage } = useApiResponse()
const { userId } = useAuth()

const loading = ref(false)
const pageError = ref('')
const messageInput = ref('')
const uploadFiles = ref([])
const uploadFileNames = ref([])
const scrollContainer = ref(null)

const messages = ref([])

const canSend = computed(() => {
  return !loading.value && (messageInput.value.trim().length > 0 || uploadFiles.value.length > 0)
})

const onSelectFiles = (event) => {
  pageError.value = ''
  const files = Array.from(event.target.files || [])

  if (!files.length) {
    uploadFiles.value = []
    uploadFileNames.value = []
    return
  }

  const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      pageError.value = 'File harus PDF, TXT, JPG, PNG, atau WEBP.'
      uploadFiles.value = []
      uploadFileNames.value = []
      event.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      pageError.value = 'Ukuran file maksimal 10MB per file.'
      uploadFiles.value = []
      uploadFileNames.value = []
      event.target.value = ''
      return
    }
  }

  uploadFiles.value = files
  uploadFileNames.value = files.map((file) => file.name)
}

const clearUploads = () => {
  uploadFiles.value = []
  uploadFileNames.value = []
}

const scrollToBottom = async () => {
  await nextTick()
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const animateAssistantText = async (message, fullText) => {
  if (!fullText) {
    message.text = ''
    return
  }
  const totalChars = fullText.length
  const chunkSize = totalChars > 1200 ? 18 : totalChars > 600 ? 12 : 8
  const frameDelay = totalChars > 1200 ? 10 : 14
  message.text = ''
  for (let i = 0; i < totalChars; i += chunkSize) {
    message.text = fullText.slice(0, i + chunkSize)
    if (i % (chunkSize * 4) === 0) {
      await scrollToBottom()
    }
    await sleep(frameDelay)
  }
  await scrollToBottom()
}

const loadHistory = async () => {
  try {
    const response = await get(`/ai/chat-history/${userId.value}`)
    const history = Array.isArray(getData(response)) ? getData(response) : []
    messages.value = history.map((item) => ({
      id: item.id || `${item.created_at}`,
      role: item.role,
      text: item.content || '',
      createdAt: item.created_at,
      fileNames: Array.isArray(item.file_names) ? item.file_names : []
    }))
    await scrollToBottom()
  } catch (e) {
    console.error('Failed to load history:', getErrorMessage(e))
  }
}

const handleSend = async () => {
  if (!canSend.value) return

  const userText = messageInput.value.trim()
  const userMessage = {
    id: `temp-user-${Date.now()}`,
    role: 'user',
    text: userText || 'Tolong analisis file yang saya upload.',
    createdAt: new Date().toISOString(),
    fileNames: [...uploadFileNames.value]
  }

  messages.value.push(userMessage)
  messageInput.value = ''
  await scrollToBottom()

  loading.value = true
  pageError.value = ''

  try {
    const form = new FormData()
    form.append('worker_id', userId.value)
    form.append('message', userText || 'Tolong analisis file yang saya upload.')

    uploadFiles.value.forEach((file) => {
      form.append('files[]', file)
    })

    const response = await post('/ai/chat', form)
    const data = getData(response) || {}

    const answer = String(data.answer || 'Maaf, aku tidak bisa memproses pertanyaanmu saat ini.')
    const assistantId = `temp-asst-${Date.now()}`

    const aiMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      createdAt: new Date().toISOString(),
      fileNames: []
    }
    messages.value.push(aiMessage)
    await animateAssistantText(aiMessage, answer)

    clearUploads()
  } catch (e) {
    pageError.value = getErrorMessage(e, 'Gagal mengirim pesan.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHistory()
})
</script>

<template>
  <section class="p-4 md:p-6 lg:p-8 h-screen flex flex-col bg-[#F8F9FA]">
    <div class="bg-white border border-[#E2E8F0] rounded-[20px] p-5 md:p-6 flex flex-col h-full shadow-sm">
      <div class="mb-4">
        <h1 class="text-[24px] font-semibold">CarrepathAI</h1>
        <p class="text-[13px] text-[#64748B] mt-1">Tanya soal CV, study plan, atau rekomendasi lowongan terbaik</p>
      </div>

      <p v-if="pageError" class="text-[13px] text-red-600 mb-3">{{ pageError }}</p>

      <!-- Chat Area -->
      <div ref="scrollContainer" class="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
        <div
          v-for="item in messages"
          :key="item.id"
          :class="[
            'flex gap-2 max-w-2xl',
            item.role === 'user' ? 'ml-auto justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'px-4 py-3 rounded-[18px] text-[14px] leading-relaxed break-words',
              item.role === 'user'
                ? 'bg-[color:var(--color-main)] text-white rounded-br-[4px]'
                : 'bg-[#F1F5F9] text-[#0F172A] rounded-bl-[4px]'
            ]"
          >
            <p class="whitespace-pre-wrap">{{ item.text }}</p>
            <p v-if="item.fileNames?.length" class="text-[12px] mt-2 opacity-80">📎 {{ item.fileNames.join(', ') }}</p>
          </div>
        </div>

        <div v-if="loading" class="flex gap-2 max-w-2xl">
          <div class="px-4 py-3 rounded-[18px] bg-[#F1F5F9]">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style="animation-delay: 0s"></div>
              <div class="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-[#64748B] rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="space-y-2 border-t border-[#E2E8F0] pt-4">
        <div v-if="uploadFileNames.length" class="flex flex-wrap gap-2">
          <div
            v-for="(name, idx) in uploadFileNames"
            :key="idx"
            class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EEF2FF] border border-[#C7D2FE] rounded-[8px] text-[12px] text-[#1E3A8A]"
          >
            📎 {{ name }}
            <button
              type="button"
              class="ml-1 text-[#1E3A8A] hover:text-[#1D4ED8] font-bold"
              @click="
                uploadFiles.splice(idx, 1),
                uploadFileNames.splice(idx, 1)
              "
            >
              ✕
            </button>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex-shrink-0 w-11 h-11 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center cursor-pointer hover:bg-[#EEF2FF] transition">
            <input class="hidden" type="file" multiple accept=".pdf,.txt,.jpg,.jpeg,.png,.webp" @change="onSelectFiles" />
            <Icon name="heroicons:plus-20-solid" class="w-6 h-6 text-[color:var(--color-main)]" />
          </label>

          <textarea
            v-model="messageInput"
            rows="1"
            class="flex-1 h-11 border border-[#E2E8F0] rounded-[14px] px-4 py-2.5 text-[14px] leading-[1.4] resize-none"
            placeholder="Tulis pertanyaan..."
            @keydown.enter.exact.prevent="handleSend"
          ></textarea>

          <button
            class="flex-shrink-0 w-11 h-11 rounded-full bg-[color:var(--color-main)] text-white flex items-center justify-center disabled:opacity-50 hover:shadow-md transition"
            :disabled="!canSend"
            @click="handleSend"
          >
            <Icon name="heroicons:paper-airplane-20-solid" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
