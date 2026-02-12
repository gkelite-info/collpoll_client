"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { fetchCollegeAdminContext } from "./collegeAdminContextAPI";

export type CollegeAdminContextType = {
    loading: boolean;
    collegeAdminId: number | null;
    userId: number | null;
    collegeId: number | null;
    collegeName: string | null;
    isActive: boolean | null;
};

const CollegeAdminContext =
    createContext<CollegeAdminContextType | null>(null);

export const CollegeAdminProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { userId, role, loading: userLoading } = useUser();

    const [state, setState] = useState<CollegeAdminContextType>({
        loading: true,
        collegeAdminId: null,
        userId: null,
        collegeId: null,
        collegeName: null,
        isActive: null,
    });

    useEffect(() => {
        const loadCollegeAdmin = async () => {
            if (userLoading) return;

            if (!userId || role !== "CollegeAdmin") {
                setState((s) => ({ ...s, loading: false }));
                return;
            }

            try {
                const admin = await fetchCollegeAdminContext(userId);

                setState({
                    loading: false,
                    collegeAdminId: admin.collegeAdminId,
                    userId: admin.userId,
                    collegeId: admin.collegeId,
                    collegeName: admin.collegeName,
                    isActive: admin.isActive,
                });
            } catch (err) {
                console.error("Failed to load college admin context", err);
                setState((s) => ({ ...s, loading: false }));
            }
        };

        loadCollegeAdmin();
    }, [userId, role, userLoading]);

    return (
        <CollegeAdminContext.Provider value={state}>
            {children}
        </CollegeAdminContext.Provider>
    );
};

export function useCollegeAdmin() {
    const context = useContext(CollegeAdminContext);
    if (!context) {
        throw new Error(
            "useCollegeAdmin must be used inside CollegeAdminProvider"
        );
    }
    return context;
}
