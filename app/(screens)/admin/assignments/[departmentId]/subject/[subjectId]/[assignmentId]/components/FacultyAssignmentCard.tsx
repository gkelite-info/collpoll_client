import { CaretDown, UserCircle } from "@phosphor-icons/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface Department {
  facultyName: string;
  name: string;
  text: string;
  color: string;
  bgColor: string;
  issuesRaised: number;
  activeSubjects: number;
  totalStudents: number;
  year?: string;
}

const FacultyAssignmentCard = ({
  name,
  text,
  color,
  bgColor,
  totalStudents,
  issuesRaised,
  activeSubjects,
  year = "2",
}: Department) => {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/admin/assignments/${encodeURIComponent(name)}?year=${year}`);
  };

  return (
    <div
      className="bg-white rounded-[10px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.04)] border-l-[8px]"
      style={{ borderLeftColor: color }}
    >
      <div className="flex justify-between items-start mb-4">
        <h2
          className="text-md font-bold tracking-tight truncate block"
          style={{ color: text }}
        >
          {name}
        </h2>
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
          style={{ backgroundColor: bgColor, color: text }}
        >
          Year <span className="ml-1">{year}</span>
          <CaretDown size={12} weight="bold" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#282828] text-[13px] font-medium">
          Faculty -
        </span>
        <div className="flex -space-x-2.5">
          {[10, 20, 30, 40, 50].map((seed, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
            >
              <img
                src={`https://i.pravatar.cc/100?u=${name}${seed}`}
                alt="faculty"
                className="w-full h-full object-cover contrast-125"
              />
            </div>
          ))}
        </div>
        <span className="text-gray-700 font-semibold text-base ml-0.5">
          +10
        </span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div>
          <div className="flex gap-2">
            <p className="text-[#282828] text-sm">
              Active Subjects with Assignments
            </p>
            <div className="bg-[#D0EFDE] text-xs flex justify-center items-center text-[#43C17A] px-3 h-4.5 rounded-full">
              {issuesRaised}
            </div>
          </div>
          <div className="flex gap-2">
            <p className="text-[#282828] text-sm">Issues Raised</p>
            <div className="bg-[#D0EFDE] text-xs flex justify-center items-center text-[#43C17A] px-3 h-4.5 rounded-full">
              {issuesRaised}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-[#282828] font-medium">
          <UserCircle size={28} className="text-[#43C17A]" weight="fill" />
          <span className="text-[13px]">{totalStudents} Students</span>
        </div>
        <button
          onClick={handleViewDetails}
          className="bg-[#16284F] cursor-pointer text-white px-4 py-1 rounded-md text-xs tracking-wide hover:bg-[#253b66] transition-all"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default FacultyAssignmentCard;
