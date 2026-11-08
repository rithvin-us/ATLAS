# Profile and Settings Pages - Implementation Guide

## Overview

This implementation provides comprehensive Profile and Settings pages for both Agent and Contractor roles, following enterprise-grade UX principles with clear separation of concerns between "Who I Am" (Profile) and "How the App Works for Me" (Settings).

## Files Created

### Agent Pages
- **Profile**: `src/app/agent/profile/page.tsx`
- **Settings**: `src/app/agent/settings/page.tsx`

### Contractor Pages
- **Profile**: `src/app/contractor/profile/page.tsx`
- **Settings**: `src/app/contractor/settings/page.tsx`

### Shared Authentication Updates
- **Auth Helper**: `src/lib/auth.ts` (added `getUserProfile` and `updateUserProfile` functions)

## Features Implemented

### 📋 Profile Page - "Who I Am"

Both Agent and Contractor profiles include:

#### Common Features
- **Read-only + Limited Edit View**: Clean card-based layout with edit mode toggle
- **Basic Information Section**:
  - Display Name (editable)
  - Email (read-only, marked with badge)
  - Phone Number (editable)
  - Role (read-only, system-controlled)
  - Account Creation Date (read-only)
- **Save/Cancel Actions**: Clear buttons with loading states
- **Validation & Error Handling**: Defensive checks with friendly error messages
- **Success Feedback**: Temporary success messages after updates

#### Agent-Specific Features
- **Organization Profile**: Display of organization ID/name
- **Activity Overview**:
  - Projects Created count
  - RFQs Posted count
  - Verification Status badge

#### Contractor-Specific Features
- **Company Information**: Company name, location, industry
- **Credibility Score Card**:
  - Overall score (out of 100) with visual indicators
  - Breakdown of performance factors:
    - Project Completion
    - Timely Delivery
    - Quality Rating
    - Compliance Score
  - Progress bars for each factor
- **Activity Overview**:
  - Projects Completed count
  - Active Projects count
  - Verification Status badge
- **Specialties Section**: Display of contractor expertise areas

### ⚙️ Settings Page - "How the App Works for Me"

Both Agent and Contractor settings include:

#### Security Section
- **Password Management**:
  - Current password verification with re-authentication
  - New password with confirmation
  - Password visibility toggles (eye icons)
  - Minimum 6-character validation
  - Proper error handling for incorrect passwords

#### Notifications Section
- **Email Notifications**: Master toggle for email alerts
- **Category-Specific Alerts**:
  - **Agent**: RFQ Updates, Bid Notifications, Invoice Alerts
  - **Contractor**: RFQ Alerts, Auction Notifications, Project Updates, Invoice Alerts
- **Confirmation Dialog**: All notification changes require confirmation to prevent accidental changes

#### Display Preferences Section
- **Dark Mode Toggle**: Light/Dark theme switch (ready for implementation)
- **Language Selection**: Dropdown with English, Spanish, French options

## Technical Implementation

### Authentication & Data Flow

```typescript
// Auth helper functions
getUserProfile(uid: string)      // Fetches user profile from Firestore
updateUserProfile(uid, updates)  // Updates safe fields (displayName, phone)
```

### Security Features

1. **Re-authentication for Password Changes**: Uses Firebase's `reauthenticateWithCredential` before allowing password updates
2. **Field-Level Access Control**: 
   - Editable fields: Display Name, Phone Number
   - Read-only fields: Email, Role, Organization, Account Creation Date
   - System-controlled badges clearly mark non-editable fields

3. **Confirmation Dialogs**: Sensitive changes (like notification preferences) require explicit confirmation

### Data Fetching

The pages use parallel data fetching for optimal performance:

```typescript
// Agent Profile
const [profileData, projects] = await Promise.all([
  getUserProfile(user.uid),
  fetchProjects(user.uid)
]);

// Contractor Profile
const [profileData, vendorData, credibilityData, projects] = await Promise.all([
  getUserProfile(user.uid),
  fetchContractorProfile(user.uid),
  fetchContractorCredibility(user.uid),
  fetchContractorProjects(user.uid)
]);
```

### Responsive Design

- **Desktop**: Full card layout with grid columns
- **Mobile**: Stacked layout with responsive breakpoints
- **Navigation**: Accessible via profile dropdown in the header

## UX & Safety Features

### ✅ Implemented UX Requirements

1. **Card-Based Layout**: Clean sections with headers and helper text
2. **Icons**: Consistent Lucide icons for visual guidance
3. **Loading States**: Skeleton loaders during data fetch
4. **Empty States**: Defensive checks with error alerts for missing data
5. **Success/Error Feedback**: Clear alert messages with auto-dismiss
6. **Responsive Design**: Mobile-first with desktop enhancements
7. **Accessibility**: Proper labels, ARIA attributes, keyboard navigation

### 🔒 Safety & Validation

1. **Runtime Error Prevention**:
   - Null checks for user data
   - Default values for missing fields
   - Error boundaries with user-friendly messages

2. **Input Validation**:
   - Phone number format (type="tel")
   - Password minimum length (6 characters)
   - Password confirmation matching
   - Trim whitespace from inputs

3. **Non-Breaking Changes**:
   - No modification to existing routes
   - Reuses existing API functions
   - Auth flow remains unchanged
   - No breaking changes to auth methods

## Navigation Integration

Profile and Settings are accessible via the **profile dropdown** in the navigation bar:

1. Click the user avatar in the top-right corner
2. Dropdown menu shows:
   - User email
   - **Profile** link (navigates to `/agent/profile` or `/contractor/profile`)
   - **Settings** link (navigates to `/agent/settings` or `/contractor/settings`)
   - Logout button

## Usage Examples

### Accessing Profile Page
```
Agent: https://your-app.com/agent/profile
Contractor: https://your-app.com/contractor/profile
```

### Accessing Settings Page
```
Agent: https://your-app.com/agent/settings
Contractor: https://your-app.com/contractor/settings
```

### Updating Profile
1. Navigate to Profile page
2. Click "Edit Profile" button
3. Modify Display Name or Phone Number
4. Click "Save" (with loading indicator)
5. Success message appears
6. Profile data reloads with updated values

### Changing Password
1. Navigate to Settings page
2. Enter current password
3. Enter new password (min 6 chars)
4. Confirm new password
5. Click "Update Password"
6. Re-authentication happens automatically
7. Success message confirms change

### Managing Notifications
1. Navigate to Settings page
2. Toggle any notification switch
3. Confirmation dialog appears
4. Click "Confirm" to apply change
5. Success message appears

## Best Practices Followed

1. **Separation of Concerns**: Profile (identity) vs Settings (preferences)
2. **Progressive Disclosure**: Edit mode only when needed
3. **Clear Visual Hierarchy**: Section headers, cards, helper text
4. **Defensive Programming**: Null checks, error handling, fallbacks
5. **User Feedback**: Loading states, success messages, error alerts
6. **Enterprise-Grade UX**: Professional layout, consistent design, clear labels
7. **Mobile-First**: Responsive design with touch-friendly targets
8. **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## Future Enhancements

The implementation is ready for:

1. **Dark Mode**: Theme toggle is in place, just needs theme provider integration
2. **Language Switching**: Dropdown exists, ready for i18n implementation
3. **Active Sessions**: UI structure ready for session management API
4. **Profile Pictures**: Avatar component can be enhanced with image upload
5. **Notification Persistence**: Current state is in-memory, can be persisted to Firestore

## Testing Checklist

- [ ] Agent can view profile
- [ ] Agent can edit display name and phone
- [ ] Contractor can view profile with credibility score
- [ ] Contractor specialties display correctly
- [ ] Password change works with re-authentication
- [ ] Password validation prevents weak passwords
- [ ] Notification toggles show confirmation dialog
- [ ] Settings page shows correct role-specific alerts
- [ ] Mobile responsive layout works
- [ ] Loading states display during data fetch
- [ ] Error states show friendly messages
- [ ] Success messages auto-dismiss after 3 seconds
- [ ] Navigation dropdown links work correctly

## Support

For questions or issues, refer to:
- Firebase Authentication docs for password management
- Firestore docs for data structure
- Component library (shadcn/ui) for UI patterns
