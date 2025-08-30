# Product Requirements Document: Review System

## 1. Introduction/Overview

The Review System is a comprehensive feedback mechanism that allows users to share their experiences and helps build trust within the Nomad Lux platform. This system enables guests to review properties and hosts, while hosts can review guests, creating a two-way feedback loop that improves the overall booking experience and platform credibility.

**Problem Statement:** Users currently lack a way to share their experiences or make informed decisions based on others' experiences, which reduces trust and engagement on the platform.

**Goal:** Implement a complete review system that facilitates honest feedback, builds trust, and helps users make informed booking decisions.

## 2. Goals

1. **Enable Comprehensive Feedback**: Allow both guests and hosts to leave detailed reviews about their experiences
2. **Build Platform Trust**: Create transparency through honest, verified reviews
3. **Improve Decision Making**: Help users make informed booking decisions based on authentic feedback
4. **Enhance User Experience**: Provide multiple review opportunities with appropriate timing
5. **Maintain Data Integrity**: Ensure review authenticity through booking verification

## 3. User Stories

### Guest Stories
- **As a guest**, I want to review a property and host after my stay so that I can share my experience and help other users
- **As a guest**, I want to see reviews from other guests so that I can make informed booking decisions
- **As a guest**, I want to leave reviews at multiple times so that I can provide both immediate and reflective feedback

### Host Stories
- **As a host**, I want to review guests after their stay so that I can help other hosts make informed decisions
- **As a host**, I want to see reviews of my property so that I can understand guest satisfaction and improve my offering
- **As a host**, I want to see guest reviews so that I can assess potential guests before accepting bookings

### Platform Stories
- **As the platform**, I want to collect authentic reviews so that I can build trust and credibility
- **As the platform**, I want to display aggregated ratings so that users can quickly assess quality

## 4. Functional Requirements

### 4.1 Review Creation
1. The system must allow guests to create reviews for properties and hosts after booking completion
2. The system must allow hosts to create reviews for guests after booking completion
3. The system must support multiple review types: guest-to-host, host-to-guest, and property-specific reviews
4. The system must require a star rating (1-5 stars) for all reviews
5. The system must allow text reviews (minimum 10 characters, maximum 1000 characters)
6. The system must enable reviews at multiple time points: immediately after completion and with a reminder after 7 days
7. The system must limit reviews to one per booking per review type
8. The system must verify that the user has completed a booking before allowing review creation

### 4.2 Review Display
1. The system must display reviews on property detail pages
2. The system must show reviews in a simple list format with newest reviews first
3. The system must display the reviewer's name and review date
4. The system must show the star rating prominently
5. The system must display the review text below the rating
6. The system must indicate the review type (guest review, host review, property review)

### 4.3 Review Aggregation
1. The system must calculate and display average ratings for properties
2. The system must calculate and display average ratings for hosts and guests
3. The system must show total review counts alongside average ratings
4. The system must update ratings in real-time when new reviews are added

### 4.4 Review Management
1. The system must allow users to edit their own reviews within 30 days of creation
2. The system must allow users to delete their own reviews within 30 days of creation
3. The system must prevent users from reviewing the same booking multiple times
4. The system must automatically update user rating statistics when reviews are added/modified/deleted

### 4.5 Review Verification
1. The system must only allow reviews from users who have completed bookings
2. The system must verify booking completion status before allowing review creation
3. The system must prevent self-reviews (hosts reviewing their own properties)

## 5. Non-Goals (Out of Scope)

1. **Review Moderation**: No manual or automated review moderation system
2. **Host Responses**: Hosts cannot respond to reviews
3. **Review Incentives**: No rewards or incentives for leaving reviews
4. **Advanced Filtering**: No complex filtering or sorting options beyond basic chronological order
5. **Review Photos**: No photo upload functionality in reviews
6. **Review Categories**: No specific rating categories (cleanliness, communication, etc.)
7. **Review Helpfulness**: No voting system for review helpfulness
8. **Review Management Pages**: No dedicated review management interfaces beyond property detail pages

## 6. Design Considerations

### 6.1 UI/UX Requirements
- Use existing Hero UI components for consistency
- Implement star rating component using Hero UI Rating component
- Follow existing color scheme and typography
- Ensure mobile-responsive design
- Use existing modal patterns for review creation

### 6.2 Translation Requirements
**CRITICAL: Follow established translation blueprint pattern**

#### Translation Store Usage
- **ALWAYS** use custom translation store: `import { useTranslation } from '../lib/stores/translationStore'`
- **NEVER** use `react-i18next` directly in components
- **NEVER** use hardcoded strings

#### Translation Namespace Structure
```typescript
// Review-specific namespace
const { t } = useTranslation(['review', 'common'])

// Use DOT format for cross-namespace calls (WORKING PATTERN)
t('review.createReview')           // ✅ Correct
t('review.rating.stars')           // ✅ Correct
t('common.buttons.submit')         // ✅ Cross-namespace call
t('common.messages.success')       // ✅ Cross-namespace call
```

#### Required Translation Files
```
src/locales/
├── en/
│   ├── review.json              // NEW: Review-specific translations
│   └── common.json              // UPDATED: Add review-related common keys
└── fr/
    ├── review.json              // NEW: Review-specific translations
    └── common.json              // UPDATED: Add review-related common keys
```

#### Review Translation Keys Structure
```json
// review.json
{
  "createReview": "Create Review",
  "editReview": "Edit Review",
  "deleteReview": "Delete Review",
  "rating": {
    "title": "Rating",
    "stars": "{{count}} stars",
    "outOf": "out of 5",
    "excellent": "Excellent",
    "good": "Good",
    "average": "Average",
    "poor": "Poor",
    "terrible": "Terrible"
  },
  "reviewText": {
    "label": "Review",
    "placeholder": "Share your experience...",
    "minLength": "Minimum 10 characters",
    "maxLength": "Maximum 1000 characters",
    "charCount": "{{count}}/1000 characters"
  },
  "reviewType": {
    "guestToHost": "Guest to Host",
    "hostToGuest": "Host to Guest",
    "property": "Property Review"
  },
  "reviews": {
    "title": "Reviews",
    "noReviews": "No reviews yet",
    "beFirst": "Be the first to review this property",
    "totalReviews": "{{count}} reviews",
    "averageRating": "{{rating}} average rating",
    "newestFirst": "Newest first",
    "oldestFirst": "Oldest first"
  },
  "reviewCard": {
    "by": "by {{name}}",
    "on": "on {{date}}",
    "verified": "Verified stay",
    "helpful": "Helpful",
    "report": "Report"
  },
  "modals": {
    "createTitle": "Write a Review",
    "editTitle": "Edit Your Review",
    "deleteTitle": "Delete Review",
    "deleteMessage": "Are you sure you want to delete this review?",
    "success": "Review submitted successfully",
    "error": "Error submitting review",
    "editSuccess": "Review updated successfully",
    "deleteSuccess": "Review deleted successfully"
  },
  "validation": {
    "ratingRequired": "Please select a rating",
    "textRequired": "Please write a review",
    "textMinLength": "Review must be at least 10 characters",
    "textMaxLength": "Review cannot exceed 1000 characters",
    "alreadyReviewed": "You have already reviewed this booking",
    "bookingNotCompleted": "You can only review completed bookings",
    "cannotReviewSelf": "You cannot review your own property"
  },
  "timing": {
    "immediate": "Review now",
    "reminder": "Remind me later",
    "reminderSent": "Review reminder sent",
    "expired": "Review period has expired"
  }
}
```

#### Common Translation Keys (common.json additions)
```json
{
  "buttons": {
    "submitReview": "Submit Review",
    "editReview": "Edit Review",
    "deleteReview": "Delete Review",
    "cancelReview": "Cancel",
    "saveReview": "Save Changes"
  },
  "messages": {
    "reviewSubmitted": "Review submitted successfully",
    "reviewUpdated": "Review updated successfully",
    "reviewDeleted": "Review deleted successfully",
    "reviewError": "Error processing review"
  },
  "labels": {
    "rating": "Rating",
    "review": "Review",
    "reviews": "Reviews",
    "verifiedStay": "Verified stay"
  }
}
```

#### Translation Implementation Pattern
```typescript
// Component example following blueprint pattern
import { useTranslation } from '../lib/stores/translationStore'

const ReviewForm: React.FC = () => {
  const { t } = useTranslation(['review', 'common'])
  
  return (
    <div>
      <h2>{t('review.createReview')}</h2>
      <label>{t('review.rating.title')}</label>
      <textarea 
        placeholder={t('review.reviewText.placeholder')}
        maxLength={1000}
      />
      <span>{t('review.reviewText.charCount', { count: textLength })}</span>
      <button>{t('common.buttons.submitReview')}</button>
    </div>
  )
}
```

### 6.3 Review Creation Flow
- Trigger review creation through booking completion notifications
- Provide clear, simple review form with star rating and text area
- Show character count for text reviews
- Provide clear success/error feedback

### 6.4 Review Display Design
- Show reviews in card format with clear visual hierarchy
- Display star ratings prominently with visual stars
- Use consistent spacing and typography
- Show review metadata (date, reviewer type) clearly

## 7. Technical Considerations

### 7.1 Database Schema
- Implement the `reviews` table as defined in the documentation
- Create proper indexes for efficient querying
- Use the existing rating update triggers for automatic statistics updates
- Ensure referential integrity with bookings and users tables

### 7.2 Translation Implementation
- **CRITICAL**: Follow translation blueprint pattern exactly
- Create `review.json` translation files for both English and French
- Update `common.json` with review-related common keys
- Use custom translation store: `import { useTranslation } from '../lib/stores/translationStore'`
- Use DOT format for cross-namespace calls: `t('review.createReview')`
- **NEVER** use hardcoded strings in any review components
- Test all translations in both English and French before deployment

### 7.3 Integration Points
- Integrate with existing booking system for completion verification
- Use existing authentication system for user verification
- Leverage existing notification system for review reminders
- Integrate with existing property and user interfaces

### 7.4 Performance Considerations
- Implement pagination for review lists
- Cache aggregated ratings for performance
- Use efficient queries for review statistics
- Consider lazy loading for large review lists

## 8. Success Metrics

1. **Review Participation Rate**: 60% of completed bookings result in at least one review
2. **Review Quality**: Average review length of 50+ characters
3. **User Engagement**: 20% increase in property detail page time-on-page
4. **Trust Indicators**: 15% increase in booking conversion for properties with reviews
5. **Data Completeness**: 80% of active properties have at least one review within 3 months

## 9. Open Questions

1. **Review Timing**: Should there be a minimum time requirement between booking completion and review creation?
2. **Review Anonymity**: Should reviewers be completely anonymous or show partial names?
3. **Review Verification**: Should the system verify that users actually stayed at the property?
4. **Review Expiration**: Should there be a time limit after booking completion for leaving reviews?
5. **Review Notifications**: How frequently should review reminders be sent?
6. **Review Analytics**: What specific metrics should be tracked for admin dashboard?

## 10. Implementation Phases

### Phase 1: Core Review System
- Database schema implementation
- Basic review creation functionality
- Review display on property pages
- Rating aggregation
- **Translation implementation**: Create review.json files and update common.json
- **Translation testing**: Verify all review components use translation store correctly

### Phase 2: Enhanced Features
- Multiple review types (guest-to-host, host-to-guest, property)
- Review editing and deletion
- Review verification improvements
- Performance optimizations

### Phase 3: Analytics & Monitoring
- Review analytics dashboard
- Success metrics tracking
- User behavior analysis
- System performance monitoring

---

**Document Version:** 1.0  
**Created:** [Current Date]  
**Last Updated:** [Current Date]  
**Status:** Ready for Implementation
