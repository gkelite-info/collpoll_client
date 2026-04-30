// "use client";
// import TinyDonut from "@/app/utils/pieChart";
// import { FaChevronRight } from "react-icons/fa6";

// type SubjectProgressCard = {
//   title: string;
//   professor: string;
//   image: string;
//   percentage: number;
//   radialStart: string;
//   radialEnd: string;
//   remainingColor: string;
// };

// type SubjectProgressCardProps = {
//   props: SubjectProgressCard[];
//   onViewMore?: () => void;
//   isLoading?: boolean;
// };

// const getSubjectInitials = (title: string) => {
//   const parts = title.trim().split(/\s+/).filter(Boolean);

//   if (parts.length === 0) return "SU";
//   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

//   return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
// };

// export default function SubjectProgressCards({
//   props,
//   onViewMore,
//   isLoading,
// }: SubjectProgressCardProps) {
//   return (
//     <>
//       <div className="bg-white h-64 rounded-lg w-[49%] p-4 shadow-md flex flex-col gap-2">
//         <div className="flex justify-between items-center">
//           <h6 className="text-[#282828] font-semibold">Subjects Progress</h6>
//           <FaChevronRight
//             className="cursor-pointer text-black"
//             onClick={onViewMore}
//           />
//         </div>

//         <div className="flex flex-col gap-2 overflow-y-auto">
//           {isLoading ? (
//             [1, 2, 3].map((_, i) => (
//               <div
//                 key={i}
//                 className="h-20 flex items-center rounded-lg p-2 gap-1 bg-gray-50 animate-pulse"
//               >
//                 <div className="h-full w-[22%] rounded-md bg-gray-200" />
//                 <div className="h-full w-[78%] rounded-md p-2 flex justify-between items-center">
//                   <div className="flex flex-col gap-2">
//                     <div className="h-2 w-24 bg-gray-200 rounded" />
//                     <div className="h-2 w-16 bg-gray-200 rounded" />
//                   </div>
//                   <div className="h-10 w-10 rounded-full bg-gray-200 mr-1" />
//                 </div>
//               </div>
//             ))
//           ) : props.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center py-10 opacity-70">
//               <p className="text-[#282828] text-sm font-medium">
//                 No subjects yet !
//               </p>
//             </div>
//           ) : (
//             props.map((subject, index) => (
//               <div
//                 key={index}
//                 className="h-20 flex items-center rounded-lg p-2 gap-1 bg-[#E8F8EF]"
//               >
//                 <div className="h-full w-[22%] rounded-md flex items-center justify-center overflow-hidden">
//                   {subject.image ? (
//                     <img
//                       src={subject.image}
//                       alt={subject.title}
//                       className="h-12 w-12 rounded-md object-cover"
//                       onError={(e) => {
//                         e.currentTarget.style.display = "none";
//                         const fallback = e.currentTarget.nextElementSibling as HTMLDivElement | null;
//                         if (fallback) fallback.style.display = "flex";
//                       }}
//                     />
//                   ) : null}
//                   <div
//                     className="h-12 w-12 items-center justify-center rounded-md bg-[#BFEFCD] text-[16px] font-semibold text-[#16284F]"
//                     style={{ display: subject.image ? "none" : "flex" }}
//                   >
//                     {getSubjectInitials(subject.title)}
//                   </div>
//                 </div>
//                 <div className="h-full w-[78%] rounded-md p-2 flex justify-between">
//                   <div className="flex flex-col gap-2 w-auto">
//                     <p
//                       style={{
//                         fontSize: 10,
//                         fontWeight: "600",
//                         color: "#16284F",
//                       }}
//                     >
//                       {subject.title}
//                     </p>
//                     <p style={{ fontSize: 10, color: "#454545" }}>
//                       {subject.professor}
//                     </p>
//                   </div>
//                   <div className="w-auto">
//                     <TinyDonut
//                       percentage={subject.percentage}
//                       width={50}
//                       height={50}
//                       radialStart={subject.radialStart}
//                       radialEnd={subject.radialEnd}
//                       remainingColor={subject.remainingColor}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

"use client";
import TinyDonut from "@/app/utils/pieChart";
import { FaChevronRight } from "react-icons/fa6";
import { useTranslations } from "next-intl";

type SubjectProgressCard = {
  title: string;
  professor: string;
  image: string;
  percentage: number;
  radialStart: string;
  radialEnd: string;
  remainingColor: string;
};

type SubjectProgressCardProps = {
  props: SubjectProgressCard[];
  onViewMore?: () => void;
  isLoading?: boolean;
};

const getSubjectInitials = (title: string) => {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

export default function SubjectProgressCards({
  props,
  onViewMore,
  isLoading,
}: SubjectProgressCardProps) {
  const t = useTranslations("Dashboard.student");

  return (
    <>
      <div className="bg-white h-64 rounded-lg w-[49%] p-4 shadow-md flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h6 className="text-[#282828] font-semibold">
            {t("Subjects Progress")}
          </h6>
          <FaChevronRight
            className="cursor-pointer text-black"
            onClick={onViewMore}
          />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {isLoading ? (
            [1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="h-20 flex items-center rounded-lg p-2 gap-1 bg-gray-50 animate-pulse"
              >
                <div className="h-full w-[22%] rounded-md bg-gray-200" />
                <div className="h-full w-[78%] rounded-md p-2 flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <div className="h-2 w-24 bg-gray-200 rounded" />
                    <div className="h-2 w-16 bg-gray-200 rounded" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-1" />
                </div>
              </div>
            ))
          ) : props.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-10 opacity-70">
              <p className="text-[#282828] text-sm font-medium">
                {t("No subjects yet !")}
              </p>
            </div>
          ) : (
            props.map((subject, index) => (
              <div
                key={index}
                className="h-20 flex items-center rounded-lg p-2 gap-1 bg-[#E8F8EF]"
              >
                <div className="h-full w-[22%] rounded-md flex items-center justify-center overflow-hidden">
                  {subject.image ? (
                    <img
                      src={subject.image}
                      alt={subject.title}
                      className="h-12 w-12 rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLDivElement | null;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="h-12 w-12 items-center justify-center rounded-md bg-[#BFEFCD] text-[16px] font-semibold text-[#16284F]"
                    style={{ display: subject.image ? "none" : "flex" }}
                  >
                    {getSubjectInitials(subject.title)}
                  </div>
                </div>
                <div className="h-full w-[78%] rounded-md p-2 flex justify-between">
                  <div className="flex flex-col gap-2 w-auto">
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color: "#16284F",
                      }}
                    >
                      {subject.title}
                    </p>
                    <p style={{ fontSize: 10, color: "#454545" }}>
                      {subject.professor}
                    </p>
                  </div>
                  <div className="w-auto">
                    <TinyDonut
                      percentage={subject.percentage}
                      width={50}
                      height={50}
                      radialStart={subject.radialStart}
                      radialEnd={subject.radialEnd}
                      remainingColor={subject.remainingColor}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
