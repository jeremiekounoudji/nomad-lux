# Translation Verification Checklist Template

## Component Verification Checklist

### File: `[COMPONENT_PATH]`

#### 1. Translation Store Usage ✅/❌
- [ ] Uses `import { useTranslation } from '../lib/stores/translationStore'`
- [ ] Does NOT use `react-i18next` directly
- [ ] Does NOT use hardcoded strings

#### 2. Namespace Declaration ✅/❌
- [ ] Uses correct namespace(s) in `useTranslation` hook
- [ ] Single namespace: `useTranslation('namespace')`
- [ ] Multiple namespaces: `useTranslation(['namespace1', 'namespace2'])`

#### 3. Translation Key Format ✅/❌
- [ ] Uses DOT format for cross-namespace calls: `t('namespace.key')`
- [ ] Uses explicit namespace format: `t('namespace:key')`
- [ ] Does NOT use colon format that causes "dot words": `t('namespace:key')`

#### 4. Translation Key Verification ✅/❌
- [ ] All translation keys exist in English file (`src/locales/en/[namespace].json`)
- [ ] All translation keys exist in French file (`src/locales/fr/[namespace].json`)
- [ ] No missing translation keys

#### 5. UI Verification ✅/❌
- [ ] No "dot words" appear in UI (raw translation keys)
- [ ] All text displays properly in English
- [ ] All text displays properly in French
- [ ] Language switching works correctly
- [ ] No console errors related to translations

#### 6. Specific Patterns Check ✅/❌
- [ ] Page banners use: `t('namespace.pageTitle')` and `t('common.pageBanner.pageName')`
- [ ] Buttons use: `t('namespace.buttons.action')`
- [ ] Tabs use: `t('namespace.tabs.tabName')`
- [ ] Messages use: `t('namespace.messages.messageType')`

## Issues Found
- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

## Actions Taken
- [ ] Action 1: [Description]
- [ ] Action 2: [Description]

## Status
- [ ] ✅ PASSED - All checks passed
- [ ] ⚠️ WARNING - Minor issues found and fixed
- [ ] ❌ FAILED - Major issues found, needs attention

## Notes
[Additional notes about the verification]

---

## Verification Summary

### Files Verified: [COUNT]
### Files Passed: [COUNT]
### Files with Warnings: [COUNT]
### Files Failed: [COUNT]

### Common Issues Found:
- [ ] Hardcoded strings
- [ ] Incorrect translation store import
- [ ] Missing translation keys
- [ ] "Dot words" in UI
- [ ] Console errors
- [ ] Incorrect namespace usage

### Translation Keys Added:
- [ ] Key 1: [namespace.key] - [Description]
- [ ] Key 2: [namespace.key] - [Description]

### Files Modified:
- [ ] File 1: [Description of changes]
- [ ] File 2: [Description of changes]
