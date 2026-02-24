"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { fetchParentContext } from "./parentContextAPI";

export type ParentContextType = {
    loading: boolean;
    parentId: number | null;
    userId: number | null;
    studentId: number | null;
    collegeId: number | null;
    fullName: string | null;
    email: string | null;
    mobile: string | null;
    gender: string | null;
    collegeCode: string | null;
    isActive: boolean | null;
    isDeleted: boolean | null;
};

const ParentContext = createContext<ParentContextType | null>(null);

export const ParentProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, role, loading: userLoading } = useUser();

    const [state, setState] = useState<ParentContextType>({
        loading: true,
        parentId: null,
        userId: null,
        studentId: null,
        collegeId: null,
        fullName: null,
        email: null,
        mobile: null,
        gender: null,
        collegeCode: null,
        isActive: null,
        isDeleted: null,
    });

    useEffect(() => {
        const loadParent = async () => {
            if (userLoading) return;

            if (!userId || role !== "Parent") {
                setState((s) => ({ ...s, loading: false }));
                return;
            }

            try {
                const parent = await fetchParentContext(userId);

                if (parent) {
                    setState({
                        loading: false,
                        parentId: parent.parentId,
                        userId: parent.userId,
                        studentId: parent.studentId,
                        collegeId: parent.collegeId,
                        fullName: parent.user?.fullName || null,
                        email: parent.user?.email || null,
                        mobile: parent.user?.mobile || null,
                        gender: parent.user?.gender || null,
                        collegeCode: parent.college?.collegeCode || null,
                        isActive: parent.isActive,
                        isDeleted: parent.is_deleted,
                    });
                } else {
                    setState((s) => ({ ...s, loading: false }));
                }
            } catch (err) {
                console.error("Failed to load parent context", err);
                setState((s) => ({ ...s, loading: false }));
            }
        };

        loadParent();
    }, [userId, role, userLoading]);

    return (
        <ParentContext.Provider value={state}>
            {children}
        </ParentContext.Provider>
    );
};

export function useParent() {
    const context = useContext(ParentContext);
    if (!context) {
        throw new Error("useParent must be used inside ParentProvider");
    }
    return context;
}