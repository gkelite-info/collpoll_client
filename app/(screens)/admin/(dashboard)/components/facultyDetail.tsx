import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyCard, { FacultyData } from "../utils/facultyDetailCard";
import SessionTable from "./tables/facultyDetailclassesTable";
import { classSessions } from "../data";

interface FacultyDetailProps {
  faculty: FacultyData;
  onBack: () => void;
}

const cardData: CardProps[] = [
  {
    value: "80",
    label: "Total Working Days",
    bgColor: "bg-[#E2DAFF]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FFFFFF]",
    iconColor: "text-[#6C20CA]",
  },
  {
    value: "220",
    label: "Days Present",
    bgColor: "bg-[#FFEDDA]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FFFFFF]",
    iconColor: "text-[#FFBB70]",
  },
  {
    value: "10",
    label: "Days Absent",
    bgColor: "bg-[#FFE6E6]",
    icon: <UserCircle />,
    iconBgColor: "bg-[#FFFFFF]",
    iconColor: "text-[#FF2020]",
  },
];

const FacultyDetail: React.FC<FacultyDetailProps> = ({ faculty, onBack }) => {
  return (
    <div className="w-full px-1">
      <div className="mb-3">
        <div className="flex items-center gap-2 group w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-bold text-[#282828]">CSE Faculty</h1>
        </div>
        <p className="text-[#282828] mt-1 ml-8 text-sm">
          Overview of all user roles in the system
        </p>
      </div>

      <article className="flex gap-3 justify-center items-center mb-4">
        {cardData.map((item, index) => (
          <CardComponent
            key={index}
            value={item.value}
            label={item.label}
            bgColor={item.bgColor}
            icon={item.icon}
            iconBgColor={item.iconBgColor}
            iconColor={item.iconColor}
          />
        ))}
      </article>

      <div className="mb-6">
        <FacultyCard data={faculty} />
      </div>

      <div>
        <h3 className="font-semibold text-lg text-[#282828] mb-1">
          Classes Teaching
        </h3>
        <p className="text-sm text-[#525252] mb-3">
          Showing what classes/sections the faculty teaches
        </p>
      </div>
      <SessionTable sessions={classSessions} />
    </div>
  );
};

export default FacultyDetail;
