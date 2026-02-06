"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { fetchFacultyContext } from "./facultyContextAPI";

type FacultyContextType = {
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
    collegeBranchId: number | null;

    isActive: boolean | null;

    sections: any[];
    sectionIds: number[];
    subjectIds: number[];
    academicYearIds: number[];
};

const FacultyContext = createContext<FacultyContextType>({
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
    collegeBranchId: null,

    isActive: null,

    sections: [],
    sectionIds: [],
    subjectIds: [],
    academicYearIds: [],
});

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
        collegeBranchId: null,

        isActive: null,

        sections: [],
        sectionIds: [],
        subjectIds: [],
        academicYearIds: [],
    });

    useEffect(() => {
        const loadFaculty = async () => {
            if (userLoading) return;

            if (!userId || role !== "Faculty") {
                setState((s) => ({ ...s, loading: false }));
                return;
            }

            try {
                const faculty = await fetchFacultyContext(userId);

                setState({
                    loading: false,

                    facultyId: faculty.facultyId,
                    userId: faculty.userId,

                    fullName: faculty.fullName,
                    email: faculty.email,
                    mobile: faculty.mobile,
                    role: faculty.role,
                    gender: faculty.gender,

                    collegeId: faculty.collegeId,
                    collegeEducationId: faculty.collegeEducationId,
                    collegeBranchId: faculty.collegeBranchId,

                    isActive: faculty.isActive,

                    sections: faculty.sections,
                    sectionIds: faculty.sectionIds,
                    subjectIds: faculty.subjectIds,
                    academicYearIds: faculty.academicYearIds,
                });
            } catch (err) {
                console.error("Failed to load faculty context", err);
                setState((s) => ({ ...s, loading: false }));
            }
        };

        loadFaculty();
    }, [userId, role, userLoading]);

    return (
        <FacultyContext.Provider value={state}>
            {children}
        </FacultyContext.Provider>
    );
};

export const useFaculty = () => useContext(FacultyContext);
