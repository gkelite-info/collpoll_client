"use client";

import { X } from "@phosphor-icons/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateCategoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategories, setSubCategories] = useState<string[]>(["Emergency", "Counselling", "Health Checkup", "Medicines"]);
  const [appliesTo, setAppliesTo] = useState("College");

  if (!isOpen) return null;

  const handleAddSubCategory = () => {
    if (subCategoryInput.trim() && !subCategories.includes(subCategoryInput.trim())) {
      setSubCategories([...subCategories, subCategoryInput.trim()]);
      setSubCategoryInput("");
    }
  };

  const handleRemoveSubCategory = (tagToRemove: string) => {
    setSubCategories(subCategories.filter(tag => tag !== tagToRemove));
  };

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
                <h2 className="text-[20px] md:text-[24px] font-bold text-[#16284F] tracking-tight">Create Category</h2>
                <button 
                    onClick={onClose} 
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded-full transition-colors mt-0.5 md:mt-1"
                >
                    <X size={20} weight="bold" className="text-gray-500" />
                </button>
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[15px] md:text-[16px] font-bold text-[#16284F]">Category Name</label>
                    <input 
                        type="text" 
                        placeholder="Enter a Category name" 
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-[14px] md:text-[15px] outline-none focus:border-[#43C17A] text-gray-700 placeholder:text-gray-400 transition-colors"
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
                            className="flex-1 px-3 py-2 text-[14px] md:text-[15px] outline-none text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0"
                        />
                        <button 
                            onClick={handleAddSubCategory}
                            className="bg-[#43C17A] hover:bg-[#39A869] transition-colors text-white font-semibold px-5 md:px-6 py-2 rounded-md text-[14px] md:text-[15px] cursor-pointer shrink-0"
                        >
                            Add
                        </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2.5 mt-2">
                        {subCategories.map((tag, index) => (
                            <div 
                                key={index} 
                                className="flex items-center gap-1.5 border border-[#43C17A]/40 bg-[#E8F8EF] text-[#34A362] px-3 py-1.5 rounded-md text-[13px] md:text-[14px] font-semibold tracking-wide"
                            >
                                {tag}
                                <button onClick={() => handleRemoveSubCategory(tag)} className="hover:bg-[#43C17A]/20 rounded-full p-0.5 cursor-pointer transition-colors">
                                    <X size={14} weight="bold" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[15px] md:text-[16px] font-bold text-[#16284F]">Assign Executives</label>
                    <div className="flex w-full border border-gray-300 rounded-lg p-1.5 focus-within:border-[#43C17A] transition-colors bg-white">
                        <input 
                            type="text" 
                            placeholder="Select one or more executives" 
                            className="flex-1 px-3 py-2 text-[14px] md:text-[15px] outline-none text-gray-700 placeholder:text-gray-400 bg-transparent min-w-0"
                        />
                        <button className="bg-[#43C17A] hover:bg-[#39A869] transition-colors text-white font-semibold px-4 py-2 rounded-md text-[14px] md:text-[15px] whitespace-nowrap cursor-pointer shrink-0">
                            Add Executive
                        </button>
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
                    className="w-full sm:flex-1 cursor-pointer py-2 rounded-md border border-gray-300 text-[#16284F] font-bold hover:bg-gray-50 transition-colors text-[15px] md:text-[16px]"
                >
                    Cancel
                </button>
                <button 
                    onClick={onClose}
                    className="w-full sm:flex-1 cursor-pointer py-2 rounded-md bg-[#43C17A] hover:bg-[#39A869] text-white font-bold transition-colors text-[15px] md:text-[16px]"
                >
                    Create Category
                </button>
            </div>
            
        </motion.div>
        </div>
    </AnimatePresence>
  );
}