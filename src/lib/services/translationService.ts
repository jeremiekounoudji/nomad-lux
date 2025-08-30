import { supabase } from '../supabase'
import { Language } from '../stores/translationStore'

export interface TranslationKey {
  id: string
  key_type: string
  key_value: string
  translation_en: string
  translation_fr: string
  description_en?: string
  description_fr?: string
  created_at: string
  updated_at: string
}

export interface ContentTranslation {
  id: string
  entity_type: string
  entity_id: string
  field_name: string
  language: string
  translation: string
  is_auto_translated: boolean
  created_at: string
  updated_at: string
}

class TranslationService {
  private cache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get translation for a property type
   */
  async getPropertyTypeTranslation(type: string, language: Language): Promise<string> {
    const cacheKey = `property_type_${type}_${language}`
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const { data, error } = await supabase
        .from('translation_keys')
        .select('translation_en, translation_fr')
        .eq('key_type', 'property_type')
        .eq('key_value', type)
        .single()

      if (error) {
        console.warn('🌐 TranslationService: Failed to fetch property type translation:', error)
        return this.getFallbackTranslation(type)
      }

      const translation = language === 'fr' ? data.translation_fr : data.translation_en
      
      // Cache the result
      this.setCache(cacheKey, translation)
      
      return translation || this.getFallbackTranslation(type)
    } catch (error) {
      console.error('🌐 TranslationService: Error fetching property type translation:', error)
      return this.getFallbackTranslation(type)
    }
  }

  /**
   * Get translation for an amenity
   */
  async getAmenityTranslation(amenity: string, language: Language): Promise<string> {
    const cacheKey = `amenity_${amenity}_${language}`
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const { data, error } = await supabase
        .from('translation_keys')
        .select('translation_en, translation_fr')
        .eq('key_type', 'amenity')
        .eq('key_value', amenity)
        .single()

      if (error) {
        console.warn('🌐 TranslationService: Failed to fetch amenity translation:', error)
        return this.getFallbackTranslation(amenity)
      }

      const translation = language === 'fr' ? data.translation_fr : data.translation_en
      
      // Cache the result
      this.setCache(cacheKey, translation)
      
      return translation || this.getFallbackTranslation(amenity)
    } catch (error) {
      console.error('🌐 TranslationService: Error fetching amenity translation:', error)
      return this.getFallbackTranslation(amenity)
    }
  }

  /**
   * Get all translated enum values for a specific type
   */
  async getTranslatedEnumValues(enumType: string, language: Language): Promise<Record<string, string>> {
    const cacheKey = `enum_${enumType}_${language}`
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const { data, error } = await supabase
        .from('translation_keys')
        .select('key_value, translation_en, translation_fr')
        .eq('key_type', enumType)

      if (error) {
        console.warn('🌐 TranslationService: Failed to fetch enum translations:', error)
        return {}
      }

      const translations: Record<string, string> = {}
      data.forEach((item) => {
        const translation = language === 'fr' ? item.translation_fr : item.translation_en
        translations[item.key_value] = translation || this.getFallbackTranslation(item.key_value)
      })

      // Cache the result
      this.setCache(cacheKey, translations)
      
      return translations
    } catch (error) {
      console.error('🌐 TranslationService: Error fetching enum translations:', error)
      return {}
    }
  }

  /**
   * Get content translation for user-generated content
   */
  async translateContent(
    entityType: string, 
    entityId: string, 
    fieldName: string, 
    language: Language
  ): Promise<string | null> {
    const cacheKey = `content_${entityType}_${entityId}_${fieldName}_${language}`
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const { data, error } = await supabase
        .from('content_translations')
        .select('translation')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('field_name', fieldName)
        .eq('language', language)
        .single()

      if (error) {
        // No translation found, return null
        return null
      }

      // Cache the result
      this.setCache(cacheKey, data.translation)
      
      return data.translation
    } catch (error) {
      console.error('🌐 TranslationService: Error fetching content translation:', error)
      return null
    }
  }

  /**
   * Save content translation
   */
  async saveContentTranslation(
    entityType: string,
    entityId: string,
    fieldName: string,
    language: Language,
    translation: string,
    isAutoTranslated: boolean = false
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('content_translations')
        .upsert({
          entity_type: entityType,
          entity_id: entityId,
          field_name: fieldName,
          language: language,
          translation: translation,
          is_auto_translated: isAutoTranslated
        })

      if (error) {
        console.error('🌐 TranslationService: Failed to save content translation:', error)
        return false
      }

      // Clear cache for this translation
      const cacheKey = `content_${entityType}_${entityId}_${fieldName}_${language}`
      this.clearCacheItem(cacheKey)

      return true
    } catch (error) {
      console.error('🌐 TranslationService: Error saving content translation:', error)
      return false
    }
  }

  /**
   * Get all property types with translations
   */
  async getPropertyTypes(language: Language): Promise<Array<{ value: string; label: string }>> {
    const translations = await this.getTranslatedEnumValues('property_type', language)
    
    return Object.entries(translations).map(([value, label]) => ({
      value,
      label
    }))
  }

  /**
   * Get all amenities with translations
   */
  async getAmenities(language: Language): Promise<Array<{ value: string; label: string }>> {
    const translations = await this.getTranslatedEnumValues('amenity', language)
    
    return Object.entries(translations).map(([value, label]) => ({
      value,
      label
    }))
  }

  /**
   * Batch translate multiple items
   */
  async batchTranslate(
    items: Array<{ type: 'property_type' | 'amenity'; value: string }>,
    language: Language
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}
    
    // Group by type for efficient querying
    const propertyTypes = items.filter(item => item.type === 'property_type').map(item => item.value)
    const amenities = items.filter(item => item.type === 'amenity').map(item => item.value)

    try {
      // Fetch property type translations
      if (propertyTypes.length > 0) {
        const { data: propertyData } = await supabase
          .from('translation_keys')
          .select('key_value, translation_en, translation_fr')
          .eq('key_type', 'property_type')
          .in('key_value', propertyTypes)

        propertyData?.forEach((item) => {
          const translation = language === 'fr' ? item.translation_fr : item.translation_en
          results[item.key_value] = translation || this.getFallbackTranslation(item.key_value)
        })
      }

      // Fetch amenity translations
      if (amenities.length > 0) {
        const { data: amenityData } = await supabase
          .from('translation_keys')
          .select('key_value, translation_en, translation_fr')
          .eq('key_type', 'amenity')
          .in('key_value', amenities)

        amenityData?.forEach((item) => {
          const translation = language === 'fr' ? item.translation_fr : item.translation_en
          results[item.key_value] = translation || this.getFallbackTranslation(item.key_value)
        })
      }

      return results
    } catch (error) {
      console.error('🌐 TranslationService: Error in batch translate:', error)
      return results
    }
  }

  /**
   * Clear all cached translations
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
    console.log('🌐 TranslationService: Cache cleared')
  }

  /**
   * Private helper methods
   */
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key)
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key)
      this.cacheExpiry.delete(key)
      return false
    }
    return this.cache.has(key)
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, value)
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION)
  }

  private clearCacheItem(key: string): void {
    this.cache.delete(key)
    this.cacheExpiry.delete(key)
  }

  private getFallbackTranslation(key: string): string {
    // Convert snake_case or kebab-case to Title Case
    return key
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }
}

// Export singleton instance
export const translationService = new TranslationService()
export default translationService