export const meetingQueryKeys = {
  all: ['meetings'] as const,
  monthly: (collegeId: number, year: number, month: number) =>
    [...meetingQueryKeys.all, 'monthly', collegeId, year, month] as const,
  conflicts: (collegeId: number, date: string, from: string, to: string) =>
    [...meetingQueryKeys.all, 'conflicts', collegeId, date, from, to] as const,
  userMonthly: (userId: number, year: number, month: number) =>
    [...meetingQueryKeys.all, 'user', userId, year, month] as const,
};
