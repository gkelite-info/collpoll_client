import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import { UserProvider } from "./utils/context/UserContext";
import { AdminProvider } from "./utils/context/admin/useAdmin";
import { FacultyProvider } from "./utils/context/faculty/useFaculty";
import { StudentProvider } from "./utils/context/student/useStudent";
import { FinanceManagerProvider } from "./utils/context/financeManager/useFinanceManager";
import { CollegeAdminProvider } from "./utils/context/college-admin/useCollegeAdmin";
import { ParentProvider } from "./utils/context/parent/useParent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collpoll",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden flex justify-between`}
      >
        <UserProvider>
          <AdminProvider>
            <FacultyProvider>
              <StudentProvider>
                <ParentProvider>
                  <CollegeAdminProvider>
                    <FinanceManagerProvider>
                      <ClientLayout>
                        {children}
                      </ClientLayout>
                    </FinanceManagerProvider>
                  </CollegeAdminProvider>
                </ParentProvider>
              </StudentProvider>
            </FacultyProvider>
          </AdminProvider>
        </UserProvider>
      </body>
    </html>
  );
}
