import React from "react";
import { FacultySection, CollegeAcademicYear } from "@/app/utils/context/faculty/useFaculty";

type SubjectPillsProps = {
  sections: FacultySection[];
  collegeAcademicYears: CollegeAcademicYear[];
  selectedSectionIndex: number;
  setSelectedSectionIndex: (index: number) => void;
};

type GroupedSection = {
  subjectName: string;
  subjectId: number;
  yearStr: string | null;
  branchCode: string | null;
  sections: {
    sectionStr: string;
    originalIndex: number;
  }[];
};

export default function SubjectPills({
  sections,
  collegeAcademicYears,
  selectedSectionIndex,
  setSelectedSectionIndex,
}: SubjectPillsProps) {
  const getAcademicYearStr = (yearId: number) => {
    const yearObj = collegeAcademicYears.find((y) => y.collegeAcademicYearId === yearId);
    if (!yearObj || !yearObj.collegeAcademicYear) return null;
    const match = yearObj.collegeAcademicYear.match(/(Year \d+|Class \d+)/i);
    return match ? match[0] : yearObj.collegeAcademicYear;
  };

  const groupedSections: GroupedSection[] = [];
  
  sections.forEach((sec, index) => {
    const subjectId = sec.collegeSubjectId;
    const subjectName = sec.faculty_subject?.subjectName ?? "Unknown Subject";
    const yearStr = sec.collegeAcademicYearId ? getAcademicYearStr(sec.collegeAcademicYearId) : null;
    const branchCode = sec.college_branch?.collegeBranchCode ?? sec.faculty_edu_type?.collegeEducationType ?? null;
    const sectionStr = sec.college_sections?.collegeSections ?? "";

    const groupKey = `${subjectId}-${branchCode}-${yearStr}`;
    
    let group = groupedSections.find(g => `${g.subjectId}-${g.branchCode}-${g.yearStr}` === groupKey);
    if (!group) {
      group = {
        subjectName,
        subjectId,
        yearStr,
        branchCode,
        sections: []
      };
      groupedSections.push(group);
    }
    
    group.sections.push({
      sectionStr,
      originalIndex: index
    });
  });

  const activeGroupIndex = groupedSections.findIndex(g => g.sections.some(s => s.originalIndex === selectedSectionIndex));

  return (
    <div className="mt-4 flex w-full overflow-x-auto gap-3 pb-2 hide-scrollbar scroll-smooth">
      {groupedSections.map((group, gIdx) => {
        const isGroupActive = activeGroupIndex === gIdx;

        return (
          <div
            key={gIdx}
            onClick={() => {
                if (!isGroupActive && group.sections.length > 0) {
                    setSelectedSectionIndex(group.sections[0].originalIndex);
                }
            }}
            className={`flex-shrink-0 flex flex-col justify-center px-5 py-3 rounded-full transition-all shadow-sm border cursor-pointer ${
              isGroupActive
                ? "bg-[#16284F] text-white border-[#16284F]"
                : "bg-[#E8F8EF] text-[#454545] border-transparent hover:bg-[#D3F1E0]"
            }`}
          >
            <span className="text-sm font-bold text-left px-1">{group.subjectName}</span>
            <div className="flex items-center flex-wrap gap-2 mt-2 text-[11px] font-medium">
              {group.yearStr && (
                <span className="px-2 py-0.5 rounded-[4px] bg-[#43C17A] text-white shadow-sm">
                  {group.yearStr}
                </span>
              )}
              {group.branchCode && (
                 <span className={`flex items-center gap-1.5 ${isGroupActive ? 'opacity-90' : 'opacity-70'}`}>
                    <span className="text-[16px] leading-none">•</span> 
                    {group.branchCode}
                 </span>
              )}
              
              <div className="flex items-center gap-1.5 ml-1">
                 {group.sections.map((s, sIdx) => {
                    const isSectionActive = s.originalIndex === selectedSectionIndex;
                    if (!s.sectionStr) return null;
                    return (
                      <button
                        key={sIdx}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSectionIndex(s.originalIndex);
                        }}
                        className={`px-2 py-0.5 rounded-[4px] cursor-pointer transition-all duration-200 flex items-center justify-center min-w-[28px] ${
                          isSectionActive
                            ? "bg-[#43C17A] text-white shadow-sm ring-2 ring-[#43C17A]/30 scale-105"
                            : isGroupActive 
                                ? "bg-white/10 text-white hover:bg-white/20 hover:scale-105" 
                                : "bg-[#43C17A]/15 text-[#2A7D4E] hover:bg-[#43C17A]/30 hover:scale-105"
                        }`}
                      >
                        {s.sectionStr}
                      </button>
                    )
                 })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
