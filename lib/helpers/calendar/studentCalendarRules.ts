export type FacultyClassSession = {
  status?: string | null;
  createdAt?: string | null;
};

export function isStudentClassVisible(sessions: FacultyClassSession[]) {
  if (sessions.length === 0) return true;

  const latest = [...sessions].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime(),
  )[0];

  return !["cancel", "cancelled", "rejected"].includes(
    latest.status?.toLowerCase() ?? "scheduled",
  );
}

export function buildFacultyClassSessionInsert(params: {
  calendarEventId: number;
  facultyId: number;
  collegeRoomId: number | null;
  now: string;
}) {
  return {
    calendarEventId: params.calendarEventId,
    facultyId: params.facultyId,
    collegeRoomId: params.collegeRoomId,
    status: "scheduled",
    acceptedAt: "00:00:00",
    is_deleted: false,
    createdAt: params.now,
    updatedAt: params.now,
    deletedAt: null,
  };
}

type AssignmentFilterQuery<TQuery> = {
  eq(column: string, value: unknown): TQuery;
  is(column: string, value: null): TQuery;
  gte(column: string, value: number): TQuery;
  lte(column: string, value: number): TQuery;
};

export function applyActiveAssignmentFilters<
  TQuery extends AssignmentFilterQuery<TQuery>,
>(
  query: TQuery,
  dateInt: number,
): TQuery {
  return query
    .eq("status", "Active")
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .gte("submissionDeadlineInt", dateInt)
    .lte("dateAssignedInt", dateInt);
}
