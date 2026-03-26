import {FC} from "react";
import { AdminProfile } from "./attendancePage";

interface Props {
  profile: AdminProfile;
  loading: boolean
}

const DefaultAvatar = () => (
  <div className="w-full h-full rounded-full border-2 border-[#43C17A] bg-gray-200 flex items-center justify-center text-gray-400"> {/* ✅ FIXED */}
    <svg
      className="w-1/2 h-1/2"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);

const FacultyInfoCard: FC<Props> = ({ profile, loading }) => {
  return (
    <div className="flex bg-white rounded-xl p-4 w-[70%] overflow-auto shadow-sm items-center gap-8 border border-gray-100/50">
      <div className="flex flex-col items-center gap-2 pl-2">
        <div className="w-[85px] h-[85px] object-cover rounded-full overflow-hidden bg-teal-500">
          {profile.image ? (
            <img src={profile.image} alt="profile" className="w-[85px] h-[85px] object-cover" />
          ) : (
            <DefaultAvatar />
          )}
        </div>
        <p className="text-[#282828] font-bold text-[15px] whitespace-nowrap">
          {profile.name}
        </p>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-y-2 text-[13px]">
        <div className="text-[#282828] font-semibold">Admin Id</div>
        {loading === false && (
          <div className="text-gray-500">{profile.adminId}</div>
        )}

        <div className="text-[#282828] font-semibold">Education Type</div>
        <div className="text-gray-500">{profile.EducationType}</div>

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
