'use client'
import { Suspense } from "react";
import FacultyExamsPage from "../facultyExams";
import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";

export default function FacultyExams() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex justify-center items-center">
                <Loader />
            </div>
        }>
            <FacultyExamsPage />
        </Suspense>
    );
}
