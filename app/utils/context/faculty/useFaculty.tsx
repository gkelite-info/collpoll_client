"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
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

    const [state, setState] = useState<FacultyContextType>({
        loading: true,
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
        selectedSectionIndex: 0,
        setSelectedSectionIndex: () => {},
    });

    const setSelectedSectionIndex = (index: number) => {
        setState(s => ({ ...s, selectedSectionIndex: index }));
    };

    const { data: facultyData, isLoading: queryLoading, error } = useQuery({
        queryKey: ["facultyContext", userId],
        queryFn: () => fetchFacultyContext(userId!),
        enabled: !!userId && role === "Faculty" && !userLoading,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (userLoading || (!userId || role !== "Faculty")) {
            if (!userLoading && (!userId || role !== "Faculty")) {
                setState((s) => ({ ...s, loading: false }));
            }
            return;
        }

        if (facultyData) {
            setState(s => ({
                ...s,
                loading: false,
                facultyId: facultyData.facultyId,
                userId: facultyData.userId,
                fullName: facultyData.fullName,
                email: facultyData.email,
                mobile: facultyData.mobile,
                role: facultyData.role,
                gender: facultyData.gender,
                collegeId: facultyData.collegeId,
                collegeEducationId: facultyData.collegeEducationId,
                collegeBranchId: facultyData.collegeBranchId,
                college_branch: facultyData.college_branch,
                faculty_edu_type: facultyData.faculty_edu_type,
                isActive: facultyData.isActive,
                sections: facultyData.sections,
                sectionIds: facultyData.sectionIds,
                subjectIds: facultyData.subjectIds,
                academicYearIds: facultyData.academicYearIds,
                faculty_subject: facultyData.faculty_subject,
                collegeAcademicYears: facultyData.collegeAcademicYears,
                collegeAcademicYear: facultyData.collegeAcademicYear,
                setSelectedSectionIndex,
            }));
        } else if (error) {
            console.error("Failed to load faculty context", error);
            setState((s) => ({ ...s, loading: false }));
        } else if (queryLoading) {
            setState((s) => ({ ...s, loading: true }));
        }
    }, [facultyData, queryLoading, error, userLoading, userId, role]);

    return (
        <FacultyContext.Provider value={state}>
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

