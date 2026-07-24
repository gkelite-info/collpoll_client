import { useState, useEffect } from "react";
import { CaretLeft, CaretRight, Calendar } from "@phosphor-icons/react";
import { CustomSelect } from "./CustomSelect";
import { PreviousSchedulesShimmer } from "./PreviousSchedulesShimmer";
import { fetchAcademicYears } from "@/lib/helpers/admin/academics/academicDropdowns";

interface PreviousSchedulesCardProps {
  collegeId: number | null;
  educations: any[];
  prevSchedulesEduSelect: number | null;
  setPrevSchedulesEduSelect: (val: number | null) => void;
  prevSchedulesBranches: any[];
  isSchoolForPrev: boolean;
  prevSchedulesLevel: 0 | 1 | 2;
  setPrevSchedulesLevel: (val: 0 | 1 | 2) => void;
  drillDownBranch: any;
  setDrillDownBranch: (val: any) => void;
  drillDownYear: string;
  setDrillDownYear: (val: string) => void;
  sideSchedules: any[];
  sideLoading: boolean;
  handleSideScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  selectedBranch: number | null;
  setSelectedBranch: (val: number | null) => void;
  setBranchSelect: (val: number | null) => void;
  handleYearSelect: (yearStr: string, yearVal: string) => void;
  handleEditSchedule: (schedule: any) => void;
  pageLoading?: boolean;
}

export function PreviousSchedulesCard({
  collegeId,
  educations,
  prevSchedulesEduSelect,
  setPrevSchedulesEduSelect,
  prevSchedulesBranches,
  isSchoolForPrev,
  prevSchedulesLevel,
  setPrevSchedulesLevel,
  drillDownBranch,
  setDrillDownBranch,
  drillDownYear,
  setDrillDownYear,
  sideSchedules,
  sideLoading,
  handleSideScroll,
  selectedBranch,
  setSelectedBranch,
  setBranchSelect,
  handleYearSelect,
  handleEditSchedule,
  pageLoading = false,
}: PreviousSchedulesCardProps) {
  const [prevAcademicYears, setPrevAcademicYears] = useState<any[]>([]);
  const [prevSchedulesLoading, setPrevSchedulesLoading] = useState(false);

  useEffect(() => {
    // When education changes, if it's school, we skip branch and load years directly
    if (collegeId && prevSchedulesEduSelect && isSchoolForPrev) {
      setPrevSchedulesLoading(true);
      fetchAcademicYears(collegeId, prevSchedulesEduSelect, null)
        .then((years) => {
          setPrevAcademicYears(years);
        })
        .catch(console.error)
        .finally(() => setPrevSchedulesLoading(false));
    }
  }, [collegeId, prevSchedulesEduSelect, isSchoolForPrev]);

  useEffect(() => {
    // When branch is selected for college/inter, load years
    if (collegeId && prevSchedulesEduSelect && !isSchoolForPrev && selectedBranch && prevSchedulesLevel === 1) {
      setPrevSchedulesLoading(true);
      fetchAcademicYears(collegeId, prevSchedulesEduSelect, selectedBranch)
        .then((years) => {
          setPrevAcademicYears(years);
        })
        .catch(console.error)
        .finally(() => setPrevSchedulesLoading(false));
    }
  }, [collegeId, prevSchedulesEduSelect, isSchoolForPrev, selectedBranch, prevSchedulesLevel]);

  // Loading state when education dropdown changes
  useEffect(() => {
    if (prevSchedulesLevel === 0 && !isSchoolForPrev && prevSchedulesBranches.length === 0) {
       // It might be loading branches from page.tsx (we can rely on sideLoading or just a small timeout if we want)
    }
  }, [prevSchedulesLevel, isSchoolForPrev, prevSchedulesBranches]);

  return (
    <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm flex flex-col">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Previous Schedules</h2>

      {prevSchedulesLevel === 0 && (
        <div className="flex flex-col mb-4">
          <label className="text-xs font-bold text-gray-600 mb-1">Filter by Education Type</label>
          <CustomSelect
            value={prevSchedulesEduSelect?.toString() || ""}
            onChange={(val) => {
              setPrevSchedulesEduSelect(Number(val));
              setPrevSchedulesLevel(0);
            }}
            options={educations.map((edu) => ({
              value: edu.collegeEducationId,
              label: edu.collegeEducationType,
            }))}
            placeholder="Select Education"
          />
        </div>
      )}

      {prevSchedulesLevel === 1 && drillDownBranch && !isSchoolForPrev && (
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setPrevSchedulesLevel(0);
              setDrillDownBranch(null);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-[#43C17A]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <span className="text-lg font-extrabold text-[#43C17A]">
            {drillDownBranch.collegeBranchCode}
          </span>
        </div>
      )}

      {prevSchedulesLevel === 2 && (drillDownBranch || isSchoolForPrev) && (
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setPrevSchedulesLevel(isSchoolForPrev ? 0 : 1);
              setDrillDownYear("");
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-[#43C17A]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <span className="text-lg font-extrabold text-[#43C17A]">
            {isSchoolForPrev ? drillDownYear : `${drillDownBranch?.collegeBranchCode} - ${drillDownYear}`}
          </span>
        </div>
      )}

      <div
        className="space-y-2 flex-1 overflow-y-auto max-h-[360px] pr-1"
        onScroll={prevSchedulesLevel === 2 ? handleSideScroll : undefined}
      >
        {(prevSchedulesLoading || pageLoading) && <PreviousSchedulesShimmer />}

        {/* Level 0: Branches */}
        {!(prevSchedulesLoading || pageLoading) && prevSchedulesLevel === 0 && !isSchoolForPrev && (
          prevSchedulesBranches.length > 0 ? (
            prevSchedulesBranches.map((b) => {
              const isSelected = selectedBranch === b.collegeBranchId;
              return (
                <button
                  key={b.collegeBranchId}
                  type="button"
                  onClick={() => {
                    setSelectedBranch(b.collegeBranchId);
                    setBranchSelect(b.collegeBranchId);
                    setDrillDownBranch(b);
                    setPrevSchedulesLevel(1);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                    isSelected ? "bg-gray-50 font-bold" : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#E6FBEA] text-[#43C17A] flex items-center justify-center">
                      <Calendar size={16} weight="fill" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">
                      {b.collegeBranchCode}
                    </span>
                  </div>
                  <CaretRight size={16} weight="bold" className="text-[#43C17A]" />
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No branches found.</p>
          )
        )}

        {/* Level 1: Years / Classes */}
        {!(prevSchedulesLoading || pageLoading) && (
          (prevSchedulesLevel === 1 && !isSchoolForPrev) ||
          (prevSchedulesLevel === 0 && isSchoolForPrev)
        ) && (
          prevAcademicYears.length > 0 ? (
            prevAcademicYears.map((yearObj) => {
              const yearStr = yearObj.collegeAcademicYear;
              return (
                <button
                  key={yearObj.collegeAcademicYearId}
                  type="button"
                  onClick={() => {
                    handleYearSelect(yearStr, yearStr);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#E6FBEA] text-[#43C17A] flex items-center justify-center">
                      <Calendar size={16} weight="fill" />
                    </div>
                    <span className="text-sm font-bold text-gray-800">{yearStr}</span>
                  </div>
                  <CaretRight size={16} weight="bold" className="text-[#43C17A]" />
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              {isSchoolForPrev ? "No classes found." : "No years found."}
            </p>
          )
        )}

        {/* Level 2: Schedules List */}
        {!(prevSchedulesLoading || pageLoading) && prevSchedulesLevel === 2 && (
          <>
            {sideSchedules.length > 0 ? (
              sideSchedules.map((item, index) => {
                const hasDates = item.fromDate && item.toDate;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEditSchedule(item)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#E6FBEA] text-[#43C17A] flex items-center justify-center">
                        <Calendar size={16} weight="fill" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.scheduleTitle}</p>
                        <p className="text-[11px] text-gray-500 font-medium">{item.examType}</p>
                        {hasDates && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(item.fromDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                            })}{" "}
                            -{" "}
                            {new Date(item.toDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              !sideLoading && (
                <p className="text-sm text-gray-500 text-center py-4">No schedules found.</p>
              )
            )}
            {sideLoading && <PreviousSchedulesShimmer />}
          </>
        )}
      </div>
    </div>
  );
}
