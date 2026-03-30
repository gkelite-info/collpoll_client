// "use client";

// import { useState } from "react";
// import { ArrowLeft } from "@phosphor-icons/react";
// import { motion } from "framer-motion";
// import HrStaffAttendancePage from "./Hrstaffattendancepage";
// import HrStaffSummaryPage from "./Hrstaffsummarypage";
// import HrStaffManageTaxPage from "./Hrstaffmanagetaxpage";
// import HrStaffMyPayPage from "./Hrstaffmypaypage";
// import HrStaffAttendanceAnalyticsPage from "./Hrstaffattendanceanalyticspage ";

// interface Props {
//   userId: string;
//   onBack: () => void;
// }

// type MainTab = "attendance" | "payroll" | "analytics";
// type PayrollSubTab = "summary" | "myPay" | "manageTax";

// export default function HrStaffAttendanceView({ userId, onBack }: Props) {
//   const [activeTab, setActiveTab] = useState<MainTab>("attendance");
//   const [activePayrollTab, setActivePayrollTab] =
//     useState<PayrollSubTab>("summary");

//   const tabs: { id: MainTab; label: string }[] = [
//     { id: "attendance", label: "Attendance" },
//     { id: "payroll", label: "Payroll" },
//     { id: "analytics", label: "Attendance Analytics" },
//   ];

//   const payrollSubTabs: { id: PayrollSubTab; label: string }[] = [
//     { id: "summary", label: "Summary" },
//     { id: "myPay", label: "My Pay" },
//     { id: "manageTax", label: "Manage Tax" },
//   ];

//   return (
//     <div className="w-full font-sans pt-2">
//       {/* Back button */}
//       <button
//         onClick={onBack}
//         className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#22C55E] transition-colors mb-4 cursor-pointer"
//       >
//         <ArrowLeft size={16} weight="bold" />
//         <span>Back to Dashboard</span>
//       </button>

//       {/* Main tab switcher */}
//       <div className="flex justify-center mb-6 w-full px-10">
//         <div className="relative flex items-center bg-[#E5E5E5] p-1 rounded-full w-full max-w-[700px] justify-between">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`relative z-10 w-1/3 py-1.5 text-[14px] cursor-pointer transition-colors duration-300 ${
//                 activeTab === tab.id
//                   ? "text-white font-medium delay-100"
//                   : "text-[#5A5A5A] hover:text-gray-800"
//               }`}
//             >
//               <span className="relative z-10">{tab.label}</span>
//               {activeTab === tab.id && (
//                 <motion.div
//                   layoutId="hr-staff-active-pill"
//                   className="absolute inset-0 rounded-full -z-0 bg-[#43C17A]"
//                   transition={{ type: "spring", stiffness: 400, damping: 30 }}
//                 />
//               )}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Tab content */}
//       <div className="transition-opacity duration-300">
//         {activeTab === "attendance" && (
//           <HrStaffAttendancePage userId={userId} />
//         )}

//         {activeTab === "payroll" && (
//           <div className="flex flex-col items-center w-full p-2">
//             {/* Payroll sub-tabs */}
//             <div className="flex justify-center mb-4 gap-12 w-full">
//               {payrollSubTabs.map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActivePayrollTab(tab.id)}
//                   className={`text-[15px] cursor-pointer pb-1.5 transition-all duration-300 ${
//                     activePayrollTab === tab.id
//                       ? "text-[#43C17A] border-b-[2px] border-[#43C17A]"
//                       : "text-[#5A5A5A] font-medium border-b-[2px] border-transparent hover:text-gray-800"
//                   }`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             <div className="w-full">
//               {activePayrollTab === "summary" && (
//                 <div className="w-full text-left mt-2">
//                   <HrStaffSummaryPage userId={userId} />
//                 </div>
//               )}
//               {activePayrollTab === "myPay" && (
//                 <div className="w-full text-left mt-2">
//                   <HrStaffMyPayPage userId={userId} />
//                 </div>
//               )}
//               {activePayrollTab === "manageTax" && (
//                 <div className="w-full text-left mt-2">
//                   <HrStaffManageTaxPage userId={userId} />
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {activeTab === "analytics" && (
//           <HrStaffAttendanceAnalyticsPage userId={userId} />
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { motion } from "framer-motion";
// import HrStaffAttendancePage from "./Hrstaffattendancepage";
// import HrStaffSummaryPage from "./Hrstaffsummarypage";
// import HrStaffManageTaxPage from "./Hrstaffmanagetaxpage";
// import HrStaffMyPayPage from "./Hrstaffmypaypage";
// import HrStaffAttendanceAnalyticsPage from "./Hrstaffattendanceanalyticspage ";

import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import {
  FacultyProfileData,
  fetchFacultyProfile,
} from "@/lib/helpers/Hr/myAttendance/fetchFaculty";

interface Props {
  userId: string;
  onBack: () => void;
}

type MainTab = "attendance" | "payroll" | "analytics";
type PayrollSubTab = "summary" | "myPay" | "manageTax";

export default function HrStaffAttendanceView({ userId, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<MainTab>("attendance");
  const [activePayrollTab, setActivePayrollTab] =
    useState<PayrollSubTab>("summary");

  const [profile, setProfile] = useState<FacultyProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      setIsLoading(true);
      const data = await fetchFacultyProfile(userId);
      setProfile(data);
      setIsLoading(false);
    };
    loadProfile();
  }, [userId]);

  const tabs: { id: MainTab; label: string }[] = [
    { id: "attendance", label: "Attendance" },
    { id: "payroll", label: "Payroll" },
    { id: "analytics", label: "Attendance Analytics" },
  ];

  const payrollSubTabs: { id: PayrollSubTab; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "myPay", label: "My Pay" },
    { id: "manageTax", label: "Manage Tax" },
  ];

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full font-sans pt-2">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#22C55E] transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} weight="bold" />
        <span>Back to Dashboard</span>
      </button>

      <div className="flex justify-center mb-6 w-full px-10">
        <div className="relative flex items-center bg-[#E5E5E5] p-1 rounded-full w-full max-w-[700px] justify-between">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative z-10 w-1/3 py-1.5 text-[14px] cursor-pointer transition-colors duration-300 ${
                activeTab === tab.id
                  ? "text-white font-medium delay-100"
                  : "text-[#5A5A5A] hover:text-gray-800"
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="hr-staff-active-pill"
                  className="absolute inset-0 rounded-full -z-0 bg-[#43C17A]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* <div className="transition-opacity duration-300">
        {activeTab === "attendance" && (
          <HrStaffAttendancePage userId={userId} />
        )}

        {activeTab === "payroll" && (
          <div className="flex flex-col items-center w-full p-2">
            <div className="flex justify-center mb-4 gap-12 w-full">
              {payrollSubTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePayrollTab(tab.id)}
                  className={`text-[15px] cursor-pointer pb-1.5 transition-all duration-300 ${
                    activePayrollTab === tab.id
                      ? "text-[#43C17A] border-b-[2px] border-[#43C17A]"
                      : "text-[#5A5A5A] font-medium border-b-[2px] border-transparent hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-full">
              {activePayrollTab === "summary" && (
                <div className="w-full text-left mt-2">
                  <HrStaffSummaryPage userId={userId} profile={profile} />
                </div>
              )}
              {activePayrollTab === "myPay" && (
                <div className="w-full text-left mt-2">
                  <HrStaffMyPayPage userId={userId} profile={profile} />
                </div>
              )}
              {activePayrollTab === "manageTax" && (
                <div className="w-full text-left mt-2">
                  <HrStaffManageTaxPage userId={userId} profile={profile} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <HrStaffAttendanceAnalyticsPage userId={userId} profile={profile} />
        )}
      </div> */}
    </div>
  );
}
