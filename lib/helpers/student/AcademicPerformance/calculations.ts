"use server";

import { createClient } from "@/lib/supabaseServer";

export async function getStudentAcademicPerformance(studentId: number | null) {
    const supabase = await createClient();

    const { data: student } = await supabase.from('students').select('collegeBranchId').eq('studentId', studentId).single();
    const { data: history } = await supabase.from('student_academic_history').select('collegeSemesterId').eq('studentId', studentId).eq('isCurrent', true).single();

    if (!student || !history) return [{ subject: "BASE_DATA_MISSING", value: 0, full: 100 }];

    const { data: subjects } = await supabase
        .from('college_subjects')
        .select('collegeSubjectId, subjectName')
        .eq('collegeSemesterId', history.collegeSemesterId)
        .eq('collegeBranchId', student.collegeBranchId)
        .is('deletedAt', null);

    if (!subjects) return [];

    const performanceData = await Promise.all(
        subjects.map(async (subject) => {
            const { data: config, error: configError } = await supabase
                .from('faculty_weightage_configs')
                .select('facultyWeightageConfigId')
                .eq('collegeSubjectId', subject.collegeSubjectId)
                .single();

            if (!config) {
                const { data: rawQuizzes } = await supabase
                    .from('quiz_submissions')
                    .select('totalMarksObtained, quizzes!inner(totalMarks)')
                    .eq('studentId', studentId)
                    .eq('quizzes.collegeSubjectId', subject.collegeSubjectId);

                let rawEarned = rawQuizzes?.reduce((acc, curr) => acc + (curr.totalMarksObtained || 0), 0) || 0;
                let rawTotal = rawQuizzes?.reduce((acc, curr: any) => acc + (curr.quizzes?.totalMarks || 0), 0) || 0;

                if (rawTotal > 0) {
                    return { subject: subject.subjectName, value: Math.round((rawEarned / rawTotal) * 100), full: 100 };
                }

                return { subject: `${subject.subjectName}`, value: 0, full: 100 };
            }

            const { data: weights } = await supabase
                .from('faculty_weightage_items')
                .select('percentage, label')
                .eq('facultyWeightageConfigId', config.facultyWeightageConfigId);

            if (!weights || weights.length === 0) {
                return { subject: `${subject.subjectName} (No Weights)`, value: 0, full: 100 };
            }

            let totalWeightedScore = 0;

            for (const item of weights) {
                const label = item.label.toLowerCase();
                let earned = 0;
                let possible = 0;

                if (label.includes('quiz')) {
                    const { data: quizData } = await supabase
                        .from('quiz_submissions')
                        .select('totalMarksObtained, quizId, quizzes!inner(totalMarks)') // Added quizId
                        .eq('studentId', studentId)
                        .eq('quizzes.collegeSubjectId', subject.collegeSubjectId);

                    if (quizData && quizData.length > 0) {
                        const bestAttempts = quizData.reduce((acc: any, curr: any) => {
                            const id = curr.quizId;
                            if (!acc[id] || curr.totalMarksObtained > acc[id].earned) {
                                acc[id] = {
                                    earned: curr.totalMarksObtained || 0,
                                    possible: curr.quizzes?.totalMarks || 0
                                };
                            }
                            return acc;
                        }, {});

                        const finalResults = Object.values(bestAttempts) as { earned: number, possible: number }[];
                        earned = finalResults.reduce((sum, item) => sum + item.earned, 0);
                        possible = finalResults.reduce((sum, item) => sum + item.possible, 0);
                    }
                }
                else if (label.includes('forum') || label.includes('assignment')) {
                    const { data: forumData } = await supabase
                        .from('student_discussion_uploads')
                        .select('marksObtained, discussion_forum!inner(maxMarks)')
                        .eq('studentId', studentId)
                        .eq('discussion_forum.collegeSubjectId', subject.collegeSubjectId);

                    if (forumData) {
                        earned = forumData.reduce((acc, curr) => acc + (curr.marksObtained || 0), 0);
                        possible = forumData.reduce((acc, curr: any) => acc + (curr.discussion_forum?.maxMarks || 0), 0);
                    }
                }

                if (possible > 0) {
                    totalWeightedScore += (earned / possible) * item.percentage;
                }
            }

            return {
                subject: subject.subjectName,
                value: Math.round(totalWeightedScore),
                full: 100
            };
        })
    );

    return performanceData;
}