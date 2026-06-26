"use client";

import { useState, useEffect } from "react";
import { X, CalendarPlus, Repeat, MagicWand, Trash } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { 
  addCollegeHoliday, 
  bulkGenerateSaturdays,
  HolidayType,
  CollegeHoliday,
  updateCollegeHoliday,
  bulkGenerateSundays
} from "@/lib/helpers/Hr/holidays/holidayAPI";
import { useUser } from "@/app/utils/context/UserContext";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

interface AddHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  year: number;
  editData?: CollegeHoliday | null;
}

const HOLIDAY_TYPES: { value: HolidayType; label: string; color: string }[] = [
  { value: "festival", label: "Festival", color: "bg-orange-100 text-orange-700" },
  { value: "government", label: "Government", color: "bg-blue-100 text-blue-700" },
  { value: "emergency", label: "Emergency / Ad-hoc", color: "bg-red-100 text-red-700" },
  { value: "custom", label: "Institutional Event", color: "bg-purple-100 text-purple-700" },
];

export default function AddHolidayModal({
  isOpen,
  onClose,
  onSuccess,
  year,
  editData,
}: AddHolidayModalProps) {
  const { collegeId, userId } = useUser();
  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 2;

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<HolidayType>("festival");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<"generate_sundays" | "generate_saturdays" | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setDate(editData.holidayDate);
        setTitle(editData.title);
        setType(editData.holidayType);
        setDescription(editData.description || "");
      } else {
        setDate("");
        setTitle("");
        setType("festival");
        setDescription("");
      }
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId || !userId) return;

    if (!date) {
      toast.error("Date is required", { id: "holiday-date-error" });
      return;
    }
    if (!title.trim()) {
      toast.error("Holiday Title is required", { id: "holiday-title-error" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editData) {
        await updateCollegeHoliday(editData.holidayId, {
          collegeId,
          holidayDate: date,
          title,
          holidayType: type,
          description,
          createdBy: userId,
        });
        toast.success("Holiday updated successfully");
      } else {
        await addCollegeHoliday({
          collegeId,
          holidayDate: date,
          title,
          holidayType: type,
          description,
          createdBy: userId,
        });
        toast.success("Holiday added successfully");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${editData ? 'update' : 'add'} holiday`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkAction = async () => {
    if (!collegeId || !userId || !bulkActionType) return;

    setIsBulkGenerating(true);
    try {
      if (bulkActionType === "generate_sundays") {
        await bulkGenerateSundays(collegeId, year, userId);
        toast.success(`Generated all Sundays for ${year}`);
      } else if (bulkActionType === "generate_saturdays") {
        await bulkGenerateSaturdays(collegeId, year, userId);
        toast.success(`Generated all Saturdays for ${year}`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || `Failed to perform bulk action`);
    } finally {
      setIsBulkGenerating(false);
      setBulkActionType(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-800">
            <CalendarPlus size={24} className="text-[#43C17A]" weight="fill" />
            <h2 className="text-lg font-bold">{editData ? "Edit Holiday" : "Add Holiday"}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {!editData && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions for {year}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBulkActionType("generate_sundays")}
                  disabled={isBulkGenerating}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-all border border-indigo-200 disabled:opacity-50 cursor-pointer text-sm"
                >
                  {isBulkGenerating && bulkActionType === "generate_sundays" ? (
                    <Repeat size={16} className="animate-spin" />
                  ) : (
                    <MagicWand size={16} weight="fill" />
                  )}
                  Add Sundays
                </button>
                
                <button
                  type="button"
                  onClick={() => setBulkActionType("generate_saturdays")}
                  disabled={isBulkGenerating}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-cyan-50 text-cyan-700 font-semibold rounded-xl hover:bg-cyan-100 transition-all border border-cyan-200 disabled:opacity-50 cursor-pointer text-sm"
                >
                  {isBulkGenerating && bulkActionType === "generate_saturdays" ? (
                    <Repeat size={16} className="animate-spin" />
                  ) : (
                    <MagicWand size={16} weight="fill" />
                  )}
                  Add Saturdays
                </button>
              </div>
              
              <p className="text-[11px] text-gray-500 mt-3 text-center leading-tight">
                Instantly mark all Sundays or Saturdays in {year} as weekly off days.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                min="2026-01-01"
                max={`${maxYear}-12-31`}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#43C17A]/20 focus:border-[#43C17A] transition text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Holiday Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Diwali, Independence Day"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#43C17A]/20 focus:border-[#43C17A] transition text-gray-800 placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {HOLIDAY_TYPES.map((t) => (
                  <div
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`cursor-pointer text-sm font-medium p-2 rounded-lg border flex items-center justify-center transition-all
                      ${type === t.value 
                        ? 'border-[#43C17A] bg-[#43C17A]/10 text-[#43C17A] shadow-sm' 
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }
                    `}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details..."
                rows={5}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#43C17A]/20 focus:border-[#43C17A] transition resize-none custom-scrollbar text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#43C17A] text-white font-bold rounded-xl hover:bg-[#3ba96a] transition-all shadow-md shadow-[#43C17A]/20 disabled:opacity-70 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? "Saving..." : editData ? "Save Changes" : "Add Holiday"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!bulkActionType}
        onConfirm={handleBulkAction}
        onCancel={() => setBulkActionType(null)}
        isDeleting={isBulkGenerating}
        title={
          bulkActionType === "generate_sundays" ? "Generate Sundays" : "Generate Saturdays"
        }
        actionType="accept"
        confirmText="Yes, Generate"
        loadingText="Generating..."
        customDescription={`Are you sure you want to auto-generate all ${bulkActionType?.includes("sundays") ? "Sundays" : "Saturdays"} for the year ${year} as weekly off days?`}
      />
    </div>
  );
}
