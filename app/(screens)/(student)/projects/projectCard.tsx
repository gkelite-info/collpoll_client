// "use client";

// import { submitProject, uploadFileToStorage } from "@/lib/helpers/student/student_project_submissionsAPI";
// import { ProjectCardProps } from "@/lib/projectTypes/project";
// import { CaretLeft } from "@phosphor-icons/react";
// import { useRef, useState } from "react";
// import toast from "react-hot-toast";
// import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";

// type ProjectCardListProps = {
//   data: ProjectCardProps[];
//   onViewDetails: (project: ProjectCardProps) => void;
//   role?: string | null;
// };

// const MemberAvatar = ({ image, name, index }: { image: string; name?: string; index: number }) => {
//   const isValidImage = image && (
//     image.startsWith("http") ||
//     image.startsWith("data:") ||
//     image.startsWith("blob:")
//   );

//   return (
//     <div
//       title={name ?? "Unknown"}
//       className={`w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0 ${index > 0 ? "-ml-3" : ""}`}
//     >
//       {isValidImage ? (
//         <img src={image} alt={name ?? "member"} className="w-full h-full object-cover" />
//       ) : (
//         <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
//           <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
//         </svg>
//       )}
//     </div>
//   );
// };

// export const ProjectCard = ({ data, onViewDetails, role }: ProjectCardListProps) => {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {data.map((project, index) => (
//         <div
//           key={index}
//           className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7"
//         >
//           <div className="bg-red-00 flex items-start justify-between">
//             <div className="bg-yellow-00 lg:w-[72%]">
//               <h2 className="text-xl md:text-2xl font-semibold text-[#1f2933] truncate">
//                 {project.title}
//               </h2>
//               <p className="text-sm md:text-base text-[#4b5563] mt-2 max-w-md truncate">
//                 {project.description}
//               </p>
//             </div>
//             <button
//               className="shrink-0 px-5 py-2 lg:w-[28%] cursor-pointer rounded-full bg-[#22c55e] text-white text-sm font-semibold shadow-sm"
//               onClick={() => onViewDetails(project)}
//             >
//               View Details
//             </button>
//           </div>

//           <div className="space-y-4 mt-5 text-sm md:text-base">
//             <div className="flex gap-4">
//               <span className="w-28 font-semibold text-[#111827]">Duration</span>
//               <span className="px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] font-medium">
//                 {project.duration}
//               </span>
//             </div>

//             <div className="flex gap-4">
//               <span className="w-28 font-semibold text-[#111827]">Tech Stack</span>
//               <p className="truncate md:max-w-sm text-[#374151]">{project.techStack}</p>
//             </div>

//             <div className="flex gap-4 items-center w-full">
//               <span className="w-28 font-semibold text-[#111827]">Team Members</span>
//               <div className="flex items-center gap-2 bg-indigo-00 w-[60%] lg:w-[70%] overflow-x-scroll">
//                 {project.teamMembers.length > 0 ? (
//                   project.teamMembers.slice(0, 4).map((member, i) => (
//                     <MemberAvatar key={i} image={member.image} name={member.name} index={i} />
//                   ))
//                 ) : (
//                   <span className="text-gray-400 text-xs italic">No members</span>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-4 bg-green-00 w-full items-center">
//               <span className="w-28 font-semibold text-[#111827]">Mentor</span>
//               <div className="flex items-center gap-2 flex-wrap bg-indigo-00 w-[60%] lg:w-[70%]">
//                 {project.mentors.length > 0 ? (
//                   <div className="flex overflow-x-scroll">
//                     {project.mentors.map((mentor, i) => (
//                       <MemberAvatar key={i} image={mentor.image} name={mentor.name} index={i} />
//                     ))}
//                   </div>
//                 ) : (
//                   <span className="text-gray-400 text-xs italic">No mentor</span>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-4">
//               <span className="w-28 font-semibold text-[#111827]">Marks</span>
//               <p className="text-[#374151]">{project.marks}</p>
//             </div>

//             <div className="flex gap-4 w-full">
//               <span className="w-28 font-semibold text-[#111827]">Attachments</span>
//               <div className="flex gap-1 overflow-x-scroll bg-yellow-00">
//                 {project.fileUrls.length > 0 ? (
//                   project.fileUrls.map((url, i) => (
//                     <a key={i} href={url} target="_blank" rel="noreferrer"
//                       className="text-blue-600 truncate md:max-w-sm hover:underline text-sm">
//                       {url.split("/").pop()}
//                     </a>
//                   ))
//                 ) : (
//                   <span className="text-gray-400 text-xs italic">No attachments</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// type ProjectDetailsModalProps = {
//   project: ProjectCardProps;
//   onClose: () => void;
//   role: string | null;
//   studentId: number | null;
// };

// export const ProjectDetailsModal = ({ project, onClose, role, studentId }: ProjectDetailsModalProps) => {

//   console.log("What is projectId", project);

//   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [isUploading, setIsUploading] = useState(false);

//   const domains = project.techStack.split(",").map((s) => s.trim()).filter(Boolean);

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
//       const newFiles = Array.from(e.dataTransfer.files);
//       setSelectedFiles((prev) => [...prev, ...newFiles]);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const newFiles = Array.from(e.target.files);
//       setSelectedFiles((prev) => [...prev, ...newFiles]);
//     }
//   };

//   const removeFile = (index: number) => {
//     setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleFinalSubmit = async () => {
//     if (selectedFiles.length === 0) return;
//     if (!studentId) {
//       alert("Error: Student ID not found. Please log in again.");
//       return;
//     }

//     setIsUploading(true);
//     try {
//       const uploadResult = await uploadFileToStorage(
//         selectedFiles[0],
//         project.projectId!,
//         studentId
//       );

//       if (!uploadResult.success || !uploadResult.url) {
//         throw new Error("Upload to storage failed");
//       }

//       const dbResult = await submitProject({
//         projectId: project.projectId,
//         studentId: studentId,
//         fileUrl: uploadResult.url,
//       });

//       if (dbResult.success) {
//         toast.success("Submission successful 🎉");
//         setSelectedFiles([]);
//         onClose();
//       } else {
//         throw new Error("Failed to save submission record.");
//       }
//     } catch (error: any) {
//       console.error("Submission error:", error);
//       alert(error.message || "Something went wrong during submission.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10">
//       <div className="mt-8 w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-lg overflow-y-auto max-h-[90vh]">
//         <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
//           <CaretLeft onClick={onClose} size={22} className="cursor-pointer active:scale-90" />
//           <p className="font-semibold text-lg">Project Details</p>
//         </div>

//         <h1 className="text-lg lg:text-2xl font-semibold text-[#16a34a] mb-6">
//           {project.title}
//         </h1>

//         <section className="mb-6">
//           <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Description</h2>
//           <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//             {project.description || "No description provided."}
//           </p>
//         </section>

//         <section className="mb-6">
//           <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Domain(s)</h2>
//           <div className="flex flex-wrap gap-2">
//             {domains.length > 0 ? (
//               domains.map((d, i) => (
//                 <span key={i} className="px-3 py-1 rounded-full bg-[#16284F21] text-[#16284F] text-xs md:text-sm font-medium">
//                   {d}
//                 </span>
//               ))
//             ) : (
//               <span className="text-gray-400 text-xs italic">No domains specified</span>
//             )}
//           </div>
//         </section>

//         <section className="mb-6">
//           <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Duration</h2>
//           <span className="inline-flex px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] text-sm font-medium">
//             {project.duration}
//           </span>
//         </section>

//         <section className="mb-6">
//           <div className="flex flex-wrap gap-10">
//             <div>
//               <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Team Members</h2>
//               <div className="flex">
//                 {project.teamMembers.length > 0 ? (
//                   project.teamMembers.slice(0, 5).map((member, i) => (
//                     <MemberAvatar key={i} image={member.image} name={member.name} index={i} />
//                   ))
//                 ) : (
//                   <span className="text-gray-400 text-xs italic">No members assigned</span>
//                 )}
//               </div>
//             </div>

//             <div>
//               <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Mentor(s)</h2>
//               <div className="flex flex-col gap-3">
//                 {project.mentors.length > 0 ? (
//                   project.mentors.map((mentor, i) => (
//                     <div key={i} className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
//                         {mentor.image && (mentor.image.startsWith("http") || mentor.image.startsWith("data:")) ? (
//                           <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
//                         ) : (
//                           <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
//                           </svg>
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-gray-900">{mentor.name}</p>
//                         <p className="text-xs text-gray-500">Faculty / Guide</p>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <span className="text-gray-400 text-xs italic">No mentor assigned</span>
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="mb-6">
//           <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Marks</h2>
//           <span className="inline-flex px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
//             {project.marks} pts
//           </span>
//         </section>

//         <section>
//           <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Attachments</h2>
//           {project.fileUrls.length > 0 ? (
//             <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-gray-700">
//               {project.fileUrls.map((url, i) => (
//                 <li key={i}>
//                   <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 break-all hover:underline">
//                     {url.split("/").pop() || url}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400 text-sm italic">No attachments uploaded</p>
//           )}
//         </section>

//         {role === "Student" && (
//           <div className="col-span-2 lg:mt-5 border-t pt-5">
//             <label className="block text-sm font-semibold mb-2 text-[#282828]">
//               Upload Your Project
//             </label>

//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               multiple
//               accept=".pdf, .jpg, .jpeg, .png, .zip"
//               className="hidden"
//             />

//             <div
//               className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${isDragging
//                 ? "border-green-500 bg-green-50 scale-[1.01]"
//                 : "border-gray-300 bg-gray-50 hover:bg-gray-100"
//                 }`}
//               onDragEnter={(e) => { handleDrag(e); setIsDragging(true); }}
//               onDragOver={(e) => { handleDrag(e); setIsDragging(true); }}
//               onDragLeave={(e) => { handleDrag(e); setIsDragging(false); }}
//               onDrop={handleDrop}
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <FaCloudUploadAlt className={`text-4xl mb-2 ${isDragging ? "text-green-500" : "text-gray-400"}`} />
//               <p className="text-gray-500 mb-4 text-center">
//                 {isDragging ? "Drop files now!" : "Drag & Drop Your File here or"}
//               </p>
//               <button
//                 type="button"
//                 className="border px-6 py-2 rounded bg-white font-medium text-[#282828] shadow-sm active:scale-95 transition-transform cursor-pointer"
//               >
//                 Browse Files
//               </button>
//             </div>

//             {selectedFiles.length > 0 && (
//               <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {selectedFiles.map((file, index) => (
//                   <div key={index} className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm animate-in fade-in slide-in-from-bottom-1">
//                     <div className="flex items-center gap-2 overflow-hidden">
//                       <div className="w-8 h-8 bg-green-100 text-green-700 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase">
//                         {file.name.split('.').pop()?.substring(0, 3)}
//                       </div>
//                       <span className="text-sm text-[#282828] truncate font-medium">
//                         {file.name}
//                       </span>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={(e) => { e.stopPropagation(); removeFile(index); }}
//                       className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
//                     >
//                       <FaTimes size={14} />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {selectedFiles.length > 0 && (
//               <button
//                 onClick={handleFinalSubmit}
//                 disabled={isUploading}
//                 className={`w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all shadow-md cursor-pointer ${isUploading ? "bg-gray-400" : "bg-[#16a34a] hover:bg-[#15803d] text-white"
//                   }`}
//               >
//                 {isUploading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//                     Uploading...
//                   </>
//                 ) : (
//                   "Submit Files"
//                 )}
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

"use client";

import {
  submitProject,
  uploadFileToStorage,
} from "@/lib/helpers/student/student_project_submissionsAPI";
import { ProjectCardProps } from "@/lib/projectTypes/project";
import { CaretLeft } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import { useTranslations } from "next-intl";

type ProjectCardListProps = {
  data: ProjectCardProps[];
  onViewDetails: (project: ProjectCardProps) => void;
  role?: string | null;
};

const MemberAvatar = ({
  image,
  name,
  index,
}: {
  image: string;
  name?: string;
  index: number;
}) => {
  const isValidImage =
    image &&
    (image.startsWith("http") ||
      image.startsWith("data:") ||
      image.startsWith("blob:"));

  return (
    <div
      title={name ?? "Unknown"}
      className={`w-9 h-9 rounded-full overflow-hidden border-2 border-white bg-gray-200 flex items-center justify-center flex-shrink-0 ${index > 0 ? "-ml-3" : ""}`}
    >
      {isValidImage ? (
        <img
          src={image}
          alt={name ?? "member"}
          className="w-full h-full object-cover"
        />
      ) : (
        <svg
          className="w-5 h-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </div>
  );
};

export const ProjectCard = ({
  data,
  onViewDetails,
  role,
}: ProjectCardListProps) => {
  const t = useTranslations("Projects.student"); // Hook
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {data.map((project, index) => (
        <div
          key={index}
          className="bg-white rounded-[26px] shadow-sm border border-gray-100 px-5 py-6 md:px-7 md:py-7"
        >
          <div className="bg-red-00 flex items-start justify-between">
            <div className="bg-yellow-00 lg:w-[72%]">
              <h2 className="text-xl md:text-2xl font-semibold text-[#1f2933] truncate">
                {project.title}
              </h2>
              <p className="text-sm md:text-base text-[#4b5563] mt-2 max-w-md truncate">
                {project.description}
              </p>
            </div>
            <button
              className="shrink-0 px-5 py-2 lg:w-[28%] cursor-pointer rounded-full bg-[#22c55e] text-white text-sm font-semibold shadow-sm"
              onClick={() => onViewDetails(project)}
            >
              {t("View Details")}
            </button>
          </div>

          <div className="space-y-4 mt-5 text-sm md:text-base">
            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">
                {t("Duration")}
              </span>
              <span className="px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] font-medium">
                {project.duration}
              </span>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">
                {t("Tech Stack")}
              </span>
              <p className="truncate md:max-w-sm text-[#374151]">
                {project.techStack}
              </p>
            </div>

            <div className="flex gap-4 items-center w-full">
              <span className="w-28 font-semibold text-[#111827]">
                {t("Team Members")}
              </span>
              <div className="flex items-center gap-2 bg-indigo-00 w-[60%] lg:w-[70%] overflow-x-scroll">
                {project.teamMembers.length > 0 ? (
                  project.teamMembers
                    .slice(0, 4)
                    .map((member, i) => (
                      <MemberAvatar
                        key={i}
                        image={member.image}
                        name={member.name}
                        index={i}
                      />
                    ))
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    {t("No members")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4 bg-green-00 w-full items-center">
              <span className="w-28 font-semibold text-[#111827]">
                {t("Mentor")}
              </span>
              <div className="flex items-center gap-2 flex-wrap bg-indigo-00 w-[60%] lg:w-[70%]">
                {project.mentors.length > 0 ? (
                  <div className="flex overflow-x-scroll">
                    {project.mentors.map((mentor, i) => (
                      <MemberAvatar
                        key={i}
                        image={mentor.image}
                        name={mentor.name}
                        index={i}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    {t("No mentor")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <span className="w-28 font-semibold text-[#111827]">
                {t("Marks")}
              </span>
              <p className="text-[#374151]">{project.marks}</p>
            </div>

            <div className="flex gap-4 w-full">
              <span className="w-28 font-semibold text-[#111827]">
                {t("Attachments")}
              </span>
              <div className="flex gap-1 overflow-x-scroll bg-yellow-00">
                {project.fileUrls.length > 0 ? (
                  project.fileUrls.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 truncate md:max-w-sm hover:underline text-sm"
                    >
                      {url.split("/").pop()}
                    </a>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    {t("No attachments")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

type ProjectDetailsModalProps = {
  project: ProjectCardProps;
  onClose: () => void;
  role: string | null;
  studentId: number | null;
};

export const ProjectDetailsModal = ({
  project,
  onClose,
  role,
  studentId,
}: ProjectDetailsModalProps) => {
  const t = useTranslations("Projects.student"); // Hook
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const domains = project.techStack
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (selectedFiles.length === 0) return;
    if (!studentId) {
      alert(t("Error: Student ID not found Please log in again"));
      return;
    }

    setIsUploading(true);
    try {
      const uploadResult = await uploadFileToStorage(
        selectedFiles[0],
        project.projectId!,
        studentId,
      );

      if (!uploadResult.success || !uploadResult.url) {
        throw new Error(t("Upload to storage failed"));
      }

      const dbResult = await submitProject({
        projectId: project.projectId,
        studentId: studentId,
        fileUrl: uploadResult.url,
      });

      if (dbResult.success) {
        toast.success(t("Submission successful 🎉"));
        setSelectedFiles([]);
        onClose();
      } else {
        throw new Error(t("Failed to save submission record"));
      }
    } catch (error: any) {
      console.error("Submission error:", error);
      alert(error.message || t("Something went wrong during submission"));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/10">
      <div className="mt-8 w-full max-w-3xl rounded-3xl bg-white p-6 md:p-8 shadow-lg overflow-y-auto max-h-[90vh]">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <CaretLeft
            onClick={onClose}
            size={22}
            className="cursor-pointer active:scale-90"
          />
          <p className="font-semibold text-lg">{t("Project Details")}</p>
        </div>

        <h1 className="text-lg lg:text-2xl font-semibold text-[#16a34a] mb-6">
          {project.title}
        </h1>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            {t("Description")}
          </h2>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed">
            {project.description || t("No description provided")}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            {t("Domains")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {domains.length > 0 ? (
              domains.map((d, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-[#16284F21] text-[#16284F] text-xs md:text-sm font-medium"
                >
                  {d}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs italic">
                {t("No domains specified")}
              </span>
            )}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            {t("Duration")}
          </h2>
          <span className="inline-flex px-4 py-1.5 rounded-full bg-[#EFE8FF] text-[#5B4FE1] text-sm font-medium">
            {project.duration}
          </span>
        </section>

        <section className="mb-6">
          <div className="flex flex-wrap gap-10">
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {t("Team Members")}
              </h2>
              <div className="flex">
                {project.teamMembers.length > 0 ? (
                  project.teamMembers
                    .slice(0, 5)
                    .map((member, i) => (
                      <MemberAvatar
                        key={i}
                        image={member.image}
                        name={member.name}
                        index={i}
                      />
                    ))
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    {t("No members assigned")}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                {t("Mentors")}
              </h2>
              <div className="flex flex-col gap-3">
                {project.mentors.length > 0 ? (
                  project.mentors.map((mentor, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                        {mentor.image &&
                        (mentor.image.startsWith("http") ||
                          mentor.image.startsWith("data:")) ? (
                          <img
                            src={mentor.image}
                            alt={mentor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg
                            className="w-6 h-6 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {mentor.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t("Faculty / Guide")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-xs italic">
                    {t("No mentor assigned")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            {t("Marks")}
          </h2>
          <span className="inline-flex px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
            {project.marks} {t("pts")}
          </span>
        </section>

        <section>
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
            {t("Attachments")}
          </h2>
          {project.fileUrls.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm md:text-base text-gray-700">
              {project.fileUrls.map((url, i) => (
                <li key={i}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 break-all hover:underline"
                  >
                    {url.split("/").pop() || url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm italic">
              {t("No attachments uploaded")}
            </p>
          )}
        </section>

        {role === "Student" && (
          <div className="col-span-2 lg:mt-5 border-t pt-5">
            <label className="block text-sm font-semibold mb-2 text-[#282828]">
              {t("Upload Your Project")}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept=".pdf, .jpg, .jpeg, .png, .zip"
              className="hidden"
            />

            <div
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
                isDragging
                  ? "border-green-500 bg-green-50 scale-[1.01]"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
              onDragEnter={(e) => {
                handleDrag(e);
                setIsDragging(true);
              }}
              onDragOver={(e) => {
                handleDrag(e);
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                handleDrag(e);
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FaCloudUploadAlt
                className={`text-4xl mb-2 ${isDragging ? "text-green-500" : "text-gray-400"}`}
              />
              <p className="text-gray-500 mb-4 text-center">
                {isDragging
                  ? t("Drop files now!")
                  : t("Drag & Drop Your File here or")}
              </p>
              <button
                type="button"
                className="border px-6 py-2 rounded bg-white font-medium text-[#282828] shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                {t("Browse Files")}
              </button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm animate-in fade-in slide-in-from-bottom-1"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-8 h-8 bg-green-100 text-green-700 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase">
                        {file.name.split(".").pop()?.substring(0, 3)}
                      </div>
                      <span className="text-sm text-[#282828] truncate font-medium">
                        {file.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer"
                    >
                      <FaTimes size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length > 0 && (
              <button
                onClick={handleFinalSubmit}
                disabled={isUploading}
                className={`w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all shadow-md cursor-pointer ${
                  isUploading
                    ? "bg-gray-400"
                    : "bg-[#16a34a] hover:bg-[#15803d] text-white"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("Uploading")}...
                  </>
                ) : (
                  t("Submit Files")
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
