"use client";
import { Suspense } from "react";
import AttendanceClient from "./attendanceClient";

export default function Attendance() {
  return (
    <Suspense fallback={<div className="p-4">Loading attendance...</div>}>
      <AttendanceClient />
    </Suspense>
  );
}
