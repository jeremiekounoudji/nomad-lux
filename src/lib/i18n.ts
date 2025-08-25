import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enCommon from '../locales/en/common.json'
import enNavigation from '../locales/en/navigation.json'
import enAuth from '../locales/en/auth.json'
import enProperty from '../locales/en/property.json'
import enBooking from '../locales/en/booking.json'
import enAdmin from '../locales/en/admin.json'
import enValidation from '../locales/en/validation.json'
import enNotifications from '../locales/en/notifications.json'
import enWallet from '../locales/en/wallet.json'
import enHelp from '../locales/en/help.json'
import enTerms from '../locales/en/terms.json'
import enSearch from '../locales/en/search.json'
import enProfile from '../locales/en/profile.json'
import enHome from '../locales/en/home.json'
import enLabels from '../locales/en/labels.json'
import enActions from '../locales/en/actions.json'
import enMap from '../locales/en/map.json'

import frCommon from '../locales/fr/common.json'
import frNavigation from '../locales/fr/navigation.json'
import frAuth from '../locales/fr/auth.json'
import frProperty from '../locales/fr/property.json'
import frBooking from '../locales/fr/booking.json'
import frAdmin from '../locales/fr/admin.json'
import frValidation from '../locales/fr/validation.json'
import frNotifications from '../locales/fr/notifications.json'
import frWallet from '../locales/fr/wallet.json'
import frHelp from '../locales/fr/help.json'
import frTerms from '../locales/fr/terms.json'
import frSearch from '../locales/fr/search.json'
import frProfile from '../locales/fr/profile.json'
import frHome from '../locales/fr/home.json'
import frLabels from '../locales/fr/labels.json'
import frActions from '../locales/fr/actions.json'
import frMap from '../locales/fr/map.json'

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    auth: enAuth,
    property: enProperty,
    booking: enBooking,
    admin: enAdmin,
    validation: enValidation,
    notifications: enNotifications,
    wallet: enWallet,
    help: enHelp,
    terms: enTerms,
    search: enSearch,
    profile: enProfile,
    home: enHome,
    labels: enLabels,
    actions: enActions,
    map: enMap
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    auth: frAuth,
    property: frProperty,
    booking: frBooking,
    admin: frAdmin,
    validation: frValidation,
    notifications: frNotifications,
    wallet: frWallet,
    help: frHelp,
    terms: frTerms,
    search: frSearch,
    profile: frProfile,
    home: frHome,
    labels: frLabels,
    actions: frActions,
    map: frMap
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    
    // Language detection configuration
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'nomad-lux-language'
    },

    interpolation: {
      escapeValue: false // React already escapes values
    },

    // Development settings
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace separation
    ns: ['common', 'navigation', 'auth', 'property', 'booking', 'admin', 'validation', 'notifications', 'wallet', 'help', 'terms', 'search', 'profile', 'home', 'labels', 'actions', 'map'],
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_'
  })

export default i18n