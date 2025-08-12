# Task List: Comprehensive Translation Verification

## Relevant Files

### Translation Files
- `src/locales/en/common.json` - Common translation keys for shared UI elements
- `src/locales/fr/common.json` - French translations for common keys
- `src/locales/en/property.json` - Property-related translations
- `src/locales/fr/property.json` - French property translations
- `src/locales/en/auth.json` - Authentication and user management translations
- `src/locales/fr/auth.json` - French auth translations
- `src/locales/en/booking.json` - Booking and reservation translations
- `src/locales/fr/booking.json` - French booking translations
- `src/locales/en/admin.json` - Admin panel translations
- `src/locales/fr/admin.json` - French admin translations
- `src/locales/en/wallet.json` - Wallet and payment translations
- `src/locales/fr/wallet.json` - French wallet translations
- `src/locales/en/notifications.json` - Notification system translations
- `src/locales/fr/notifications.json` - French notification translations
- `src/locales/en/help.json` - Help and support translations
- `src/locales/fr/help.json` - French help translations
- `src/locales/en/terms.json` - Legal and terms translations
- `src/locales/fr/terms.json` - French terms translations
- `src/locales/en/navigation.json` - Navigation and layout translations
- `src/locales/fr/navigation.json` - French navigation translations

### Configuration Files
- `src/lib/i18n.ts` - i18n initialization and namespace registration

### Page Files
- `src/pages/HelpPage.tsx` - Help page requiring translation implementation
- `src/pages/WalletPage.tsx` - Wallet page requiring translation implementation
- `src/pages/BookingRequestsPage.tsx` - Booking requests page requiring translation implementation
- `src/pages/AdminPage.tsx` - Admin page requiring translation implementation
- `src/pages/NotificationsPage.tsx` - Notifications page requiring translation implementation
- `src/pages/RegisterPage.tsx` - Register page requiring translation implementation
- `src/pages/TermsPage.tsx` - Terms page requiring translation implementation
- `src/pages/AdminLoginPage.tsx` - Admin login page requiring translation implementation
- `src/pages/AdminRegisterPage.tsx` - Admin register page requiring translation implementation

### Shared Component Files
- `src/components/shared/HomePagePropertyCard.tsx` - Property card component requiring translation
- `src/components/shared/CityPropertyCard.tsx` - City property card component requiring translation
- `src/components/shared/MyBookingCard.tsx` - Booking card component requiring translation
- `src/components/shared/BookingCalendar.tsx` - Calendar component requiring translation
- `src/components/shared/PaymentButton.tsx` - Payment button component requiring translation
- `src/components/shared/ProfileModal.tsx` - Profile modal component requiring translation
- `src/components/shared/NotificationCenter.tsx` - Notification center component requiring translation
- `src/components/shared/NotificationToast.tsx` - Notification toast component requiring translation
- `src/components/shared/PageBanner.tsx` - Page banner component requiring translation
- `src/components/shared/PopularPlaces.tsx` - Popular places component requiring translation
- `src/components/shared/FileProgressCard.tsx` - File progress card component requiring translation
- `src/components/shared/UploadProgressIndicator.tsx` - Upload progress indicator component requiring translation
- `src/components/shared/LoadingSkeleton.tsx` - Loading skeleton component requiring translation
- `src/components/shared/LoadingDebug.tsx` - Loading debug component requiring translation
- `src/components/shared/AuthTest.tsx` - Auth test component requiring translation

### Modal Component Files
- `src/components/shared/modals/BookPropertyModal.tsx` - Booking modal requiring translation
- `src/components/shared/modals/PropertyQuickViewModal.tsx` - Property quick view modal requiring translation
- `src/components/shared/modals/ContactHostModal.tsx` - Contact host modal requiring translation
- `src/components/shared/modals/SharePropertyModal.tsx` - Share property modal requiring translation
- `src/components/shared/modals/PropertyStatsModal.tsx` - Property stats modal requiring translation
- `src/components/shared/modals/PropertyEditConfirmationModal.tsx` - Property edit confirmation modal requiring translation
- `src/components/shared/modals/ProfileEditModal.tsx` - Profile edit modal requiring translation
- `src/components/shared/modals/NotificationDetailsModal.tsx` - Notification details modal requiring translation
- `src/components/shared/modals/CancelBookingModal.tsx` - Cancel booking modal requiring translation
- `src/components/shared/modals/RequestPayoutModal.tsx` - Request payout modal requiring translation

### Feature Component Files
- `src/components/features/property/PropertySubmissionForm.tsx` - Property submission form requiring translation
- `src/components/features/admin/AdminDashboard.tsx` - Admin dashboard component requiring translation
- `src/components/features/admin/UserManagement.tsx` - User management component requiring translation
- `src/components/features/admin/BookingManagement.tsx` - Booking management component requiring translation
- `src/components/features/admin/AdminHeader.tsx` - Admin header component requiring translation
- `src/components/features/admin/AdminSidebar.tsx` - Admin sidebar component requiring translation
- `src/components/features/admin/AdminStats.tsx` - Admin stats component requiring translation
- `src/components/features/admin/PropertyApproval.tsx` - Property approval component requiring translation
- `src/components/features/admin/PayoutRequestsTable.tsx` - Payout requests table component requiring translation
- `src/components/features/admin/SystemSettings.tsx` - System settings component requiring translation
- `src/components/features/admin/ActivityLog.tsx` - Activity log component requiring translation
- `src/components/features/admin/AnalyticsDashboard.tsx` - Analytics dashboard component requiring translation
- `src/components/features/admin/LocationVerificationMap.tsx` - Location verification map component requiring translation

### Layout Component Files
- `src/components/layout/Sidebar.tsx` - Sidebar component requiring translation

### Test Files
- `src/pages/HelpPage.test.tsx` - Unit tests for HelpPage translations
- `src/pages/WalletPage.test.tsx` - Unit tests for WalletPage translations
- `src/pages/BookingRequestsPage.test.tsx` - Unit tests for BookingRequestsPage translations
- `src/pages/AdminPage.test.tsx` - Unit tests for AdminPage translations
- `src/pages/NotificationsPage.test.tsx` - Unit tests for NotificationsPage translations
- `src/pages/RegisterPage.test.tsx` - Unit tests for RegisterPage translations
- `src/pages/TermsPage.test.tsx` - Unit tests for TermsPage translations
- `src/pages/AdminLoginPage.test.tsx` - Unit tests for AdminLoginPage translations
- `src/pages/AdminRegisterPage.test.tsx` - Unit tests for AdminRegisterPage translations

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.
- All translation files should be created in both English and French versions.
- Translation keys should follow hierarchical naming conventions (e.g., `buttons.save`, `messages.error`).
- Use `useTranslation` hook from 'react-i18next' in all components, not from stores.

## Tasks

- [x] 1.0 Implement Page Translations
  - [x] 1.1 Implement HelpPage.tsx translations
  - [x] 1.2 Implement WalletPage.tsx translations
  - [x] 1.3 Implement BookingRequestsPage.tsx translations
  - [x] 1.4 Implement AdminPage.tsx translations
  - [x] 1.5 Implement NotificationsPage.tsx translations
  - [x] 1.6 Implement RegisterPage.tsx translations
  - [x] 1.7 Implement TermsPage.tsx translations
  - [x] 1.8 Implement AdminLoginPage.tsx translations
  - [x] 1.9 Implement AdminRegisterPage.tsx translations

- [x] 2.0 Implement Shared Component Translations
  - [x] 2.1 Implement HomePagePropertyCard.tsx translations
  - [x] 2.2 Implement CityPropertyCard.tsx translations
  - [x] 2.3 Implement MyBookingCard.tsx translations
  - [x] 2.4 Implement BookingCalendar.tsx translations
  - [x] 2.5 Implement PaymentButton.tsx translations
  - [x] 2.6 Implement ProfileModal.tsx translations
  - [x] 2.7 Implement NotificationCenter.tsx translations
  - [x] 2.8 Implement NotificationToast.tsx translations
  - [x] 2.9 Implement PageBanner.tsx translations
  - [x] 2.10 Implement PopularPlaces.tsx translations
  - [x] 2.11 Implement FileProgressCard.tsx translations
  - [x] 2.12 Implement UploadProgressIndicator.tsx translations
  - [x] 2.13 Implement LoadingSkeleton.tsx translations
  - [x] 2.14 Implement LoadingDebug.tsx translations
  - [x] 2.15 Implement AuthTest.tsx translations

- [x] 3.0 Implement Modal Component Translations
  - [x] 3.1 Implement BookPropertyModal.tsx translations
  - [x] 3.2 Implement PropertyQuickViewModal.tsx translations
  - [x] 3.3 Implement ContactHostModal.tsx translations
  - [x] 3.4 Implement SharePropertyModal.tsx translations
  - [x] 3.5 Implement PropertyStatsModal.tsx translations
  - [x] 3.6 Implement PropertyEditConfirmationModal.tsx translations
  - [x] 3.7 Implement ProfileEditModal.tsx translations
  - [x] 3.8 Implement NotificationDetailsModal.tsx translations
  - [x] 3.9 Implement CancelBookingModal.tsx translations
  - [x] 3.10 Implement RequestPayoutModal.tsx translations

- [x] 4.0 Implement Feature Component Translations
  - [x] 4.1 Implement PropertySubmissionForm.tsx translations
  - [x] 4.2 Implement AdminDashboard.tsx translations
  - [x] 4.3 Implement UserManagement.tsx translations
  - [x] 4.4 Implement BookingManagement.tsx translations
  - [x] 4.5 Implement AdminHeader.tsx translations
  - [x] 4.6 Implement AdminSidebar.tsx translations
  - [x] 4.7 Implement AdminStats.tsx translations
  - [x] 4.8 Implement PropertyApproval.tsx translations
  - [x] 4.9 Implement PayoutRequestsTable.tsx translations
  - [x] 4.10 Implement SystemSettings.tsx translations
  - [x] 4.11 Implement ActivityLog.tsx translations
  - [x] 4.12 Implement AnalyticsDashboard.tsx translations
  - [x] 4.13 Implement LocationVerificationMap.tsx translations

- [x] 5.0 Implement Layout Component Translations
  - [x] 5.1 Implement Sidebar.tsx translations

- [ ] 6.0 Create and Update Translation Files
  - [x] 6.1 Create auth.json translation files (en/fr)
  - [x] 6.2 Create booking.json translation files (en/fr)
  - [x] 6.3 Create admin.json translation files (en/fr)
  - [x] 6.4 Create wallet.json translation files (en/fr)
  - [x] 6.5 Create notifications.json translation files (en/fr)
  - [x] 6.6 Create help.json translation files (en/fr)
  - [x] 6.7 Create terms.json translation files (en/fr)
  - [x] 6.8 Create navigation.json translation files (en/fr)
  - [x] 6.9 Verify modal translation keys exist across appropriate namespaces (no separate modals.json)
  - [x] 6.10 Verify form translation keys exist across appropriate namespaces (no separate forms.json)
  - [ ] 6.11 Update existing common.json files with new keys
  - [ ] 6.12 Update existing property.json files with new keys

- [ ] 7.0 Comprehensive Testing and Verification
  - [ ] 7.1 Manual verification for all translated pages (no new test files [[Prefers no test code]])
  - [ ] 7.2 Manual verification for all translated components (no new test files [[Prefers no test code]])
  - [x] 7.3 Verify all translation keys exist in both languages
  - [ ] 7.4 Test language switching functionality
  - [ ] 7.5 Verify no hardcoded strings remain (in progress)
  - [ ] 7.6 Test error handling for missing translations
  - [ ] 7.7 Verify proper interpolation for dynamic values
  - [ ] 7.8 Test application performance with translations

- [ ] 8.0 Quality Assurance and Optimization
  - [ ] 8.1 Review and optimize translation file structure
  - [ ] 8.2 Implement missing translation keys
  - [ ] 8.3 Ensure consistent key naming conventions
  - [ ] 8.4 Verify translation completeness across all components
  - [ ] 8.5 Optimize translation loading performance
  - [ ] 8.6 Document translation management process
  - [ ] 8.7 Final verification of all acceptance criteria 