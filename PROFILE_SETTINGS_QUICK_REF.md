# Profile & Settings Pages - Quick Reference

## 📍 Routes

### Agent
- Profile: `/agent/profile`
- Settings: `/agent/settings`

### Contractor
- Profile: `/contractor/profile`
- Settings: `/contractor/settings`

## 🎯 Access
Both pages are accessible via the **profile dropdown** (top-right avatar icon) in the navigation bar.

## ✨ Key Features

### Profile Page
- ✏️ **Editable**: Display Name, Phone Number
- 🔒 **Read-only**: Email, Role, Organization, Account Created Date
- 📊 **Agent Stats**: Projects Created, RFQs Posted
- 🏆 **Contractor Stats**: Credibility Score (with breakdown), Projects Completed, Specialties

### Settings Page
- 🔐 **Security**: Password change with re-authentication
- 🔔 **Notifications**: Email and category-specific alerts with confirmation dialogs
- 🎨 **Display**: Dark mode toggle, Language selection

## 🛠️ Technical Details

### New Files Created
```
src/app/agent/profile/page.tsx
src/app/agent/settings/page.tsx
src/app/contractor/profile/page.tsx
src/app/contractor/settings/page.tsx
```

### Modified Files
```
src/lib/auth.ts (added getUserProfile, updateUserProfile, UserProfile type)
src/app/agent/layout.tsx (linked Settings in dropdown)
```

### API Functions Added
```typescript
getUserProfile(uid: string): Promise<UserProfile | null>
updateUserProfile(uid: string, updates: { displayName?: string; phone?: string })
```

## 🔒 Security Features
- Re-authentication required for password changes
- Field-level access control (editable vs read-only)
- Confirmation dialogs for sensitive changes
- Input validation (password length, trimming whitespace)

## ✅ Responsive Design
- Mobile-first approach
- Card-based layout
- Touch-friendly buttons
- Responsive grid columns

## 🚀 Quick Test
1. Login as Agent or Contractor
2. Click avatar icon (top-right)
3. Select "Profile" or "Settings"
4. Try editing display name
5. Try changing password
6. Toggle notification preferences

## 📖 Full Documentation
See `PROFILE_SETTINGS_IMPLEMENTATION.md` for comprehensive guide.
