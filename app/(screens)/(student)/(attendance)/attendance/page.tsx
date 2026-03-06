"use client";
import { Suspense } from "react";
import AttendanceClient from "./attendanceClient";
import { Loader } from "../../calendar/right/timetable";

export default function Attendance() {
  return (
    <Suspense fallback={<div className="p-4"><Loader/></div>}>
      <AttendanceClient />
    </Suspense>
  );
}
