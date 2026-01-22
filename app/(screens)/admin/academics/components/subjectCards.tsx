"use client";

import { Timer } from "@phosphor-icons/react";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
// import { SubjectDetailsCard } from "./subjectDetails";
// import AddNewCardModal from "./addNewCardModal";

export type CardProps = {
  subjectTitle: string;
  year: string | number;
  units: number;
  topicsCovered: number;
  topicsTotal: number;
  nextLesson: string;
  percentage?: number;
  students: number;
  fromDate: string;
  toDate: string;
};

type SubjectCardProps = { subjectProps: CardProps[] };

export default function SubjectCard({ subjectProps }: SubjectCardProps) {
  const [cards, setCards] = useState<CardProps[]>(subjectProps);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveNewCard = (newCard: CardProps) => {
    setCards((prev) => [newCard, ...prev]);
  };

  // if (showDetails && selectedCard) {
  //   return (
  //     <div className="h-screen overflow-x-scroll">
  //       <SubjectDetailsCard
  //         details={selectedCard}
  //         onBack={() => setShowDetails(false)}
  //       />
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="flex justify-between items-start">
        <div className="mb-6 flex flex-wrap gap-8">
          <FilterLabel label="Subject" value="All" />
          <FilterSelect label="Semester" options={["I", "II"]} />
          <FilterSelect label="Year" options={["1st Year", "2nd Year"]} />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#43C17A] text-sm text-white px-3 py-1 rounded-md cursor-pointer hover:bg-[#3bad6d]"
        >
          Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((item, index) => (
          <IndividualCard
            key={index}
            item={item}
            onViewDetails={() => {
              setSelectedCard(item);
              setShowDetails(true);
            }}
          />
        ))}
      </div>

      {/* <AddNewCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewCard}
      /> */}
    </>
  );
}

const FilterLabel = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <p className="text-[#525252] text-sm">{label} :</p>
    <p className="px-4 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium">
      {value}
    </p>
  </div>
);

const FilterSelect = ({
  label,
  options,
}: {
  label: string;
  options: string[];
}) => (
  <div className="flex items-center gap-2">
    <p className="text-[#525252] text-sm">{label} :</p>
    <div className="relative flex items-center">
      <select className="px-3 py-0.5 bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs font-medium appearance-none pr-8 focus:outline-none">
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <FaChevronDown className="absolute right-3 pointer-events-none text-[#43C17A] text-xs" />
    </div>
  </div>
);

const IndividualCard = ({
  item,
  onViewDetails,
}: {
  item: CardProps;
  onViewDetails: () => void;
}) => {
  const percentage = item.percentage ?? 0;
  const ballWidthPx = 16;
  const ballLeft =
    percentage <= 0
      ? "0px"
      : percentage >= 100
      ? `calc(100% - ${ballWidthPx}px)`
      : `calc(${percentage}% - ${ballWidthPx / 2}px)`;
  const filledWidth = `calc(${percentage}% + ${ballWidthPx / 2}px)`;

  return (
    <div className="bg-white rounded-2xl w-full p-6 flex flex-col shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[#282828] font-semibold text-xl">
          {item.subjectTitle} – {item.year}
        </h3>
        <button
          onClick={onViewDetails}
          className="bg-[#7051E1] px-3 py-1 text-white cursor-pointer rounded-md text-sm"
        >
          View Details
        </button>
      </div>
      <div className="space-y-3 text-[#525252] text-lg">
        <div className="flex gap-6">
          <p>
            <span className="font-semibold text-[#282828]">Units : </span>
            {item.units.toString().padStart(2, "0")}
          </p>
          <p>
            <span className="font-semibold text-[#282828]">
              Topics Covered :{" "}
            </span>
            {item.topicsCovered}
          </p>
        </div>
        <p>
          <span className="font-semibold text-[#282828]">Next lesson : </span>
          {item.nextLesson}
        </p>
        <p>
          <span className="font-semibold text-[#282828]">Students : </span>
          {item.students}
        </p>
      </div>
      <div className="flex flex-col justify-between relative">
        <div className="relative lg:w-full rounded-full h-[17px] bg-gray-200 mt-4 overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#9B83F4] to-[#6D4EE0] rounded-full"
            style={{ width: filledWidth }}
          />
          <div
            className="absolute top-0 h-4 w-4 bg-white rounded-full shadow-lg"
            style={{ left: ballLeft }}
          />
        </div>
        <div className="relative w-full h-4">
          <span
            className="absolute bg-gradient-to-b from-[#7153E1] to-[#2D1A76] bg-clip-text text-transparent font-medium text-xs"
            style={{ left: ballLeft, transform: "translateX(-10%)" }}
          >
            {percentage}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Timer size={16} weight="fill" className="text-[#9880F3]" />
          <p className="text-[13px] text-[#7153E1]">
            {item.fromDate} - {item.toDate}
          </p>
        </div>
      </div>
    </div>
  );
};
