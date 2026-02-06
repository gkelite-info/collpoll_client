"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { fetchAdminContext } from "./adminContextAPI";

type AdminContextType = {
    loading: boolean;
    adminId: number | null;
    collegeId: number | null;
    collegePublicId: string | null;
    collegeCode: string | null;
    collegeEducationId: number | null;
};

const AdminContext = createContext<AdminContextType>({
    loading: true,
    adminId: null,
    collegeId: null,
    collegePublicId: null,
    collegeCode: null,
    collegeEducationId: null,
});

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, role, loading: userLoading } = useUser();

    const [state, setState] = useState<AdminContextType>({
        loading: true,
        adminId: null,
        collegeId: null,
        collegePublicId: null,
        collegeCode: null,
        collegeEducationId: null,
    });

    useEffect(() => {
        const loadAdmin = async () => {
            if (userLoading) return;

            if (!userId || role !== "Admin") {
                setState((s) => ({ ...s, loading: false }));
                return;
            }

            try {
                const admin = await fetchAdminContext(userId);

                setState({
                    loading: false,
                    adminId: admin.adminId,
                    collegeId: admin.collegeId,
                    collegePublicId: admin.collegePublicId,
                    collegeCode: admin.collegeCode,
                    collegeEducationId: admin.collegeEducationId,
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
