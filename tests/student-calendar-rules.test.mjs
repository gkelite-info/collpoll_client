import assert from "node:assert/strict";
import test from "node:test";

import {
  applyActiveAssignmentFilters,
  buildFacultyClassSessionInsert,
  isStudentClassVisible,
} from "../lib/helpers/calendar/studentCalendarRules.ts";

test("student calendar includes classes that have not created a session row yet", () => {
  assert.equal(isStudentClassVisible([]), true);
});

test("student calendar includes scheduled and accepted sessions but excludes cancelled sessions", () => {
  assert.equal(isStudentClassVisible([{ status: "scheduled", createdAt: "2026-09-26T05:00:00Z" }]), true);
  assert.equal(isStudentClassVisible([{ status: "accepted", createdAt: "2026-09-26T06:00:00Z" }]), true);
  assert.equal(isStudentClassVisible([{ status: "cancel", createdAt: "2026-09-26T07:00:00Z" }]), false);
});

test("class creation builds a faculty session row using only columns present in the schema", () => {
  assert.deepEqual(
    buildFacultyClassSessionInsert({
      calendarEventId: 95,
      facultyId: 48,
      collegeRoomId: 3,
      now: "2026-09-26T05:52:12.918Z",
    }),
    {
      calendarEventId: 95,
      facultyId: 48,
      collegeRoomId: 3,
      status: "scheduled",
      acceptedAt: "00:00:00",
      is_deleted: false,
      createdAt: "2026-09-26T05:52:12.918Z",
      updatedAt: "2026-09-26T05:52:12.918Z",
      deletedAt: null,
    },
  );
});

test("assignment query uses only the valid Active enum and the selected-date range", () => {
  const calls = [];
  const query = new Proxy({}, {
    get(_target, method) {
      return (...args) => {
        calls.push([method, ...args]);
        return query;
      };
    },
  });

  applyActiveAssignmentFilters(query, 20260926);

  assert.deepEqual(calls, [
    ["eq", "status", "Active"],
    ["eq", "is_deleted", false],
    ["is", "deletedAt", null],
    ["gte", "submissionDeadlineInt", 20260926],
    ["lte", "dateAssignedInt", 20260926],
  ]);
});
