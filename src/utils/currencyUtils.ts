/**
 * Format price with currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'XOF', 'EUR')
 * @returns Formatted price string
 */
export const formatPrice = (amount: number, currency: string = 'USD'): string => {
  try {
    // Handle XOF specifically as it might not be supported by Intl.NumberFormat
    if (currency === 'XOF') {
      return `${amount.toFixed(2)} XOF`
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    // Fallback for unsupported currencies
    return `${currency} ${amount.toFixed(2)}`
  }
}

/**
 * Format price without currency symbol (just the code)
 * @param amount - The amount to format
 * @param currency - The currency code
 * @returns Formatted price string without symbol
 */
export const formatPriceWithoutSymbol = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${currency}`
  } catch (error) {
    // Fallback
    return `${amount.toFixed(2)} ${currency}`
  }
}
