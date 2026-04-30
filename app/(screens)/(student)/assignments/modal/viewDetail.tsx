// "use client";

// import { downloadAssignmentFile } from "@/app/utils/storageActions";
// import { PaperPlaneRight } from "@phosphor-icons/react";
// import { FiDownload } from "react-icons/fi";

// type AssignmentDetailsModalProps = {
//     isOpen: boolean;
//     onClose: () => void;
//     card: any;
//     submissionFileName?: string;
// };

// export default function ViewDetailModal({
//     isOpen,
//     onClose,
//     card,
//     submissionFileName,
// }: AssignmentDetailsModalProps) {
//     if (!isOpen || !card) return null;

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4">
//             <div className="bg-white w-full max-w-140 max-h-[80vh] rounded-xl relative shadow-lg flex flex-col overflow-hidden">
//                 <div className="w-full flex items-center justify-between px-5 pt-3 shrink-0">
//                     <div className="w-full flex justify-end">
//                         <button
//                             onClick={onClose}
//                             className="text-[#282828] hover:text-black text-xl cursor-pointer"
//                         >
//                             ✕
//                         </button>
//                     </div>
//                 </div>

//                 <div className="flex-1 overflow-y-auto px-5 pb-5">
//                     <div className="mt-2 grid grid-cols-2 gap-x-3">
//                         {/* Left Labels */}
//                         <div className="flex flex-col gap-3">
//                             <p className="text-sm text-[#111827] font-medium min-h-[20px]">
//                                 Assignment Title:
//                             </p>
//                             <p className="text-sm text-[#111827] font-medium min-h-[20px]">
//                                 Subject:
//                             </p>
//                             <p className="text-sm text-[#111827] font-medium min-h-[20px]">
//                                 Faculty:
//                             </p>
//                             <p className="text-sm text-[#111827] font-medium min-h-[20px]">
//                                 Posted on:
//                             </p>
//                             <p className="text-sm text-[#111827] font-medium min-h-[20px]">
//                                 Deadline:
//                             </p>
//                         </div>

//                         {/* Right Values */}
//                         <div className="flex flex-col gap-3 min-w-0">
//                             <p className="text-[#474747] text-sm break-words min-h-[20px]">
//                                 {card.title}
//                             </p>

//                             <p className="text-[#474747] text-sm break-words min-h-[20px]">
//                                 {card.subjectName}
//                             </p>

//                             <p className="text-[#474747] text-sm break-words min-h-[20px]">
//                                 {card.professor}
//                             </p>

//                             <p className="text-[#474747] text-sm break-words min-h-[20px]">
//                                 {card.fromDate}
//                             </p>

//                             <p className="text-[#474747] text-sm break-words min-h-[20px]">
//                                 {card.toDate}
//                             </p>
//                         </div>
//                     </div>

//                     <div className="mt-4">
//                         <h3 className="text-[#282828] font-semibold text-lg mt-2">
//                             Attachment:
//                         </h3>

//                         {submissionFileName ? (
//                             <p
//                                 className="text-[#474747] font-medium text-sm underline cursor-pointer break-all"
//                                 onClick={() =>
//                                     downloadAssignmentFile(
//                                         Number(card.assignmentId),
//                                         submissionFileName.split("/").pop()!
//                                     )
//                                 }
//                             >
//                                 {submissionFileName.split("/").pop()}
//                             </p>
//                         ) : (
//                             <p className="text-gray-500 text-sm">
//                                 No attachment uploaded
//                             </p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

"use client";

import { downloadAssignmentFile } from "@/app/utils/storageActions";
import { PaperPlaneRight } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { FiDownload } from "react-icons/fi";

type AssignmentDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  card: any;
  submissionFileName?: string;
};

export default function ViewDetailModal({
  isOpen,
  onClose,
  card,
  submissionFileName,
}: AssignmentDetailsModalProps) {
  const t = useTranslations("Assignment.student");
  if (!isOpen || !card) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4">
      <div className="bg-white w-full max-w-140 max-h-[80vh] rounded-xl relative shadow-lg flex flex-col overflow-hidden">
        <div className="w-full flex items-center justify-between px-5 pt-3 shrink-0">
          <div className="w-full flex justify-end">
            <button
              onClick={onClose}
              className="text-[#282828] hover:text-black text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="mt-2 grid grid-cols-2 gap-x-3">
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#111827] font-medium min-h-[20px]">
                {t("Assignment Title:")}
              </p>
              <p className="text-sm text-[#111827] font-medium min-h-[20px]">
                {t("Subject:")}
              </p>
              <p className="text-sm text-[#111827] font-medium min-h-[20px]">
                {t("Faculty:")}
              </p>
              <p className="text-sm text-[#111827] font-medium min-h-[20px]">
                {t("Posted on:")}
              </p>
              <p className="text-sm text-[#111827] font-medium min-h-[20px]">
                {t("Deadline:")}
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-0">
              <p className="text-[#474747] text-sm break-words min-h-[20px]">
                {card.title}
              </p>
              <p className="text-[#474747] text-sm break-words min-h-[20px]">
                {card.subjectName}
              </p>
              <p className="text-[#474747] text-sm break-words min-h-[20px]">
                {card.professor}
              </p>
              <p className="text-[#474747] text-sm break-words min-h-[20px]">
                {card.fromDate}
              </p>
              <p className="text-[#474747] text-sm break-words min-h-[20px]">
                {card.toDate}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-[#282828] font-semibold text-lg mt-2">
              {t("Attachment:")}
            </h3>

            {submissionFileName ? (
              <p
                className="text-[#474747] font-medium text-sm underline cursor-pointer break-all"
                onClick={() =>
                  downloadAssignmentFile(
                    Number(card.assignmentId),
                    submissionFileName.split("/").pop()!,
                  )
                }
              >
                {submissionFileName.split("/").pop()}
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                {t("No attachment uploaded")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
