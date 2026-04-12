import { ref } from 'vue'

export const useOcr = () => {
  const ocrText = ref('')
  const ocrEmail = ref('')
  const ocrPhone = ref('')
  const ocrLoading = ref(false)
  const ocrError = ref('')

  /**
   * Extract text from image using client-side OCR (Tesseract.js)
   * This is an alternative approach that can also work with backend OCR
   */
  const extractTextFromImage = async (file: File): Promise<string> => {
    if (!file) return ''

    try {
      ocrLoading.value = true
      ocrError.value = ''

      // For now, we'll prepare for Tesseract.js but keep it optional
      // You can install with: npm install tesseract.js
      // Then uncomment the code below

      // For client-side OCR using Tesseract.js:
      /*
      const Tesseract = await import('tesseract.js').then(m => m.default)

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          console.log('OCR progress:', m.progress)
        }
      })

      return result.data?.text || ''
      */

      // Fallback: Use placeholder text extraction
      // In production, this should call backend API for OCR
      console.warn('Client-side OCR not configured. Please use backend OCR API.')
      return ''
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OCR extraction failed'
      ocrError.value = message
      console.error('OCR Error:', message)
      return ''
    } finally {
      ocrLoading.value = false
    }
  }

  /**
   * Send image to backend for OCR processing
   * This is the recommended approach for production
   */
  const sendImageToBackendOcr = async (file: File): Promise<{
    text: string
    extracted_fields?: {
      full_name?: string
      email?: string
      phone?: string
      headline?: string
      summary?: string
      skills?: string[]
      experience?: Array<any>
      education?: Array<any>
      certifications?: string[]
    }
  }> => {
    try {
      ocrLoading.value = true
      ocrError.value = ''

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'cv_image')

      // This endpoint should be implemented in backend
      // POST /ai/ocr-extract or similar
      // Returns extracted text and structured fields

      console.warn('Backend OCR endpoint not yet configured')
      return {
        text: '',
        extracted_fields: {}
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Backend OCR failed'
      ocrError.value = message
      console.error('Backend OCR Error:', message)
      return {
        text: '',
        extracted_fields: {}
      }
    } finally {
      ocrLoading.value = false
    }
  }

  /**
   * Extract basic contact info from text using regex patterns
   * This is a simple client-side parser for common patterns
   */
  const parseContactFromText = (text: string) => {
    // Email pattern
    const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/)
    if (emailMatch) ocrEmail.value = emailMatch[0]

    // Phone pattern (various formats)
    const phoneMatch = text.match(/(?:\+|0)?(?:\d{2,3})?[\s.-]?\d{3,4}[\s.-]?\d{3,4}[\s.-]?\d{0,4}/)
    if (phoneMatch) ocrPhone.value = phoneMatch[0].trim()
  }

  /**
   * Clean OCR text - remove artifacts and normalize
   */
  const cleanOcrText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to one
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters
      .trim()
  }

  return {
    ocrText,
    ocrEmail,
    ocrPhone,
    ocrLoading,
    ocrError,
    extractTextFromImage,
    sendImageToBackendOcr,
    parseContactFromText,
    cleanOcrText
  }
}
