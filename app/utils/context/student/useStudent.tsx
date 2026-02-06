"use client";

import { supabase } from "@/lib/supabaseClient";
import { createContext, useContext, useEffect, useState } from "react";
import { fetchStudentContext } from "./studentContextAPI";

type StudentContextType = {
    loading: boolean;

    studentId: number | null;
    userId: number | null;

    collegeId: number | null;
    collegeEducationId: number | null;
    collegeBranchId: number | null;

    collegeEducationType: string | null;
    collegeBranchCode: string | null;

    collegeAcademicYearId: number | null;
    collegeAcademicYear: string | null;
    collegeSemesterId: number | null;
    collegeSectionsId: number | null;

    entryType: string | null;
    status: string | null;
};

const StudentContext = createContext<StudentContextType>({
    loading: true,

    studentId: null,
    userId: null,

    collegeId: null,
    collegeEducationId: null,
    collegeBranchId: null,

    collegeEducationType: null,
    collegeBranchCode: null,

    collegeAcademicYearId: null,
    collegeAcademicYear: null,
    collegeSemesterId: null,
    collegeSectionsId: null,

    entryType: null,
    status: null,
});

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useState<StudentContextType>({
        ...useContext(StudentContext),
        loading: true,
    });

    useEffect(() => {
        const loadStudent = async () => {
            try {
                const { data: auth } = await supabase.auth.getUser();
                if (!auth.user) return;

                const { data: user } = await supabase
                    .from("users")
                    .select("userId, role")
                    .eq("auth_id", auth.user.id)
                    .single();

                if (!user || user.role !== "Student") return;

                const student = await fetchStudentContext(user.userId);

                setState({
                    loading: false,

                    userId: user.userId,
                    studentId: student.studentId,

                    collegeId: student.collegeId,
                    collegeEducationId: student.collegeEducationId,
                    collegeBranchId: student.collegeBranchId,

                    collegeEducationType: student.collegeEducationType,
                    collegeBranchCode: student.collegeBranchCode,

                    collegeAcademicYearId: student.collegeAcademicYearId,
                    collegeAcademicYear: student.collegeAcademicYear,
                    collegeSemesterId: student.collegeSemesterId,
                    collegeSectionsId: student.collegeSectionsId,

                    entryType: student.entryType,
                    status: student.status,
                });
            } catch (err) {
                console.error("Student context error:", err);
                setState(prev => ({ ...prev, loading: false }));
            }
        };

        loadStudent();
    }, []);

    return (
        <StudentContext.Provider value={state}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => useContext(StudentContext);
