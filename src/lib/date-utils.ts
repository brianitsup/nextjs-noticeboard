export function formatDate(d: Date | string | null): string {
  if (!d) return 'No date'
  
  try {
    const date = d instanceof Date ? d : new Date(d)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', d, error)
    return 'Invalid date'
  }
} 