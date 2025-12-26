"use client";
import { X, CaretRight } from "@phosphor-icons/react";

type Props = {
  open: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onResumeClick: () => void;
};

export default function ProfileQuickMenu({
  open,
  onClose,
  onProfileClick,
  onResumeClick,
}: Props) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-200"
        onClick={onClose}
      />

      <div className="fixed top-21 right-4 z-210 bg-white rounded-md shadow-lg w-64">
        <div className="flex justify-start p-2">
          <button onClick={onClose} className="cursor-pointer">
            <X size={18} className="text-black"/>
          </button>
        </div>

        <div className="px-4 pb-4 pl-6 -mt-1">
          <div
            onClick={onProfileClick}
            className="flex justify-between items-center cursor-pointer rounded px-2"
          >
            <span className="text-sm font-medium text-[#282828]">Profile</span>
            <CaretRight size={16} className="text-[#000000]"/>
          </div>

          <hr className="w-[90%] ml-2 mt-1 text-[#B3B3B3]"/>

          <div
            onClick={onResumeClick}
            className="flex justify-between items-center py-2 cursor-pointer rounded px-2"
          >
            <span className="text-sm font-medium text-[#282828]">Resume</span>
            <CaretRight size={16} className="text-[#000000]"/>
          </div>
        </div>
      </div>
    </>
  );
}
