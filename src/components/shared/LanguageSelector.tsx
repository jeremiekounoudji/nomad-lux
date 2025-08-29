import React from 'react'
import { Button, Popover, PopoverTrigger, PopoverContent } from '@heroui/react'
import { Languages, Check, ChevronDown } from 'lucide-react'
import { useTranslationStore, Language } from '../../lib/stores/translationStore'
import { useTranslation } from '../../lib/stores/translationStore'

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'buttons'
  className?: string
  showFlags?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const languages = [
  { code: 'en' as Language, name: 'languages.en', flag: '🇺🇸' },
  { code: 'fr' as Language, name: 'languages.fr', flag: '🇫🇷' }
]

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
  showFlags = true,
  size = 'md'
}) => {
  const { currentLanguage, changeLanguage, isLoading } = useTranslationStore()
  const { t } = useTranslation('common')

  // Debug log to verify persistence
  React.useEffect(() => {
    console.log('🌐 LanguageSelector: Current language from store:', currentLanguage)
  }, [currentLanguage])

  const handleLanguageChange = async (language: Language) => {
    if (language !== currentLanguage && !isLoading) {
      console.log('🌐 LanguageSelector: Changing language from', currentLanguage, 'to', language)
      await changeLanguage(language)
      console.log('🌐 LanguageSelector: Language changed successfully to', language)
    }
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage)

  if (variant === 'toggle') {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`min-w-unit-16 ${className}`}
        onPress={() => handleLanguageChange(currentLanguage === 'en' ? 'fr' : 'en')}
        isLoading={isLoading}
        startContent={showFlags ? currentLang?.flag : <Languages className="size-4" />}
      >
        {currentLang?.code.toUpperCase()}
      </Button>
    )
  }

  if (variant === 'buttons') {
    return (
      <div className={`flex gap-1 ${className}`}>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? 'solid' : 'ghost'}
            size={size}
            className="min-w-unit-12"
            onPress={() => handleLanguageChange(language.code)}
            isLoading={isLoading && currentLanguage === language.code}
            startContent={showFlags ? language.flag : undefined}
          >
            {language.code.toUpperCase()}
          </Button>
        ))}
      </div>
    )
  }

  // Default dropdown variant with HeroUI Popover
  return (
    <Popover placement="bottom-end" className={className}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size={size}
          className="min-w-unit-20"
          isLoading={isLoading}
          startContent={showFlags ? currentLang?.flag : <Languages className="size-4" />}
          endContent={<ChevronDown className="size-3" />}
        >
          {t(currentLang?.name || 'languages.en')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[160px] p-2">
        <div className="space-y-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isLoading}
              className={`
                flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors
                ${currentLanguage === language.code
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }
                ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-2">
                {showFlags && <span className="text-lg">{language.flag}</span>}
                <span className="font-medium">{t(language.name)}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="size-4 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Compact version for mobile/header use
export const CompactLanguageSelector: React.FC<{ className?: string }> = ({ className }) => {
  const { currentLanguage, changeLanguage, isLoading } = useTranslationStore()
  const { t } = useTranslation('common')
  const currentLang = languages.find(lang => lang.code === currentLanguage)

  const handleLanguageChange = async (language: Language) => {
    if (language !== currentLanguage && !isLoading) {
      await changeLanguage(language)
    }
  }

  return (
    <Popover placement="bottom-end" className={className}>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="min-w-unit-12 px-2"
          isLoading={isLoading}
          startContent={<span className="text-base">{currentLang?.flag}</span>}
          endContent={<ChevronDown className="size-3" />}
        >
          <span className="text-xs font-medium">{currentLang?.code.toUpperCase()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[140px] p-2">
        <div className="space-y-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isLoading}
              className={`
                flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors
                ${currentLanguage === language.code
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }
                ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{language.flag}</span>
                <span className="text-sm font-medium">{t(language.name)}</span>
              </div>
              {currentLanguage === language.code && (
                <Check className="size-3 text-primary-600" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Full language selector with names for settings pages
export const FullLanguageSelector: React.FC<{ className?: string }> = ({ className }) => {
  const { currentLanguage, changeLanguage, isLoading } = useTranslationStore()
  const { t } = useTranslation('common')

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {t('labels.language')}
      </label>
      <div className="space-y-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            disabled={isLoading}
            className={`
              flex w-full items-center justify-between rounded-lg border p-3 transition-colors
              ${currentLanguage === language.code
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
              }
              ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{language.flag}</span>
              <span className="font-medium">{t(language.name)}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="text-primary size-5" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}