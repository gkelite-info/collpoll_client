"use client";

import { X } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export type CategoryEditData = {
  categoryId?: number;
  title: string;
  subCategories?: string[];
  appliesTo?: string;
} | null;

export default function CreateCategoryModal({
  isOpen,
  onClose,
  categoryData,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  categoryData?: CategoryEditData;
  onSave?: (title: string, subCategories: string[], appliesTo: string) => Promise<void> | void;
}) {
  const [categoryName, setCategoryName] = useState("");
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [appliesTo, setAppliesTo] = useState("College");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (categoryData) {
        setCategoryName(categoryData.title || "");
        setSubCategories(categoryData.subCategories || []);
        setAppliesTo(categoryData.appliesTo || "College");
      } else {
        setCategoryName("");
        setSubCategories([]);
        setAppliesTo("College");
      }
      setSubCategoryInput("");
      setIsSaving(false);
    }
  }, [isOpen, categoryData]);

  const handleCreateOrSave = async () => {
    const trimmedCatName = categoryName.trim();
    if (!trimmedCatName) {
      toast.error("Category name is required.");
      return;
    }

    // Trim all sub-categories and filter out empty ones
    const trimmedSubCats = subCategories
      .map((sub) => sub.trim())
      .filter((sub) => sub.length > 0);

    // Check for duplicate sub-categories in the list
    const uniqueSubs = new Set<string>();
    for (const sub of trimmedSubCats) {
      const lower = sub.toLowerCase();
      if (uniqueSubs.has(lower)) {
        toast.error(`Sub-category "${sub}" is duplicated.`);
        return;
      }
      uniqueSubs.add(lower);
    }

    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(trimmedCatName, trimmedSubCats, appliesTo);
      } catch {
        setIsSaving(false);
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleAddSubCategory = () => {
    const trimmedInput = subCategoryInput.trim();
    if (!trimmedInput) {
      toast.error("Sub-category name cannot be empty.");
      return;
    }

    const isDuplicate = subCategories.some(
      (sub) => sub.trim().toLowerCase() === trimmedInput.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`Sub-category "${trimmedInput}" already exists.`);
      return;
    }

    setSubCategories([...subCategories, trimmedInput]);
    setSubCategoryInput("");
  };

  const handleRemoveSubCategory = (tagToRemove: string) => {
    setSubCategories(subCategories.filter(tag => tag !== tagToRemove));
  };

  const isEditing = !!categoryData?.categoryId;
  const saveBtnText = isSaving
    ? (isEditing ? "Saving..." : "Creating...")
    : (isEditing ? "Save Changes" : "Create Category");

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 font-sans">
        <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-[550px] rounded-2xl p-5 md:p-8 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto"
        >
            <div className="flex justify-between items-start mb-6">
                <h2 className="text-[20px] md:text-[24px] font-bold text-[#16284F] tracking-tight">
                  {isEditing ? "Edit Category" : "Create Category"}
                </h2>
                <button 
                    onClick={onClose} 
                    disabled={isSaving}
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors mt-0.5 md:mt-1 disabled:opacity-50"
                >
                    <X size={20} weight="bold" className="text-gray-500" />
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[15px] md:text-[16px] font-bold text-[#16284F]">Category Name</label>
                    <input 
                        type="text" 
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Enter a Category name" 
                        disabled={isSaving}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] md:text-[15px] outline-none focus:border-[#43C17A] text-gray-700 placeholder:text-gray-400 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-[15px] md:text-[16px] font-bold text-[#16284F]">Add Sub Categories</label>
                    <div className="flex w-full border border-gray-300 rounded-lg p-1.5 focus-within:border-[#43C17A] transition-colors bg-white">
                        <input 
                            type="text" 
                            value={subCategoryInput}
                            onChange={(e) => setSubCategoryInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubCategory()}
                            placeholder="Enter Sub Category name" 
                            disabled={isSaving}
                            className="flex-1 px-3 py-2 text-[14px] md:text-[15px] outline-none text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0 disabled:cursor-not-allowed"
                        />
                        <button 
                            onClick={handleAddSubCategory}
                            disabled={isSaving}
                            className="bg-[#43C17A] hover:bg-[#39A869] transition-colors text-white font-semibold px-5 md:px-6 py-2 rounded-md text-[14px] md:text-[15px] cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                    
                    <div className="mt-2 border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50/50 h-[120px] overflow-y-auto custom-scrollbar">
                        {subCategories.length > 0 ? (
                            <div className="flex flex-wrap gap-2.5 items-start content-start">
                                {subCategories.map((tag, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center gap-1.5 border border-[#43C17A]/40 bg-[#E8F8EF] text-[#34A362] px-3 py-1.5 rounded-md text-[13px] md:text-[14px] font-semibold tracking-wide h-fit"
                                    >
                                        {tag}
                                        <button 
                                          onClick={() => handleRemoveSubCategory(tag)} 
                                          disabled={isSaving}
                                          className="hover:bg-[#43C17A]/20 rounded-full p-0.5 cursor-pointer transition-colors disabled:cursor-not-allowed"
                                        >
                                            <X size={14} weight="bold" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                                <p className="text-[13px] font-medium text-gray-400">
                                    No sub-categories added yet. Use the field above to add them.
                                </p>
                            </div>
                        )}
                    </div>
                </div>


                <div className="flex flex-col gap-2">
                    <label className="text-[15px] md:text-[16px] font-bold text-[#16284F]">Applies To</label>
                    <div className="w-full border border-gray-300 rounded-lg p-4 flex flex-wrap items-center gap-4 sm:gap-10">
                        
                        {["College", "Hostel", "Both"].map((option) => (
                            <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
                                <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${appliesTo === option ? 'border-[#16284F]' : 'border-gray-400 group-hover:border-gray-600'}`}>
                                    {appliesTo === option && <div className="w-2.5 h-2.5 bg-[#16284F] rounded-full" />}
                                </div>
                                <span className="text-[#16284F] font-medium text-[14px] md:text-[15px]">{option}</span>
                                <input 
                                    type="radio" 
                                    name="appliesTo" 
                                    value={option} 
                                    checked={appliesTo === option} 
                                    onChange={() => setAppliesTo(option)} 
                                    disabled={isSaving}
                                    className="hidden" 
                                />
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-8">
                <button 
                    onClick={onClose} 
                    disabled={isSaving}
                    className="w-full sm:flex-1 cursor-pointer py-2 rounded-md border border-gray-300 text-[#16284F] font-bold hover:bg-gray-50 transition-colors text-[15px] md:text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleCreateOrSave}
                    disabled={isSaving}
                    className="w-full sm:flex-1 cursor-pointer py-2 rounded-md bg-[#43C17A] hover:bg-[#39A869] text-white font-bold transition-colors text-[15px] md:text-[16px] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {saveBtnText}
                </button>
            </div>
            
        </motion.div>
        </div>
    </AnimatePresence>
  );
}