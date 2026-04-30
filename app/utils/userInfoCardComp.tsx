// 'use client'

// import { useEffect, useState } from "react";
// import { useUser } from "./context/UserContext";
// import { useStudent } from "./context/student/useStudent";

// export default function UserInfoCard() {

//     const [today, setToday] = useState("");
//     const { fullName, gender, collegeEducationType, collegeBranchCode, identifierId } = useUser();
//     const { collegeAcademicYear } = useStudent();

//     useEffect(() => {
//         const currentDate = new Date();
//         const day = String(currentDate.getDate()).padStart(2, "0");
//         const month = String(currentDate.getMonth() + 1).padStart(2, "0");
//         const year = currentDate.getFullYear();

//         setToday(`${day}/${month}/${year}`);
//     }, []);

//     return (
//         <>
//             <div className="grid grid-cols-[50%_50%] justify-between items-center rounded-lg h-[170px] bg-[#DAEEE3]">
//                 <div className="flex flex-col justify-start p-3 gap-5 bg-yellow-00 rounded-l-lg h-[100%]">
//                     <div className="flex items-center gap-3">
//                         <p className="text-[#714EF2] text-sm font-medium">{collegeEducationType && collegeBranchCode ? `${collegeEducationType} ${collegeBranchCode}` : "—"} - {collegeAcademicYear ? `${collegeAcademicYear}` : "—"}</p>
//                         <p className="text-[#089144] text-sm font-medium">Student Id - <span className="text-[#282828] text-sm">{identifierId}</span></p>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <p className="text-md text-[#282828]">Welcome Back, <span className="text-[#089144] text-md font-medium">{fullName}</span></p>
//                     </div>
//                     <div className="flex flex-col">
//                         <p className="text-sm text-[#454545]">You’ve completed <span className="text-[#089144] font-semibold">0</span> of your tasks.</p>
//                         <p className="text-sm text-[#454545]">Keep up the great progress!</p>
//                     </div>
//                     {/* <div className="bg-[#A3FFCB] w-[25%] p-1 flex items-center justify-center rounded-sm text-[#007533] font-semibold text-sm">
//                         {today ? today : "Loading date..."}
//                     </div> */}
//                 </div>
//                 {/* <div className="w-[40%] bg-pink-00 rounded-r-lg h-[100%] flex items-center justify-center"> */}
//                 {/* <img src="maleuser.png" className="lg:relative lg:top-[-6] z-50 h-[180px]" /> */}
//                 {/* {!loading && (
//                         <img
//                             src="/maleuser.png"
//                             className="lg:relative lg:top-[-6] z-50 h-[180px]"
//                         />
//                     )}
//                 </div> */}

//                 <div className="bg-pink-00 rounded-r-lg h-[100%] flex items-center justify-center">
//                     {gender && (
//                         <img
//                             src={gender === "Female" ? "/student-f.png" : "/student-m.png"}
//                             className="lg:relative lg:top-[-10] z-50 h-[180px] bg-pink-00"
//                             alt="Student"
//                         />
//                     )}
//                 </div>

//             </div>
//         </>
//     )
// }

"use client";

import { useEffect, useState } from "react";
import { useUser } from "./context/UserContext";
import { useStudent } from "./context/student/useStudent";
import { useTranslations } from "next-intl";

export default function UserInfoCard() {
  const [today, setToday] = useState("");
  const {
    fullName,
    gender,
    collegeEducationType,
    collegeBranchCode,
    identifierId,
  } = useUser();
  const { collegeAcademicYear } = useStudent();
  const t = useTranslations("Dashboard.student");

  useEffect(() => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();

    setToday(`${day}/${month}/${year}`);
  }, []);

  return (
    <>
      <div className="grid grid-cols-[50%_50%] justify-between items-center rounded-lg h-[170px] bg-[#DAEEE3]">
        <div className="flex flex-col justify-start p-3 gap-5 bg-yellow-00 rounded-l-lg h-[100%]">
          <div className="flex items-center gap-3">
            <p className="text-[#714EF2] text-sm font-medium">
              {collegeEducationType && collegeBranchCode
                ? `${collegeEducationType} ${collegeBranchCode}`
                : "—"}{" "}
              - {collegeAcademicYear ? `${collegeAcademicYear}` : "—"}
            </p>
            <p className="text-[#089144] text-sm font-medium">
              {t("Student Id - ")}{" "}
              <span className="text-[#282828] text-sm">{identifierId}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-md text-[#282828]">
              {t("Welcome Back, ")}{" "}
              <span className="text-[#089144] text-md font-medium">
                {fullName}
              </span>
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-[#454545]">
              {t("You’ve completed ")}{" "}
              <span className="text-[#089144] font-semibold">0</span>{" "}
              {t(" of your tasks")}
            </p>
            <p className="text-sm text-[#454545]">
              {t("Keep up the great progress!")}
            </p>
          </div>
        </div>

        <div className="bg-pink-00 rounded-r-lg h-[100%] flex items-center justify-center">
          {gender && (
            <img
              src={gender === "Female" ? "/student-f.png" : "/student-m.png"}
              className="lg:relative lg:top-[-10] z-50 h-[180px] bg-pink-00"
              alt="Student"
            />
          )}
        </div>
      </div>
    </>
  );
}
