import { ref } from 'vue'

interface ModalState {
  isOpen: boolean
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  actionText: string
  cancelText: string
  showCancel: boolean
  loading: boolean
  loadingText: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

const shared = {
  modalState: ref<ModalState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    actionText: 'OK',
    cancelText: 'Cancel',
    showCancel: true,
    loading: false,
    loadingText: 'Loading...'
  }),
  lastSignature: ref(''),
  lastOpenedAt: ref(0)
}

export const useModal = () => {
  const DEDUPE_WINDOW_MS = 800

  const close = () => {
    shared.modalState.value = {
      ...shared.modalState.value,
      isOpen: false,
      loading: false,
      loadingText: 'Loading...',
      onConfirm: undefined,
      onCancel: undefined
    }
  }

  const shouldSkipDuplicate = (type: ModalState['type'], title: string, message: string) => {
    const signature = `${type}::${title}::${message}`
    const now = Date.now()

    if (
      shared.modalState.value.isOpen &&
      signature === shared.lastSignature.value &&
      now - shared.lastOpenedAt.value <= DEDUPE_WINDOW_MS
    ) {
      return true
    }

    shared.lastSignature.value = signature
    shared.lastOpenedAt.value = now
    return false
  }

  const openModal = (payload: ModalState) => {
    if (shouldSkipDuplicate(payload.type, payload.title, payload.message)) return
    shared.modalState.value = payload
  }

  /**
   * Show success notification
   */
  const success = (title: string, message: string, onConfirm?: () => void) => {
    openModal({
      isOpen: true,
      type: 'success',
      title,
      message,
      actionText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      loading: false,
      loadingText: 'Loading...',
      onConfirm
    })
  }

  /**
   * Show error notification
   */
  const error = (title: string, message: string, onConfirm?: () => void) => {
    openModal({
      isOpen: true,
      type: 'error',
      title,
      message,
      actionText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      loading: false,
      loadingText: 'Loading...',
      onConfirm
    })
  }

  /**
   * Show warning notification
   */
  const warning = (title: string, message: string, onConfirm?: () => void) => {
    openModal({
      isOpen: true,
      type: 'warning',
      title,
      message,
      actionText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      loading: false,
      loadingText: 'Loading...',
      onConfirm
    })
  }

  /**
   * Show info notification
   */
  const info = (title: string, message: string, onConfirm?: () => void) => {
    openModal({
      isOpen: true,
      type: 'info',
      title,
      message,
      actionText: 'OK',
      cancelText: 'Cancel',
      showCancel: false,
      loading: false,
      loadingText: 'Loading...',
      onConfirm
    })
  }

  /**
   * Show confirmation dialog (with Cancel button)
   */
  const confirm = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void,
    actionText = 'Confirm'
  ) => {
    openModal({
      isOpen: true,
      type: 'info',
      title,
      message,
      actionText,
      cancelText: 'Cancel',
      showCancel: true,
      loading: false,
      loadingText: 'Loading...',
      onConfirm,
      onCancel
    })
  }

  /**
   * Show confirmation dialog with loading state
   */
  const confirmAsync = async (
    title: string,
    message: string,
    onConfirm: () => Promise<void>,
    onCancel?: () => void,
    actionText = 'Confirm'
  ) => {
    return new Promise<boolean>((resolve) => {
      const actualOnConfirm = async () => {
        shared.modalState.value.loading = true
        shared.modalState.value.loadingText = 'Processing...'

        try {
          await onConfirm()
          close()
          resolve(true)
        } catch (err) {
          shared.modalState.value.loading = false
          console.error('Confirm error:', err)
          resolve(false)
        }
      }

      const actualOnCancel = () => {
        onCancel?.()
        close()
        resolve(false)
      }

      openModal({
        isOpen: true,
        type: 'info',
        title,
        message,
        actionText,
        cancelText: 'Cancel',
        showCancel: true,
        loading: false,
        loadingText: 'Processing...',
        onConfirm: actualOnConfirm,
        onCancel: actualOnCancel
      })
    })
  }

  /**
   * Get current modal state (for component binding)
   */
  const getModalState = () => shared.modalState

  return {
    success,
    error,
    warning,
    info,
    confirm,
    confirmAsync,
    close,
    getModalState
  }
}
