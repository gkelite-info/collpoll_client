'use client'
import { Suspense } from "react";
import { Loader } from "../../(student)/calendar/right/timetable";
import FacultyExamsPage from "./facultyExams";

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
