"use client";
import Image from "next/image";
import { Trash, TrashSimpleIcon } from "@phosphor-icons/react";

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
  onAddExecutive?: () => void;
  onDelete?: () => void;
};

export default function CategoryCard({
  title,
  executivesAssigned,
  executives,
  onAddExecutive,
  onDelete,
}: CategoryCardProps) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow">
      
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start mb-5">
        <div className="flex flex-col gap-0.5 order-2 md:order-1">
          <h2 className="text-[20px] font-bold text-[#282828] leading-tight">{title}</h2>
          <p className="text-[13px] font-medium text-[#282828]">{executivesAssigned} Executives Assigned</p>
        </div>
        
        <div className="flex items-center gap-2 order-1 md:order-2 w-full md:w-auto">
          <button
            onClick={onAddExecutive}
            className="flex-1 md:flex-none cursor-pointer bg-[#43C17A] text-white text-[12px] font-bold px-3 py-1.5 rounded-[6px] shadow-sm"
          >
            Add Executive
          </button>
          <button
            onClick={onDelete}
            className="flex cursor-pointer items-center justify-center w-7 h-7 rounded-full bg-[#FF00001A] text-[#FF0000] shadow-sm shrink-0"
          >
            <TrashSimpleIcon  size={16} weight="fill" className="md:w-4 md:h-4"/>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {executives.map((exec) => (
          <div key={exec.id} className="flex items-center gap-3">
            <div className="relative w-[42px] h-[42px] rounded-full overflow-hidden flex-shrink-0 bg-gray-200 border border-gray-100 shadow-sm">
              <Image
                src={exec.image}
                alt={exec.name}
                fill
                sizes="42px"
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-[14px] font-bold text-[#282828] truncate">{exec.name}</p>
                <p className="text-[12px] font-bold text-[#282828] shrink-0">{exec.staffId}</p>
              </div>
              <p className="text-[12px] font-bold text-[#43C17A] truncate mt-[1px]">{exec.role}</p>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}