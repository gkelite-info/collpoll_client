// "use client";

// import { useParams } from "next/navigation";
// import ProjectsHeader from "../compounents/ProjectsHeader";
// import ProjectFilters from "../compounents/ProjectFilters";
// import ProjectGrid from "../compounents/ProjectGrid";
// import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

// export default function DepartmentProjectsPage() {
//   const params = useParams();
//   const department = decodeURIComponent(params.department as string);

//   return (
//     <div className="p-4 flex flex-col">
//       {/* Header */}
//       <div className="flex w-full justify-between items-center mb-4">
//         <ProjectsHeader title={`${department} Projects`} />

//         <div className="w-[350px]">
//           <CourseScheduleCard />
//         </div>
//       </div>

//       {/* Filters */}
//       <ProjectFilters/>

//       {/* Projects List */}
//       <ProjectGrid department={department} />
//     </div>
//   );
// }
