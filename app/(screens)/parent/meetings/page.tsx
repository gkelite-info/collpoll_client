'use client'
import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import ParentMeetingsPage from "./parentMeetings";

export default function ParentMeetings() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex justify-center items-center">
                <Loader />
            </div>
        }>
            <ParentMeetingsPage />
        </Suspense>
    );
}