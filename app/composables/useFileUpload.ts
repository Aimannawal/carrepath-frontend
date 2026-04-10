/**
 * useFileUpload - Centralized file upload handling
 * Supports profile images, PDFs, with proper validation and error handling
 */
export const useFileUpload = () => {
  const { post } = useApi()
  const { getErrorMessage } = useApiResponse()

  const uploading = ref(false)
  const uploadError = ref('')
  const uploadSuccess = ref('')

  /**
   * Validate file before upload
   */
  const validateFile = (
    file: File,
    options: {
      maxSize?: number // bytes, default 10MB
      allowedTypes?: string[] // mime types
      required?: boolean
    } = {}
  ): string => {
    const {
      maxSize = 10 * 1024 * 1024,
      allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
      required = true
    } = options

    if (!file && required) {
      return 'File is required'
    }

    if (!file) {
      return ''
    }

    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(1)
      return `File size exceeds ${sizeMB}MB limit`
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type not allowed. Accepted: ${allowedTypes.join(', ')}`
    }

    return ''
  }

  const resolveUploadPayload = (response: any) => {
    const payload = response?.data && typeof response.data === 'object' ? response.data : response
    const publicUrl = payload?.public_url || payload?.publicUrl || ''
    const warning = response?.warning || payload?.warning || ''

    return {
      payload,
      publicUrl,
      warning
    }
  }

  /**
   * Upload profile image
   * POST /storage/upload/profile/:userId
   * Response may include warning field if DB column not configured
   */
  const uploadProfileImage = async (
    file: File,
    userId: string,
    options: { validationOptions?: any } = {}
  ) => {
    uploadError.value = ''
    uploadSuccess.value = ''

    // Validate first
    const validationError = validateFile(file, {
      maxSize: 2 * 1024 * 1024, // 2MB for images
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      ...options.validationOptions
    })

    if (validationError) {
      uploadError.value = validationError
      return null
    }

    uploading.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await post(
        `/storage/upload/profile/${userId}`,
        formData
      )

      // Handle response - may have warning
      const { publicUrl, warning } = resolveUploadPayload(response)

      if (!publicUrl) {
        uploadError.value = 'Failed to upload image: no public URL returned'
        return null
      }

      // Success - even if there's a warning
      uploadSuccess.value = response?.message || 'Image uploaded successfully'

      return {
        publicUrl,
        warning,
        fullResponse: response
      }
    } catch (e) {
      uploadError.value = getErrorMessage(e, 'Failed to upload profile image')
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload PDF CV
   * POST /storage/upload/pdf/:workerId
   * Returns public_url for use as cv_url
   */
  const uploadPdfCv = async (
    file: File,
    workerId: string,
    options: { validationOptions?: any } = {}
  ) => {
    uploadError.value = ''
    uploadSuccess.value = ''

    // Validate
    const validationError = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB for PDF
      allowedTypes: ['application/pdf'],
      ...options.validationOptions
    })

    if (validationError) {
      uploadError.value = validationError
      return null
    }

    uploading.value = true
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await post(
        `/storage/upload/pdf/${workerId}`,
        formData
      )

      const { publicUrl, warning } = resolveUploadPayload(response)
      const cvUrl = publicUrl
      if (!cvUrl) {
        uploadError.value = 'Failed to upload PDF: no URL returned'
        return null
      }

      uploadSuccess.value = response?.message || 'PDF uploaded successfully'
      return {
        publicUrl: cvUrl,
        warning,
        fullResponse: response
      }
    } catch (e) {
      uploadError.value = getErrorMessage(e, 'Failed to upload PDF')
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Generic file upload (can be used for other file types)
   */
  const uploadFile = async (
    file: File,
    endpoint: string,
    options: {
      fieldName?: string
      validationOptions?: any
      additionalFormFields?: Record<string, string>
    } = {}
  ) => {
    const { fieldName = 'file', validationOptions = {}, additionalFormFields = {} } = options

    uploadError.value = ''
    uploadSuccess.value = ''

    const validationError = validateFile(file, validationOptions)
    if (validationError) {
      uploadError.value = validationError
      return null
    }

    uploading.value = true
    try {
      const formData = new FormData()
      formData.append(fieldName, file)

      // Add any additional form fields
      for (const [key, value] of Object.entries(additionalFormFields)) {
        formData.append(key, value)
      }

      const response = await post(endpoint, formData)

      uploadSuccess.value = response?.message || 'File uploaded successfully'
      return response?.data
    } catch (e) {
      uploadError.value = getErrorMessage(e, 'File upload failed')
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Clear all upload state
   */
  const clearUploadState = () => {
    uploading.value = false
    uploadError.value = ''
    uploadSuccess.value = ''
  }

  return {
    uploading,
    uploadError,
    uploadSuccess,
    validateFile,
    uploadProfileImage,
    uploadPdfCv,
    uploadFile,
    clearUploadState
  }
}
