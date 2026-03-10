'use client'
import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import AdminMeetingsPage from "./hrMeetings";

export default function FacultyMeetings() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex justify-center items-center">
                <Loader />
            </div>
        }>
            <AdminMeetingsPage />
        </Suspense>
    );
}