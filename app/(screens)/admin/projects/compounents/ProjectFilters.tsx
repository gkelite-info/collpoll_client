// "use client";

// import { CaretDown, Plus } from "@phosphor-icons/react";

// export default function ProjectFilters() {
//   return (
//     <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl shadow-sm">
//       {/* Add Project */}
//       <button className="flex items-center gap-2 bg-[#43C17A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#3ab36e] transition">
//         <Plus size={16} weight="bold" />
//         Add Project
//       </button>

//       {/* Year */}
//       <FilterPill label="Year" value="2nd Year" />

//       {/* Subject */}
//       <FilterPill label="Subject" value="DBMS Project" />

//       {/* Status */}
//       <FilterPill label="Status" value="Completed" />
//     </div>
//   );
// }

// function FilterPill({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) {
//   return (
//     <div className="flex items-center gap-2 bg-[#EAF6EF] px-4 py-2 rounded-full text-sm cursor-pointer hover:bg-[#dff2e6] transition">
//       <span className="text-[#525252]">{label}</span>
//       <span className="text-[#22C55E] font-medium">{value}</span>
//       <CaretDown size={14} className="text-[#22C55E]" />
//     </div>
//   );
// }
