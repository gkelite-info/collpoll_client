import { Briefcase, Buildings, GraduationCap } from "@phosphor-icons/react";
import { useFacultyExtras } from "./useFacultyExtras";
import { FacultyCardShimmer } from "./FacultyCardShimmer";
import { Avatar } from "@/app/utils/Avatar";

export interface FacultyData {
  raw?: {
    facultyId?: number;
    designation?: string;
    experienceYears?: number;
    qualification?: string;
    users?: {
      userId?: number;
      fullName?: string;
      email?: string;
    };
    mobile?: string;
    collegeBranchCode?: string
  };
  name: string;
  subject: string;
  role: string;
  id: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  collegeBranchCode?: string;
  experience: string;
  qualification: string;
  avatar: string;
  collegeId?: number;
}

interface FacultyCardProps {
  data: FacultyData;
  collegeEdu?: string | null;
}

const FacultyCard: React.FC<FacultyCardProps> = ({ data, collegeEdu }) => {

  const raw = (data as any)?.raw ?? (data as any) ?? {};

  const userId = raw?.userId as number | undefined;
  const collegeId = raw.collegeId as number | undefined;
  const { identifierId, avatarUrl, loading } = useFacultyExtras(
    userId,
    collegeId,
  );

  const formattedDateOfJoining = raw.dateOfJoining
    ? new Date(raw.dateOfJoining).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "N/A";

  if (loading) {
    return <FacultyCardShimmer />;
  }

  return (
    <div className="w-full bg-white rounded-[20px] shadow-sm p-5 font-sans border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0">
            <Avatar src={avatarUrl} alt=""/>
          </div>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-[#1a1a1a] tracking-tight">
              {data.name}
            </h2>
            <span className="rounded-full bg-[#FFF4E5] px-2.5 py-0.5 text-xs font-medium text-[#FF9F43]">
              {data.role}
            </span>
          </div>
        </div>

        <span className="rounded-full bg-[#E1F5EA] px-3 py-1 text-sm font-medium text-[#43C17A]">
          ID - {identifierId ?? "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-3 gap-x-2 mb-6 pl-1">
        <div>
          <p className="text-sm font-medium text-[#666666] mb-0.5">Contact</p>
          <p className="text-base font-medium text-[#333333]">
            {raw.mobile ?? "N/A"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-[#666666] mb-0.5">Email</p>
          <p
            className="text-base font-medium text-[#333333] truncate"
            title={data.email}
          >
            {data.email}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-[#666666] mb-0.5">Gender</p>
          <p className="text-base font-medium text-[#333333] leading-tight">
            {raw.gender ?? 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-md p-4 bg-[#E8F6E2]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#43C17A] text-white">
            <Briefcase size={20} weight="fill" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1a1a1a]">
              {raw.experienceYears ? `${raw.experienceYears} years` : 'N/A'}
            </p>
            <p className="text-xs font-medium text-[#444444]">Experience</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md p-4 bg-[#FFEBEE]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#FF1F1F] text-white">
            <GraduationCap size={20} weight="fill" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1a1a1a]">
              {formattedDateOfJoining}
            </p>
            <p className="text-xs font-medium text-[#444444]">Date of joining</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md p-4 bg-[#D6EAFE]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#4E9CF8] text-white">
            <Buildings size={20} weight="fill" />
          </div>
          <div>
            <p className="text-base font-bold text-[#1a1a1a]">
              {data.department}
            </p>
            <p className="text-xs font-medium text-[#444444]">{!(collegeEdu === "Inter") ? "Branch" : "Group"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyCard;
