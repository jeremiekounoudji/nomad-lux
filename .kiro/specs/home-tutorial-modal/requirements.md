# Requirements Document

## Introduction

This feature adds an interactive tutorial modal to the home page that guides new users through understanding the platform's core functionality. The tutorial will showcase the four main user journeys: booking properties, creating properties, managing bookings, and handling booking requests. This onboarding experience will help users quickly understand how to navigate and use the Nomad Lux platform effectively.

## Requirements

### Requirement 1

**User Story:** As a new user visiting the home page, I want to see an optional tutorial that explains the platform's main features, so that I can quickly understand how to use Nomad Lux effectively.

#### Acceptance Criteria

1. WHEN a user visits the home page for the first time THEN the system SHALL display a tutorial modal automatically
2. WHEN a user has previously completed or dismissed the tutorial THEN the system SHALL NOT display the tutorial modal automatically
3. WHEN a user clicks outside the modal or presses the escape key THEN the system SHALL close the tutorial modal
4. WHEN a user completes the tutorial THEN the system SHALL remember this preference and not show the tutorial again

### Requirement 2

**User Story:** As a user viewing the tutorial, I want to navigate through four distinct steps that explain different platform features, so that I can learn about booking, property creation, booking management, and request handling.

#### Acceptance Criteria

1. WHEN the tutorial modal opens THEN the system SHALL display step 1 of 4 showing how to book properties
2. WHEN a user clicks the "Next" button THEN the system SHALL advance to the next tutorial step
3. WHEN a user clicks the "Previous" button THEN the system SHALL go back to the previous tutorial step
4. WHEN a user is on step 1 THEN the system SHALL disable the "Previous" button
5. WHEN a user is on step 4 THEN the system SHALL show "Get Started" instead of "Next" button
6. WHEN a user clicks "Get Started" on the final step THEN the system SHALL close the tutorial and mark it as completed

### Requirement 3

**User Story:** As a user navigating the tutorial, I want to see visual indicators of my progress and rich content for each step, so that I can easily understand where I am in the tutorial and what each feature does.

#### Acceptance Criteria

1. WHEN viewing any tutorial step THEN the system SHALL display a full-width image relevant to that step's content
2. WHEN viewing any tutorial step THEN the system SHALL display a clear title and description for that step
3. WHEN viewing the tutorial THEN the system SHALL show progress dots indicating the current step and total steps
4. WHEN a user clicks on a progress dot THEN the system SHALL navigate directly to that tutorial step
5. WHEN displaying tutorial content THEN the system SHALL use appropriate translations based on the user's language preference

### Requirement 4

**User Story:** As a user, I want the tutorial content to be properly translated and accessible, so that I can understand the tutorial regardless of my language preference or accessibility needs.

#### Acceptance Criteria

1. WHEN the tutorial displays THEN the system SHALL use the translation blueprint pattern with explicit namespace format
2. WHEN the tutorial displays THEN the system SHALL load translations from the 'tutorial' namespace
3. WHEN the tutorial displays THEN the system SHALL support both English and French languages
4. WHEN the tutorial displays THEN the system SHALL include proper alt text for all images
5. WHEN the tutorial displays THEN the system SHALL be keyboard navigable for accessibility
6. WHEN the tutorial displays THEN the system SHALL have proper ARIA labels for screen readers

### Requirement 5

**User Story:** As a returning user, I want the option to access the tutorial again if needed, so that I can refresh my knowledge of the platform features.

#### Acceptance Criteria

1. WHEN a user has completed the tutorial THEN the system SHALL provide a way to access the tutorial again from the home page
2. WHEN a user manually opens the tutorial THEN the system SHALL start from step 1
3. WHEN a user manually opens the tutorial THEN the system SHALL allow them to navigate through all steps normally
4. WHEN a user closes the manually opened tutorial THEN the system SHALL NOT change their completion status