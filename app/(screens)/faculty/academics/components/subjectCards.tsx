"use client";
import { useState, useEffect } from "react";
import { SubjectDetailsCard } from "./subjectDetails";
import AddNewCardModal from "./addNewCardModal";
import { CardProps } from "@/lib/types/faculty";
import { useRouter, useSearchParams } from "next/navigation";
import AddWeightageModal from "./weightageModal";
import { CustomDropdown, DropdownOption } from "@/app/components/CustomDropdown";
import { Pagination } from "@/app/(screens)/admin/academic-setup/components/pagination";
import AcademicsSkeleton from "./academicsSkeleton";

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
  totalCount: number;
  page: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
  loadingData: boolean;
  subjectId: number | null;
  sectionId: number | null;
  onSubjectChange: (val: number | null) => void;
  onSectionChange: (val: number | null) => void;
};

export default function SubjectCard({
  subjectProps,
  facultyCtx,
  role,
  totalCount,
  page,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loadingData,
  subjectId,
  sectionId,
  onSubjectChange,
  onSectionChange,
}: SubjectCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardProps | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultSubjectId, setDefaultSubjectId] = useState<number | null>(null);
  const facultySubjects = facultyCtx?.faculty_subject ?? [];
  const facultySections = facultyCtx?.sections ?? [];
  const [isWeightageOpen, setIsWeightageOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const subjectIdParam = searchParams.get("subjectId");
    const sectionIdParam = searchParams.get("sectionId");

    if (subjectIdParam && subjectProps.length > 0) {
      const found = subjectProps.find(
        (item) => item.collegeSubjectId === Number(subjectIdParam) && 
                 (!sectionIdParam || item.collegeSectionId === Number(sectionIdParam))
      );

      if (found) {
        setSelectedCard(found);
        setShowDetails(true);
      }
    }
  }, [searchParams, subjectProps]);

  const handleSaveNewCard = (newCard: CardProps) => {
    // After save, the React Query cache will be invalidated by the modal
    // For instant feedback, we don't need to manually manage cards anymore
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

  // Build dropdown options
  const uniqueSubjects = Array.from(
    new Map(
      (facultyCtx?.faculty_subject ?? []).map((s: any) => [
        s.subjectId,
        { value: s.subjectId, label: s.subjectName },
      ])
    ).values()
  ) as DropdownOption[];

  const filteredSections = facultySections.filter((fs: FacultySection) =>
    subjectId ? fs.collegeSubjectId === subjectId : true
  );

  const sectionOptions: DropdownOption[] = filteredSections.map(
    (fs: FacultySection, index: number) => ({
      value: fs.collegeSectionsId,
      label: fs.college_sections?.collegeSections ?? "N/A",
    })
  );

  return (
    <>
      <div className="bg-pink-00 flex justify-between items-start max-md:flex-col max-md:gap-3 max-md:mb-4">
        <div className="mb-6 max-md:mb-0 flex flex-wrap max-md:flex-nowrap gap-8 max-md:gap-3 max-md:w-full max-md:overflow-x-auto max-md:no-scrollbar max-md:py-2">
          <div className="flex items-center gap-2 max-md:shrink-0">
            <p className="text-[#525252] text-sm max-md:text-[12px] max-md:whitespace-nowrap">Subject :</p>
            <CustomDropdown
              value={subjectId ?? "All"}
              options={uniqueSubjects}
              onChange={(val) =>
                onSubjectChange(val === "All" ? null : Number(val))
              }
              includeAll={true}
              theme="always-green"
              widthClassName="w-[160px] max-md:w-[120px]"
              hideCheckmark={false}
            />
          </div>

          <div className="flex items-center gap-2 max-md:shrink-0">
            <p className="text-[#525252] text-sm max-md:text-[12px] max-md:whitespace-nowrap">Section :</p>
            <CustomDropdown
              value={sectionId ?? "All"}
              options={sectionOptions}
              onChange={(val) =>
                onSectionChange(val === "All" ? null : Number(val))
              }
              includeAll={true}
              theme="always-green"
              widthClassName="w-[140px] max-md:w-[100px]"
              disabled={!subjectId}
              hideCheckmark={false}
            />
          </div>
        </div>

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

      {/* Cards Grid */}
      <div className="flex-1">
        {loadingData ? (
          <AcademicsSkeleton count={itemsPerPage} />
        ) : subjectProps.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-4xl">📚</span>
              <p className="text-base font-medium text-gray-600">No classes found</p>
              <p className="text-sm text-gray-400">
                {subjectId || sectionId
                  ? "Try changing the filters to see more classes."
                  : "No classes are assigned to you yet."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjectProps.map((item, index) => (
              <IndividualCard
                key={`${item.collegeSubjectId}-${item.collegeSectionId ?? index}`}
                item={item}
                onViewDetails={() => {
                  setSelectedCard(item);
                  setShowDetails(true);

                  router.push(`/faculty/academics?subjectId=${item.collegeSubjectId}${item.collegeSectionId ? `&sectionId=${item.collegeSectionId}` : ''}`, {
                    scroll: false,
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination — always at the bottom */}
      <div className="mt-auto pt-4">
        <Pagination
          currentPage={page}
          totalItems={totalCount}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          alwaysShow={true}
          roundedBottom="rounded-lg"
        />
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
      <div className="flex justify-between items-start max-md:items-center gap-4 max-md:gap-3 mb-4 max-md:mb-0">
        <h3 
          className="text-[#282828] font-semibold text-xl max-md:font-medium max-md:text-[17px] truncate flex-1 min-w-0"
          title={`${item.subjectTitle} – ${item.year}`}
        >
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
        {item.sectionName && item.sectionName !== "-" && (
          <p className="max-md:truncate">
            <span className="font-semibold max-md:font-medium text-[#282828] max-md:mr-1.5">Section : </span>
            {item.sectionName}
          </p>
        )}
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

        {/* Mobile Progress Bar */}
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