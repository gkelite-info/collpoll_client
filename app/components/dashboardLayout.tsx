"use client";

import { useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import FacultyNavbar from "./navbar/facultyNavbar";
import Header from "./header/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { role } = useUser();

    return (
        <div className="flex h-screen overflow-hidden">
            {isSidebarOpen && (
                <>
                    {role === "Faculty" && (
                        <FacultyNavbar />
                    )}

                    {/* later you can add others */}
                    {/* {role === "Student" && <StudentNavbar />} */}
                    {/* {role === "Admin" && <AdminNavbar />} */}
                </>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <Header onMenuClick={() => setIsSidebarOpen(prev => !prev)} />
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}