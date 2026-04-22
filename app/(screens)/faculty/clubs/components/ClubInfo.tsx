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
}

// const USERS = [
//     { id: "1", name: "Rohith Sharma", avatar: "https://i.pravatar.cc/150?u=1" },
//     { id: "2", name: "Ayaan Reddy", avatar: "https://i.pravatar.cc/150?u=2" },
//     { id: "3", name: "Ananya Sharma", avatar: "https://i.pravatar.cc/150?u=3" },
//     { id: "4", name: "Sharmila Reddy", avatar: "https://i.pravatar.cc/150?u=4" },
//     { id: "5", name: "Aarav Rathod", avatar: "https://i.pravatar.cc/150?u=5" },
//     { id: "6", name: "Poojith Goud", avatar: "https://i.pravatar.cc/150?u=6" },
// ];

export default function ClubInfo({ info, isLoading = false }: ClubInfoProps) {
    if (isLoading || !info) {
        return <FacultyClubInfoShimmer />;
    }
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
            <div className="flex w-full max-w-2xl bg-red-00 flex-col justify-between gap-8 px-2 md:flex-row md:px-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar src={info.president.avatar} alt={info.president.name} size={40} />
                        <span className="text-sm font-bold text-[#16284F]">{info.president.name}</span>
                        <span className="rounded bg-[#E0E5FA] px-2 py-1 text-xs font-semibold text-[#16284F] border border-[#465FAC]">
                            {info.president.role} 👑
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Avatar src={info.vicePresident.avatar} alt={info.vicePresident.name} size={40} />
                        <span className="text-sm font-bold text-[#16284F]">{info.vicePresident.name}</span>
                        <span className="rounded bg-[#E0E5FA] px-2 py-1 text-xs font-semibold text-[#16284F] border border-[#465FAC]">
                            {info.vicePresident.role}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Avatar src={info.responsibleFaculty?.avatar} alt={info.responsibleFaculty?.name} size={40} />
                        <span className="text-sm font-bold text-[#16284F]">{info.responsibleFaculty?.name}</span>
                        <span className="rounded bg-[#E0E5FA] px-2 py-1 text-xs font-semibold text-[#16284F] border border-[#465FAC]">
                            {info.responsibleFaculty?.role}
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