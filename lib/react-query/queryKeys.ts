/**
 * Factory for all React Query keys.
 * Using a centralized factory ensures consistent keys and prevents typos.
 * It's structured by domain (e.g., users, admin, faculty, applications).
 */
export const queryKeys = {
  // ---------------------------------------------------------
  // USERS DOMAIN (General Users)
  // ---------------------------------------------------------
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // ---------------------------------------------------------
  // APPLICATIONS / LEADS DOMAIN
  // ---------------------------------------------------------
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.applications.lists(), { filters }] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
    
    // KPI Data specific to applications
    kpis: () => [...queryKeys.applications.all, 'kpis'] as const,
    kpi: (filters: Record<string, any>) => [...queryKeys.applications.kpis(), { filters }] as const,
    
    recent: () => [...queryKeys.applications.all, 'recent'] as const,
    recentList: (limit: number, filters: Record<string, any>) => [...queryKeys.applications.recent(), { limit, filters }] as const,
  },

  // ---------------------------------------------------------
  // ADMIN DASHBOARD DOMAIN
  // ---------------------------------------------------------
  admin: {
    all: ['admin'] as const,
    analytics: () => [...queryKeys.admin.all, 'analytics'] as const,
    settings: () => [...queryKeys.admin.all, 'settings'] as const,
    academicSetup: (collegeId: number) => [...queryKeys.admin.all, 'academicSetup', collegeId] as const,
    modalInitialData: (collegeId: number) => [...queryKeys.admin.all, 'modalInitialData', collegeId] as const,
    sessionOptions: (collegeId: number) => [...queryKeys.admin.all, 'sessionOptions', collegeId] as const,
    adminEducations: (adminId: number) => [...queryKeys.admin.all, 'adminEducations', adminId] as const,
  },

  // ---------------------------------------------------------
  // FACULTY DOMAIN
  // ---------------------------------------------------------
  faculty: {
    all: ['faculty'] as const,
    courses: () => [...queryKeys.faculty.all, 'courses'] as const,
    schedules: () => [...queryKeys.faculty.all, 'schedules'] as const,
  },

  // ---------------------------------------------------------
  // STUDENT DOMAIN
  // ---------------------------------------------------------
  student: {
    all: ['student'] as const,
    profile: (studentId: string) => [...queryKeys.student.all, 'profile', studentId] as const,
    grades: (studentId: string) => [...queryKeys.student.all, 'grades', studentId] as const,
    attendance: (studentId: string) => [...queryKeys.student.all, 'attendance', studentId] as const,
  },
};
