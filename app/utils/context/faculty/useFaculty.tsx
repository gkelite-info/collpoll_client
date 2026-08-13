"use client";

import { useMemo, useState, createContext, useContext } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchFacultyContext } from "./facultyContextAPI";
import { useQuery } from "@tanstack/react-query";

export type FacultySubject = {
    subjectName: string;
}

export type CollegeAcademicYear = {
    collegeAcademicYearId: number;
    collegeAcademicYear: string;
};

export type FacultySection = {
    facultySectionId: number;
    collegeSectionsId: number;
    collegeSubjectId: number;
    collegeAcademicYearId: number;
    faculty_subject: {
        subjectName: string;
    } | null;
    college_sections: {
        collegeSections: string;
    } | null;
    collegeEducationId?: number | null;
    collegeBranchId?: number | null;
    college_branch?: {
        collegeBranchCode: string;
    } | null;
    faculty_edu_type?: {
        collegeEducationType: string;
    } | null;
};

export type FacultyContextType = {
    loading: boolean;
    facultyId: number | null;
    userId: number | null;
    fullName: string | null;
    email: string | null;
    mobile: string | null;
    role: string | null;
    gender: string | null;
    collegeId: number | null;
    collegeEducationId: number | null;
    faculty_edu_type: string | null;
    collegeBranchId: number | null;
    college_branch: string | null;
    isActive: boolean | null;
    sections: FacultySection[];
    sectionIds: number[];
    subjectIds: number[];
    academicYearIds: number[];
    faculty_subject: FacultySubject[];
    collegeAcademicYears: CollegeAcademicYear[];
    collegeAcademicYear: string | null;
    selectedSectionIndex: number;
    setSelectedSectionIndex: (index: number) => void;
};

const FacultyContext = createContext<FacultyContextType | null>(null);

export const FacultyProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, role, loading: userLoading } = useUser();
    const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);

    const { data: facultyData, isLoading: queryLoading, error } = useQuery({
        queryKey: ["facultyContext", userId],
        queryFn: () => fetchFacultyContext(userId!),
        enabled: !!userId && role === "Faculty" && !userLoading,
        staleTime: 0,
        refetchOnMount: "always",
    });

    const isLoading = userLoading || queryLoading || (!!userId && role === "Faculty" && !facultyData && !error);

    const value = useMemo<FacultyContextType>(() => {
        if (!facultyData) {
            return {
                loading: isLoading,
                facultyId: null,
                userId: null,
                fullName: null,
                email: null,
                mobile: null,
                role: null,
                gender: null,
                collegeId: null,
                collegeEducationId: null,
                faculty_edu_type: null,
                collegeBranchId: null,
                college_branch: null,
                isActive: null,
                sections: [],
                sectionIds: [],
                subjectIds: [],
                academicYearIds: [],
                faculty_subject: [],
                collegeAcademicYears: [],
                collegeAcademicYear: null,
                selectedSectionIndex,
                setSelectedSectionIndex,
            };
        }

        return {
            loading: isLoading,
            facultyId: facultyData.facultyId ?? null,
            userId: facultyData.userId ?? null,
            fullName: facultyData.fullName ?? null,
            email: facultyData.email ?? null,
            mobile: facultyData.mobile ?? null,
            role: facultyData.role ?? null,
            gender: facultyData.gender ?? null,
            collegeId: facultyData.collegeId ?? null,
            collegeEducationId: facultyData.collegeEducationId ?? null,
            collegeBranchId: facultyData.collegeBranchId ?? null,
            college_branch: facultyData.college_branch ?? null,
            faculty_edu_type: facultyData.faculty_edu_type ?? null,
            isActive: facultyData.isActive ?? null,
            sections: facultyData.sections ?? [],
            sectionIds: facultyData.sectionIds ?? [],
            subjectIds: facultyData.subjectIds ?? [],
            academicYearIds: facultyData.academicYearIds ?? [],
            faculty_subject: facultyData.faculty_subject ?? [],
            collegeAcademicYears: facultyData.collegeAcademicYears ?? [],
            collegeAcademicYear: facultyData.collegeAcademicYear ?? null,
            selectedSectionIndex,
            setSelectedSectionIndex,
        };
    }, [facultyData, isLoading, selectedSectionIndex]);

    return (
        <FacultyContext.Provider value={value}>
            {children}
        </FacultyContext.Provider>
    );
};

export function useFaculty() {
    const context = useContext(FacultyContext);
    if (!context) {
        throw new Error("useFaculty must be used inside FacultyProvider");
    }
    return context;
}

