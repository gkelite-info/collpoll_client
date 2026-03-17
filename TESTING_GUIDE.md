# Profile Routing - Quick Testing Guide

## 🚀 Quick Start Testing

### Test 1: Profile Access from All Roles
```
1. Login as Student → Click Profile in navbar → Should navigate to /profile
2. Login as Faculty → Click Profile in navbar → Should navigate to /profile
3. Login as Admin → Click Profile in navbar → Should navigate to /profile
4. Login as HR → Click Profile in navbar → Should navigate to /profile
5. Login as Finance Manager → Click Profile in navbar → Should navigate to /profile
6. Login as College Admin → Click Profile in navbar → Should navigate to /profile
7. Login as Parent → Click Profile in navbar → Should navigate to /profile
8. Login as Super Admin → Click Profile in navbar → Should navigate to /profile
9. Login as Placement → Click Profile in navbar → Should navigate to /profile
```

### Test 2: Active Tab Highlighting
```
1. From Student dashboard, click Profile
2. Verify Background turns white (#F4F4F4)
3. Verify Text turns green (#43C17A)
4. Verify all other nav items remain white
5. Click any other nav item → Profile becomes white again
6. Click Profile again → Profile becomes green again
```

### Test 3: Resume/Profile Toggle
```
1. Navigate to /profile
2. Should see tabs: "Resume / Profile" (or just "Profile" if no resume access)
3. Click Resume tab → URL becomes /profile?resume=personal-details&Step=1
4. Verify Profile nav item is STILL highlighted
5. Click Profile tab → URL becomes /profile?profile=personal-details&Step=1
6. Verify Profile nav item is STILL highlighted (important!)
```

### Test 4: Query Parameters Persistence
```
1. Navigate to /profile
2. URL might show: /profile?resume=personal-details&Step=1
3. Click on Education in Resume stepper
4. URL becomes: /profile?resume=education&Step=2
5. Go back to dashboard (click another nav item, then click Profile again)
6. Verify you return to /profile with correct state
```

### Test 5: Navigation Consistency
```
1. Start on home page (other nav item is active)
2. Click Profile → Profile becomes active
3. Click Resume tab, toggle through steps
4. Navigate to other page, then Profile again
5. Verify Profile is still the active nav item
```

## ✅ What Should NOT Break

- [ ] Existing profile data persistence
- [ ] Resume components functionality
- [ ] Navigation to other pages
- [ ] User context and role detection
- [ ] Query parameter handling
- [ ] Step tracking in multi-step forms

## 🔍 Verification Checklist

- [ ] All 9 navbar files have UserCircle icon imported
- [ ] All 9 navbar files have Profile nav item
- [ ] Profile.tsx imports canAccessResume
- [ ] Profile.tsx uses showResumeTabs instead of role === "Student"
- [ ] profileRouteConfig.ts has all roles mapped
- [ ] Documentation updated with new routing

## 📊 Browser DevTools Testing

### Check NavBar Active State:
```javascript
// In browser console
// Should show .activeNav class applied to Profile nav item
document.querySelector('div.activeNav')

// Should show the Profile label text
document.querySelector('div.activeNav p').textContent // "Profile"
```

### Check URL Pattern:
```javascript
// Navigate to /profile
window.location.pathname // "/profile"
window.location.search // "?resume=personal-details&Step=1" or similar
```

### Check Component Rendering:
```javascript
// Should see both Resume and Profile tabs (for roles with resume access)
document.querySelector('span:contains("Resume")') // exists
document.querySelector('span:contains("Profile")') // exists

// For roles without resume access
document.querySelector('span:contains("Resume")') // should not exist
document.querySelector('span:contains("Profile")') // exists
```

## 🐛 Troubleshooting

### Issue: Profile nav item not highlighting
**Check:**
1. Is ProfileClient component rendering?
2. Is usePathname() returning "/profile"?
3. Are query parameters being added correctly?
4. Check browser console for errors

### Issue: Resume tab not appearing
**Check:**
1. Is canAccessResume(role) returning true?
2. Is showResumeTabs variable true?
3. Are resume components properly imported?
4. Check that role is properly loaded from UserContext

### Issue: Active state disappears when toggling tabs
**Check:**
1. Verify pathname is still "/profile" after toggle
2. Query parameters should not affect pathname matching
3. Check useEffect dependencies in navbar

## 🎯 Performance Checklist

- [ ] No infinite re-renders
- [ ] useEffect has proper dependencies
- [ ] Route matching is efficient (O(n) where n = number of nav items)
- [ ] No memory leaks in useEffect cleanup
- [ ] Navigate between pages smoothly without lag

## 📝 Notes

- Profile page is shared across all roles (no role-specific /student/profile, /faculty/profile, etc.)
- This simplifies maintenance but may need role-specific resume components in future
- Active tab highlighting works because usePathname() returns pathname without query params
- All roles default to Resume mode on first visit (if they have resume access)
