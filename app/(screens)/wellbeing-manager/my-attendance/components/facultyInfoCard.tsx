import { Avatar } from "@/app/utils/Avatar";
import { FC } from "react";
import { AdminProfile } from "./attendancePage";

interface Props {
  profile: AdminProfile;
  loading: boolean;
}

const FacultyInfoCard: FC<Props> = ({ profile, loading }) => {
  return (
    <div className="flex bg-white rounded-xl p-4 w-[70%] max-md:w-full max-md:flex-col max-md:items-start max-md:gap-4 overflow-auto shadow-sm items-center gap-8 border border-gray-100/50">
      <div className="flex flex-col items-center gap-2 pl-2 max-md:pl-0 max-md:flex-row max-md:w-full max-md:border-b max-md:pb-4 max-md:border-gray-100">
        <Avatar src={profile.image} alt={profile.name} size={85} />
        <p className="text-[#282828] font-bold text-[15px] whitespace-nowrap">
          {profile.name}
        </p>
      </div>

      <div className="grid grid-cols-[140px_1fr] gap-y-2 text-[13px]">
        <div className="text-[#282828] font-semibold">wellbeingManager Id</div>
        {loading === false && (
          <div className="text-gray-500">{profile.adminId}</div>
        )}

        <div className="text-[#282828] font-semibold">Education Type</div>
        <div className="text-gray-500">{profile.EducationType || "—"}</div>

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
