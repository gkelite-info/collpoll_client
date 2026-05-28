"use client";
import { TrashSimpleIcon, PencilSimple } from "@phosphor-icons/react";

type SubCategory = {
  subCategoryId: number;
  subCategoryName: string;
};

type SubCategoryCardProps = {
  title: string;
  subCategoriesCount: number;
  subCategories: SubCategory[];
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function SubCategoryCard({
  title,
  subCategoriesCount,
  subCategories,
  onEdit,
  onDelete,
}: SubCategoryCardProps) {
  return (
    <div className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow h-[280px]">
      
      <div className="flex flex-col md:flex-row gap-2 justify-between items-start mb-5 shrink-0">
        <div className="flex flex-col gap-0.5 order-2 md:order-1">
          <h2 className="text-[20px] font-bold text-[#43C17A] leading-tight">{title}</h2>
          <p className="text-[13px] font-medium text-[#282828]">{subCategoriesCount} Active Subcategories</p>
        </div>
        
        <div className="flex items-center gap-2 order-1 md:order-2 w-full md:w-auto justify-end">
          <button
            onClick={onEdit}
            className="flex cursor-pointer items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 shadow-sm shrink-0"
          >
            <PencilSimple size={16} weight="fill" />
          </button>
          <button
            onClick={onDelete}
            className="flex cursor-pointer items-center justify-center w-7 h-7 rounded-full bg-[#FF00001A] text-[#FF0000] shadow-sm shrink-0"
          >
            <TrashSimpleIcon size={16} weight="fill" className="md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 pr-1">
        {subCategories.length > 0 ? (
          subCategories.map((sub) => (
            <div 
              key={sub.subCategoryId} 
              className="bg-[#F4F6F9] rounded-[8px] px-4 py-2.5 text-[14px] font-medium text-[#282828] border border-gray-100"
            >
              {sub.subCategoryName}
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-[13px] font-medium text-gray-400">No sub-categories assigned to this category.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
