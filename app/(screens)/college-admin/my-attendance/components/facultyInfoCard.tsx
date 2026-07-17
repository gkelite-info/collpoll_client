import { FC } from "react";
import { Avatar } from "@/app/utils/Avatar";
import { AdminProfile } from "./attendancePage";
import { useCollegeAdmin } from "@/app/utils/context/college-admin/useCollegeAdmin";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

interface Props {
  profile: AdminProfile;
  loading: boolean;
}

const FacultyInfoCard: FC<Props> = ({ profile, loading }) => {
  const { collegeEducationType } = useCollegeAdmin();
  
  const isSchoolStr = typeof document !== 'undefined'
    ? document.cookie.split("; ").find((row) => row.startsWith("isSchool="))?.split("=")[1]
    : null;
  const isSchool = isSchoolStr === "true";

  return (
    <div className="flex bg-white rounded-xl p-4 w-[70%] overflow-auto shadow-sm items-center gap-8 border border-gray-100/50">
      <div className="flex flex-col items-center gap-2 pl-2">
        <Avatar src={profile.image || null} alt={profile.name} size={85} />
        <p className="text-[#282828] font-bold text-[15px] whitespace-nowrap">
          {profile.name}
        </p>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-y-2 text-[13px]">
        <div className="text-[#282828] font-semibold">{isSchool ? "School Admin ID" : "College Admin ID"}</div>
        {loading === false && <div className="text-gray-500">{profile.adminId}</div>}

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
