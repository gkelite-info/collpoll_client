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

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, role, loading: userLoading } = useUser();

    const [state, setState] = useState<AdminContextType>({
        loading: true,
        adminId: null,
        userId: null,
        collegeId: null,
        collegePublicId: null,
        collegeCode: null,
        collegeEducationId: null,
        collegeEducationType: null,
    });

    useEffect(() => {
        const loadAdmin = async () => {
            if (userLoading) return;

            if (!userId || role !== "Admin") {
                setState((s) => ({ ...s, loading: false }));
                return;
            }

            setState((s) => ({ ...s, loading: s.adminId ? s.loading : true }));

            try {
                const admin = await fetchAdminContext(userId);

                setState({
                    loading: false,
                    adminId: admin.adminId,
                    userId: admin.userId,
                    collegeId: admin.collegeId,
                    collegePublicId: admin.collegePublicId,
                    collegeCode: admin.collegeCode,
                    collegeEducationId: admin.collegeEducationId,
                    collegeEducationType: admin.collegeEducationType,
                });
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
