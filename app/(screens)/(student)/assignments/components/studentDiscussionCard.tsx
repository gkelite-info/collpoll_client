// "use client";
// import { MouseEvent, useState } from "react";
// import {
//   CalendarDotsIcon,
//   FileIcon,
//   FilePdf,
//   UserCircle,
//   XCircle,
// } from "@phosphor-icons/react";
// import { useRouter, usePathname, useSearchParams } from "next/navigation";
// import {
//   deactivateStudentDiscussionUpload,
//   deleteStudentDiscussionFileFromStorage,
// } from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";
// import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
// import toast from "react-hot-toast";

// export default function StudentDiscussionCard({
//   data,
//   isCompleted = false,
//   uploadedFiles = [],
//   onRemoveFile,
// }: {
//   data: any;
//   isCompleted?: boolean;
//   uploadedFiles?: any[];
//   onRemoveFile?: (index: number) => void;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const [deleteUploadId, setDeleteUploadId] = useState<number | null>(null);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleCardClick = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("modal", "viewDiscussion");
//     params.set("discussionId", String(data.discussionId));
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handleUploadClick = (e: MouseEvent) => {
//     e.stopPropagation();
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("modal", "uploadDiscussion");
//     params.set("discussionId", String(data.discussionId));
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handleRemoveUpload = async () => {
//     if (!deleteUploadId) return;
//     try {
//       setIsDeleting(true);

//       const fileToDelete = uploadedFiles.find(
//         (f: any) => f.studentDiscussionUploadId === deleteUploadId,
//       );

//       if (fileToDelete?.fileUrl) {
//         await deleteStudentDiscussionFileFromStorage(fileToDelete.fileUrl);
//       }

//       const result = await deactivateStudentDiscussionUpload(deleteUploadId);
//       if (result.success) {
//         if (onRemoveFile) onRemoveFile(deleteUploadId);
//         toast.success("File removed successfully");
//       } else {
//         toast.error("Failed to remove file");
//         console.error("Failed to deactivate file record");
//       }
//     } catch (error) {
//       toast.error("An error occurred");
//       console.error("handleRemoveUpload error:", error);
//     } finally {
//       setIsDeleting(false);
//       setDeleteUploadId(null);
//     }
//   };

//   return (
//     <>
//       <div
//         onClick={handleCardClick}
//         className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
//       >
//         <div className="flex justify-between items-start">
//           <div className="flex flex-col gap-1 w-[80%]">
//             <h3 className="text-lg font-bold text-[#282828]">{data.title}</h3>
//             <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
//               {data.description}
//             </p>
//           </div>
//           <div>
//             {!isCompleted ? (
//               <button
//                 onClick={handleUploadClick}
//                 className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-[#38a366] transition-colors"
//               >
//                 Upload
//               </button>
//             ) : (
//               <div className="bg-[#16284F] text-white px-5 py-1.5 rounded-md text-sm font-bold">
//                 Uploaded
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-[1fr_1.5fr] gap-6 mt-1">
//           <div className="flex flex-col gap-3">
//             <div className="flex items-center gap-2 text-sm">
//               <div className="bg-[#43C07A24] p-1 rounded-full">
//                 <UserCircle
//                   size={18}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-bold text-[#282828]">Faculty Name :</span>
//               <span className="text-gray-600">{data.facultyName}</span>
//             </div>
//             <div className="flex items-center gap-2 text-sm">
//               <div className="bg-[#43C07A24] p-1 rounded-full">
//                 <CalendarDotsIcon
//                   size={18}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-bold text-[#282828]">Uploaded On :</span>
//               <span className="text-gray-600">
//                 {data.createdAt
//                   ? new Date(data.createdAt).toLocaleDateString()
//                   : "—"}
//               </span>
//             </div>
//             <div className="flex items-center gap-2 text-sm">
//               <div className="bg-[#43C07A24] p-1 rounded-full">
//                 <CalendarDotsIcon
//                   size={18}
//                   className="text-red-500"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-bold text-[#282828]">Deadline :</span>
//               <span className="text-gray-600">
//                 {data.deadline
//                   ? new Date(data.deadline).toLocaleDateString()
//                   : "—"}
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-col gap-2 min-w-0">
//             <span className="font-bold text-[#282828] text-sm">
//               {isCompleted ? "Faculty Attachments" : "Reference Attachments"}
//             </span>
//             <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
//               {(data.attachments ?? []).map(
//                 (file: { fileUrl: string }, idx: number) => (
//                   <a
//                     key={`fac-${idx}`}
//                     href={file.fileUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     onClick={(e) => e.stopPropagation()}
//                     className="flex items-center gap-2 bg-[#e2e8f0] text-[#334155] px-3 py-1.5 rounded-md text-xs font-medium flex-shrink-0"
//                   >
//                     <div className="bg-[#16284F] rounded-full p-1 flex items-center justify-center mx-auto">
//                       <FilePdf size={16} weight="fill" className="text-white" />
//                     </div>
//                     {file.fileUrl
//                       .split("/")
//                       .pop()
//                       ?.split("_")
//                       .slice(1)
//                       .join("_")}
//                   </a>
//                 ),
//               )}
//             </div>

//             <span className="font-bold text-[#282828] text-sm mt-2">
//               Your Uploads
//             </span>
//             <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
//               {uploadedFiles && uploadedFiles.length > 0 ? (
//                 uploadedFiles.map((file: any, idx: number) => (
//                   <div
//                     key={`stu-${idx}`}
//                     className="flex items-center gap-2 bg-[#e2f6ea] text-[#334155] pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold flex-shrink-0"
//                   >
//                     <a
//                       href={file.fileUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       onClick={(e) => e.stopPropagation()}
//                       className="flex items-center gap-2"
//                     >
//                       <FileIcon
//                         size={16}
//                         weight="fill"
//                         className="text-[#43C17A]"
//                       />
//                       {file.fileUrl
//                         ?.split("/")
//                         .pop()
//                         ?.split("_")
//                         .slice(1)
//                         .join("_") ?? "File"}
//                     </a>
//                     {!isCompleted && (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setDeleteUploadId(file.studentDiscussionUploadId);
//                         }}
//                         className="ml-1 text-red-500 cursor-pointer hover:text-red-700 transition-colors"
//                       >
//                         <XCircle size={16} weight="regular" />
//                       </button>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-xs text-gray-400 italic">
//                   {isCompleted ? "No files uploaded." : "Upload a file first!"}
//                 </p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <ConfirmDeleteModal
//         open={!!deleteUploadId}
//         onConfirm={handleRemoveUpload}
//         onCancel={() => {
//           setDeleteUploadId(null);
//         }}
//         isDeleting={isDeleting}
//         name="uploaded file"
//       />
//     </>
//   );
// }

"use client";
import { MouseEvent, useState } from "react";
import {
  CalendarDotsIcon,
  FileIcon,
  FilePdf,
  UserCircle,
  XCircle,
} from "@phosphor-icons/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  deactivateStudentDiscussionUpload,
  deleteStudentDiscussionFileFromStorage,
} from "@/lib/helpers/student/assignments/discussionForum/student_discussion_uploadsAPI";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";

export default function StudentDiscussionCard({
  data,
  isCompleted = false,
  uploadedFiles = [],
  onRemoveFile,
}: {
  data: any;
  isCompleted?: boolean;
  uploadedFiles?: any[];
  onRemoveFile?: (index: number) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deleteUploadId, setDeleteUploadId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const t = useTranslations("Assignment.student");

  const handleCardClick = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "viewDiscussion");
    params.set("discussionId", String(data.discussionId));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleUploadClick = (e: MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "uploadDiscussion");
    params.set("discussionId", String(data.discussionId));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRemoveUpload = async () => {
    if (!deleteUploadId) return;
    try {
      setIsDeleting(true);

      const fileToDelete = uploadedFiles.find(
        (f: any) => f.studentDiscussionUploadId === deleteUploadId,
      );

      if (fileToDelete?.fileUrl) {
        await deleteStudentDiscussionFileFromStorage(fileToDelete.fileUrl);
      }

      const result = await deactivateStudentDiscussionUpload(deleteUploadId);
      if (result.success) {
        if (onRemoveFile) onRemoveFile(deleteUploadId);
        toast.success(t("File removed successfully"));
      } else {
        toast.error(t("Failed to remove file"));
      }
    } catch (error) {
      toast.error(t("An error occurred"));
    } finally {
      setIsDeleting(false);
      setDeleteUploadId(null);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1 w-[80%]">
            <h3 className="text-lg font-bold text-[#282828]">{data.title}</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {data.description}
            </p>
          </div>
          <div>
            {!isCompleted ? (
              <button
                onClick={handleUploadClick}
                className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-[#38a366] transition-colors"
              >
                {t("Upload")}
              </button>
            ) : (
              <div className="bg-[#16284F] text-white px-5 py-1.5 rounded-md text-sm font-bold">
                {t("Uploaded")}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-[1fr_1.5fr] gap-6 mt-1">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="bg-[#43C07A24] p-1 rounded-full">
                <UserCircle
                  size={18}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-bold text-[#282828]">
                {t("Faculty Name :")}
              </span>
              <span className="text-gray-600">{data.facultyName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="bg-[#43C07A24] p-1 rounded-full">
                <CalendarDotsIcon
                  size={18}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-bold text-[#282828]">
                {t("Uploaded On :")}
              </span>
              <span className="text-gray-600">
                {data.createdAt
                  ? new Date(data.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="bg-[#43C07A24] p-1 rounded-full">
                <CalendarDotsIcon
                  size={18}
                  className="text-red-500"
                  weight="regular"
                />
              </div>
              <span className="font-bold text-[#282828]">
                {t("Deadline :")}
              </span>
              <span className="text-gray-600">
                {data.deadline
                  ? new Date(data.deadline).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-0">
            <span className="font-bold text-[#282828] text-sm">
              {isCompleted
                ? t("Faculty Attachments")
                : t("Reference Attachments")}
            </span>
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
              {(data.attachments ?? []).map(
                (file: { fileUrl: string }, idx: number) => (
                  <a
                    key={`fac-${idx}`}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 bg-[#e2e8f0] text-[#334155] px-3 py-1.5 rounded-md text-xs font-medium flex-shrink-0"
                  >
                    <div className="bg-[#16284F] rounded-full p-1 flex items-center justify-center mx-auto">
                      <FilePdf size={16} weight="fill" className="text-white" />
                    </div>
                    {file.fileUrl
                      .split("/")
                      .pop()
                      ?.split("_")
                      .slice(1)
                      .join("_")}
                  </a>
                ),
              )}
            </div>

            <span className="font-bold text-[#282828] text-sm mt-2">
              {t("Your Uploads")}
            </span>
            <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
              {uploadedFiles && uploadedFiles.length > 0 ? (
                uploadedFiles.map((file: any, idx: number) => (
                  <div
                    key={`stu-${idx}`}
                    className="flex items-center gap-2 bg-[#e2f6ea] text-[#334155] pl-3 pr-2 py-1.5 rounded-md text-xs font-semibold flex-shrink-0"
                  >
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2"
                    >
                      <FileIcon
                        size={16}
                        weight="fill"
                        className="text-[#43C17A]"
                      />
                      {file.fileUrl
                        ?.split("/")
                        .pop()
                        ?.split("_")
                        .slice(1)
                        .join("_") ?? "File"}
                    </a>
                    {!isCompleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteUploadId(file.studentDiscussionUploadId);
                        }}
                        className="ml-1 text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                      >
                        <XCircle size={16} weight="regular" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">
                  {isCompleted
                    ? t("No files uploaded")
                    : t("Upload a file first!")}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteUploadId}
        onConfirm={handleRemoveUpload}
        onCancel={() => {
          setDeleteUploadId(null);
        }}
        isDeleting={isDeleting}
        name="uploaded file"
      />
    </>
  );
}
