export const formatDate = (dateInput: string | Date | number | null | undefined, includeTime: boolean = false) => {
  if (!dateInput) return '-'
  
  const date = new Date(dateInput)
  if (isNaN(date.getTime())) return '-'

  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }
  
  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return date.toLocaleDateString('id-ID', options)
}
