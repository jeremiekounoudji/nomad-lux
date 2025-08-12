import { useState, useEffect } from 'react'
import { useTranslationStore, Language } from '../lib/stores/translationStore'
import { translationService } from '../lib/services/translationService'

/**
 * Hook for translating property types
 */
export const usePropertyTypeTranslation = (propertyType: string) => {
  const { currentLanguage } = useTranslationStore()
  const [translation, setTranslation] = useState<string>(propertyType)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTranslation = async () => {
      setIsLoading(true)
      try {
        const translated = await translationService.getPropertyTypeTranslation(propertyType, currentLanguage)
        setTranslation(translated)
      } catch (error) {
        console.error('Failed to fetch property type translation:', error)
        setTranslation(propertyType) // Fallback to original
      } finally {
        setIsLoading(false)
      }
    }

    if (propertyType) {
      fetchTranslation()
    }
  }, [propertyType, currentLanguage])

  return { translation, isLoading }
}

/**
 * Hook for translating amenities
 */
export const useAmenityTranslation = (amenity: string) => {
  const { currentLanguage } = useTranslationStore()
  const [translation, setTranslation] = useState<string>(amenity)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTranslation = async () => {
      setIsLoading(true)
      try {
        const translated = await translationService.getAmenityTranslation(amenity, currentLanguage)
        setTranslation(translated)
      } catch (error) {
        console.error('Failed to fetch amenity translation:', error)
        setTranslation(amenity) // Fallback to original
      } finally {
        setIsLoading(false)
      }
    }

    if (amenity) {
      fetchTranslation()
    }
  }, [amenity, currentLanguage])

  return { translation, isLoading }
}

/**
 * Hook for translating multiple amenities at once
 */
export const useAmenitiesTranslation = (amenities: string[]) => {
  const { currentLanguage } = useTranslationStore()
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTranslations = async () => {
      if (!amenities.length) return

      setIsLoading(true)
      try {
        const items = amenities.map(amenity => ({ type: 'amenity' as const, value: amenity }))
        const translated = await translationService.batchTranslate(items, currentLanguage)
        setTranslations(translated)
      } catch (error) {
        console.error('Failed to fetch amenities translations:', error)
        // Fallback to original values
        const fallback: Record<string, string> = {}
        amenities.forEach(amenity => {
          fallback[amenity] = amenity
        })
        setTranslations(fallback)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslations()
  }, [amenities.join(','), currentLanguage])

  return { translations, isLoading }
}

/**
 * Hook for getting all property types with translations
 */
export const usePropertyTypes = () => {
  const { currentLanguage } = useTranslationStore()
  const [propertyTypes, setPropertyTypes] = useState<Array<{ value: string; label: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      setIsLoading(true)
      try {
        const types = await translationService.getPropertyTypes(currentLanguage)
        setPropertyTypes(types)
      } catch (error) {
        console.error('Failed to fetch property types:', error)
        setPropertyTypes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropertyTypes()
  }, [currentLanguage])

  return { propertyTypes, isLoading }
}

/**
 * Hook for getting all amenities with translations
 */
export const useAmenities = () => {
  const { currentLanguage } = useTranslationStore()
  const [amenities, setAmenities] = useState<Array<{ value: string; label: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAmenities = async () => {
      setIsLoading(true)
      try {
        const amenitiesList = await translationService.getAmenities(currentLanguage)
        setAmenities(amenitiesList)
      } catch (error) {
        console.error('Failed to fetch amenities:', error)
        setAmenities([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAmenities()
  }, [currentLanguage])

  return { amenities, isLoading }
}

/**
 * Hook for translating content (user-generated content like property titles/descriptions)
 */
export const useContentTranslation = (
  entityType: string,
  entityId: string,
  fieldName: string,
  originalContent: string
) => {
  const { currentLanguage } = useTranslationStore()
  const [translatedContent, setTranslatedContent] = useState<string>(originalContent)
  const [isLoading, setIsLoading] = useState(false)
  const [hasTranslation, setHasTranslation] = useState(false)

  useEffect(() => {
    const fetchTranslation = async () => {
      // If current language is English or no entity info, use original content
      if (currentLanguage === 'en' || !entityType || !entityId || !fieldName) {
        setTranslatedContent(originalContent)
        setHasTranslation(false)
        return
      }

      setIsLoading(true)
      try {
        const translation = await translationService.translateContent(
          entityType,
          entityId,
          fieldName,
          currentLanguage
        )

        if (translation) {
          setTranslatedContent(translation)
          setHasTranslation(true)
        } else {
          setTranslatedContent(originalContent)
          setHasTranslation(false)
        }
      } catch (error) {
        console.error('Failed to fetch content translation:', error)
        setTranslatedContent(originalContent)
        setHasTranslation(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslation()
  }, [entityType, entityId, fieldName, originalContent, currentLanguage])

  return { 
    translatedContent, 
    isLoading, 
    hasTranslation,
    originalContent 
  }
}

/**
 * Generic hook for translating any enum value
 */
export const useEnumTranslation = (enumType: string, enumValue: string) => {
  const { currentLanguage } = useTranslationStore()
  const [translation, setTranslation] = useState<string>(enumValue)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTranslation = async () => {
      if (!enumType || !enumValue) return

      setIsLoading(true)
      try {
        let translated: string
        
        if (enumType === 'property_type') {
          translated = await translationService.getPropertyTypeTranslation(enumValue, currentLanguage)
        } else if (enumType === 'amenity') {
          translated = await translationService.getAmenityTranslation(enumValue, currentLanguage)
        } else {
          // For other enum types, we could extend the service
          translated = enumValue
        }
        
        setTranslation(translated)
      } catch (error) {
        console.error(`Failed to fetch ${enumType} translation:`, error)
        setTranslation(enumValue)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTranslation()
  }, [enumType, enumValue, currentLanguage])

  return { translation, isLoading }
}