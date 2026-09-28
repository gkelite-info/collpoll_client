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

type AssignmentFilterResult = {
  data: unknown[] | null;
  error: unknown;
};

type AssignmentFilterQuery = PromiseLike<AssignmentFilterResult> & {
  eq(column: string, value: unknown): AssignmentFilterQuery;
  is(column: string, value: null): AssignmentFilterQuery;
  gte(column: string, value: number): AssignmentFilterQuery;
  lte(column: string, value: number): AssignmentFilterQuery;
};

export function applyActiveAssignmentFilters(
  query: AssignmentFilterQuery,
  dateInt: number,
): AssignmentFilterQuery {
  return query
    .eq("status", "Active")
    .eq("is_deleted", false)
    .is("deletedAt", null)
    .gte("submissionDeadlineInt", dateInt)
    .lte("dateAssignedInt", dateInt);
}
