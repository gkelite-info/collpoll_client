// "use client";

// import { motion } from "framer-motion";
// import { AlertCircle, Loader2 } from "lucide-react";

// type Props = {
//   isOpen: boolean;
//   type: "post" | "comment" | undefined;
//   isDeleting: boolean;
//   onCancel: () => void;
//   onConfirm: () => void;
// };

// export default function DeleteConfirmModal({
//   isOpen,
//   type,
//   isDeleting,
//   onCancel,
//   onConfirm,
// }: Props) {
//   if (!isOpen) return null;

//   return (
//     <motion.div
//       className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-default"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       onClick={onCancel}
//     >
//       <motion.div
//         initial={{ scale: 0.9, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         exit={{ scale: 0.9, opacity: 0 }}
//         className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl flex flex-col items-center text-center"
//         onClick={(e) => e.stopPropagation()} // Prevent clicking modal from closing it
//       >
//         <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
//           <AlertCircle size={24} />
//         </div>
//         <h3 className="text-lg font-bold text-[#282828] mb-2">
//           Delete {type === "post" ? "Post" : "Comment"}?
//         </h3>
//         <p className="text-sm text-gray-500 mb-6">
//           This action cannot be undone. Are you sure you want to permanently
//           remove this {type}?
//         </p>

//         <div className="flex w-full gap-3">
//           <button
//             onClick={onCancel}
//             disabled={isDeleting}
//             className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={isDeleting}
//             className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
//           >
//             {isDeleting ? (
//               <Loader2 size={16} className="animate-spin" />
//             ) : (
//               "Delete"
//             )}
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// }

"use client";

import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  type: "post" | "comment" | "e-paper" | string | undefined;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  isOpen,
  type,
  isDeleting,
  onCancel,
  onConfirm,
}: Props) {
  if (!isOpen) return null;

  const displayTitle =
    type === "e-paper"
      ? "E-Paper"
      : type === "post"
        ? "Post"
        : type === "comment"
          ? "Comment"
          : type;

  return (
    <motion.div
      className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-sm flex items-center justify-center cursor-default"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()} // Prevent clicking modal from closing it
      >
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={24} />
        </div>

        {/* Updated Title Logic */}
        <h3 className="text-lg font-bold text-[#282828] mb-2">
          Delete {displayTitle}?
        </h3>

        <p className="text-sm text-gray-500 mb-6">
          This action cannot be undone. Are you sure you want to permanently
          remove this {type}?
        </p>

        <div className="flex w-full gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
