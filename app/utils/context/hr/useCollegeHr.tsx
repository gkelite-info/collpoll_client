"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "../UserContext";
import { fetchHrContext } from "./hrContextAPI";

type HrContextType = {
    loading: boolean;
    collegeHrId: number | null;
    collegeId: number | null;
};

const HrContext = createContext<HrContextType>({
    loading: true,
    collegeHrId: null,
    collegeId: null,
});

export const HrProvider = ({ children }: { children: React.ReactNode }) => {
    const { userId, role, loading: userLoading } = useUser();

    const [state, setState] = useState<HrContextType>({
        loading: true,
        collegeHrId: null,
        collegeId: null,
    });

    useEffect(() => {
        const loadHr = async () => {
            if (userLoading) return;
            if (!userId || role !== "CollegeHr") {
                setState((s) => ({ ...s, loading: false }));
                return;
            }
            try {
                const hr = await fetchHrContext(Number(userId));
                setState({
                    loading: false,
                    collegeHrId: hr.collegeHrId,
                    collegeId: hr.collegeId,
                });
            } catch (err) {
                console.error("Failed to load hr context", err);
                setState((s) => ({ ...s, loading: false }));
            }
        };

        loadHr();
    }, [userId, role, userLoading]);

    return (
        <HrContext.Provider value={state}>
            {children}
        </HrContext.Provider>
    );
};

export const useCollegeHr = () => useContext(HrContext);
