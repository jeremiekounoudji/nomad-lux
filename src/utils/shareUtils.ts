import { Property } from '../interfaces/Property'
import toast from 'react-hot-toast'

// Web Share API types
interface ShareData {
  title?: string
  text?: string
  url?: string
  files?: File[]
}

interface ShareOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

/**
 * Check if Web Share API is supported
 */
export const isWebShareSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * Update meta tags for property-specific sharing
 */
export const updatePropertyMetaTags = (property: Property): void => {
  const baseUrl = window.location.origin
  const propertyUrl = `${baseUrl}/property/${property.id}`
  // Use the first property image if available, otherwise fallback to the logo
  const propertyImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : `${baseUrl}/favicon.jpg`
  
  // Update title
  document.title = `${property.title} - NomadLux`
  
  // Create rich description with amenities
  const amenitiesText = property.amenities && property.amenities.length > 0 
    ? ` Features: ${property.amenities.slice(0, 3).join(', ')}${property.amenities.length > 3 ? ' and more' : ''}.`
    : ''
  
  const description = `${property.title} in ${property.location.city}, ${property.location.country}. Starting at ${property.currency || '$'}${property.price}/night${property.rating ? ` with ${property.rating}⭐ rating` : ''}.${amenitiesText} Book now on NomadLux!`
  
  // Update meta tags
  const metaUpdates = [
    { selector: 'meta[name="title"]', content: `${property.title} - NomadLux` },
    { selector: 'meta[name="description"]', content: description },
    
    // Open Graph tags
    { selector: 'meta[property="og:title"]', content: `${property.title} - NomadLux` },
    { selector: 'meta[property="og:description"]', content: description },
    { selector: 'meta[property="og:url"]', content: propertyUrl },
    { selector: 'meta[property="og:image"]', content: propertyImage },
    { selector: 'meta[property="og:image:alt"]', content: `${property.title} - Property photo` },
    { selector: 'meta[property="og:image:width"]', content: '1200' },
    { selector: 'meta[property="og:image:height"]', content: '630' },
    { selector: 'meta[property="og:type"]', content: 'website' },
    { selector: 'meta[property="og:site_name"]', content: 'NomadLux' },
    
    // Twitter tags
    { selector: 'meta[property="twitter:card"]', content: 'summary_large_image' },
    { selector: 'meta[property="twitter:title"]', content: `${property.title} - NomadLux` },
    { selector: 'meta[property="twitter:description"]', content: description },
    { selector: 'meta[property="twitter:url"]', content: propertyUrl },
    { selector: 'meta[property="twitter:image"]', content: propertyImage },
    { selector: 'meta[property="twitter:image:alt"]', content: `${property.title} - Property photo` },
    
    // Additional meta tags for better SEO
    { selector: 'meta[name="keywords"]', content: `${property.title}, ${property.location.city}, ${property.location.country}, luxury rental, vacation home, ${property.property_type}, accommodation, travel` },
    { selector: 'meta[name="author"]', content: 'NomadLux' },
    
    // Canonical URL
    { selector: 'link[rel="canonical"]', content: propertyUrl, attribute: 'href' }
  ]
  
  metaUpdates.forEach(({ selector, content, attribute = 'content' }) => {
    const element = document.querySelector(selector)
    if (element) {
      element.setAttribute(attribute, content)
    } else {
      // Create the meta tag if it doesn't exist
      const newMeta = document.createElement(selector.includes('link') ? 'link' : 'meta')
      const isProperty = selector.includes('property=')
      const isName = selector.includes('name=')
      const isRel = selector.includes('rel=')
      
      if (isProperty) {
        newMeta.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '')
      } else if (isName) {
        newMeta.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '')
      } else if (isRel) {
        newMeta.setAttribute('rel', selector.match(/rel="([^"]+)"/)?.[1] || '')
      }
      
      newMeta.setAttribute(attribute, content)
      document.head.appendChild(newMeta)
    }
  })
  
  console.log('🏷️ Meta tags updated for property:', property.title)
}

/**
 * Reset meta tags to default site values
 */
export const resetDefaultMetaTags = (): void => {
  const defaultUpdates = [
    { selector: 'meta[name="title"]', content: 'NomadLux - Luxury Property Rentals' },
    { selector: 'meta[name="description"]', content: 'Discover and book luxury properties worldwide. From stunning villas to cozy apartments, find your perfect getaway with NomadLux.' },
    
    // Open Graph tags
    { selector: 'meta[property="og:title"]', content: 'NomadLux - Luxury Property Rentals' },
    { selector: 'meta[property="og:description"]', content: 'Discover and book luxury properties worldwide. From stunning villas to cozy apartments, find your perfect getaway with NomadLux.' },
    { selector: 'meta[property="og:url"]', content: 'https://nomadlux.com/' },
    { selector: 'meta[property="og:image"]', content: `${window.location.origin}/favicon.jpg` },
    { selector: 'meta[property="og:image:alt"]', content: 'NomadLux - Luxury property rental platform' },
    
    // Twitter tags
    { selector: 'meta[property="twitter:title"]', content: 'NomadLux - Luxury Property Rentals' },
    { selector: 'meta[property="twitter:description"]', content: 'Discover and book luxury properties worldwide. From stunning villas to cozy apartments, find your perfect getaway with NomadLux.' },
    { selector: 'meta[property="twitter:url"]', content: 'https://nomadlux.com/' },
    { selector: 'meta[property="twitter:image"]', content: `${window.location.origin}/favicon.jpg` },
    { selector: 'meta[property="twitter:image:alt"]', content: 'NomadLux - Luxury property rental platform' },
    
    // Canonical URL
    { selector: 'link[rel="canonical"]', content: 'https://nomadlux.com/', attribute: 'href' }
  ]
  
  defaultUpdates.forEach(({ selector, content, attribute = 'content' }) => {
    const element = document.querySelector(selector)
    if (element) {
      element.setAttribute(attribute, content)
    }
  })
  
  document.title = 'NomadLux - Luxury Property Rentals'
  console.log('🏷️ Meta tags reset to default')
}

/**
 * Main sharing function with Web Share API and fallback
 */
export const shareContent = async (
  shareData: ShareData,
  options: ShareOptions = {}
): Promise<boolean> => {
  const { showSuccessToast = true, showErrorToast = true } = options

  try {
    if (isWebShareSupported()) {
      await navigator.share(shareData)
      if (showSuccessToast) {
        toast.success('Content shared successfully!')
      }
      return true
    } else {
      // Fallback: copy to clipboard
      if (shareData.url) {
        await navigator.clipboard.writeText(shareData.url)
        if (showSuccessToast) {
          toast.success('Link copied to clipboard!')
        }
        return true
      }
    }
  } catch (error: any) {
    // User cancelled or other error
    if (error.name !== 'AbortError' && showErrorToast) {
      console.error('Share failed:', error)
      toast.error('Failed to share content')
    }
  }
  
  return false
}

/**
 * Create property-specific share data
 */
export const createPropertyShareData = (property: Property): ShareData => {
  const baseUrl = window.location.origin
  const propertyUrl = `${baseUrl}/property/${property.id}`
  
  return {
    title: `${property.title} - Nomad Lux`,
    text: `Check out this amazing property: ${property.title} in ${property.location.city}, ${property.location.country}. Starting at ${property.price}/night with ${property.rating}⭐ rating!`,
    url: propertyUrl
  }
}

/**
 * Create social media sharing URLs
 */
export const createSocialShareUrls = (shareData: ShareData) => {
  const encodedUrl = encodeURIComponent(shareData.url || '')
  const encodedText = encodeURIComponent(shareData.text || '')
  const encodedTitle = encodeURIComponent(shareData.title || '')

  return {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
  }
}

/**
 * Open social media share in popup window
 */
export const openSocialShare = (url: string): void => {
  const popup = window.open(
    url,
    'share-popup',
    'width=600,height=400,scrollbars=yes,resizable=yes'
  )
  
  // Focus the popup if it was successfully opened
  if (popup) {
    popup.focus()
  }
}