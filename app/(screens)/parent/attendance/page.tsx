"use client";
import { Suspense } from "react";
import ParentAttendanceClient from "./parentAttendanceClient";

export default function ParentStuAttendance() {
    return (
        <Suspense fallback={<div className="p-4">Loading attendance...</div>}>
            <ParentAttendanceClient />
        </Suspense>
    );
}
