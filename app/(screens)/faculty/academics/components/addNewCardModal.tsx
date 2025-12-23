"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { CardProps } from "./subjectCards";

type AddNewCardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCard: CardProps) => void;
};

export default function addNewCardModal({
  isOpen,
  onClose,
  onSave,
}: AddNewCardModalProps) {
  const [formData, setFormData] = useState({
    subjectTitle: "",
    year: "",
    fromDate: "",
    toDate: "",
    units: "",
    nextLesson: "",
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const newCard: CardProps = {
      subjectTitle: formData.subjectTitle,
      year: formData.year,
      units: Number(formData.units),
      topicsCovered: 0,
      topicsTotal: 15,
      nextLesson: formData.nextLesson,
      percentage: 0,
      students: 0,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
    };
    onSave(newCard);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex text-black items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="p-6 overflow-y-auto">
          <h2 className="text-xl font-bold text-[#282828] mb-0.5">Add Class</h2>
          <p className="text-[#525252] text-xs mb-5">
            Track progress, add lessons, and manage course content across all
            your batches.
          </p>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#282828]">
                Subject Name
              </label>
              <input
                type="text"
                placeholder="Data Structures"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#43C17A]"
                onChange={(e) =>
                  setFormData({ ...formData, subjectTitle: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#282828]">
                Class / Year / Branch
              </label>
              <div className="relative flex items-center">
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none"
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                >
                  <option>Year 2 - CSE B</option>
                  <option>Year 3 - CSE A</option>
                </select>
                <FaChevronDown className="absolute right-3 text-gray-400 text-[10px] pointer-events-none" />
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-sm font-semibold text-[#282828] mb-1">
                Duration
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase">From</span>
                  <input
                    type="date"
                    placeholder="DD/MM/YYYY"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-center placeholder:text-gray-300 focus:outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, fromDate: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs  uppercase">To</span>
                  <input
                    type="date"
                    placeholder="DD/MM/YYYY"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-center placeholder:text-gray-300 focus:outline-none"
                    onChange={(e) =>
                      setFormData({ ...formData, toDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#282828]">
                Total Units
              </label>
              <input
                type="text"
                placeholder="Data Structures"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, units: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#282828]">
                Topics
              </label>
              <div className="relative flex items-center">
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm appearance-none focus:outline-none">
                  <option>Year 2 - CSE B</option>
                </select>
                <FaChevronDown className="absolute right-3 text-gray-400 text-[10px] pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-sm font-semibold text-[#282828]">
                New Lesson Topic
              </label>
              <input
                type="text"
                placeholder="Arrays Introduction"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
                onChange={(e) =>
                  setFormData({ ...formData, nextLesson: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 bg-[#43C17A] text-white font-semibold py-2.5 rounded-lg hover:bg-[#3bad6d] transition-colors cursor-pointer text-sm"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-white border border-gray-300 text-[#282828] font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
