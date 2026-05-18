import { CheckCircle } from "@phosphor-icons/react";
import Image from "next/image";

export default function AddExecutiveModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  const executivesList = [
    { id: 1, name: "Rahul Sharma", role: "B.Tech CSE • ID-28939", image: "https://i.pravatar.cc/150?img=11" },
    { id: 2, name: "Shreya Patel", role: "B.Tech CSE • ID-28939", image: "https://i.pravatar.cc/150?img=45" },
    { id: 3, name: "Rohan Shetty", role: "B.Tech CSE • ID-28939", image: "https://i.pravatar.cc/150?img=12" },
    { id: 4, name: "Shreya Patel", role: "B.Tech CSE • ID-28939", image: "https://i.pravatar.cc/150?img=20" },
    { id: 5, name: "Priya Reddy", role: "B.Tech CSE • ID-28939", image: "https://i.pravatar.cc/150?img=5" },
    { id: 6, name: "Krish Kapoor", role: "B.Tech CSE • ID-28939", image: "https://i.pravatar.cc/150?img=8" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[400px] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col">
        
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#16284F]">Add Executive</h2>
          <p className="text-[13px] text-gray-500 font-medium mt-1">Assign executives to the Infrastructure category</p>
        </div>

        <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
          {executivesList.map((exec) => (
            <div 
              key={exec.id} 
              className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-[38px] h-[38px] rounded-full overflow-hidden bg-gray-100 border border-black/5">
                  <Image
                    src={exec.image}
                    alt={exec.name}
                    fill
                    sizes="38px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-[#16284F] leading-tight">{exec.name}</span>
                  <span className="text-[12px] text-gray-500 font-medium mt-0.5">{exec.role}</span>
                </div>
              </div>
              <CheckCircle size={22} weight="fill" color="#A0AEC0" className="flex-shrink-0" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6 pt-2">
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
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}