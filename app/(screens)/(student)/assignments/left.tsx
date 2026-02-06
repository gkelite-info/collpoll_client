"use client"

import { useState, useEffect } from "react"
import AssignmentCard from "./components/card";
import { supabase } from "@/lib/supabaseClient";
// import { fetchAssignments, fetchAssignmentsForStudent } from "@/lib/helpers/student/assignments/assignmentsAPI";
import { fetchStudentContext } from "@/app/utils/context/student/studentContextAPI";
import { fetchAssignmentsForStudent } from "@/lib/helpers/student/assignments/assignmentsAPI";
import { getSubmissionForAssignment } from "@/lib/helpers/student/assignments/insertAssignmentSubmission";


export default function AssignmentsLeft() {
    const [activeView, setActiveView] =
        useState<"active" | "previous">("active");

    const [activeAssignments, setActiveAssignments] = useState<any[]>([]);
    const [previousAssignments, setPreviousAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAssignments();
    }, []);

    async function loadAssignments() {
        try {
            console.log("🟡 Step 1: Get auth user");

            const {
                data: { user },
                error: authError,
            } = await supabase.auth.getUser();

            if (authError || !user) {
                throw new Error("User not authenticated");
            }

            console.log("🟢 Auth UUID:", user.id);

            /* ---------------- Step 2: internal user ---------------- */
            const { data: userRow, error: userErr } = await supabase
                .from("users")
                .select("userId, role")
                .eq("auth_id", user.id)
                .eq("is_deleted", false)
                .single();

            if (userErr || !userRow || userRow.role !== "Student") {
                throw new Error("Invalid student user");
            }

            /* ---------------- Step 3: student context ---------------- */
            const { data: student } = await supabase
                .from("students")
                .select("studentId, collegeBranchId")
                .eq("userId", userRow.userId)
                .is("deletedAt", null)
                .single();

            if (!student) {
                throw new Error("Student record not found");
            }

            const { data: academic } = await supabase
                .from("student_academic_history")
                .select("collegeAcademicYearId, collegeSectionsId")
                .eq("studentId", student.studentId)
                .eq("isCurrent", true)
                .is("deletedAt", null)
                .single();

            if (!academic) {
                throw new Error("Academic context not found");
            }

            /* ---------------- Step 4: helper call ✅ ---------------- */
            const res = await fetchAssignmentsForStudent({
                collegeBranchId: student.collegeBranchId,
                collegeAcademicYearId: academic.collegeAcademicYearId,
                collegeSectionsId: academic.collegeSectionsId,
            });

            if (!res.success) {
                throw new Error(res.error);
            }

            console.log("🟢 Raw assignments:", res.assignments);

            /* ---------------- Step 5: format ---------------- */
            const todayInt = Number(formatDateToInt(new Date()));

            const formatted = await Promise.all(
                res.assignments.map(async (a: any) => {
                    const existingFilePath = await getSubmissionForAssignment(a.assignmentId);

                    return {
                        assignmentId: a.assignmentId,
                        status: a.status,
                        image: "/ds.jpg",

                        title: a.topicName,
                        topicName: a.topicName,

                        subjectName: a.subject?.subjectName ?? "—",
                        professor: a.faculty?.user?.fullName ?? "Faculty",

                        marksTotal: a.marks,
                        marksScored: null,

                        fromDate: convertIntToShow(a.dateAssignedInt),
                        toDate: convertIntToShow(a.submissionDeadlineInt),
                        toDateInt: a.submissionDeadlineInt,

                        existingFilePath, // ✅ now defined
                    };
                })
            );

            console.log("🧪 Formatted card:", formatted[0]);

            setActiveAssignments(formatted.filter(a => a.toDateInt >= todayInt));
            setPreviousAssignments(formatted.filter(a => a.toDateInt < todayInt));

        } catch (err) {
            console.error("❌ Failed to load assignments:", err);
        } finally {
            setLoading(false);
        }
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

// function fetchAssignments(arg0: { collegeBranchId: any; collegeAcademicYearId: any; collegeSectionsId: any; }) {
//     throw new Error("Function not implemented.");
// }
// function fetchAssignments(arg0: { collegeBranchId: any; collegeAcademicYearId: any; collegeSectionsId: any; }) {
//     throw new Error("Function not implemented.");
// }

