"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getStudentId } from "@/lib/helpers/studentAPI";

type UserContextType = {
    userId: number | null;
    loading: boolean;
    studentId: number | null;
    fullName: string | null;
    mobile: string | null;
    email: string | null;
};

const StudentContext = createContext<UserContextType>({
    userId: null,
    loading: true,
    studentId: null,
    fullName: null,
    mobile: null,
    email: null
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [fullName, setFullName] = useState<string | null>(null);
    const [mobile, setMobile] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);

    useEffect(() => {
        getStudentId().then(setStudentId).catch(console.error);
    }, []);

    useEffect(() => {
        const resolveStudentId = async () => {
            const { data: auth } = await supabase.auth.getUser();

            if (!auth.user) {
                setUserId(null);
                setStudentId(null);
                setFullName(null);
                setMobile(null);
                setEmail(null);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("users")
                .select("userId, fullName, mobile, email")
                .eq("auth_id", auth.user.id)
                .single();

            if (error || !data) {
                console.error("User not found", error);
                setUserId(null);
            } else {
                setUserId(data.userId);
                setFullName(data.fullName);
                setMobile(data.mobile);
                setEmail(data.email);
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
        <StudentContext.Provider value={{ userId, loading, studentId, fullName, mobile, email }}>
            {children}
        </StudentContext.Provider>
    );
};

export const useUser = () => useContext(StudentContext);
