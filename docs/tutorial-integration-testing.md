# Tutorial Integration Testing Guide

## Overview
This document provides manual testing instructions for the tutorial integration with the HomePage component.

## What Was Implemented

### HomePage Integration
- **Tutorial Imports**: Added tutorial-related imports to HomePage component
- **Tutorial State**: Added local state management for tutorial modal visibility
- **Trigger Logic**: Implemented useEffect to check for first-time user visits
- **Modal Integration**: Added TutorialModal component to HomePage JSX structure
- **User Preference Checking**: Integrated with useTutorial hook for preference management

### Key Features
- **First-time User Detection**: Checks if user has never seen the tutorial before
- **Authentication Check**: Only shows tutorial for authenticated users
- **Homepage Context**: Only triggers on the main homepage view
- **State Management**: Properly manages tutorial visibility state

## Manual Testing Instructions

### Prerequisites
1. Ensure the application is running (`npm run dev`)
2. Clear browser local storage to simulate a first-time user
3. Have a test user account ready

### Test Scenarios

#### Test 1: First-time Authenticated User
1. **Clear Browser Data**: Clear all browser data (localStorage, sessionStorage, cookies)
2. **Navigate to Homepage**: Go to the application homepage
3. **Login**: Sign in with a test user account
4. **Expected Result**: Tutorial modal should appear automatically
5. **Verify Navigation**: Test the tutorial navigation (Next, Previous, Skip buttons)
6. **Verify Close**: Test closing the tutorial modal

#### Test 2: Returning User
1. **Complete Tutorial**: Complete the tutorial in Test 1
2. **Refresh Page**: Refresh the browser page
3. **Expected Result**: Tutorial should NOT appear again
4. **Verify State**: Check that user preference is saved

#### Test 3: Unauthenticated User
1. **Clear Browser Data**: Clear all browser data
2. **Navigate to Homepage**: Go to the application homepage without logging in
3. **Expected Result**: Tutorial should NOT appear
4. **Login**: Sign in with a test user account
5. **Expected Result**: Tutorial should appear (first-time user)

#### Test 4: "Never Show Again" Preference
1. **Start Tutorial**: Begin the tutorial
2. **Check "Never Show Again"**: Check the "Never show again" checkbox
3. **Complete Tutorial**: Complete the tutorial
4. **Clear Browser Data**: Clear browser data
5. **Login Again**: Sign in with the same user
6. **Expected Result**: Tutorial should NOT appear due to preference

### Console Logging
The integration includes comprehensive console logging. Check the browser console for:
- `🎓 Checking tutorial trigger conditions`
- `🎓 Triggering tutorial for first-time user`
- `🎓 Tutorial modal closed`

### Files Modified
- `src/pages/HomePage.tsx` - Added tutorial integration

### Integration Points
- **useTutorial Hook**: For tutorial state management and preferences
- **TutorialModal Component**: For displaying tutorial content
- **tutorialContent Utility**: For loading tutorial step data
- **Authentication System**: For user authentication checks

## Expected Behavior

### Tutorial Trigger Conditions
- User must be authenticated (`isAuthenticated: true`)
- User must not be loading (`isLoading: false`)
- User must be on homepage (`currentPage === 'home'`)
- Tutorial should not have been shown before (`!tutorialState.hasBeenShown`)
- Tutorial should not be currently visible (`!tutorialState.isVisible`)

### Tutorial State Management
- Tutorial modal visibility is managed locally in HomePage component
- Tutorial state is managed globally via useTutorial hook
- User preferences are persisted via tutorialStore

### Error Handling
- Graceful handling of tutorial state changes
- No errors when tutorial components are not available
- Proper cleanup when component unmounts

## Troubleshooting

### Tutorial Not Appearing
1. Check browser console for error messages
2. Verify user is authenticated
3. Check if tutorial has been shown before
4. Verify tutorial components are properly imported

### Tutorial Appearing Multiple Times
1. Check user preference storage
2. Verify tutorial completion tracking
3. Check for localStorage clearing issues

### Performance Issues
1. Check tutorial image loading
2. Verify tutorial content is optimized
3. Monitor component re-renders

## Notes
- The tutorial integration is designed to be non-intrusive
- User preferences are respected and persisted
- The integration follows the existing code patterns in the project
- All tutorial functionality is properly integrated with the authentication system
