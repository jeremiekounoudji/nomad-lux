# Task List: Comprehensive Translation Verification

## Relevant Files

- `blueprints/translation-blueprint.md` - Source of truth for translation patterns and implementation guidelines.
- `blueprints/translation-implementation-summary.md` - Progress tracking and current implementation state documentation.
- `src/lib/stores/translationStore.ts` - Custom translation store that all components must use.
- `src/lib/i18n.ts` - i18next configuration with all namespaces.
- `src/locales/en/*.json` - English translation files for all namespaces.
- `src/locales/fr/*.json` - French translation files for all namespaces.
- `src/pages/*.tsx` - All page components that need translation verification.
- `src/components/shared/*.tsx` - Shared components requiring translation verification.
- `src/components/shared/modals/*.tsx` - Modal components requiring translation verification.
- `src/components/features/*/*.tsx` - Feature-specific components requiring translation verification.
- `src/components/layout/*.tsx` - Layout components requiring translation verification.
- `src/components/map/*.tsx` - Map components requiring translation verification.
- `src/components/ui/*.tsx` - UI components requiring translation verification.

### Notes

- All components must use the custom translation store instead of react-i18next directly.
- Translation keys must follow the DOT format for cross-namespace calls (e.g., `t('property.myListings')`).
- All translation keys must exist in both English and French files.
- No hardcoded strings should remain in any component.
- Progress must be documented in the translation implementation summary.
- Read all the file you want tu check,identify all the ussues and then apply the fixes for all the issues one after another
-if a file content is more than 800 line, check if its possible to refactor it by for example moving the exact code of modals or some part of the ui as a separate component for better structure as we did usually (on HomePage.tsx for example). do this before check the page translations. **mAKE SURE THE NEW EXTRACTED COMPONENT IS  THE EXACT SET OF CODE FROM THE MAIN FILE**

## Tasks

- [x] 1.0 Setup and Preparation
  - [x] 1.1 Review translation blueprint and implementation summary
  - [x] 1.2 Create verification checklist template
  - [x] 1.3 Set up progress tracking in implementation summary
  - [x] 1.4 Identify all components and pages to verify
  - [ ] 1.5 Create backup of current working state

- [x] 2.0 Page Components Verification
  - [x] 2.1 Verify HomePage.tsx translation implementation
  - [x] 2.2 Verify PropertyDetailPage.tsx translation implementation
  - [x] 2.3 Verify SearchPage.tsx translation implementation
  - [x] 2.4 Verify MyListingsPage.tsx translation implementation
  - [x] 2.5 Verify MyBookingsPage.tsx translation implementation
  - [x] 2.6 Verify LikedPropertiesPage.tsx translation implementation
  - [x] 2.7 Verify CreatePropertyPage.tsx translation implementation
  - [x] 2.8 Verify BookingRequestsPage.tsx translation implementation
  - [x] 2.9 Verify LoginPage.tsx translation implementation
  - [x] 2.10 Verify RegisterPage.tsx translation implementation
  - [x] 2.11 Verify WalletPage.tsx translation implementation
  - [x] 2.12 Verify NotificationsPage.tsx translation implementation
  - [x] 2.13 Verify HelpPage.tsx translation implementation
  - [x] 2.14 Verify TermsPage.tsx translation implementation
  - [x] 2.15 Verify AdminPage.tsx translation implementation
  - [x] 2.16 Verify AdminLoginPage.tsx translation implementation
  - [x] 2.17 Verify AdminRegisterPage.tsx translation implementation

- [ ] 3.0 Shared Components Verification
  - [x] 3.1 Verify PageBanner.tsx translation implementation
  - [x] 3.2 Verify PropertyCard.tsx translation implementation
  - [x] 3.3 Verify HomePagePropertyCard.tsx translation implementation
  - [x] 3.4 Verify CityPropertyCard.tsx translation implementation
  - [x] 3.5 Verify PopularPlaces.tsx translation implementation
  - [x] 3.6 Verify NotificationCenter.tsx translation implementation
  - [x] 3.7 Verify NotificationToast.tsx translation implementation
  - [x] 3.8 Verify LoadingSkeleton.tsx translation implementation
  - [x] 3.9 Verify LanguageSelector.tsx translation implementation
  - [x] 3.10 Verify MyBookingCard.tsx translation implementation
  - [x] 3.11 Verify BookingCalendar.tsx translation implementation
  - [x] 3.12 Verify PaymentButton.tsx translation implementation
  - [x] 3.13 Verify ProfileModal.tsx translation implementation
  - [x] 3.14 Verify FileProgressCard.tsx translation implementation
  - [x] 3.15 Verify UploadProgressIndicator.tsx translation implementation
  - [x] 3.16 Verify LoadingDebug.tsx translation implementation
  - [x] 3.17 Verify AuthTest.tsx translation implementation

- [ ] 4.0 Modal Components Verification
  - [x] 4.1 Verify BookPropertyModal.tsx translation implementation
  - [x] 4.2 Verify PropertyQuickViewModal.tsx translation implementation
  - [x] 4.3 Verify ContactHostModal.tsx translation implementation
  - [x] 4.4 Verify SharePropertyModal.tsx translation implementation
  - [x] 4.5 Verify PropertyStatsModal.tsx translation implementation
  - [x] 4.6 Verify PropertyEditConfirmationModal.tsx translation implementation
  - [x] 4.7 Verify ProfileEditModal.tsx translation implementation
  - [x] 4.8 Verify NotificationDetailsModal.tsx translation implementation
  - [x] 4.9 Verify CancelBookingModal.tsx translation implementation
  - [x] 4.10 Verify RequestPayoutModal.tsx translation implementation

- [x] 5.0 Feature Components Verification
  - [x] 5.1 Verify PropertySubmissionForm.tsx translation implementation
  - [x] 5.2 Verify PropertySubmissionForm steps components translation implementation
  - [x] 5.3 Verify AdminDashboard.tsx translation implementation
  - [x] 5.4 Verify AdminHeader.tsx translation implementation
  - [x] 5.5 Verify AdminSidebar.tsx translation implementation
  - [x] 5.6 Verify AdminStats.tsx translation implementation
  - [x] 5.7 Verify PropertyApproval.tsx translation implementation
  - [x] 5.8 Verify UserManagement.tsx translation implementation
  - [x] 5.9 Verify BookingManagement.tsx translation implementation
  - [x] 5.10 Verify PayoutRequestsTable.tsx translation implementation
  - [x] 5.11 Verify SystemSettings.tsx translation implementation
  - [x] 5.12 Verify ActivityLog.tsx translation implementation
  - [x] 5.13 Verify AnalyticsDashboard.tsx translation implementation
  - [x] 5.14 Verify LocationVerificationMap.tsx translation implementation
  - [x] 5.15 Verify AdminPropertiesMap.tsx translation implementation
  - [x] 5.16 Verify PropertyDistributionMap.tsx translation implementation
  - [x] 5.17 Verify AdminMapToolbar.tsx translation implementation
  - [x] 5.18 Verify HostBookingManagement.tsx translation implementation
  - [x] 5.19 Verify PaymentCheckout.tsx translation implementation
  - [x] 5.20 Verify CityPropertiesView.tsx translation implementation
  - [x] 5.21 Verify SearchFilters.tsx translation implementation
  - [x] 5.22 Verify PropertiesMap.tsx translation implementation
  - [x] 5.23 Verify MapToggle.tsx translation implementation
  - [x] 5.24.1 Verify PaymentRecordDetailsModal.tsx translation implementation
  - [x] 5.24.2 Verify UserActivationModal.tsx translation implementation
  - [x] 5.24.3 Verify UserDeletionModal.tsx translation implementation
  - [x] 5.24.4 Verify UserSuspensionModal.tsx translation implementation
  - [x] 5.24.5 Verify BulkUserActionsModal.tsx translation implementation
  - [x] 5.24.6 Verify SendMessageModal.tsx translation implementation
  - [x] 5.24.7 Verify DisputeManagementModal.tsx translation implementation
  - [x] 5.24.8 Verify RefundModal.tsx translation implementation
  - [ ] 5.24.9 Verify ContactPartiesModal.tsx translation implementation
  - [ ] 5.24.10 Verify BookingDetailsModal.tsx translation implementation
  - [ ] 5.24.11 Verify PropertyDetailsModal.tsx translation implementation
  - [ ] 5.24.12 Verify ApproveRejectPayoutModal.tsx translation implementation
  - [ ] 5.24.13 Verify PropertySuspensionModal.tsx translation implementation
  - [ ] 5.24.14 Verify PropertyRejectionModal.tsx translation implementation
  - [ ] 5.24.15 Verify PropertyApprovalModal.tsx translation implementation
  - [ ] 5.24.16 Verify BulkSuspendModal.tsx translation implementation
  - [ ] 5.24.17 Verify BulkActionModal.tsx translation implementation
  - [ ] 5.24.18 Verify ImageLightboxModal.tsx translation implementation

- [ ] 6.0 Layout and Map Components Verification
  - [ ] 6.1 Verify MainLayout.tsx translation implementation
  - [ ] 6.2 Verify Sidebar.tsx translation implementation
  - [ ] 6.3 Verify MapContainer.tsx translation implementation
  - [ ] 6.4 Verify PropertiesMap.tsx translation implementation
  - [ ] 6.5 Verify PropertyMap.tsx translation implementation
  - [ ] 6.6 Verify PropertyMarker.tsx translation implementation
  - [ ] 6.7 Verify MapToggle.tsx translation implementation
  - [ ] 6.8 Verify MapLoadingState.tsx translation implementation
  - [ ] 6.9 Verify MapErrorState.tsx translation implementation
  - [ ] 6.10 Verify LazyMapWrapper.tsx translation implementation
  - [ ] 6.11 Verify MapMeasurementTools.tsx translation implementation
  - [ ] 6.12 Verify DirectionsButton.tsx translation implementation
  - [ ] 6.13 Verify VirtualizedMarkerRenderer.tsx translation implementation
  - [ ] 6.14 Verify AdminMarkerStyles.tsx translation implementation
  - [ ] 6.15 Verify AdminPropertyMarker.tsx translation implementation

- [ ] 7.0 UI Components Verification
  - [ ] 7.1 Verify all components in src/components/ui/ directory
  - [ ] 7.2 Check for any hardcoded strings in UI components
  - [ ] 7.3 Ensure UI components use proper translation patterns

- [ ] 8.0 Translation File Verification
  - [ ] 8.1 Verify all translation keys exist in both English and French files
  - [ ] 8.2 Check for missing translation keys across all namespaces
  - [ ] 8.3 Verify proper key structure in JSON files
  - [ ] 8.4 Add any missing translation keys to appropriate files

- [ ] 9.0 Final Verification and Documentation
  - [ ] 9.1 Test language switching functionality across all components
  - [ ] 9.2 Verify no "dot words" appear in UI
  - [ ] 9.3 Check for console errors related to translations
  - [ ] 9.4 Update translation implementation summary with final status
  - [ ] 9.5 Document any issues found and their resolutions
  - [ ] 9.6 Verify all acceptance criteria are met
  - [ ] 9.7 Create final verification report 