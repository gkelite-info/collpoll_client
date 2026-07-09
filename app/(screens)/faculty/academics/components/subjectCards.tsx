"use client";
import { useState, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { SubjectDetailsCard } from "./subjectDetails";
import AddNewCardModal from "./addNewCardModal";
import { CardProps } from "@/lib/types/faculty";
import { useRouter, useSearchParams } from "next/navigation";
import AddWeightageModal from "./weightageModal";

type FacultySubject = {
  collegeSubjectId: number;
  subjectName: string;
};

type FacultySection = {
  collegeSectionsId: number;
  collegeSubjectId: number;
  college_sections: {
    collegeSections: string;
  };
};

type SubjectCardProps = {
  subjectProps: CardProps[];
  facultyCtx: any;
  role: string | null;
};

export default function SubjectCard({ subjectProps, facultyCtx, role }: SubjectCardProps) {
  const [cards, setCards] = useState<CardProps[]>(subjectProps);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [defaultSubjectId, setDefaultSubjectId] = useState<number | null>(null);
  const facultySubjects = facultyCtx?.faculty_subject ?? [];
  const facultySections = facultyCtx?.sections ?? [];
  const [isWeightageOpen, setIsWeightageOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setSectionId(null);
  }, [subjectId]);



  useEffect(() => {
    setCards(subjectProps);
  }, [subjectProps]);

  useEffect(() => {
    const subjectIdParam = searchParams.get("subjectId");

    if (subjectIdParam && cards.length > 0) {
      const found = cards.find(
        (item) => item.collegeSubjectId === Number(subjectIdParam)
      );

      if (found) {
        setSelectedCard(found);
        setShowDetails(true);
      }
    }
  }, [searchParams, cards]);


  const handleSaveNewCard = (newCard: CardProps) => {
    setCards((prev) => [newCard, ...prev]);
  };

  if (showDetails && selectedCard) {
    return (
      <div className="h-screen overflow-x-scroll">
        <SubjectDetailsCard
          details={selectedCard}
          onBack={() => {
            setShowDetails(false);
            router.push("/faculty/academics");
          }}
        />
      </div>
    );
  }

  const filteredSections = facultySections.filter((fs: FacultySection) =>
    subjectId ? fs.collegeSubjectId === subjectId : true
  );

  const filteredCards = cards.filter((card: any) => {
    const cardSubId = card.collegeSubjectId;
    const cardSecId = card.collegeSectionId;

    if (subjectId !== null && Number(cardSubId) !== Number(subjectId)) return false;
    if (sectionId !== null && Number(cardSecId) !== Number(sectionId)) return false;

    return true;
  });

  return (
    <>
      <div className="bg-pink-00 flex justify-between items-start max-md:flex-col max-md:gap-3 max-md:mb-4">
        <div className="mb-6 max-md:mb-0 flex flex-wrap max-md:flex-nowrap gap-8 max-md:gap-3 max-md:w-full max-md:overflow-x-auto max-md:no-scrollbar max-md:py-2">
          <div className="flex items-center gap-2 max-md:shrink-0">
            <p className="text-[#525252] text-sm max-md:text-[12px] max-md:whitespace-nowrap">Subject :</p>
            <div className="relative">
              <select
                value={subjectId ?? ""}
                onChange={(e) =>
                  setSubjectId(e.target.value ? Number(e.target.value) : null)
                }
                className="px-3 max-md:px-2 py-0.5 focus:outline-none bg-[#DCEAE2] text-[#43C17A] rounded-full text-xs max-md:text-[11px] font-medium pr-8 max-md:pr-6 appearance-none max-md:max-w-[100px] max-md:truncate"
              >
                <option value="">All</option>
                {Array.from(
                  new Map(subjectProps.map(s => [s.collegeSubjectId, s])).values()
                ).map((s) => (
                  <option key={s.collegeSubjectId} value={s.collegeSubjectId}>
                    {s.subjectTitle}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-2 max-md:right-2 top-1/2 -translate-y-1/2 text-xs max-md:text-[10px] text-[#43C17A]" />
            </div>
          </div>

          <div className="flex items-center gap-2 max-md:shrink-0">
            <p className="text-[#525252] text-sm max-md:text-[12px] max-md:whitespace-nowrap">Section :</p>
            <div className="relative">
              <select
                value={sectionId ?? ""}
                onChange={(e) =>
                  setSectionId(e.target.value ? Number(e.target.value) : null)
                }
                className="px-3 max-md:px-2 py-0.5 bg-[#DCEAE2] focus:outline-none text-[#43C17A] rounded-full text-xs max-md:text-[11px] font-medium pr-8 max-md:pr-6 appearance-none max-md:max-w-[100px] max-md:truncate"
              >
                <option value="">All</option>
                {filteredSections.map((fs: FacultySection, index: number) => (
                  <option
                    key={`${fs.collegeSectionsId}-${index}`}
                    value={fs.collegeSectionsId}
                  >
                    {fs.college_sections?.collegeSections ?? "N/A"}
                  </option>
                ))}
              </select>
              <FaChevronDown className="absolute right-2 max-md:right-2 top-1/2 -translate-y-1/2 text-xs max-md:text-[10px] text-[#43C17A]" />
            </div>
          </div>
        </div>

        {/* <div className="mb-6 flex flex-wrap gap-8">
          <FilterLabel label="Subject" value="All" />
          <FilterSelect label="Semester" options={["I", "II"]} />
          <FilterSelect label="Year" options={["1st Year", "2nd Year"]} />
        </div> */}
        <div className="bg-blue-00 flex items-center gap-3 max-md:w-full max-md:overflow-x-auto max-md:scrollbar-hide max-md:pb-2 max-md:shrink-0">
          <button
            className="bg-[#43C17A] text-sm max-md:text-[11px] text-white px-3 max-md:px-3 py-1 max-md:py-1.5 rounded-md cursor-pointer hover:bg-[#3bad6d] font-medium max-md:whitespace-nowrap"
            onClick={() => setIsWeightageOpen(true)}
          >
            Add Weightage
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isGeneratingPdf}
            className={`text-sm max-md:text-[11px] text-white px-3 max-md:px-3 py-1 max-md:py-1.5 rounded-md font-medium max-md:whitespace-nowrap ${
              isGeneratingPdf ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer hover:bg-[#3bad6d]"
            }`}
          >
            {isGeneratingPdf ? "Generating..." : "Add Unit"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCards.map((item, index) => (
          <IndividualCard
            key={index}
            item={item}
            onViewDetails={() => {
              setSelectedCard(item);
              setShowDetails(true);

              router.push(`/faculty/academics?subjectId=${item.collegeSubjectId}`, {
                scroll: false,
              });
            }}
          // onViewDetails={() => {
          //   setSelectedCard({
          //     ...item,
          //     collegeSubjectId: item.collegeSubjectId,
          //   });
          //   setShowDetails(true);
          // }}

          />
        ))}
      </div>

      <AddNewCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewCard}
        facultySubjects={facultySubjects}
        facultySections={facultySections}
        defaultSubjectId={defaultSubjectId}
        onGeneratingStart={() => setIsGeneratingPdf(true)}
        onGeneratingEnd={() => setIsGeneratingPdf(false)}
      />
      <AddWeightageModal
        isOpen={isWeightageOpen}
        onClose={() => setIsWeightageOpen(false)}
        facultyCtx={facultyCtx}
        role={role}
      />
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
    <div className="bg-white rounded-2xl max-md:rounded-lg w-full p-6 max-md:p-4 flex flex-col max-md:justify-between max-md:min-h-[230px] shadow-sm border border-gray-100">
      <div className="flex justify-between items-start max-md:items-center max-md:gap-3 mb-4 max-md:mb-0">
        <h3 className="text-[#282828] font-semibold text-xl max-md:font-medium max-md:text-[17px] max-md:truncate whitespace-nowrap overflow-x-auto max-md:overflow-hidden flex-1 max-md:min-w-0">
          {item.subjectTitle} – {item.year}
        </h3>

        <button
          onClick={onViewDetails}
          className="bg-[#7051E1] px-3 py-1 max-md:px-2.5 text-white cursor-pointer rounded-md text-sm max-md:text-xs shrink-0"
        >
          View Details
        </button>
      </div>
      <div className="space-y-3 max-md:space-y-0 max-md:flex max-md:flex-col max-md:gap-2 max-md:mt-1 text-[#525252] text-lg max-md:text-[15px]">
        <div className="flex gap-6 max-md:gap-5 max-md:items-center">
          <p className="max-md:truncate">
            <span className="font-semibold max-md:font-medium text-[#282828] max-md:mr-1.5">Units : </span>
            {item.units.toString().padStart(2, "0")}
          </p>
          <p className="max-md:truncate">
            <span className="font-semibold max-md:font-medium text-[#282828] max-md:mr-1.5">
              Topics Covered :{" "}
            </span>
            {item.topicsCovered}
          </p>
        </div>
        <p className="max-md:truncate">
          <span className="font-semibold max-md:font-medium text-[#282828] max-md:mr-1.5">Next lesson : </span>
          {item.nextLesson}
        </p>
        <p className="max-md:truncate">
          <span className="font-semibold max-md:font-medium text-[#282828] max-md:mr-1.5">Students : </span>
          {item.students}
        </p>
      </div>

      <div className="flex flex-col justify-between max-md:mt-1 relative">
        {/* Desktop Progress Bar */}
        <div className="max-md:hidden">
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
        </div>

        {/* Mobile Progress Bar (Student Layout Port) */}
        <div className="hidden max-md:block">
          <div className="relative w-full rounded-full h-3 bg-gray-200 mt-3 overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#9B83F4] to-[#6D4EE0] transition-all duration-700 ease-out rounded-full"
              style={{
                width: percentage > 0 ? `${percentage}%` : "0%",
              }}
            />
            {percentage > 0 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 bg-white rounded-full shadow-sm transition-all duration-700 ease-out"
                style={{
                  left: `calc(${percentage}% - 10px - 2px)`,
                  height: "10px",
                  width: "10px",
                }}
              />
            )}
          </div>
          <div className="relative w-full h-5 mt-0.5">
            <span
              className="absolute bg-gradient-to-b from-[#7153E1] to-[#2D1A76] bg-clip-text text-transparent font-medium transition-all duration-700 ease-out text-xs"
              style={{
                left: `${percentage}%`,
                transform:
                  percentage > 90
                    ? "translateX(-100%)"
                    : percentage < 10
                      ? "translateX(0%)"
                      : "translateX(-50%)",
              }}
            >
              {item.percentage === null ? "0%" : `${percentage}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};