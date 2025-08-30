import { useState } from 'react'
import { Property } from '../interfaces/Property'
import { shareContent, createPropertyShareData } from '../utils/shareUtils'

export const usePropertyShare = () => {
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async (property: Property) => {
    console.log('📤 Share property:', property.title)
    
    setIsSharing(true)
    
    try {
      const shareData = createPropertyShareData(property)
      await shareContent(shareData, {
        showSuccessToast: true,
        showErrorToast: true
      })
    } catch (error) {
      console.error('❌ Share failed:', error)
    } finally {
      setIsSharing(false)
    }
  }

  return {
    isSharing,
    handleShare
  }
} 