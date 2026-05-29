"use client";
import { Avatar } from "@/app/utils/Avatar";
import { TrashSimpleIcon, PencilSimple } from "@phosphor-icons/react";

type Executive = {
  id: number;
  name: string;
  staffId: string;
  role: string;
  image: string;
};

type CategoryCardProps = {
  title: string;
  executivesAssigned: number;
  executives: Executive[];
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CategoryCard({
  title,
  executivesAssigned,
  executives,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow h-[280px]">
      
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start mb-5 shrink-0">
        <div className="flex flex-col gap-0.5 order-2 md:order-1">
          <h2 className="text-[20px] font-bold text-[#282828] leading-tight">{title}</h2>
          <p className="text-[13px] font-medium text-[#282828]">{executivesAssigned} Executives Assigned</p>
        </div>
        
        <div className="flex items-center gap-2 order-1 md:order-2 w-full md:w-auto justify-end">
          <button
            onClick={onEdit}
            className="flex cursor-pointer items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 shadow-sm shrink-0"
          >
            <PencilSimple size={16} weight="fill" />
          </button>
          <div className="relative group">
            <button
              type="button"
              aria-disabled={executivesAssigned > 0}
              onClick={executivesAssigned > 0 ? undefined : onDelete}
              className={`flex items-center justify-center w-7 h-7 rounded-full shadow-sm shrink-0 transition-all ${
                executivesAssigned > 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : "cursor-pointer bg-[#FF00001A] text-[#FF0000] hover:bg-[#FF00002A] active:scale-95"
              }`}
            >
              <TrashSimpleIcon size={16} weight="fill" className="md:w-4 md:h-4"/>
            </button>
            {executivesAssigned > 0 && (
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex group-focus-within:flex w-44 p-2 bg-[#16284F] text-white text-[11px] font-medium rounded-lg shadow-lg z-50 text-center pointer-events-none transition-all after:content-[''] after:absolute after:bottom-full after:right-[10px] after:border-4 after:border-transparent after:border-b-[#16284F]">
                Cannot delete category with assigned executives
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1">
        {executives.length > 0 ? (
          executives.map((exec) => (
            <div key={exec.id} className="flex items-center gap-3">
              <Avatar src={exec.image} alt={exec.name} size={42} />
              
              <div className="flex flex-col min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-[14px] font-bold text-[#282828] truncate">{exec.name}</p>
                  <p className="text-[12px] font-bold text-[#282828] shrink-0">{exec.staffId}</p>
                </div>
                <p className="text-[12px] font-bold text-[#43C17A] truncate mt-[1px]">{exec.role}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-[13px] font-medium text-gray-400">No Wellbeing Executives assigned to this category yet.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}