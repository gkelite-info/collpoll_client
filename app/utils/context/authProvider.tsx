"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface User {
    userId: number;
    fullName: string;
    email: string;
    role: string;
    collegeId: number;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (payload: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const restoreSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", session.user.email)
                    .single();

                if (!error && data) {
                    setUser({
                        userId: data.userId,
                        fullName: data.fullName,
                        email: data.email,
                        role: data.role,
                        collegeId: data.collegeId,
                    });
                    setIsAuthenticated(true);
                }
            }
        };

        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            if (userError || !userData) throw new Error("User not found");

            setUser({
                userId: userData.userId,
                fullName: userData.fullName,
                email: userData.email,
                role: userData.role,
                collegeId: userData.collegeId,
            });
            setIsAuthenticated(true);
            toast.success("Logged in successfully");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setIsAuthenticated(false);
            toast.success("Logged out successfully");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const signup = async (payload: any) => {
        try {
            const { email, password, ...rest } = payload;

            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            const authUserId = data.user?.id;

            if (!authUserId) throw new Error("Failed to create user");

            await import("@/lib/helpers/upsertUser").then((mod) =>
                mod.upsertUser({
                    ...rest,
                    email,
                })
            );

            toast.success("User registered successfully! Please confirm email.");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
