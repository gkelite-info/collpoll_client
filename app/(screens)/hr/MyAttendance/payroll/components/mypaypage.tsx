// "use client";

// import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Suspense, useEffect, useState } from "react";
// import AddPayModal from "../../components/AddPayModal";

// function MyPayPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const mainParam = searchParams.get("main") || "payroll";
//   const subParam = searchParams.get("sub") || "myPay";
//   const viewParam = (searchParams.get("view") as "salary" | "tax") || "salary";

//   const [activeTab, setActiveTab] = useState<"salary" | "tax">(viewParam);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const currentEmployee = {
//     name: "Dr. Ranvith Reddy",
//     id: "904244",
//     joiningDate: "01/05/2026",
//     department: "Computer Science",
//     role: "Associate Professor",
//     image: "/rahul.png",
//   };

//   useEffect(() => {
//     setActiveTab(viewParam);
//   }, [viewParam]);

//   const handleTabSwitch = (tab: "salary" | "tax") => {
//     setActiveTab(tab);
//     router.push(`?main=${mainParam}&sub=${subParam}&view=${tab}`, {
//       scroll: false,
//     });
//   };

//   const paySlips = [
//     {
//       id: 1,
//       month: "January 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 2,
//       month: "February 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 3,
//       month: "March 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 4,
//       month: "January 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 5,
//       month: "February 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 6,
//       month: "March 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 7,
//       month: "January 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 8,
//       month: "February 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//     {
//       id: 9,
//       month: "March 2025",
//       date: "23/09/2025",
//       gross: "45,500.0",
//       deductions: "5,80.00",
//       net: "6,90.00",
//     },
//   ];

//   return (
//     <div className="w-full max-w-5xl mx-auto flex flex-col h-[550px] text-left">
//       <AddPayModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         employee={currentEmployee}
//       />

//       <div className="flex-shrink-0 text-[14px] font-bold mb-4">
//         <span
//           onClick={() => handleTabSwitch("salary")}
//           className={`cursor-pointer transition-colors ${activeTab === "salary" ? "text-[#43C17A] underline decoration-2 underline-offset-4" : "text-[#333333] hover:text-[#43C17A]"}`}
//         >
//           My Salary & Pay Slips
//         </span>
//         <span className="text-gray-400 mx-2">/</span>
//         <span
//           onClick={() => handleTabSwitch("tax")}
//           className={`cursor-pointer transition-colors ${activeTab === "tax" ? "text-[#43C17A] underline decoration-2 underline-offset-4" : "text-[#333333] hover:text-[#43C17A]"}`}
//         >
//           Income TAX
//         </span>
//       </div>

//       {activeTab === "salary" ? (
//         <>
//           <div className="flex-shrink-0">
//             <div className="flex justify-between items-center mb-3">
//               <h2 className="text-[16px] font-extrabold text-[#333333]">
//                 My Salary
//               </h2>
//               <button
//                 onClick={() => setIsModalOpen(true)}
//                 className="bg-[#16284F] hover:bg-[#1a2f5c] cursor-pointer text-white px-6 py-2 rounded-md font-medium text-[13px] transition-colors"
//               >
//                 Adding Pay
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//               <div className="col-span-1 flex flex-col gap-4">
//                 <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50">
//                   <p className="text-[#666666] text-[13px] font-semibold">
//                     Current Compensation
//                   </p>
//                   <p className="text-[#333333] font-bold text-[16px] mt-1">
//                     INR 8,50,000/Annum
//                   </p>
//                 </div>

//                 <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex justify-between items-center">
//                   <div>
//                     <p className="text-[#666666] text-[13px] font-semibold">
//                       Payroll
//                     </p>
//                     <p className="text-[#333333] font-semibold text-[14px] mt-0.5">
//                       Paycycle
//                     </p>
//                   </div>
//                   <span className="text-[#43C17A] font-bold text-[14px] mt-4">
//                     Monthly
//                   </span>
//                 </div>
//               </div>

//               <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="text-[#333333] font-extrabold text-[15px]">
//                       Salary Timeline
//                     </h3>
//                     <p className="text-[#666666] text-[11px] mt-1 font-bold">
//                       SALARY REVISION :{" "}
//                       <span className="font-medium">
//                         Effective Jan 23, 2025
//                       </span>
//                     </p>
//                   </div>
//                   <span className="bg-[#43C17A] text-white text-[10px] px-2 py-0.5 rounded-[4px] font-bold tracking-wide">
//                     CURRENT
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-4 gap-2 mt-5">
//                   <div>
//                     <p className="text-[#333333] font-bold text-[13px]">
//                       Regular Salary
//                     </p>
//                     <p className="text-[#666666] text-[13px] font-medium mt-1">
//                       INR 8,50,000
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[#333333] font-bold text-[13px]">
//                       Other
//                     </p>
//                     <p className="text-[#666666] text-[13px] font-medium mt-1">
//                       INR 5
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[#333333] font-bold text-[13px]">
//                       Bonus
//                     </p>
//                     <p className="text-[#666666] text-[13px] font-medium mt-1">
//                       INR 50,00,000
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-[#333333] font-bold text-[13px]">
//                       Total
//                     </p>
//                     <p className="text-[#666666] text-[13px] font-medium mt-1">
//                       INR 9,00,005
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <h2 className="text-[16px] font-extrabold text-[#333333] mb-3">
//               Pay Slips
//             </h2>
//           </div>
//           <div className="min-h-[108vh] overflow-y-auto pr-2 pb-6 space-y-4 rounded-xl custom-scrollbar">
//             {paySlips.map((slip) => (
//               <div
//                 key={slip.id}
//                 className="bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50"
//               >
//                 <div className="flex justify-between items-center mb-5">
//                   <h3 className="text-[15px] font-bold text-[#333333]">
//                     {slip.month}
//                   </h3>
//                   <div className="flex items-center space-x-4 text-[13px] font-bold">
//                     <span className="text-[#333333]">
//                       Status - <span className="text-[#43C17A]">Paid</span>
//                     </span>
//                     <button className="flex items-center text-[#333333] hover:text-[#43C17A] transition-colors">
//                       Download
//                       <svg
//                         className="w-[14px] h-[14px] ml-1.5"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2.5"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       >
//                         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
//                         <polyline points="7 10 12 15 17 10"></polyline>
//                         <line x1="12" y1="15" x2="12" y2="3"></line>
//                       </svg>
//                     </button>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-[13px]">
//                   <div className="flex items-center">
//                     <span className="w-[100px] font-bold text-[#333333]">
//                       Pay Date :
//                     </span>
//                     <span className="text-[#666666] font-medium">
//                       {slip.date}
//                     </span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="w-[100px] font-bold text-[#333333]">
//                       Deductions :
//                     </span>
//                     <span className="text-[#666666] font-medium">
//                       {slip.deductions}
//                     </span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="w-[100px] font-bold text-[#333333]">
//                       Gross Pay :
//                     </span>
//                     <span className="text-[#666666] font-medium">
//                       {slip.gross}
//                     </span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="w-[100px] font-bold text-[#333333]">
//                       Net Pay :
//                     </span>
//                     <span className="text-[#666666] font-medium">
//                       {slip.net}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </>
//       ) : (
//         <div className="flex-1 min-h-[154vh] overflow-y-auto pr-2 pb-6 custom-scrollbar">
//           <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
//             <div>
//               <p className="text-[#333333] font-bold text-[14px]">
//                 Net Taxable Income
//               </p>
//               <p className="text-[#43C17A] font-medium text-[13px] mt-1">
//                 INR 3,39,200
//               </p>
//             </div>
//             <div>
//               <p className="text-[#333333] font-bold text-[14px]">
//                 Gross Income Tax
//               </p>
//               <p className="text-[#43C17A] font-medium text-[13px] mt-1">
//                 INR 3,39,200
//               </p>
//             </div>
//             <div>
//               <p className="text-[#333333] font-bold text-[14px]">
//                 Total Surcharge & Cess
//               </p>
//               <p className="text-[#43C17A] font-medium text-[13px] mt-1">
//                 INR 3,39,200
//               </p>
//             </div>
//             <div>
//               <p className="text-[#333333] font-bold text-[14px]">
//                 Net Income Tax Payable
//               </p>
//               <p className="text-[#43C17A] font-medium text-[13px] mt-1">
//                 INR 3,39,200
//               </p>
//             </div>
//             <div>
//               <p className="text-[#333333] font-bold text-[14px]">
//                 TAX paid Till Now
//               </p>
//               <p className="text-[#43C17A] font-medium text-[13px] mt-1">
//                 INR 0
//               </p>
//             </div>
//             <div>
//               <p className="text-[#333333] font-bold text-[14px]">
//                 Remaining Tax To Be Paid
//               </p>
//               <p className="text-[#43C17A] font-medium text-[13px] mt-1">
//                 INR 0
//               </p>
//             </div>
//           </div>
//           <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
//             <div className="overflow-x-auto w-full">
//               <table className="w-full text-left text-[14px]">
//                 <thead>
//                   <tr className="border-b border-gray-100">
//                     <th className="py-4 px-6 text-[#333333] font-bold">
//                       Salary Breakup
//                     </th>
//                     <th className="py-4 px-6 text-[#333333] font-bold">
//                       Total
//                     </th>
//                     <th className="py-4 px-6 text-[#333333] font-bold">
//                       Apr 25
//                     </th>
//                     <th className="py-4 px-6 text-[#333333] font-bold">
//                       May 25
//                     </th>
//                     <th className="py-4 px-6 text-[#333333] font-bold">
//                       Jun 25
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
//                     <td className="py-4 px-6 text-[#666666] font-medium">
//                       Basic
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       2,12,500
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       37,417
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       37,417
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       37,417
//                     </td>
//                   </tr>
//                   <tr className="hover:bg-gray-50/50 transition-colors">
//                     <td className="py-4 px-6 text-[#666666] font-medium">
//                       HRA
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       85,000
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       14,234
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       14,234
//                     </td>
//                     <td className="py-4 px-6 text-[#333333] font-medium">
//                       14,234
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default function Page() {
//   return (
//     <Suspense
//       fallback={
//         <div className="p-6 text-sm ">
//           {" "}
//           <Loader />{" "}
//         </div>
//       }
//     >
//       <MyPayPage />
//     </Suspense>
//   );
// }

"use client";

import { Loader } from "@/app/(screens)/(student)/calendar/right/timetable";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddPayModal from "../../components/AddPayModal";
import { FacultyProfileData } from "@/lib/helpers/Hr/myAttendance/fetchFaculty";
import { useCollegeHr } from "@/app/utils/context/hr/useCollegeHr";
import {
  EmployeePaySummary,
  fetchEmployeePaySummary,
} from "@/lib/helpers/Hr/myAttendance/fetchEmployeePaySummary";

interface MyPayPageProps {
  profile?: any;
}

export default function MyPayPage({ profile }: MyPayPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { collegeId, loading: hrLoading } = useCollegeHr();

  const mainParam = searchParams.get("main") || "payroll";
  const subParam = searchParams.get("sub") || "myPay";
  const viewParam = (searchParams.get("view") as "salary" | "tax") || "salary";
  const facultyId = searchParams.get("faculty");

  const [activeTab, setActiveTab] = useState<"salary" | "tax">(viewParam);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [payData, setPayData] = useState<EmployeePaySummary | null>(null);
  const [isFetchingPay, setIsFetchingPay] = useState(true);

  const loadPayData = async () => {
    if (!profile?.id || !collegeId) return;
    setIsFetchingPay(true);
    const data = await fetchEmployeePaySummary(
      parseInt(profile.id, 10),
      collegeId,
    );
    setPayData(data);
    setIsFetchingPay(false);
  };

  useEffect(() => {
    if (!hrLoading) loadPayData();
  }, [profile?.id, collegeId, hrLoading]);

  useEffect(() => {
    setActiveTab(viewParam);
  }, [viewParam]);

  const handleTabSwitch = (tab: "salary" | "tax") => {
    setActiveTab(tab);
    const facultyStr = facultyId ? `&faculty=${facultyId}` : "";
    router.push(`?main=${mainParam}&sub=${subParam}&view=${tab}${facultyStr}`, {
      scroll: false,
    });
  };

  const paySlips = [
    {
      id: 1,
      month: "January 2025",
      date: "23/09/2025",
      gross: "45,500.0",
      deductions: "5,80.00",
      net: "6,90.00",
    },
    {
      id: 2,
      month: "February 2025",
      date: "23/09/2025",
      gross: "45,500.0",
      deductions: "5,80.00",
      net: "6,90.00",
    },
    {
      id: 3,
      month: "March 2025",
      date: "23/09/2025",
      gross: "45,500.0",
      deductions: "5,80.00",
      net: "6,90.00",
    },
  ];

  if (!profile) return null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-[550px] text-left">
      <AddPayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadPayData}
        employee={profile}
      />

      <div className="flex-shrink-0 text-[14px] font-bold mb-4">
        <span
          onClick={() => handleTabSwitch("salary")}
          className={`cursor-pointer transition-colors ${activeTab === "salary" ? "text-[#43C17A] underline decoration-2 underline-offset-4" : "text-[#333333] hover:text-[#43C17A]"}`}
        >
          My Salary & Pay Slips
        </span>
        <span className="text-gray-400 mx-2">/</span>
        <span
          onClick={() => handleTabSwitch("tax")}
          className={`cursor-pointer transition-colors ${activeTab === "tax" ? "text-[#43C17A] underline decoration-2 underline-offset-4" : "text-[#333333] hover:text-[#43C17A]"}`}
        >
          Income TAX
        </span>
      </div>

      {activeTab === "salary" ? (
        <>
          <div className="flex-shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-[16px] font-extrabold text-[#333333]">
                My Salary
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#16284F] hover:bg-[#1a2f5c] cursor-pointer text-white px-6 py-2 rounded-md font-medium text-[13px] transition-colors"
              >
                {payData ? "Edit Pay" : "Adding Pay"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="col-span-1 flex flex-col gap-4">
                <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 relative overflow-hidden">
                  {isFetchingPay && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                      <Loader />
                    </div>
                  )}
                  <p className="text-[#666666] text-[13px] font-semibold">
                    Current Compensation
                  </p>
                  <p className="text-[#333333] font-bold text-[16px] mt-1">
                    INR{" "}
                    {payData ? payData.totalCTC.toLocaleString("en-IN") : "0"}
                    /Annum
                  </p>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex justify-between items-center relative overflow-hidden">
                  {isFetchingPay && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                      <Loader />
                    </div>
                  )}
                  <div>
                    <p className="text-[#666666] text-[13px] font-semibold">
                      Payroll
                    </p>
                    <p className="text-[#333333] font-semibold text-[14px] mt-0.5">
                      Paycycle
                    </p>
                  </div>
                  <span className="text-[#43C17A] font-bold text-[14px] mt-4">
                    Monthly
                  </span>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col justify-between relative overflow-hidden">
                {isFetchingPay && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <Loader />
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[#333333] font-extrabold text-[15px]">
                      Salary Timeline
                    </h3>
                    <p className="text-[#666666] text-[11px] mt-1 font-bold">
                      SALARY REVISION :{" "}
                      <span className="font-medium">
                        {payData
                          ? `Effective ${payData.revisionDate}`
                          : "Not Configured"}
                      </span>
                    </p>
                  </div>
                  <span className="bg-[#43C17A] text-white text-[10px] px-2 py-0.5 rounded-[4px] font-bold tracking-wide">
                    CURRENT
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-5">
                  <div>
                    <p className="text-[#333333] font-bold text-[13px]">
                      Regular Salary
                    </p>
                    <p className="text-[#666666] text-[13px] font-medium mt-1">
                      INR{" "}
                      {payData
                        ? payData.regularSalary.toLocaleString("en-IN")
                        : "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#333333] font-bold text-[13px]">
                      Other
                    </p>
                    <p className="text-[#666666] text-[13px] font-medium mt-1">
                      INR{" "}
                      {payData
                        ? (
                            payData.variablePay + payData.otherAddons
                          ).toLocaleString("en-IN")
                        : "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#333333] font-bold text-[13px]">
                      Bonus
                    </p>
                    <p className="text-[#666666] text-[13px] font-medium mt-1">
                      INR{" "}
                      {payData ? payData.bonus.toLocaleString("en-IN") : "0"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#333333] font-bold text-[13px]">
                      Total
                    </p>
                    <p className="text-[#666666] text-[13px] font-medium mt-1">
                      INR{" "}
                      {payData ? payData.total.toLocaleString("en-IN") : "0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-[16px] font-extrabold text-[#333333] mb-3">
              Pay Slips
            </h2>
          </div>

          <div className="min-h-[108vh] overflow-y-auto pr-2 pb-6 space-y-4 rounded-xl custom-scrollbar">
            {paySlips.map((slip) => (
              <div
                key={slip.id}
                className="bg-white rounded-xl p-5 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50"
              >
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-[15px] font-bold text-[#333333]">
                    {slip.month}
                  </h3>
                  <div className="flex items-center space-x-4 text-[13px] font-bold">
                    <span className="text-[#333333]">
                      Status - <span className="text-[#43C17A]">Paid</span>
                    </span>
                    <button className="flex items-center text-[#333333] hover:text-[#43C17A] transition-colors">
                      Download
                      <svg
                        className="w-[14px] h-[14px] ml-1.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-[13px]">
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Pay Date :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.date}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Deductions :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.deductions}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Gross Pay :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.gross}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-[100px] font-bold text-[#333333]">
                      Net Pay :
                    </span>
                    <span className="text-[#666666] font-medium">
                      {slip.net}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-[154vh] overflow-y-auto pr-2 pb-6 custom-scrollbar">
          <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Net Taxable Income
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Gross Income Tax
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Total Surcharge & Cess
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Net Income Tax Payable
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 3,39,200
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                TAX paid Till Now
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 0
              </p>
            </div>
            <div>
              <p className="text-[#333333] font-bold text-[14px]">
                Remaining Tax To Be Paid
              </p>
              <p className="text-[#43C17A] font-medium text-[13px] mt-1">
                INR 0
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Salary Breakup
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Total
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Apr 25
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      May 25
                    </th>
                    <th className="py-4 px-6 text-[#333333] font-bold">
                      Jun 25
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[#666666] font-medium">
                      Basic
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      2,12,500
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      37,417
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      37,417
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      37,417
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 text-[#666666] font-medium">
                      HRA
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      85,000
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      14,234
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      14,234
                    </td>
                    <td className="py-4 px-6 text-[#333333] font-medium">
                      14,234
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
