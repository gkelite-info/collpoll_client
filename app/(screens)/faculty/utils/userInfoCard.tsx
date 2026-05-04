// "use client";

// import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
// import { useEffect, useState } from "react";

// export type UserInfoCardProps = {
//   show?: boolean;
//   studentId?: number;
//   studentBranch?: string;
//   user: string;
//   studentName?: string;
//   facultySubject?: string;
//   studentsTaskPercentage?: number;
//   childPerformance?: string;
//   image?: string;
//   studentAcademicYear?: string;
//   imageHeight?: string;
//   imageAlign?: "center" | "bottom";
//   top?: string;
//   right?: string;
// };

// type UserInfoProps = {
//   cardProps: UserInfoCardProps[];
// };

// export function UserInfoCard({ cardProps }: UserInfoProps) {
//   const [today, setToday] = useState("");

//   const { faculty_subject } = useFaculty();

//   useEffect(() => {
//     const currentDate = new Date();

//     const day = String(currentDate.getDate()).padStart(2, "0");
//     const month = String(currentDate.getMonth() + 1).padStart(2, "0");
//     const year = currentDate.getFullYear();

//     setToday(`${day}/${month}/${year}`);
//   }, []);

//   return (
//     <div className="w-full relative bg-[#DAEEE3] rounded-2xl h-[170px]  shadow-sm">
//       {cardProps.map((item, index) => (
//         <div
//           className="relative z-10 grid grid-cols-[70%_30%] h-full items-center justify-between px-8"
//           key={index}
//         >
//           <div className="bg-blue-00 flex flex-col max-w-[90%] gap-2">
//             <p className="text-xs text-[#282828] leading-tight">
//               {item.show && "StudentID:"} {item.studentId}
//               {item.show && ", "} {item.studentBranch}
//               {item.show && ", "} {item.studentAcademicYear}
//             </p>

//             <p className="text-lg text-[#282828] leading-tight mt-3">
//               Welcome Back,
//             </p>

//             <div className="flex items-baseline flex-wrap gap-1.5">
//               <h1 className="text-lg font-semibold text-[#089144] leading-tight">
//                 {!item.show ? `Prof. ${item.user}` : item.user}
//               </h1>

//               <div className="bg-yellow-00 min-w-0 overflow-x-auto">
//                 {!item.show && faculty_subject?.length > 0 && (
//                   <span className="text-[#454545] text-md font-medium whitespace-nowrap">
//                     {faculty_subject.map((s) => s.subjectName).join(", ")}
//                   </span>
//                 )}
//               </div>

//               {item.show && item.studentName && (
//                 <p className="text-[#454545] italic text-sm font-medium">
//                   Parent of{" "}
//                   <span className="text-[#089144] font-semibold">
//                     {item.studentName}
//                   </span>
//                 </p>
//               )}
//             </div>

//             <p className="text-md text-[#454545] mt-0 font-medium">
//               {!item.show && "Your Students Completed "}
//               <span className="text-[#089144] font-bold">
//                 {item.studentsTaskPercentage}
//                 {!item.show && "%"}
//               </span>{" "}
//               {!item.show && "of the tasks."}
//             </p>
//             <p className="text-sm text-[#454545] mt-0">
//               {item.childPerformance}
//             </p>
//           </div>

//           {item.image && (
//             <img
//               src={item.image}
//               alt="User"
//               className="lg:relative lg:top-[-10] bg-green-00 z-50 h-[180px]"
//             />
//           )}
//         </div>
//       ))}

//       <svg
//         className="absolute right-0 bottom-0 z-0 h-full w-auto"
//         width="186"
//         height="170"
//         viewBox="0 0 186 170"
//         fill="none"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path
//           fillRule="evenodd"
//           clipRule="evenodd"
//           d="M173.532 0C180.146 0 185.512 5.35094 185.532 11.9644L185.955 154.896C185.98 163.197 179.257 169.94 170.955 169.94H51.5453C46.2115 169.775 40.1483 169.848 34.1023 169.92C7.43518 170.24 -18.9265 170.556 18.8128 150.447C28.6823 144.861 52.2795 137.844 67.7118 154.469C74.142 158.938 101.032 145.673 130.82 112.96C139.793 102.681 157.737 73.8116 157.737 40.5622C156.99 31.1773 155.943 10.7256 157.737 0H171.9H173.532Z"
//           fill="#BCE6D0"
//         />
//       </svg>
//     </div>
//   );
// }

"use client";

import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export type UserInfoCardProps = {
  show?: boolean;
  studentId?: number;
  studentBranch?: string;
  user: string;
  studentName?: string;
  facultySubject?: string;
  studentsTaskPercentage?: number;
  childPerformance?: string;
  image?: string;
  studentAcademicYear?: string;
  imageHeight?: string;
  imageAlign?: "center" | "bottom";
  top?: string;
  right?: string;
};

type UserInfoProps = {
  cardProps: UserInfoCardProps[];
};

export function UserInfoCard({ cardProps }: UserInfoProps) {
  const [today, setToday] = useState("");
  const t = useTranslations("Dashboard.parent");

  const { faculty_subject } = useFaculty();
  const bgBanner = "/dashboard-banner-bg.png";

  return (
    <div
      className="w-full relative rounded-2xl h-[170px] shadow-sm"
      style={{
        backgroundImage: `url(${bgBanner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      {cardProps.map((item, index) => (
        <div
          className="relative z-10 grid grid-cols-[70%_30%] h-full items-center justify-between px-8"
          key={index}
        >
          <div className="bg-blue-00 flex flex-col max-w-[65%] gap-2">
            <p className="text-xs text-[#282828] leading-tight">
              {item.show && t("StudentID:")} {item.studentId}
              {item.show && ", "} {item.studentBranch}
              {item.show && ", "} {item.studentAcademicYear}
            </p>

            <p className="text-lg text-[#282828] leading-tight mt-3">
              {t("Welcome Back,")}
            </p>

            <div className="flex items-baseline flex-wrap gap-1.5">
              <h1 className="text-lg font-semibold text-[#089144] leading-tight">
                {!item.show ? `${t("Prof")} ${item.user}` : item.user}
              </h1>

              <div className="bg-yellow-00 min-w-0 overflow-x-auto">
                {!item.show && faculty_subject?.length > 0 && (
                  <span className="text-[#454545] text-md font-medium whitespace-nowrap">
                    {faculty_subject.map((s) => s.subjectName).join(", ")}
                  </span>
                )}
              </div>

              {item.show && item.studentName && (
                <p className="text-[#454545] italic text-sm font-medium">
                  {t("Parent of")}{" "}
                  <span className="text-[#089144] font-semibold">
                    {item.studentName}
                  </span>
                </p>
              )}
            </div>

            <p className="text-md text-[#454545] mt-0 font-medium">
              {!item.show && t("Your Students Completed ")}
              <span className="text-[#089144] font-bold">
                {item.studentsTaskPercentage}
                {!item.show && "%"}
              </span>{" "}
              {!item.show && t("of the tasks")}
            </p>
            <p className="text-sm text-[#454545] mt-0">
              {item.childPerformance}
            </p>
          </div>

          {/* {item.image && (
            <img
              src={item.image}
              alt="User"
              className="lg:relative lg:top-[-10] bg-green-00 z-50 h-[180px]"
            />
          )} */}
          {cardProps[0].image && (
            <div className="absolute md:-right-3 lg:right-10 bottom-0 h-[105%] w-[180px]">
              <Image
                src={cardProps[0].image}
                alt="Avatar"
                fill
                className="object-contain object-bottom pointer-events-none"
                priority
              />
            </div>
          )}
        </div>
      ))}

      <svg
        className="absolute right-0 bottom-0 z-0 h-full w-auto"
        width="186"
        height="170"
        viewBox="0 0 186 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M173.532 0C180.146 0 185.512 5.35094 185.532 11.9644L185.955 154.896C185.98 163.197 179.257 169.94 170.955 169.94H51.5453C46.2115 169.775 40.1483 169.848 34.1023 169.92C7.43518 170.24 -18.9265 170.556 18.8128 150.447C28.6823 144.861 52.2795 137.844 67.7118 154.469C74.142 158.938 101.032 145.673 130.82 112.96C139.793 102.681 157.737 73.8116 157.737 40.5622C156.99 31.1773 155.943 10.7256 157.737 0H171.9H173.532Z"
          fill="#BCE6D0"
        />
      </svg>
    </div>
  );
}
