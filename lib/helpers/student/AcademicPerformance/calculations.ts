"use server";

import { createClient } from "@/lib/supabaseServer";

const ATTENDED_STATUSES = ["PRESENT", "LATE"] as const;
const CONDUCTED_STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;
const CANCELLED_STATUSES = ["CLASS_CANCEL", "CANCEL_CLASS"] as const;

function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function isAttendedStatus(status: string) {
    return (ATTENDED_STATUSES as readonly string[]).includes(status);
}

function isConductedStatus(status: string) {
    return (CONDUCTED_STATUSES as readonly string[]).includes(status);
}

function isCancelledStatus(status: string) {
    return (CANCELLED_STATUSES as readonly string[]).includes(status);
}

export async function getStudentAcademicPerformance(studentId: number | null) {
    try {
        const supabase = await createClient();
        const today = formatDate(new Date());

        if (!studentId) {
            return [{ subject: "NO_STUDENT_ID", value: 0, full: 100 }];
        }

        const { data: student, error: studentError } = await supabase
            .from("students")
            .select("collegeBranchId")
            .eq("studentId", studentId)
            .single();

        if (studentError) {
            return [{ subject: `STUDENT_ERR: ${studentError.message}`, value: 0, full: 100 }];
        }

        const { data: history, error: historyError } = await supabase
            .from("student_academic_history")
            .select("collegeSemesterId, collegeAcademicYearId, collegeSectionsId")
            .eq("studentId", studentId)
            .eq("isCurrent", true)
            .maybeSingle();

        if (historyError) {
            return [{ subject: `HISTORY_ERR: ${historyError.message}`, value: 0, full: 100 }];
        }

        let subjectsQuery = supabase
            .from("college_subjects")
            .select("collegeSubjectId, subjectName, subjectKey")
            .eq("collegeBranchId", student.collegeBranchId)
            .is("deletedAt", null);

        if (history?.collegeSemesterId) {
            subjectsQuery = subjectsQuery.or(`collegeSemesterId.eq.${history.collegeSemesterId},collegeSemesterId.is.null`);
        } else {
            subjectsQuery = subjectsQuery.is("collegeSemesterId", null);
        }

        const { data: subjects, error: subjectsError } = await subjectsQuery;

        if (subjectsError) {
            return [{ subject: `SUBJECTS_ERR: ${subjectsError.message}`, value: 0, full: 100 }];
        }

        if (!subjects || subjects.length === 0) {
            return [{ subject: "NO_SUBJECTS_FOUND", value: 0, full: 100 }];
        }

        const performanceData = await Promise.all(
            subjects.map(async (subject) => {
                const { data: config } = await supabase
                    .from("faculty_weightage_configs")
                    .select("facultyWeightageConfigId")
                    .eq("collegeSubjectId", subject.collegeSubjectId)
                    .maybeSingle();

                if (!config) {
                    return {
                        subject: subject.subjectKey || subject.subjectName,
                        value: 0,
                        full: 100,
                    };
                }

                const { data: weights, error: weightsError } = await supabase
                    .from("faculty_weightage_items")
                    .select("percentage, label")
                    .eq("facultyWeightageConfigId", config.facultyWeightageConfigId);

                if (!weights || weights.length === 0) {
                    return { subject: subject.subjectKey || subject.subjectName, value: 0, full: 100 };
                }

                let totalWeightedScore = 0;

                for (const item of weights!) {
                    const label = item.label.toLowerCase();
                    let earned = 0;
                    let possible = 0;

                    if (label.includes("quiz")) {
                        const { data: allQuizzes } = await supabase
                            .from("quizzes")
                            .select("quizId, totalMarks")
                            .eq("collegeSubjectId", subject.collegeSubjectId)
                            .is("is_deleted", false)
                            .is("isActive", true);

                        if (allQuizzes && allQuizzes.length > 0) {
                            possible = allQuizzes.reduce((acc, curr) => acc + (Number(curr.totalMarks) || 0), 0);

                            const quizIds = allQuizzes.map((q) => q.quizId);
                            const { data: quizData } = await supabase
                                .from("quiz_submissions")
                                .select("totalMarksObtained, quizId")
                                .eq("studentId", studentId)
                                .in("quizId", quizIds);

                            if (quizData && quizData.length > 0) {
                                const bestAttempts = quizData.reduce((acc: any, curr: any) => {
                                    const id = curr.quizId;
                                    if (!acc[id] || curr.totalMarksObtained > acc[id].earned) {
                                        acc[id] = { earned: curr.totalMarksObtained || 0 };
                                    }
                                    return acc;
                                }, {});
                                const res = Object.values(bestAttempts) as any[];
                                earned = res.reduce((s, r) => s + r.earned, 0);
                            }
                        }
                    }

                    else if (label.includes("discussion")) {
                        if (history?.collegeSectionsId) {
                            const { data: allForums } = await supabase
                                .from("discussion_forum_sections")
                                .select("discussionId, marks")
                                .eq("collegeSectionsId", history.collegeSectionsId)
                                .is("is_deleted", false)
                                .is("isActive", true);

                            if (allForums && allForums.length > 0) {
                                possible = allForums.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);

                                const forumIds = allForums.map((f) => f.discussionId);
                                const { data: forumData } = await supabase
                                    .from("student_discussion_uploads")
                                    .select("marksObtained, discussionId")
                                    .eq("studentId", studentId)
                                    .in("discussionId", forumIds)
                                    .is("is_deleted", false);

                                if (forumData && forumData.length > 0) {
                                    const bestForum = forumData.reduce((acc: any, curr: any) => {
                                        const id = curr.discussionId;
                                        const s = Number(curr.marksObtained) || 0;
                                        if (!acc[id] || s > acc[id].earned) {
                                            acc[id] = { earned: s };
                                        }
                                        return acc;
                                    }, {});
                                    const res = Object.values(bestForum) as any[];
                                    earned = res.reduce((s, r) => s + r.earned, 0);
                                }
                            }
                        }
                    }

                    else if (label.includes("assignment")) {
                        const { data: allAssignments } = await supabase
                            .from("assignments")
                            .select("assignmentId, marks")
                            .eq("subjectId", subject.collegeSubjectId)
                            .is("is_deleted", false);

                        if (allAssignments && allAssignments.length > 0) {
                            possible = allAssignments.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);

                            const assignIds = allAssignments.map((a) => a.assignmentId);
                            const { data: assignData } = await supabase
                                .from("student_assignments_submission")
                                .select("marksScored, assignmentId")
                                .eq("studentId", studentId)
                                .in("assignmentId", assignIds);

                            if (assignData && assignData.length > 0) {
                                const uniqueAssign = assignData.reduce((acc: any, curr: any) => {
                                    const id = curr.assignmentId;
                                    const s = Number(curr.marksScored) || 0;
                                    if (!acc[id] || s > acc[id].earned) {
                                        acc[id] = { earned: s };
                                    }
                                    return acc;
                                }, {});
                                const res = Object.values(uniqueAssign) as any[];
                                earned = res.reduce((s, r) => s + r.earned, 0);
                            }
                        }
                    }

                    else if (label.includes("project")) {
                        const { data: allProjects } = await supabase
                            .from("projects")
                            .select("projectId, marks")
                            .eq("collegeSubjectId", subject.collegeSubjectId)
                            .is("is_deleted", false);

                        if (allProjects && allProjects.length > 0) {
                            possible = allProjects.reduce((acc, curr) => acc + (Number(curr.marks) || 0), 0);

                            const projectIds = allProjects.map((p) => p.projectId);
                            const { data: projectData } = await supabase
                                .from("student_project_submissions")
                                .select("marksObtained, projectId")
                                .eq("studentId", studentId)
                                .in("projectId", projectIds);

                            if (projectData && projectData.length > 0) {
                                const bestProject = projectData.reduce((acc: any, curr: any) => {
                                    const id = curr.projectId;
                                    const s = Number(curr.marksObtained) || 0;
                                    if (!acc[id] || s > acc[id].earned) {
                                        acc[id] = { earned: s };
                                    }
                                    return acc;
                                }, {});
                                const res = Object.values(bestProject) as any[];
                                earned = res.reduce((s, r) => s + r.earned, 0);
                            }
                        }
                    }

                    else if (label.includes("attendance")) {
                        const { data: attendanceRecords } = await supabase
                            .from("attendance_record")
                            .select(`
                            status,
                            calendar_event:calendarEventId (
                                subject,
                                type,
                                date,
                                is_deleted
                            )
                        `)
                            .eq("studentId", studentId)
                            .is("deletedAt", null)
                            .lte("markedAt", today)
                            .returns<Array<{
                                status: string;
                                calendar_event: {
                                    subject: number | null;
                                    type: string;
                                    date: string;
                                    is_deleted: boolean | null;
                                } | null;
                            }>>();

                        const validAttendance = (attendanceRecords ?? []).filter((record) => {
                            const event = record.calendar_event;

                            return (
                                !!event &&
                                event.subject === subject.collegeSubjectId &&
                                event.type === "class" &&
                                event.is_deleted === false &&
                                event.date <= today &&
                                !isCancelledStatus(record.status)
                            );
                        });

                        if (validAttendance.length > 0) {
                            earned = validAttendance.filter((record) =>
                                isAttendedStatus(record.status),
                            ).length;
                            possible = validAttendance.filter((record) =>
                                isConductedStatus(record.status),
                            ).length;
                        }
                    }

                    if (possible > 0) {
                        const contribution = (earned / possible) * item.percentage;
                        totalWeightedScore += contribution;
                    }
                }
                return { subject: subject.subjectKey || subject.subjectName, value: Math.round(totalWeightedScore), full: 100 };
            })
        );
        return performanceData;
    } catch (err) {
        throw err;
    }
}
