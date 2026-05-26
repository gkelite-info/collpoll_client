'use client';
import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import WellbeingMeetingsPage from "./WellbeingMeetings";

export default function MeetingsPage() {
  return (
    <Suspense fallback={
        <div className="h-screen w-full flex justify-center items-center">
            <Loader />
        </div>
    }>
        <WellbeingMeetingsPage />
    </Suspense>
  );
}
