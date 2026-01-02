"use client"

import { useState, useEffect } from "react"
import AssignmentCard from "./components/card";
import { supabase } from "@/lib/supabaseClient";

export default function AssignmentsLeft() {

    const [activeView, setActiveView] = useState<"active" | "previous">("active");

    const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
    const [previousAssignments, setPreviousAssignments] = useState<any[]>([]);

    useEffect(() => {
        fetchAssignments();
    }, []);

    async function fetchAssignments() {
        // 1. Fetch ALL assignments of ALL faculty
        const { data, error } = await supabase
            .from("faculty_assignments")
            .select("*")
            .order("submissionDeadlineInt", { ascending: true });

        if (error) {
            console.error("FETCH ERROR:", error);
            return;
        }

        // 🔹 Extract unique faculty IDs
        const facultyIds = [...new Set(data.map(a => a.facultyId))];

        // 🔹 Fetch faculty names from users table
        const { data: facultyUsers, error: facultyErr } = await supabase
            .from("users")
            .select("userId, fullName")
            .in("userId", facultyIds);

        if (facultyErr) {
            console.error("FACULTY FETCH ERROR:", facultyErr);
        }

        // 🔹 Create a lookup map: { 32: "Vamshi Vadla" }
        const facultyMap = Object.fromEntries(
            (facultyUsers || []).map(f => [f.userId, f.fullName])
        );

        // 2. Convert today into YYYYMMDD int format
        const todayInt = Number(formatDateToInt(new Date()));

        // 3. Transform rows for UI
        const formatted = data.map((a) => ({
            assignmentId: a.assignmentId,
            facultyId: a.facultyId,
            status: a.status,
            image: "/ds.jpg",
            title: a.assignmentTitle,
            description: a.topicName,
            fromDate: convertIntToShow(a.dateAssignedInt),
            toDate: convertIntToShow(a.submissionDeadlineInt),

            // ⭐ REPLACED → professor: "Faculty"
            professor: facultyMap[a.facultyId] || "Faculty",

            marksScored: null,
            marksTotal: a.totalMarks,
            toDateInt: a.submissionDeadlineInt,
        }));

        setActiveAssignments(formatted); // show all
        setPreviousAssignments([]);      // no previous
    }

    function convertIntToShow(intVal: number) {
        if (!intVal) return "";
        const s = intVal.toString();  // 20250301

        const year = s.slice(0, 4);
        const month = s.slice(4, 6);
        const day = s.slice(6, 8);

        return `${day}/${month}/${year}`; // DD/MM/YYYY
    }


    function formatDateToInt(date: Date) {
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    }

    return (
        <>
            <div className="w-[68%] p-2 flex flex-col">
                <div className="mb-4">
                    <h1 className="text-[#282828] font-bold text-2xl mb-1">Assignments</h1>
                    <p className="text-[#282828]">View, Track, and Submit Your Work With Ease</p>
                </div>

                <div className="w-full flex flex-col">
                    <div className="flex gap-4 pb-1">
                        <h5
                            className={`
                                text-xs cursor-pointer pb-1
                                ${activeView === "active"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                }
                            `}
                            onClick={() => setActiveView("active")}
                        >
                            Active Assignments
                        </h5>

                        <h5
                            className={`
                                text-xs cursor-pointer pb-1
                                ${activeView === "previous"
                                    ? "text-[#43C17A] font-medium border-b-2 border-[#43C17A]"
                                    : "text-[#282828]"
                                }
                            `}
                            onClick={() => setActiveView("previous")}
                        >
                            Previous Assignments
                        </h5>

                    </div>

                    <div className="mt-4">
                        {activeView === "active" && (
                            <AssignmentCard
                                cardProp={activeAssignments}
                                activeView={activeView}
                            />
                        )}

                        {activeView === "previous" && (
                            <div className="text-sm text-[#282828]">
                                <AssignmentCard
                                    cardProp={previousAssignments}
                                    activeView="previous"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
