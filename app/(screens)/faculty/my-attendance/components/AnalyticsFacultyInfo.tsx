import { FC } from "react";
import { AnalyticsFacultyProfile } from "../types";

interface Props {
  profile: AnalyticsFacultyProfile;
}

const AnalyticsFacultyInfo: FC<Props> = ({ profile }) => {
  const isInter = ["Inter"].includes(profile.collegeEducationType!)
  return (
    <div className="w-full mb-5 text-[14px]">
      <h2 className="text-[#282828] font-bold text-[17px] mb-4">
        Faculty Information
      </h2>

      <div className="grid grid-cols-3 gap-y-3.5 w-full">
        <div>
          <span className="font-semibold text-[#282828]">Name : </span>
          <span className="text-[#525252]">{profile.name}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">{isInter ? "Group" : "Branch"} : </span>
          <span className="text-[#525252]">{profile.department}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Employee ID : </span>
          <span className="text-[#525252]">{profile.employeeId}</span>
        </div>

        <div>
          <span className="font-semibold text-[#282828]">Experience : </span>
          <span className="text-[#525252]">{profile.experience}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Leaves Taken: </span>
          <span className="text-[#525252]">{profile.leavesTaken}</span>
        </div>
        <div>
          <span className="font-semibold text-[#282828]">Working Days : </span>
          <span className="text-[#525252]">{profile.workingDays}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFacultyInfo;
