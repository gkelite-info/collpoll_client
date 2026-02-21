'use client'
import { Suspense } from "react";
import { Loader } from "../calendar/right/timetable";
import StudentMeetingsPage from "./studentMeetings";

export default function StudentMeetings() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex justify-center items-center">
                <Loader />
            </div>
        }>
            <StudentMeetingsPage />
        </Suspense>
    );
}