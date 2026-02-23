'use client'
import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import AdminMeetingsPage from "./adminMeetings";

export default function StudentMeetings() {
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