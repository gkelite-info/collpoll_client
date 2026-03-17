# Profile Routing Implementation Guide

## Overview
This document describes the comprehensive profile routing system implemented across all user roles in the CollPoll application.

## Key Features

### 1. Universal Profile Access
All user roles now have access to the profile page:
- Student
- Faculty
- Admin
- College Admin
- Finance Manager
- HR
- Parent
- Super Admin
- Placement Officer

### 2. Resume Access
Resume functionality is available to all role types that can access the profile page. Previously, this was restricted to students only.

## File Structure

### Core Configuration
- `lib/helpers/profile/profileRouteConfig.ts` - Configuration for profile routes and role-based access
- `lib/helpers/navbar/routeMatchingUtils.ts` - Utilities for consistent route matching across navbars

### Components
- `app/profile/Profile.tsx` - Main profile component with profile/resume toggle
- `app/components/navbar/GenericNavbar.tsx` - Reusable navbar component

### Updated Navbar Files
All navbar files have been updated with profile routes:
- `studentNavbar.tsx`
- `adminNavbar.tsx`
- `facultyNavbar.tsx`
- `parentNavbar.tsx`
- `hrNavbar.tsx`
- `financeNavbar.tsx`
- `collegeAdminNavbar.tsx`
- `superAdminNavbar.tsx`
- `placementNav.tsx`

## How It Works

### 1. Navigation
Each navbar now includes a "Profile" menu item that routes to `/profile`:
```typescript
{
  icon: (isActive) => (
    <UserCircle size={18} weight={isActive ? "fill" : "regular"} />
  ),
  label: "Profile",
  path: "/profile",
}
```

### 2. Active Tab Detection
The navbars use Next.js `usePathname()` hook to detect the current route:
```typescript
useEffect(() => {
  const current = items.find((item) => item.path === pathname);
  if (current) setActive(current.label);
}, [pathname]);
```

When you navigate to `/profile?profile=personal-details&Step=1`, the pathname is still `/profile`, so the profile nav item remains highlighted.

### 3. Profile/Resume Toggle
The profile page includes tabs to switch between Profile and Resume modes:
```typescript
const isProfileMode = searchParams.has("profile");
const currentView = isProfileMode ? "profile" : "resume";
```

- If URL has `?profile=...`, it shows Profile mode
- If URL has `?resume=...` or no query params (with resume access), it shows Resume mode
- The toggle buttons navigate using `handleViewToggle()` which updates the query parameters

### 4. Default Behavior
When first visiting `/profile`:
- If the role can access resume (all roles), the page defaults to Resume mode
- When switching tabs, query parameters are updated: `?resume=personal-details` or `?profile=personal-details`
- The Step parameter helps track progress through multi-step forms

## Active Tab Highlighting

### How It Works
1. Each navbar item has a path (e.g., `/profile`)
2. The navbar compares the current pathname with each item's path
3. When matched, the navbar item is highlighted with:
   - Background color: `#F4F4F4`
   - Text color: `#43C17A`
   - Icon fills in
   - CSS class: `activeNav`

### Query Parameters Don't Affect Tab Highlighting
The active tab highlighting **persists** when you add query parameters because:
- `usePathname()` in Next.js returns only the path portion, not query parameters
- `/profile?profile=personal-details` has pathname `/profile`
- So the profile nav item stays active even when viewing specific profile steps

## Production Considerations

### Performance
- Route matching is done on every pathname change (efficient)
- No unnecessary re-renders due to proper useEffect dependencies
- Lazy loading of profile components handled by Suspense

### Scalability
- **GenericNavbar component**: Can be reused for new roles without duplication
- **Route matching utilities**: Centralized logic for consistent behavior
- **Profile route config**: Single source of truth for role-route mappings

### Browser Support
- Uses modern Next.js routing (works with all modern browsers)
- No special browser requirements

## Maintenance Guide

### Adding a New Role
1. Add role to `profileRouteConfig.ts` `UserRole` type
2. Update `ROLE_PROFILE_ROUTES` with route mapping
3. Create/update navbar component with profile route item
4. Import `UserCircle` icon from `@phosphor-icons/react`
5. Add profile item to navbar items array before Settings item

Example:
```typescript
// In navbar file
const items: NavItem[] = [
  // ... existing items
  {
    icon: (isActive) => (
      <UserCircle size={18} weight={isActive ? "fill" : "regular"} />
    ),
    label: "Profile",
    path: "/profile",
  },
];
```

### Customizing Route Matching
If a role needs special routing logic (like finance analytics), use the `GenericNavbar` component with custom logic:

```typescript
const customActiveLogic = (pathname: string, item: NavItem) => {
  if (pathname.startsWith("/finance/finance-analytics")) {
    return item.label === "Finance / Analytics";
  }
  return pathname === item.path;
};

<GenericNavbar items={items} customActiveLogic={customActiveLogic} />
```

### Resume Access Control
To restrict resume access to specific roles, modify `canAccessResume()` in `profileRouteConfig.ts`:

```typescript
export const canAccessResume = (role: UserRole | null | undefined): boolean => {
  const rolesWithResume = ["Student", "Faculty"];
  return rolesWithResume.includes(role as string);
};
```

## Testing Checklist

- [ ] Navigate to profile page from each role's navbar
- [ ] Verify profile nav item is highlighted
- [ ] Toggle between Profile and Resume tabs
- [ ] Verify tab highlighting persists when toggling
- [ ] Check that query parameters change correctly
- [ ] Test navigation back from profile page
- [ ] Verify active tab is still highlighted when returning

## Known Limitations

1. **Profile Route**: All roles navigate to the same `/profile` route. If role-specific profile pages are needed in the future, implement role-based routing like `/student/profile`, `/faculty/profile`, etc.

2. **Resume Component Rendering**: Resume components may not be optimized for all roles. Some components might display student-specific content. This can be fixed by:
   - Adding role checks in resume components
   - Creating role-specific resume components
   - Adding conditional field rendering based on role

## Future Improvements

1. Create role-specific profile page variants with different form fields
2. Add profile picture/avatar upload for all roles
3. Implement profile completion percentage indicator
4. Add sidebar navigation within profile page for faster tab switching
5. Cache profile data using React Query or SWR
