// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import ClientLayout from "./components/ClientLayout";
// import { UserProvider } from "./utils/context/UserContext";
// import { AdminProvider } from "./utils/context/admin/useAdmin";
// import { FacultyProvider } from "./utils/context/faculty/useFaculty";
// import { StudentProvider } from "./utils/context/student/useStudent";
// import { FinanceManagerProvider } from "./utils/context/financeManager/useFinanceManager";
// import { CollegeAdminProvider } from "./utils/context/college-admin/useCollegeAdmin";
// import { ParentProvider } from "./utils/context/parent/useParent";
// import { HrProvider } from "./utils/context/hr/useCollegeHr";
// import { FontProvider } from "./utils/FontProvider";
// import SessionRefresher from "./components/sessionRefresher";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Tekton Campus",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden flex justify-between`}
//       >
//         <FontProvider>
//           <UserProvider>
//             <AdminProvider>
//               <FacultyProvider>
//                 <StudentProvider>
//                   <ParentProvider>
//                     <CollegeAdminProvider>
//                       <FinanceManagerProvider>
//                         <HrProvider>
//                           <SessionRefresher />
//                           <ClientLayout>{children}</ClientLayout>
//                         </HrProvider>
//                       </FinanceManagerProvider>
//                     </CollegeAdminProvider>
//                   </ParentProvider>
//                 </StudentProvider>
//               </FacultyProvider>
//             </AdminProvider>
//           </UserProvider>
//         </FontProvider>
//       </body>
//     </html>
//   );
// }

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
import { HrProvider } from "./utils/context/hr/useCollegeHr";
import { FontProvider } from "./utils/FontProvider";
import SessionRefresher from "./components/sessionRefresher";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tekton Campus",
  description: "A comprehensive management platform for modern educational institutions.",
  keywords: [
    "Tekton Campus",
    "TC",
    "Institution Management System",
    "IMS",
    "ERP",
    "School ERP",
    "Student Portal",
    "Faculty Management",
    "College Administration Software",
    "CMS",
    "Automated Attendance",
    "Education Technology",
    "Fee Management System",
    "Institution Management System", "School ERP 2026",
    "College Automation Platform", "Student Information System", "SIS",
    "Faculty Performance Portal", "Automated Fee Management", "Placement Cell Software",
    "CBCS Credit Tracking", "Biometric Attendance System", "Cloud-based School ERP",
    "Paperless Campus", "Academic Workflow Automation", "HR and Payroll for Colleges"
  ],
  icons: {
    icon: [
      { url: "/logo-secondary.png" },
      { url: "/logo-secondary.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/logo-secondary.png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        suppressHydrationWarning
        // className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden flex justify-between`}
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen w-screen flex justify-between`}
      >
        <NextIntlClientProvider messages={messages}>
          <FontProvider>
            <UserProvider>
              <AdminProvider>
                <FacultyProvider>
                  <StudentProvider>
                    <ParentProvider>
                      <CollegeAdminProvider>
                        <FinanceManagerProvider>
                          <HrProvider>
                            {/* <SessionRefresher /> */}
                            <ClientLayout>{children}</ClientLayout>
                          </HrProvider>
                        </FinanceManagerProvider>
                      </CollegeAdminProvider>
                    </ParentProvider>
                  </StudentProvider>
                </FacultyProvider>
              </AdminProvider>
            </UserProvider>
          </FontProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
