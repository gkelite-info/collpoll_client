"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { fetchFinanceManagerContext } from "./financeManagerContextAPI";

export type FinanceManagerContextType = {
    loading: boolean;
    financeManagerId: number | null;
    userId: number | null;
    collegeId: number | null;
    collegeEducationId: number | null;
    collegeEducationIds: number[];
    collegeName: string | null;
    collegeEducationType: string | null;
    collegeEducationTypes: string[];
    isActive: boolean | null;
    type: "executive" | "manager" | null;
};

const FinanceManagerContext =
    createContext<FinanceManagerContextType | null>(null);

export const FinanceManagerProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const { userId, role, loading: userLoading } = useUser();

    const [state, setState] = useState<FinanceManagerContextType>({
        loading: true,
        financeManagerId: null,
        userId: null,
        collegeId: null,
        collegeEducationId: null,
        collegeEducationIds: [],
        collegeName: null,
        collegeEducationType: null,
        collegeEducationTypes: [],
        isActive: null,
        type: null,
    });

    useEffect(() => {
        const loadFinanceManager = async () => {
            if (userLoading) return;

            if (!userId || (role !== "Finance" && role !== "FinanceManager")) {
                setState((s) => ({ ...s, loading: false }));
                return;
            }

            try {
                const fm = await fetchFinanceManagerContext(userId);

                setState({
                    loading: false,
                    financeManagerId: fm.financeManagerId,
                    userId: fm.userId,
                    collegeId: fm.collegeId,
                    collegeEducationId: fm.collegeEducationId,
                    collegeEducationIds: fm.collegeEducationIds,
                    collegeName: fm.collegeName,
                    collegeEducationType: fm.collegeEducationType,
                    collegeEducationTypes: fm.collegeEducationTypes,
                    isActive: fm.isActive,
                    type: fm.type,
                });
            } catch {
                setState((s) => ({ ...s, loading: false }));
            }
        };

        loadFinanceManager();
    }, [userId, role, userLoading]);

    return (
        <FinanceManagerContext.Provider value={state}>
            {children}
        </FinanceManagerContext.Provider>
    );
};

export function useFinanceManager() {
    const context = useContext(FinanceManagerContext);
    if (!context) {
        throw new Error(
            "useFinanceManager must be used inside FinanceManagerProvider"
        );
    }
    return context;
}
