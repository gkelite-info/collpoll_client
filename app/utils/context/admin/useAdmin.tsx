"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { fetchAdminContext } from "./adminContextAPI";

type AdminContextType = {
    loading: boolean;
    adminId: number | null;
    userId: number | null;
    collegeId: number | null;
    collegePublicId: string | null;
    collegeCode: string | null;
    collegeEducationId: number | null;
    collegeEducationType: string | null;
};

const AdminContext = createContext<AdminContextType>({
    loading: true,
    adminId: null,
    userId: null,
    collegeId: null,
    collegePublicId: null,
    collegeCode: null,
    collegeEducationId: null,
    collegeEducationType: null,
});

const getInitialState = (): AdminContextType => {
    return {
        loading: true,
        adminId: null,
        userId: null,
        collegeId: null,
        collegePublicId: null,
        collegeCode: null,
        collegeEducationId: null,
        collegeEducationType: null,
    };
};

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, role, loading: userLoading } = useUser();

    const [state, setState] = useState<AdminContextType>(getInitialState);

    useEffect(() => {
        let hydrated = false;
        try {
            const cached = sessionStorage.getItem("adminContext");
            if (cached) {
                const parsed = JSON.parse(cached);
                // Only hydrate if it belongs to current user
                if (parsed && parsed.userId === userId) {
                    setState({ ...parsed, loading: false });
                    hydrated = true;
                }
            }
        } catch (e) {
            console.error("Failed to parse admin context from session storage", e);
        }

        const loadAdmin = async () => {
            if (userLoading) return;

            if (!userId || role !== "Admin") {
                setState((s) => {
                    const newState = { ...s, loading: false };
                    sessionStorage.removeItem("adminContext");
                    return newState;
                });
                return;
            }

            if (!hydrated) {
                setState((s) => ({ ...s, loading: s.adminId ? false : true }));
            }

            try {
                const admin = await fetchAdminContext(userId);

                const newState = {
                    loading: false,
                    adminId: admin.adminId,
                    userId: admin.userId,
                    collegeId: admin.collegeId,
                    collegePublicId: admin.collegePublicId,
                    collegeCode: admin.collegeCode,
                    collegeEducationId: admin.collegeEducationId,
                    collegeEducationType: admin.collegeEducationType,
                };

                setState(newState);
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("adminContext", JSON.stringify(newState));
                }
            } catch (err) {
                console.error("Failed to load admin context", err);
                setState((s) => ({ ...s, loading: false }));
            }
        };

        loadAdmin();
    }, [userId, role, userLoading]);

    return (
        <AdminContext.Provider value={state}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
