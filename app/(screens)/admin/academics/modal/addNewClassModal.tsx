"use client";

import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { CheckCircle, UserCircle, Spinner } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  saveAdminAcademicUnit,
  upsertAdminSubjectUnit,
} from "@/lib/helpers/admin/academics/adminCreateAction";
import { SubjectContext } from "@/lib/helpers/admin/academics/adminUnitActions";

type AddNewCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  prefilledContext?: SubjectContext;
  existingUnitNumbers?: number[];
};

export default function AddNewClassModal({
  isOpen,
  onClose,
  onSave,
  prefilledContext,
  existingUnitNumbers = [],
}: AddNewCardModalProps) {
  // State for form
  const [unitName, setUnitName] = useState("");
  const [unitNumber, setUnitNumber] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // AI & Topics State
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [adminId, setAdminId] = useState<number | null>(null);
  const { userId, collegeId, loading } = useUser();
  const [saveLoading, setSaveLoading] = useState(false);

  const resetForm = () => {
    setUnitName("");
    setUnitNumber("");
    setStartDate("");
    setEndDate("");
    setAvailableTopics([]);
    setSelectedTopics([]);
    setSearchQuery("");
    setSelectAll(false);
    setShowSearch(false);
    setIsAiLoading(false);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Load Admin Context
  useEffect(() => {
    if (!userId || loading) return;
    fetchAdminContext(userId).then((ctx) => setAdminId(ctx.adminId));
  }, [userId, loading]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!collegeId || !adminId || !prefilledContext) {
      toast.error("Missing configuration");
      return;
    }

    if (!prefilledContext.facultyId || prefilledContext.facultyId === 0) {
      toast.error("Cannot save: No faculty assigned to this section.");
      return;
    }

    if (existingUnitNumbers.includes(Number(unitNumber))) {
      toast.error(`Unit No. ${unitNumber} already exists for this subject!`);
      return;
    }

    if (!unitName.trim()) {
      toast.error("Please enter a Unit Name.");
      return;
    }
    if (!unitNumber || unitNumber < 1) {
      toast.error("Please enter a valid Unit Number.");
      return;
    }
    // if (!startDate) {
    //   toast.error("Please select a Start Date.");
    //   return;
    // }
    // if (!endDate) {
    //   toast.error("Please select an End Date.");
    //   return;
    // }
    // if (new Date(startDate) > new Date(endDate)) {
    //   toast.error("Start Date cannot be after the End Date.");
    //   return;
    // }
    if (selectedTopics.length === 0) {
      toast.error("Please add at least one topic.");
      return;
    }

    try {
      setSaveLoading(true);

      const unitResult = await upsertAdminSubjectUnit({
        collegeId,
        collegeSubjectId: prefilledContext.subjectId,
        adminId: adminId,
        facultyId: prefilledContext.facultyId,
        unitNumber: Number(unitNumber),
        unitTitle: unitName,
        startDate: startDate,
        endDate: endDate,
        topics: selectedTopics,
      });

      await saveAdminAcademicUnit({
        collegeId,
        collegeEducationId: prefilledContext.educationId,
        collegeBranchId: prefilledContext.branchId,
        collegeAcademicYearId: prefilledContext.academicYearId,
        collegeSemesterId: prefilledContext.semesterId,
        collegeSubjectId: prefilledContext.subjectId,
        collegeSectionId: prefilledContext.sectionId,
        collegeSubjectUnitId: unitResult.collegeSubjectUnitId,
        adminId: adminId,
        facultyId: prefilledContext.facultyId,
      });

      toast.success("Class saved successfully");
      if (onSave) onSave();
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Save failed");
    }
    finally {
      setSaveLoading(false);
    }
  };

  

  const handleUnitNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\b\w/g, (char) => char.toUpperCase());
    setUnitName(val);

    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    if (!val || !prefilledContext?.subjectName) {
      setAvailableTopics([]);
      setIsAiLoading(false);
      return;
    }

    setAvailableTopics([]);
    setIsAiLoading(true);

    aiTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await suggestTopicsAction(
          prefilledContext.subjectName,
          val,
        );
        setAvailableTopics(suggestions);
      } catch (e) {
        console.error(e);
        toast.error("Failed to generate AI suggestions.");
      } finally {
        setIsAiLoading(false);
      }
    }, 2000);
  };

  const isUnitNumberDuplicate = existingUnitNumbers.includes(
    Number(unitNumber),
  );

  return (
    <div className="fixed inset-0 text-black z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[#282828] mb-1">Add Unit</h2>

          {prefilledContext && (
            <div className="flex items-center gap-4 mb-6 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold">
                  Year
                </span>
                <span className="text-sm font-semibold text-[#282828]">
                  {prefilledContext.academicYear}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold">
                  Subject
                </span>
                <span className="text-sm font-semibold text-[#282828]">
                  {prefilledContext.subjectName}
                </span>
              </div>
              <div className="h-8 w-[1px] bg-gray-300"></div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-gray-500 font-bold">
                  Faculty
                </span>
                <div className="flex items-center gap-1.5">
                  <UserCircle size={16} className="text-[#43C17A]" />
                  <span className="text-sm font-medium text-[#282828]">
                    {prefilledContext.facultyName}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="col-span-2">
              <label className="text-sm font-semibold text-[#282828]">
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={unitName}
                onChange={handleUnitNameChange}
                placeholder="e.g. Introduction To Graphs"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#43C17A] outline-none"
              />

              {isAiLoading && (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-[#43C17A] bg-[#F0FDF4] p-3 rounded-lg border border-[#BBF7D0]">
                  <Spinner size={16} className="animate-spin" />
                  Generating AI suggestions for "{unitName}"...
                </div>
              )}

              {!isAiLoading &&
                (availableTopics.length > 0 || selectedTopics.length > 0) && (
                  <div className="mt-3 border border-[#BBF7D0] bg-[#F0FDF4] rounded-lg p-3 relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#15803d]">
                        AI Suggestions
                      </span>
                      {availableTopics.length > 0 && (
                        <div className="flex gap-2">
                          <label className="text-xs flex items-center gap-1 cursor-pointer select-none text-[#15803d]">
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={(e) => {
                                setSelectAll(e.target.checked);
                                if (e.target.checked) {
                                  setSelectedTopics((p) => [
                                    ...new Set([...p, ...availableTopics]),
                                  ]);
                                  setAvailableTopics([]);
                                }
                              }}
                              className="accent-[#15803d]"
                            />
                            Select All
                          </label>
                        </div>
                      )}
                    </div>

                    {selectedTopics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedTopics.map((t) => (
                          <span
                            key={t}
                            onClick={() => {
                              setSelectedTopics((p) =>
                                p.filter((x) => x !== t),
                              );
                              setAvailableTopics((p) => [...p, t]);
                              setSelectAll(false);
                            }}
                            className="bg-white border border-green-200 text-green-800 text-[11px] px-2 py-1 rounded-full cursor-pointer flex items-center gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          >
                            <CheckCircle weight="fill" /> {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {availableTopics
                        .filter((t) =>
                          t.toLowerCase().includes(searchQuery.toLowerCase()),
                        )
                        .map((t) => (
                          <span
                            key={t}
                            onClick={() => {
                              setSelectedTopics((p) => [...p, t]);
                              setAvailableTopics((p) =>
                                p.filter((x) => x !== t),
                              );
                              setSelectAll(false);
                            }}
                            className="bg-green-100 text-green-700 text-[11px] px-2 py-1 rounded-full cursor-pointer border border-transparent hover:border-green-300 transition-colors"
                          >
                            + {t}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Unit No. <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={unitNumber}
                onChange={(e) =>
                  setUnitNumber(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="Enter unit no"
                onWheel={(e) => e.currentTarget.blur()}
                className={`w-full border text-[#282828] rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 ${isUnitNumberDuplicate
                  ? "border-red-500 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-[#43C17A]"
                  }`}
              />
              {isUnitNumberDuplicate && (
                <span className="text-[11px] font-medium text-red-500 mt-1 block">
                  Unit {unitNumber} already exists!
                </span>
              )}
            </div>
            <div></div>
            {/* <div>
              <label className="text-sm font-semibold text-[#282828]">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && new Date(e.target.value) > new Date(endDate)) {
                    setEndDate("");
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#43C17A]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={startDate}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!startDate}
                className={`w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#43C17A] ${!startDate ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
              />
            </div> */}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              disabled={isUnitNumberDuplicate || saveLoading}
              className={`flex-1 text-white cursor-pointer font-semibold py-2 rounded-xl transition-all ${isUnitNumberDuplicate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#43C17A] hover:bg-[#3bad6d]"
                }`}
            >
              {saveLoading ? "Saving.." : "Save Unit"}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 border cursor-pointer border-gray-300 py-2 rounded-xl text-[#282828] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
