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
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-screen overflow-hidden flex justify-between`}
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
                            <SessionRefresher />
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
