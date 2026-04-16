// "use client";

// interface Props {
//   open: boolean;
//   onConfirm: () => void;
//   onCancel: () => void;
//   isDeleting?: boolean;
//   name?: string;
// }

// export default function ConfirmDeleteModal({
//   open,
//   onConfirm,
//   onCancel,
//   isDeleting = false,
//   name = "event"
// }: Props) {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center">
//       <div className="bg-white rounded-xl w-[380px] p-6">
//         <h3 className="text-lg font-semibold text-gray-800 mb-2">
//           Delete {name}?
//         </h3>
//         <p className="text-sm text-gray-600 mb-6">
//           Are you sure you want to delete this {name}? This action cannot be undone.
//         </p>

//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onCancel}
//             disabled={isDeleting}
//             className="px-4 py-2 text-[#282828] cursor-pointer rounded-lg text-sm border"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={isDeleting}
//             className="px-4 py-2 cursor-pointer rounded-lg text-sm bg-red-600 text-white"
//           >
//             {isDeleting ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash, X } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  name?: string;
}

export default function ConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
  isDeleting = false,
  name = "event"
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isDeleting ? onCancel : undefined}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl w-full max-w-[400px] p-8 shadow-2xl border border-gray-100"
          >
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            >
              <X size={20} weight="bold" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50/50">
                <Trash size={32} weight="duotone" className="text-red-500" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete {name}?
              </h3>

              <p className="text-[15px] text-gray-500 mb-8 leading-relaxed">
                Are you sure you want to delete this <span className="font-semibold text-gray-700">{name}</span>? This action cannot be undone and will permanently remove the data.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-gray-700 font-semibold bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 flex items-center justify-center px-4 py-3 font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all disabled:opacity-70 shadow-sm shadow-red-200 cursor-pointer"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}