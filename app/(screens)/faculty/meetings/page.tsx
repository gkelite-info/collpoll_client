'use client'
import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import FacultyMeetingsPage from "./facultyMeetings";

export default function FacultyMeetings() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex justify-center items-center">
                <Loader />
            </div>
        }>
            <FacultyMeetingsPage />
        </Suspense>
    );
}