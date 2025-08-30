# Translation Testing Guide for Tutorial System

## Overview
This document provides testing instructions for the translation functionality in the tutorial system.

## What Was Implemented

### Translation Files
- **English**: `src/locales/en/tutorial.json` - Complete English translations
- **French**: `src/locales/fr/tutorial.json` - Complete French translations

### Translation Integration
- **TutorialModal**: All UI text now uses translation keys
- **TutorialStep**: Step titles, descriptions, and image alt text use translations
- **TutorialProgress**: Progress indicators and labels use translations
- **Analytics**: Analytics event messages use translations

### Analytics Integration
- **TutorialAnalytics**: Analytics utility functions for tracking tutorial events
- **Event Tracking**: Start, step completion, skip, finish, and preference events
- **Console Logging**: Comprehensive logging with translated messages

## Manual Testing Instructions

### Prerequisites
1. Ensure the application is running (`npm run dev`)
2. Clear browser local storage to simulate a first-time user
3. Have a test user account ready

### Test Scenarios

#### Test 1: English Translation
1. **Set Language to English**: Ensure the application language is set to English
2. **Trigger Tutorial**: Login and navigate to homepage to trigger tutorial
3. **Verify English Text**: Check that all tutorial text appears in English:
   - Modal title: "Welcome to Nomad Lux"
   - Step titles: "Booking Properties", "Property Creation", etc.
   - Button labels: "Next", "Previous", "Skip", "Finish Tutorial"
   - Progress indicators: "Step X of Y"
   - Preferences: "Don't show this tutorial again"

#### Test 2: French Translation
1. **Set Language to French**: Change the application language to French
2. **Trigger Tutorial**: Login and navigate to homepage to trigger tutorial
3. **Verify French Text**: Check that all tutorial text appears in French:
   - Modal title: "Bienvenue sur Nomad Lux"
   - Step titles: "Réservation de propriétés", "Création de propriété", etc.
   - Button labels: "Suivant", "Précédent", "Passer", "Terminer le tutoriel"
   - Progress indicators: "Étape X sur Y"
   - Preferences: "Ne plus afficher ce tutoriel"

#### Test 3: Analytics Translation
1. **Open Browser Console**: Open developer tools console
2. **Trigger Tutorial Events**: Complete tutorial steps and actions
3. **Verify Translated Logs**: Check console for translated analytics messages:
   - English: "Tutorial started", "Step X completed", "Tutorial finished"
   - French: "Tutoriel commencé", "Étape X terminée", "Tutoriel terminé"

#### Test 4: Dynamic Language Switching
1. **Start Tutorial in English**: Begin tutorial in English
2. **Switch to French**: Change language while tutorial is open
3. **Verify Text Updates**: Check that tutorial text updates to French
4. **Switch Back to English**: Change language back to English
5. **Verify Text Updates**: Check that tutorial text updates to English

### Translation Keys Tested

#### Modal Content
- `tutorial.title` - Modal title
- `tutorial.stepCounter` - Step counter text
- `tutorial.actions.previous` - Previous button
- `tutorial.actions.next` - Next button
- `tutorial.actions.finish` - Finish button
- `tutorial.actions.skip` - Skip button
- `tutorial.preferences.neverShowAgain` - Never show again checkbox

#### Step Content
- `tutorial.steps.bookingProperties.title` - Step 1 title
- `tutorial.steps.bookingProperties.description` - Step 1 description
- `tutorial.steps.propertyCreation.title` - Step 2 title
- `tutorial.steps.propertyCreation.description` - Step 2 description
- `tutorial.steps.managingSelfBookings.title` - Step 3 title
- `tutorial.steps.managingSelfBookings.description` - Step 3 description
- `tutorial.steps.bookingRequests.title` - Step 4 title
- `tutorial.steps.bookingRequests.description` - Step 4 description

#### Progress Indicators
- `tutorial.progress.label` - Progress label
- `tutorial.progress.stepIndicator` - Step indicator
- `tutorial.progress.percentage` - Percentage complete

#### Analytics Messages
- `tutorial.analytics.started` - Tutorial started message
- `tutorial.analytics.stepCompleted` - Step completed message
- `tutorial.analytics.skipped` - Tutorial skipped message
- `tutorial.analytics.finished` - Tutorial finished message
- `tutorial.analytics.neverShowAgain` - Never show again message

### Expected Behavior

#### Translation Loading
- Translation files should load correctly on application start
- No console errors related to missing translation keys
- Fallback to key name if translation is missing

#### Language Switching
- Tutorial text should update immediately when language changes
- No broken layout or text overflow issues
- Maintain proper text alignment and spacing

#### Analytics Integration
- Console logs should show translated messages
- Analytics events should be tracked correctly
- No errors in analytics tracking

### Troubleshooting

#### Translation Not Loading
1. Check browser console for i18n errors
2. Verify translation files exist in correct locations
3. Check translation key format (DOT format)

#### Text Not Updating
1. Verify language change is working in other parts of the app
2. Check if tutorial components are re-rendering
3. Verify translation keys are correct

#### Analytics Issues
1. Check console for analytics errors
2. Verify analytics utility is imported correctly
3. Check translation keys for analytics messages

## Files Modified
- `src/locales/en/tutorial.json` - English translations
- `src/locales/fr/tutorial.json` - French translations
- `src/utils/tutorialContent.ts` - Updated to use translation keys
- `src/components/shared/TutorialModal.tsx` - Added analytics integration
- `src/components/shared/TutorialStep.tsx` - Added translation support
- `src/utils/tutorialAnalytics.ts` - Analytics utility functions

## Notes
- All translation keys follow the DOT format (e.g., `tutorial.title`)
- Analytics events are logged to console with translated messages
- Translation system integrates seamlessly with existing i18n setup
- Fallback behavior ensures app doesn't break if translations are missing
