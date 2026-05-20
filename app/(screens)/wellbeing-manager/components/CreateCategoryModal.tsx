import { X } from "@phosphor-icons/react";

export default function CreateCategoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[400px] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col">
        
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#16284F]">Create Category</h2>
            <p className="text-[13px] text-gray-500 font-medium mt-1">Add a new category for campus issues</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 cursor-pointer bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors border border-gray-100"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold text-[#16284F]">Category Name</label>
            <input 
              type="text" 
              placeholder="e.g., Library, Transport" 
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#43C17A] focus:ring-1 focus:ring-[#43C17A] transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <button 
            onClick={onClose} 
            className="flex-1 cursor-pointer py-2.5 rounded-xl border border-gray-200 text-[#4D6285] font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="flex-1 cursor-pointer py-2.5 rounded-xl bg-[#43C17A] text-white font-bold hover:bg-[#34A362] transition-colors shadow-[0_2px_8px_rgba(67,193,122,0.2)] text-sm"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}