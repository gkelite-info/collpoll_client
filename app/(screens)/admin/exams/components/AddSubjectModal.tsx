import { X, CaretDown } from "@phosphor-icons/react";
import { CustomSelect } from "./CustomSelect";

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  subjectsList: any[];
  newSubjectName: string;
  setNewSubjectName: (val: string) => void;
  newSubjectDate: string;
  setNewSubjectDate: (val: string) => void;
  newSubjectTime: string;
  setNewSubjectTime: (val: string) => void;
}

export function AddSubjectModal({
  isOpen,
  onClose,
  onSubmit,
  subjectsList,
  newSubjectName,
  setNewSubjectName,
  newSubjectDate,
  setNewSubjectDate,
  newSubjectTime,
  setNewSubjectTime,
}: AddSubjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-800">Add Subject Exam</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-gray-700 mb-1.5">Subject Name</label>
            {subjectsList.length > 0 ? (
              <CustomSelect
                value={newSubjectName}
                onChange={(val) => setNewSubjectName(val.toString())}
                options={subjectsList.map((sub) => ({
                  value: sub.subjectName,
                  label: sub.subjectName,
                }))}
                placeholder="Select Subject"
              />
            ) : (
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-1.5">Exam Date</label>
              <input
                type="text"
                value={newSubjectDate}
                onChange={(e) => setNewSubjectDate(e.target.value)}
                placeholder="e.g. 11/09/2026"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-bold text-gray-700 mb-1.5">Exam Time</label>
              <input
                type="text"
                value={newSubjectTime}
                onChange={(e) => setNewSubjectTime(e.target.value)}
                placeholder="e.g. 11:49 AM"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#43C17A] focus:border-[#43C17A]"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#43C17A] hover:bg-[#38b16d] text-white py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
            >
              Add Subject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
