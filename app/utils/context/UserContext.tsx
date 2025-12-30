"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getStudentId } from "@/lib/helpers/studentAPI";

type StudentContextType = {
    userId: number | null;
    loading: boolean;
    studentId: number | null;
};

const StudentContext = createContext<StudentContextType>({
    userId: null,
    loading: true,
    studentId: null
});

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState<number | null>(null);

    useEffect(() => {
        getStudentId().then(setStudentId).catch(console.error);
    }, []);

    useEffect(() => {
        const resolveStudentId = async () => {
            const { data: auth } = await supabase.auth.getUser();

            if (!auth.user) {
                setUserId(null);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("userId")
                .eq("auth_id", auth.user.id)
                .single();

            if (error || !data) {
                console.error("User not found", error);
                setUserId(null);
            } else {
                setUserId(data.userId);
            }

            setLoading(false);
        };

        resolveStudentId();

        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            setLoading(true);
            resolveStudentId();
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    return (
        <StudentContext.Provider value={{ userId, loading, studentId }}>
            {children}
        </StudentContext.Provider>
    );
};

export const useStudent = () => useContext(StudentContext);
