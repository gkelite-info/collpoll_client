import FacultyClubInfoShimmer from "../shimmers/FacultyClubInfoShimmer";
import { Avatar } from "@/app/utils/Avatar";

interface ClubInfoProps {
    info?: {
        name: string;
        logo: string;
        president: { name: string; role: string; avatar: string };
        vicePresident: { name: string; role: string; avatar: string };
        responsibleFaculty: { name: string; role: string; avatar: string };
        mentors: { name: string; id: string; avatar: string }[];
    } | null;
    isLoading?: boolean;
    isCollegeAdmin?: boolean;
    stats?: { active: string | number; inactive: string | number };
}

export default function ClubInfo({ info, isLoading = false, isCollegeAdmin = false, stats }: ClubInfoProps) {
    if (isLoading || !info) {
        return <FacultyClubInfoShimmer isCollegeAdmin={isCollegeAdmin}/>;
    }

    const ROLE_DISPLAY_NAMES: Record<string, string> = {
        responsibleFaculty: "Responsible Faculty",
        president: "President",
        vicePresident: "Vice President",
    };

    return (
        <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-[150px] w-[150px] items-center justify-center overflow-hidden rounded-full shadow-sm border border-gray-100">
                <Avatar
                    src={info.logo}
                    alt={info.name}
                    size={150}
                />
            </div>
            <h2 className="mb-8 text-xl font-bold text-[#282828]">{info.name}</h2>
            {isCollegeAdmin && stats && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mb-10 px-2 md:px-4">
                    <div className="bg-gradient-to-br from-[#43C17A]/10 to-[#43C17A]/5 border border-[#43C17A]/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[#43C17A] text-[10px] uppercase tracking-wider font-bold mb-1">Active Members</span>
                        <span className="text-2xl font-black text-[#16284F]">{stats.active}</span>
                    </div>
                    <div className="bg-gradient-to-br from-[#FF2A2A]/10 to-[#FF2A2A]/5 border border-[#FF2A2A]/20 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
                        <span className="text-[#FF2A2A] text-[10px] uppercase tracking-wider font-bold mb-1">Inactive Members</span>
                        <span className="text-2xl font-black text-[#16284F]">{stats.inactive}</span>
                    </div>
                </div>
            )}
            <div className="flex w-full max-w-2xl bg-red-00 flex-col justify-between gap-8 px-2 md:flex-row md:px-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar src={info.responsibleFaculty?.avatar} alt={info.responsibleFaculty?.name} size={40} />
                        <span className="text-sm font-bold text-[#16284F]">{info.responsibleFaculty?.name}</span>
                        <span className="rounded bg-[#E0E5FA] px-2 py-1 text-xs font-semibold text-[#16284F] border border-[#465FAC]">
                            {/* {info.responsibleFaculty?.role} */}
                            {ROLE_DISPLAY_NAMES["responsibleFaculty"] || info.responsibleFaculty?.role}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar src={info.president.avatar} alt={info.president.name} size={40} />
                        <span className="text-sm font-bold text-[#16284F]">{info.president.name}</span>
                        <span className="rounded bg-[#E0E5FA] px-2 py-1 text-xs font-semibold text-[#16284F] border border-[#465FAC]">
                            {/* {info.president.role} 👑 */}
                            {ROLE_DISPLAY_NAMES["president"] || info.president.role} 👑
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Avatar src={info.vicePresident.avatar} alt={info.vicePresident.name} size={40} />
                        <span className="text-sm font-bold text-[#16284F]">{info.vicePresident.name}</span>
                        <span className="rounded bg-[#E0E5FA] px-2 py-1 text-xs font-semibold text-[#16284F] border border-[#465FAC]">
                            {/* {info.vicePresident.role} */}
                            {ROLE_DISPLAY_NAMES["vicePresident"] || info.vicePresident.role}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-start md:items-center">
                    <span className="mb-3 text-sm font-semibold text-[#484848] flex self-start">Mentors :</span>
                    <div className="flex flex-wrap gap-4">
                        {info.mentors.map((mentor) => (
                            <div key={mentor.id} className="flex flex-col items-center gap-1.5">
                                <Avatar src={mentor.avatar} alt={mentor.name} size={40} />
                                <span className="text-[11px] font-semibold text-[#16284F]">{mentor.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}