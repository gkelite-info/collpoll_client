import { X } from "@phosphor-icons/react";
import { UpcomingLesson } from "../../utils/upcomingClasses";

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: UpcomingLesson | null;
  onAccept: (id: string) => void;
  onCancelClass: (id: string) => void;
}

export const ClassActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  onClose,
  lesson,
  onAccept,
  onCancelClass,
}) => {
  if (!isOpen || !lesson) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-black">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Upcoming Class
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Class Title
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
              {`${lesson.degree} - Year ${lesson.year} ${lesson.title}`}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Topic
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
              {lesson.description || "No topic specified"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Class Date
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
              {lesson.date || "NULL"}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Class Time
            </label>
            <div className="flex gap-3">
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                {lesson.fromTime || "NULL"}
              </div>
              <p className="pt-1.5">to</p>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
                {lesson.toTime || "NULL"}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-gray-700">
              Classroom
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 bg-gray-50">
              {lesson.roomNo || "NULL"}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-3">
          <button
            onClick={() => onAccept(lesson.id)}
            className="flex-1 cursor-pointer bg-[#3FC27B] hover:bg-[#36a86a] text-white font-medium py-2.5 rounded-md text-sm transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => onCancelClass(lesson.id)}
            className="flex-1 cursor-pointer bg-[#FF3B3B] hover:bg-[#e63535] text-white font-medium py-2.5 rounded-md text-sm transition-colors"
          >
            Cancel Class
          </button>
        </div>
      </div>
    </div>
  );
};
