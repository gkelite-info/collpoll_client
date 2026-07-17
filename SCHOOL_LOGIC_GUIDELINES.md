# School UI & Logic Guidelines

This document outlines the standard rules and approaches for implementing School-specific UI changes within the Tekton Campus platform, specifically for the School Admin role.

## Golden Rule
**Never delete or break existing College logic.** 
All School-specific modifications must be wrapped conditionally so they only apply when the institution is verified as a School. 

## 1. School Identity Verification
To verify if the current institution is a school, use one of the following methods:

**Client-Side (React Components):**
```tsx
// Method 1: Using the specialized context (Preferred for deeply nested components)
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

const { collegeEducationType } = useCollegeAdmin();
const isSchool = isSchoolEducation(collegeEducationType);

// Method 2: Reading the cookie directly (Best for instant, non-flickering renders like Layouts or Headers)
const isSchoolStr = typeof document !== 'undefined'
  ? document.cookie.split("; ").find((row) => row.startsWith("isSchool="))?.split("=")[1]
  : null;
const isSchool = isSchoolStr === "true";
```

**Server-Side (API Routes & Middleware):**
```typescript
import { cookies } from "next/headers";
const cookieStore = cookies();
const isSchool = cookieStore.get("isSchool")?.value === "true";
```

## 2. Dynamic Labelling
Any static text or table header displaying the word "College" must dynamically switch to "School" when `isSchool` is true.

- **Example**: 
  `<h2>{isSchool ? "School Settings" : "College Settings"}</h2>`
- **Example Table Header**: 
  `<th>{isSchool ? "School Branch" : "College Branch"}</th>`

## 3. Component Hiding Rules
Schools operate on a different structural hierarchy than colleges (e.g., Nursery to 10th vs Degrees and Semesters). 

When rendering tables, forms, or filters, apply the following hiding rules:
- **Hide Branch Types / Degree Types**: Schools do not use degrees.
- **Hide Semesters**: Schools use Terms or Academic Years. Hide any dropdowns or table headers related to Semesters if `isSchool` is true.

```tsx
{/* Example: Hiding a Semester Filter */}
{!isSchool && (
  <div className="filter-group">
    <label>Select Semester</label>
    <SemesterDropdown />
  </div>
)}
```

## 4. Preventing UI Flicker (Loading States)
When a component heavily relies on the `isSchool` flag to determine its entire layout (such as `admin/academic-setup`), you must prevent the component from rendering the "College" UI while the context is fetching.

Always use the `loading` flag from the context provider to show a loading skeleton or spinner before rendering the form fields.

```tsx
const { collegeEducationType, loading } = useAdmin();
const isSchool = isSchoolEducation(collegeEducationType);

if (loading) {
  return <Spinner text="Loading options..." />;
}

return (
  <div>
    {/* Safe to render conditional UI here without flickering */}
    {isSchool ? <SchoolForm /> : <CollegeForm />}
  </div>
);
```
