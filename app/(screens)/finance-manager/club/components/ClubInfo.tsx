import { Avatar } from "@/app/utils/Avatar";
import { clubInfo } from "../data";

export default function ClubInfo() {
  return (
    <div className="mb-8 flex flex-col items-center">
      <div className="mb-4 flex h-[120px] w-[120px] items-center justify-center overflow-hidden rounded-full border border-gray-100 shadow-sm md:h-[150px] md:w-[150px]">
        <Avatar
          src={clubInfo.logo}
          alt={clubInfo.name}
          sizes="w-[120px] h-[120px] md:w-[150px] md:h-[150px]"
        />
      </div>
      <h2 className="mb-8 text-center text-lg font-bold text-[#282828] md:text-xl">
        {clubInfo.name}
      </h2>

      <div className="flex w-full max-w-2xl flex-col justify-between gap-8 px-2 md:flex-row md:px-4">
        <div className="flex flex-col gap-4">
          <MemberRow
            avatar={clubInfo.responsibleFaculty.avatar}
            name={clubInfo.responsibleFaculty.name}
            role="Responsible Faculty"
          />
          <MemberRow
            avatar={clubInfo.president.avatar}
            name={clubInfo.president.name}
            role="President"
          />
          <MemberRow
            avatar={clubInfo.vicePresident.avatar}
            name={clubInfo.vicePresident.name}
            role="Vice President"
          />
        </div>

        <div className="flex flex-col items-start md:items-center">
          <span className="mb-3 self-start text-sm font-semibold text-[#484848]">
            Mentors :
          </span>
          <div className="flex flex-wrap gap-4">
            {clubInfo.mentors.map((mentor) => (
              <div key={mentor.id} className="flex flex-col items-center gap-1.5">
                <Avatar src={mentor.avatar} alt={mentor.name} size={40} />
                <span className="text-[11px] font-semibold text-[#16284F]">
                  {mentor.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberRow({
  avatar,
  name,
  role,
}: {
  avatar: string;
  name: string;
  role: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar src={avatar} alt={name} size={40} />
      <span className="text-sm font-bold text-[#16284F]">{name}</span>
      <span className="rounded border border-[#465FAC] bg-[#E0E5FA] px-2 py-1 text-xs font-semibold text-[#16284F]">
        {role}
      </span>
    </div>
  );
}
