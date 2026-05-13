import React from "react";
import { FacultyProfile } from "../types";
import { Avatar } from "@/app/utils/Avatar";

interface Props {
  profile: FacultyProfile;
}

const FacultyInfoCard: React.FC<Props> = ({ profile }) => {
  return (
    <div className="flex bg-white rounded-xl p-4 w-[70%] shadow-sm items-center gap-8 border border-gray-100/50">
      {/* Avatar & Name */}
      <div className="flex flex-col items-center gap-2 pl-2">
        <Avatar src={profile.image || null} alt={profile.name} size={85} />
        <p className="text-[#282828] font-bold text-[15px] whitespace-nowrap">
          {profile.name}
        </p>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-y-2 text-[13px]">
        <div className="text-[#282828] font-semibold">ID</div>
        <div className="text-gray-500">{profile.id}</div>

        <div className="text-[#282828] font-semibold">Department</div>
        <div className="text-gray-500">{profile.department}</div>

        <div className="text-[#282828] font-semibold">Mobile</div>
        <div className="text-gray-500">{profile.mobile}</div>

        <div className="text-[#282828] font-semibold">Email</div>
        <div className="text-gray-500">{profile.email}</div>

        <div className="text-[#282828] font-semibold">Date of Joining</div>
        <div className="text-gray-500">{profile.joiningDate}</div>

        <div className="text-[#282828] font-semibold">Experience</div>
        <div className="text-gray-500">{profile.experience}</div>
      </div>
    </div>
  );
};

export default FacultyInfoCard;
