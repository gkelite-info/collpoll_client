export const ROLES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super-Admin",
  COLLEGE_ADMIN: "College-Admin",
  FINANCE: "Finance",
  FINANCE_MANAGER: "FinanceManager",
  ACCOUNTANT: "Accountant",
  HR: "HR",
  PLACEMENT: "Placement",
  PARENT: "Parent",
  WELLBEING_EXECUTIVE: "WellbeingExecutive",
  WELLBEING_MANAGER: "WellbeingManager",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

const matchesRouteSegment = (pathname: string, route: string): boolean => {
  return pathname === route || pathname.startsWith(route + "/");
};



export const PUBLIC_ROUTES = [
  "/",
  "/landing_page",
  "/privacy-policy",
  "/login",
  "/forgot-password",
  "/reset-password",
];


export const AUTH_ONLY_ROUTES = [
  "/",
  "/landing_page",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];



export const PROTECTED_ROUTES = [
  "/student",
  "/admin",
  "/faculty",
  "/super-admin",
  "/college-admin",
  "/finance",
  "/finance-manager",
  "/accountant",
  "/hr",
  "/placement",
  "/parent",
  "/wellbeing-executive",
  "/wellbeing-manager",
  "/profile",
];



export const EXEMPTED_ROUTES = [
  "/construction",
  "/api",
  "/_next",
];



export const ROLE_PROTECTED_PORTALS = [
  "/admin",
  "/faculty",
  "/super-admin",
  "/college-admin",
  "/finance-manager",
  "/finance",
  "/accountant",
  "/hr",
  "/placement",
  "/parent",
  "/wellbeing-executive",
  "/wellbeing-manager",
];



export const LEGACY_STUDENT_ROUTES = [
  "/stu_dashboard",
  "/attendance",
  "/academics",
  "/calendar",
  "/assignments",
  "/projects",
  "/student-progress",
  "/stu_placements",
  "/meetings",
  "/drive",
  "/payments",
  "/settings",
  "/clubs",
  "/leaveRequests",
  "/wellbeing"
];



export const AUTH_PROTECTED_ROUTES = [
  "/profile",
  "/settings",
  "/notifications",
  "/help",
];



export const ROLE_LANDING_PAGES: Record<UserRole, string> = {
  [ROLES.STUDENT]: "/stu_dashboard",
  [ROLES.FACULTY]: "/faculty",
  [ROLES.ADMIN]: "/admin",
  [ROLES.SUPER_ADMIN]: "/super-admin",
  [ROLES.COLLEGE_ADMIN]: "/college-admin",
  [ROLES.FINANCE]: "/finance",
  [ROLES.FINANCE_MANAGER]: "/finance-manager",
  [ROLES.ACCOUNTANT]: "/accountant",
  [ROLES.HR]: "/hr",
  [ROLES.PLACEMENT]: "/placement",
  [ROLES.PARENT]: "/parent",
  [ROLES.WELLBEING_EXECUTIVE]: "/wellbeing-executive",
  [ROLES.WELLBEING_MANAGER]: "/wellbeing-manager",
};



export const ROLE_PORTALS = Object.values(ROLE_LANDING_PAGES);



// export const isPublicRoute = (pathname: string): boolean => {
//   return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
// };

export const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") {
      return pathname === "/";
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
};



export const isAuthOnlyRoute = (pathname: string): boolean => {
  return AUTH_ONLY_ROUTES.some((route) => matchesRouteSegment(pathname, route));
};



export const isProtectedRoute = (pathname: string): boolean => {
  // return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublicRoute(pathname)) return false;
  if (isExemptedRoute(pathname)) return false;

  return true;
};

export const isLegacyStudentRoute = (pathname: string): boolean => {
  return LEGACY_STUDENT_ROUTES.some((route) => {
    if (route === "*") return false;
    return matchesRouteSegment(pathname, route);
  });
};



export const isExemptedRoute = (pathname: string): boolean => {
  const staticFileRegex = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|css|js)$/i;
  if (staticFileRegex.test(pathname)) return true;
  return EXEMPTED_ROUTES.some((route) => pathname.includes(route));
};



export const isRolePortalPath = (pathname: string, role: UserRole): boolean => {
  const landingPage = ROLE_LANDING_PAGES[role];
  return matchesRouteSegment(pathname, landingPage);
};



export const getLandingPageForRole = (role: UserRole | null): string => {
  if (!role || !ROLE_LANDING_PAGES[role]) {
    return "/login";
  }
  return ROLE_LANDING_PAGES[role];
};



export const normalizeRole = (role: string | null): UserRole | null => {
  if (!role) return null;

  const roleMap: Record<string, UserRole> = {
    student: ROLES.STUDENT,
    faculty: ROLES.FACULTY,
    admin: ROLES.ADMIN,
    "super-admin": ROLES.SUPER_ADMIN,
    superadmin: ROLES.SUPER_ADMIN,
    "college-admin": ROLES.COLLEGE_ADMIN,
    collegeadmin: ROLES.COLLEGE_ADMIN,
    finance: ROLES.FINANCE,
    financemanager: ROLES.FINANCE_MANAGER,
    "finance-manager": ROLES.FINANCE_MANAGER,
    "finance manager": ROLES.FINANCE_MANAGER,
    accountant: ROLES.ACCOUNTANT,
    hr: ROLES.HR,
    collegehr: ROLES.HR,
    placementofficer: ROLES.PLACEMENT,
    parent: ROLES.PARENT,
    wellbeingexecutive: ROLES.WELLBEING_EXECUTIVE,
    "wellbeing-executive": ROLES.WELLBEING_EXECUTIVE,
    "wellbeing executive": ROLES.WELLBEING_EXECUTIVE,
    wellbeingmanager: ROLES.WELLBEING_MANAGER,
    "wellbeing-manager": ROLES.WELLBEING_MANAGER,
    "wellbeing manager": ROLES.WELLBEING_MANAGER,
  };

  return roleMap[role.toLowerCase().trim()] || null;
};



export const isValidRole = (role: unknown): role is UserRole => {
  return Object.values(ROLES).includes(role as UserRole);
};



export const needsRolePortalProtection = (pathname: string): boolean => {
  // return ROLE_PROTECTED_PORTALS.some((portal) => pathname.startsWith(portal));
  const isSpecificPortal = ROLE_PROTECTED_PORTALS.some((portal) => matchesRouteSegment(pathname, portal));
  const isLegacyRoute = isLegacyStudentRoute(pathname);

  return (
    isSpecificPortal ||
    isLegacyRoute ||
    (!isPublicRoute(pathname) && !isAuthProtectedRoute(pathname))
  );
};



export const isAuthProtectedRoute = (pathname: string): boolean => {
  return AUTH_PROTECTED_ROUTES.some((route) => matchesRouteSegment(pathname, route));
};
