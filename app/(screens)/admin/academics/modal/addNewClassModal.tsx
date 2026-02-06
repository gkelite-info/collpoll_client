"use client";

import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { suggestTopicsAction } from "@/lib/helpers/faculty/ai/suggestTopics.server";
import { CheckCircle, UserCircle } from "@phosphor-icons/react";
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
};

export default function AddNewClassModal({
  isOpen,
  onClose,
  onSave,
  prefilledContext,
}: AddNewCardModalProps) {
  // State for form
  const [unitName, setUnitName] = useState("");
  const [unitNumber, setUnitNumber] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // AI & Topics State
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [adminId, setAdminId] = useState<number | null>(null);
  const { userId, collegeId, loading } = useUser();

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

    if (!unitName.trim()) {
      toast.error("Please enter unit name");
      return;
    }
    if (selectedTopics.length === 0) {
      toast.error("Please add topics");
      return;
    }

    try {
      const unitResult = await upsertAdminSubjectUnit({
        collegeId,
        collegeSubjectId: prefilledContext.subjectId,
        adminId: adminId,
        facultyId: prefilledContext.facultyId,
        unitNumber: unitNumber,
        unitTitle: unitName,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
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
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Save failed");
    }
  };

  // --- AI HANDLER ---
  const handleUnitNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUnitName(val);

    if (!val || !prefilledContext?.subjectName) return;
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    aiTimeoutRef.current = setTimeout(async () => {
      try {
        const suggestions = await suggestTopicsAction(
          prefilledContext.subjectName,
          val,
        );
        setAvailableTopics(suggestions);
      } catch (e) {
        console.error(e);
      }
    }, 1500);
  };

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
                Unit Name
              </label>
              <input
                type="text"
                value={unitName}
                onChange={handleUnitNameChange}
                placeholder="e.g. Introduction to Graphs"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#43C17A] outline-none"
              />

              {/* AI Topics UI */}
              {(availableTopics.length > 0 || selectedTopics.length > 0) && (
                <div className="mt-3 border border-[#BBF7D0] bg-[#F0FDF4] rounded-lg p-3 relative z-10">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-[#15803d]">
                      AI Suggestions
                    </span>
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
                  </div>

                  {/* Selected Chips */}
                  {selectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedTopics.map((t) => (
                        <span
                          key={t}
                          onClick={() => {
                            setSelectedTopics((p) => p.filter((x) => x !== t));
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

                  {/* Available Chips */}
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
                            setAvailableTopics((p) => p.filter((x) => x !== t));
                            setSelectAll(false);
                          }}
                          className="bg-green-100 text-green-700 text-[11px] px-2 py-1 rounded-full cursor-pointer border border-transparent hover:border-green-300"
                        >
                          + {t}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
            {/* Unit No & Dates */}
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Unit No.
              </label>
              <input
                type="number"
                min={1}
                value={unitNumber}
                onChange={(e) => setUnitNumber(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#43C17A]"
              />
            </div>
            <div></div>
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#43C17A]"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#282828]">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#43C17A]"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#43C17A] text-white font-semibold py-2 rounded-xl hover:bg-[#3bad6d]"
            >
              Save Unit
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-xl text-[#282828] hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
