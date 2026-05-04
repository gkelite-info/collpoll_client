// "use client";

// import { fetchStudentFaculties } from "@/lib/helpers/student/leave request/studentLeaveAPI";
// import { X, CaretDown, Check, File as FileIcon } from "@phosphor-icons/react";
// import { useState, useEffect, useRef } from "react";

// interface RequestLeaveModalProps {
//   isOpen: boolean;
//   studentId: number | null;
//   onClose: () => void;
//   onSubmit: (data: any) => Promise<void>;
// }

// export default function RequestLeaveModal({
//   isOpen,
//   studentId,
//   onClose,
//   onSubmit,
// }: RequestLeaveModalProps) {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [faculties, setFaculties] = useState<any[]>([]);
//   const [loadingFaculties, setLoadingFaculties] = useState(false);

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   const [formData, setFormData] = useState({
//     leaveType: "",
//     startDate: "",
//     endDate: "",
//     faculty: null as any,
//     description: "",
//   });

//   const [files, setFiles] = useState<File[]>([]);

//   useEffect(() => {
//     if (isOpen && studentId) {
//       setLoadingFaculties(true);
//       fetchStudentFaculties(studentId)
//         .then((data) => setFaculties(data))
//         .finally(() => setLoadingFaculties(false));
//     }
//   }, [isOpen, studentId]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(event.target as Node)
//       ) {
//         setIsDropdownOpen(false);
//       }
//     };
//     if (isDropdownOpen)
//       document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isDropdownOpen]);

//   if (!isOpen) return null;

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       if (files.length + newFiles.length > 5) {
//         alert("You can only upload a maximum of 5 files.");
//         return;
//       }
//       setFiles((prev) => [...prev, ...newFiles]);
//     }
//   };

//   const removeFile = (indexToRemove: number) => {
//     setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.faculty) {
//       alert("Please select a faculty.");
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await onSubmit({ ...formData, files });
//       setFormData({
//         leaveType: "",
//         startDate: "",
//         endDate: "",
//         faculty: null,
//         description: "",
//       });
//       setFiles([]);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         @keyframes scrollBackForth {
//           0%, 15% { transform: translateX(0); }
//           85%, 100% { transform: translateX(calc(-100% + 220px)); }
//         }
//         .hover-marquee:hover {
//           animation: scrollBackForth 4s ease-in-out infinite alternate;
//         }
//         /* Hide scrollbar for file previews but allow scroll */
//         .hide-scrollbar::-webkit-scrollbar {
//           display: none;
//         }
//         .hide-scrollbar {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>

//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//         <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden max-h-[90vh]">
//           <div className="flex items-center justify-between p-5 pb-2">
//             <h2 className="text-2xl font-bold text-[#282828]">Request Leave</h2>
//             <button
//               onClick={onClose}
//               disabled={isSubmitting}
//               className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer disabled:opacity-50"
//             >
//               <X size={24} weight="bold" />
//             </button>
//           </div>

//           <form
//             onSubmit={handleSubmit}
//             className="p-5 flex flex-col gap-4 overflow-y-auto"
//           >
//             <div className="flex flex-col gap-1.5">
//               <label className="text-[15px] font-semibold text-[#282828]">
//                 Leave Type <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <select
//                   required
//                   value={formData.leaveType}
//                   onChange={(e) =>
//                     setFormData({ ...formData, leaveType: e.target.value })
//                   }
//                   className="w-full appearance-none border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer bg-white"
//                 >
//                   <option value="" disabled>
//                     Select Leave Type
//                   </option>
//                   <option value="leave">Leave</option>
//                   <option value="attendanceregularization">
//                     Attendance Regularization
//                   </option>
//                 </select>
//                 <CaretDown
//                   size={16}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <label className="text-[15px] font-semibold text-[#282828]">
//                 Leave Date < span className="text-red-500" >*</span >
//               </label >
//               <div className="flex gap-4">
//                 <div className="flex-1 flex flex-col gap-1">
//                   <span className="text-xs font-semibold text-[#525252]">
//                     Start Date
//                   </span>
//                   <input
//                     type="date"
//                     required
//                     min={new Date().toISOString().split("T")[0]}
//                     value={formData.startDate}
//                     onChange={(e) =>
//                       setFormData({ ...formData, startDate: e.target.value })
//                     }
//                     className="w-full border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer"
//                   />
//                 </div>
//                 <div className="flex-1 flex flex-col gap-1">
//                   <span className="text-xs font-semibold text-[#525252]">
//                     End Date
//                   </span>
//                   <input
//                     type="date"
//                     required
//                     min={
//                       formData.startDate ||
//                       new Date().toISOString().split("T")[0]
//                     }
//                     value={formData.endDate}
//                     onChange={(e) =>
//                       setFormData({ ...formData, endDate: e.target.value })
//                     }
//                     className="w-full border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer"
//                   />
//                 </div>
//               </div>
//             </div >

//             <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
//               <label className="text-[15px] font-semibold text-[#282828]">
//                 Faculties < span className="text-red-500" >*</span >
//               </label >
//               <div
//                 onClick={() => {
//                   if (!loadingFaculties && faculties.length > 0)
//                     setIsDropdownOpen(!isDropdownOpen);
//                 }}
//                 className={`w-full flex items-center justify-between border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm outline-none transition-colors ${loadingFaculties || faculties.length === 0
//                   ? "bg-gray-50 cursor-not-allowed text-gray-500"
//                   : "bg-white cursor-pointer hover:border-gray-300 focus:border-[#43C17A]"
//                   }`}
//               >
//                 {loadingFaculties ? (
//                   <span>Loading faculties...</span>
//                 ) : faculties.length === 0 ? (
//                   <span>No faculties assigned</span>
//                 ) : formData.faculty ? (
//                   <div className="flex items-center gap-2 overflow-hidden pr-2">
//                     <img
//                       src={formData.faculty.avatar}
//                       alt="faculty"
//                       className="w-6 h-6 rounded-full shrink-0 object-cover"
//                     />
//                     <span className="truncate text-[#282828] font-medium">
//                       {formData.faculty.name} •{" "}
//                       <span className="text-gray-500 font-normal">
//                         {formData.faculty.subject}
//                       </span>
//                     </span>
//                   </div>
//                 ) : (
//                   <span className="text-[#525252]">Select Faculties</span>
//                 )}
//                 <CaretDown
//                   size={16}
//                   className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
//                 />
//               </div>

//               {
//                 isDropdownOpen && (
//                   <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md max-h-64 overflow-y-auto z-50 py-1">
//                     {faculties.map((fac) => (
//                       <div
//                         key={`${fac.id}-${fac.subjectId}`}
//                         onClick={() => {
//                           setFormData({ ...formData, faculty: fac });
//                           setIsDropdownOpen(false);
//                         }}
//                         className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer group"
//                       >
//                         <img
//                           src={fac.avatar}
//                           alt={fac.name}
//                           className="w-8 h-8 rounded-full shrink-0 object-cover border border-gray-100"
//                         />
//                         <div className="flex-1 overflow-hidden relative">
//                           <p className="whitespace-nowrap inline-block text-sm text-[#282828] hover-marquee">
//                             <span className="font-semibold">{fac.name}</span> •{" "}
//                             <span className="text-gray-500">{fac.subject}</span>
//                           </p>
//                         </div>
//                         {formData.faculty?.id === fac.id &&
//                           formData.faculty?.subjectId === fac.subjectId && (
//                             <Check
//                               size={16}
//                               weight="bold"
//                               className="text-[#43C17A] shrink-0"
//                             />
//                           )}
//                       </div>
//                     ))}
//                   </div>
//                 )
//               }
//             </div >

//             <div className="flex flex-col gap-1.5 mt-1">
//               <label className="text-[15px] font-semibold text-[#282828]">
//                 Description < span className="text-red-500" >*</span >
//               </label >
//               <textarea
//                 required
//                 rows={3}
//                 value={formData.description}
//                 onChange={(e) =>
//                   setFormData({ ...formData, description: e.target.value })
//                 }
//                 placeholder="Provide a short explanation for your leave request.........."
//                 className="w-full resize-none border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
//               />
//             </div >

//             < div className="flex flex-col gap-1.5" >
//               <label className="text-[15px] font-semibold text-[#282828] flex justify-between">
//                 Attachments{" "}
//                 <span className="text-gray-400 text-xs font-normal mr-1">
//                   Optional (Max 5)
//                 </span>
//               </label>

//               <div className="relative border-2 border-dashed border-[#E0E0E0] rounded-md p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer bg-[#F8F9FA]">
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileChange}
//                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 />
//                 <span className="text-sm font-medium text-[#525252]">
//                   Click to upload files
//                 </span>
//               </div>

//               {
//                 files.length > 0 && (
//                   <div className="flex overflow-x-auto gap-3 py-2 hide-scrollbar">
//                     {files.map((f, i) => {
//                       const isImage = f.type.startsWith("image/");
//                       return (
//                         <div
//                           key={i}
//                           className="relative shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm flex flex-col items-center justify-center group"
//                         >
//                           {isImage ? (
//                             <img
//                               src={URL.createObjectURL(f)}
//                               className="w-full h-full object-cover"
//                               alt="preview"
//                             />
//                           ) : (
//                             <div className="flex flex-col items-center justify-center p-1">
//                               <FileIcon
//                                 size={20}
//                                 weight="fill"
//                                 className="text-gray-400"
//                               />
//                               <span className="text-[10px] text-gray-500 truncate w-14 text-center mt-1">
//                                 {f.name}
//                               </span>
//                             </div>
//                           )}
//                           <button
//                             type="button"
//                             onClick={() => removeFile(i)}
//                             className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
//                           >
//                             <X size={12} weight="bold" />
//                           </button>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )
//               }
//             </div >

//             <div className="flex gap-3 mt-2">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 disabled={isSubmitting}
//                 className="flex-1 py-2.5 bg-[#EAEAEA] cursor-pointer text-[#525252] rounded-md font-bold text-sm hover:bg-[#dfdfdf] transition-colors disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex-1 py-2.5 bg-[#43C17A] cursor-pointer text-white rounded-md font-bold text-sm hover:bg-[#3ba869] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Submitting...
//                   </>
//                 ) : (
//                   "Submit Request"
//                 )}
//               </button>
//             </div>
//           </form >
//         </div >
//       </div >
//     </>
//   );
// }

"use client";

import { fetchStudentFaculties } from "@/lib/helpers/student/leave request/studentLeaveAPI";
import { X, CaretDown, Check, File as FileIcon } from "@phosphor-icons/react";
import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

interface RequestLeaveModalProps {
  isOpen: boolean;
  studentId: number | null;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export default function RequestLeaveModal({
  isOpen,
  studentId,
  onClose,
  onSubmit,
}: RequestLeaveModalProps) {
  const t = useTranslations("Leave.student"); // Hook

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    faculty: null as any,
    description: "",
  });

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isOpen && studentId) {
      setLoadingFaculties(true);
      fetchStudentFaculties(studentId)
        .then((data) => setFaculties(data))
        .finally(() => setLoadingFaculties(false));
    }
  }, [isOpen, studentId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        alert(t("You can only upload a maximum of 5 files"));
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.faculty) {
      alert(t("Please select a faculty"));
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, files });
      setFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        faculty: null,
        description: "",
      });
      setFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes scrollBackForth {
          0%, 15% { transform: translateX(0); }
          85%, 100% { transform: translateX(calc(-100% + 220px)); } 
        }
        .hover-marquee:hover {
          animation: scrollBackForth 4s ease-in-out infinite alternate;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden max-h-[90vh]">
          <div className="flex items-center justify-between p-5 pb-2">
            <h2 className="text-2xl font-bold text-[#282828]">
              {t("Request Leave")}
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer disabled:opacity-50"
            >
              <X size={24} weight="bold" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-5 flex flex-col gap-4 overflow-y-auto"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] font-semibold text-[#282828]">
                {t("Leave Type")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveType: e.target.value })
                  }
                  className="w-full appearance-none border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer bg-white"
                >
                  <option value="" disabled>
                    {t("Select Leave Type")}
                  </option>
                  <option value="leave">{t("Leave")}</option>
                  <option value="attendanceregularization">
                    {t("Attendance Regularization")}
                  </option>
                </select>
                <CaretDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] font-semibold text-[#282828]">
                {t("Leave Date")} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#525252]">
                    {t("Start Date")}
                  </span>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-[#525252]">
                    {t("End Date")}
                  </span>
                  <input
                    type="date"
                    required
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
              <label className="text-[15px] font-semibold text-[#282828]">
                {t("Faculties")} <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => {
                  if (!loadingFaculties && faculties.length > 0)
                    setIsDropdownOpen(!isDropdownOpen);
                }}
                className={`w-full flex items-center justify-between border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm outline-none transition-colors ${
                  loadingFaculties || faculties.length === 0
                    ? "bg-gray-50 cursor-not-allowed text-gray-500"
                    : "bg-white cursor-pointer hover:border-gray-300 focus:border-[#43C17A]"
                }`}
              >
                {loadingFaculties ? (
                  <span>{t("Loading faculties")}</span>
                ) : faculties.length === 0 ? (
                  <span>{t("No faculties assigned")}</span>
                ) : formData.faculty ? (
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <img
                      src={formData.faculty.avatar}
                      alt="faculty"
                      className="w-6 h-6 rounded-full shrink-0 object-cover"
                    />
                    <span className="truncate text-[#282828] font-medium">
                      {formData.faculty.name} •{" "}
                      <span className="text-gray-500 font-normal">
                        {formData.faculty.subject}
                      </span>
                    </span>
                  </div>
                ) : (
                  <span className="text-[#525252]">
                    {t("Select Faculties")}
                  </span>
                )}
                <CaretDown
                  size={16}
                  className={`text-gray-500 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-xl rounded-md max-h-64 overflow-y-auto z-50 py-1">
                  {faculties.map((fac) => (
                    <div
                      key={`${fac.id}-${fac.subjectId}`}
                      onClick={() => {
                        setFormData({ ...formData, faculty: fac });
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer group"
                    >
                      <img
                        src={fac.avatar}
                        alt={fac.name}
                        className="w-8 h-8 rounded-full shrink-0 object-cover border border-gray-100"
                      />
                      <div className="flex-1 overflow-hidden relative">
                        <p className="whitespace-nowrap inline-block text-sm text-[#282828] hover-marquee">
                          <span className="font-semibold">{fac.name}</span> •{" "}
                          <span className="text-gray-500">{fac.subject}</span>
                        </p>
                      </div>
                      {formData.faculty?.id === fac.id &&
                        formData.faculty?.subjectId === fac.subjectId && (
                          <Check
                            size={16}
                            weight="bold"
                            className="text-[#43C17A] shrink-0"
                          />
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-[15px] font-semibold text-[#282828]">
                {t("Description")} <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={t(
                  "Provide a short explanation for your leave request",
                )}
                className="w-full resize-none border border-[#E0E0E0] rounded-md px-3 py-2.5 text-sm text-[#525252] outline-none focus:border-[#43C17A]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[15px] font-semibold text-[#282828] flex justify-between">
                {t("Attachments")}{" "}
                <span className="text-gray-400 text-xs font-normal mr-1">
                  {t("Optional (Max 5)")}
                </span>
              </label>

              <div className="relative border-2 border-dashed border-[#E0E0E0] rounded-md p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer bg-[#F8F9FA]">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-[#525252]">
                  {t("Click to upload files")}
                </span>
              </div>

              {files.length > 0 && (
                <div className="flex overflow-x-auto gap-3 py-2 hide-scrollbar">
                  {files.map((f, i) => {
                    const isImage = f.type.startsWith("image/");
                    return (
                      <div
                        key={i}
                        className="relative shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm flex flex-col items-center justify-center group"
                      >
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(f)}
                            className="w-full h-full object-cover"
                            alt="preview"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-1">
                            <FileIcon
                              size={20}
                              weight="fill"
                              className="text-gray-400"
                            />
                            <span className="text-[10px] text-gray-500 truncate w-14 text-center mt-1">
                              {f.name}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                        >
                          <X size={12} weight="bold" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-[#EAEAEA] cursor-pointer text-[#525252] rounded-md font-bold text-sm hover:bg-[#dfdfdf] transition-colors disabled:opacity-50"
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-[#43C17A] cursor-pointer text-white rounded-md font-bold text-sm hover:bg-[#3ba869] transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t("Submitting")}
                  </>
                ) : (
                  t("Submit Request")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
