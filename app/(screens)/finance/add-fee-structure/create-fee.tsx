// "use client";

// import { CaretDown, MinusCircleIcon, X } from "@phosphor-icons/react";
// import AddFeeHeader from "./components/Header";
// import { useEffect, useState } from "react";
// import { useUser } from "@/app/utils/context/UserContext";
// import { getFinanceCollegeStructure } from "@/lib/helpers/finance/financeManagerContextAPI";
// import { supabase } from "@/lib/supabaseClient";
// import { saveCollegeFeeStructure } from "@/lib/helpers/finance/feeStructure/academicFee/collegeFeeStructureAPI";
// import { saveFeeType } from "@/lib/helpers/finance/feeStructure/academicFee/feeTypeMasterAPI";
// import { saveFeeComponent } from "@/lib/helpers/finance/feeStructure/academicFee/collegeFeeComponentsAPI";
// import { getOrCreateCollegeSession } from "@/lib/helpers/finance/feeStructure/academicFee/collegeSessionAPI";
// import toast from "react-hot-toast";
// import { useSearchParams } from "next/navigation";
// import CreateFeeSkeleton from "./shimmer/createFeeSkeleton";
// import { motion, AnimatePresence } from "framer-motion";

// export default function CreateFee() {
//   const { userId } = useUser();

//   const [collegeName, setCollegeName] = useState("");
//   const [educationType, setEducationType] = useState("");

//   const [collegeId, setCollegeId] = useState<number | null>(null);
//   const [collegeEducationId, setCollegeEducationId] = useState<number | null>(
//     null,
//   );

//   const [branches, setBranches] = useState<any[]>([]);
//   const [financeManagerId, setFinanceManagerId] = useState<number | null>(null);

//   const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

//   // For Academic Tab
//   const [sessionStart, setSessionStart] = useState("");
//   const [sessionEnd, setSessionEnd] = useState("");

//   // For Additional Tab
//   const [availableSessions, setAvailableSessions] = useState<any[]>([]);
//   const [selectedSessionId, setSelectedSessionId] = useState<string>("");

//   const [showHostelFee, setShowHostelFee] = useState(false);
//   const [showMiscFee, setShowMiscFee] = useState(false);
//   const [showCreateBox, setShowCreateBox] = useState(false);

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const [feeValues, setFeeValues] = useState<Record<string, string>>({});
//   const [gstValue, setGstValue] = useState("");
//   const [metaData, setMetaData] = useState({
//     dueDate: "",
//     lateFee: "",
//     remarks: "",
//   });

//   const [customFees, setCustomFees] = useState<{ id: string; label: string }[]>(
//     [],
//   );
//   const [createdFeeOptions, setCreatedFeeOptions] = useState<
//     { id: string; label: string }[]
//   >([]);
//   const [newFeeName, setNewFeeName] = useState("");
//   const [totalFee, setTotalFee] = useState(0);
//   const [isSaving, setIsSaving] = useState(false);

//   const searchParams = useSearchParams();
//   const editMode = searchParams.get("edit") === "true";
//   const editId = searchParams.get("id");

//   const [isLoadingEditData, setIsLoadingEditData] = useState(editMode);

//   const [activeTab, setActiveTab] = useState<"academic" | "additional">(
//     "academic",
//   );

//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [addDept, setAddDept] = useState("");
//   const [addCourseType, setAddCourseType] = useState("");
//   const [addAmount, setAddAmount] = useState("");

//   const [additionalDuesList, setAdditionalDuesList] = useState<
//     { id: number; dept: string; course: string; amount: number }[]
//   >([]);
//   const [additionalMetaData, setAdditionalMetaData] = useState({
//     dueDate: "",
//     lateFee: "",
//     remarks: "",
//   });
//   const [additionalTotalFee, setAdditionalTotalFee] = useState(0);

//   // Existing Handlers
//   const handleFeeChange = (key: string, value: string) => {
//     const cleanValue = value.replace(/\D/g, "");
//     setFeeValues((prev) => ({ ...prev, [key]: cleanValue }));
//   };

//   const handleMetaChange = (key: string, value: string) => {
//     setMetaData((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleAdditionalMetaChange = (key: string, value: string) => {
//     setAdditionalMetaData((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleIntegerInput = (e: any) => {
//     const value = e.target.value;
//     if (value === "") return;
//     e.target.value = value.replace(/\D/g, "");
//   };

//   // Calculate Additional Dues Total
//   useEffect(() => {
//     const total = additionalDuesList.reduce(
//       (acc, curr) => acc + curr.amount,
//       0,
//     );
//     setAdditionalTotalFee(total);
//   }, [additionalDuesList]);

//   // Modal Save Handler
//   const handleSaveModalComponent = () => {
//     if (!addDept.trim() || !addCourseType.trim() || !addAmount.trim()) {
//       toast.error("Please fill all fields");
//       return;
//     }

//     setAdditionalDuesList((prev) => [
//       ...prev,
//       {
//         id: Date.now(),
//         dept: addDept,
//         course: addCourseType,
//         amount: Number(addAmount.replace(/\D/g, "")),
//       },
//     ]);

//     // Reset Modal
//     setAddDept("");
//     setAddCourseType("");
//     setAddAmount("");
//     setIsAddModalOpen(false);
//   };

//   const handleRemoveAdditionalDue = (id: number) => {
//     setAdditionalDuesList((prev) => prev.filter((item) => item.id !== id));
//   };

//   // --- EDIT MODE LOAD ---
//   useEffect(() => {
//     const loadEditData = async () => {
//       if (!editMode || !editId || !financeManagerId) return;

//       setIsLoadingEditData(true);

//       try {
//         const { data: struct, error } = await supabase
//           .from("college_fee_structure")
//           .select("*")
//           .eq("feeStructureId", editId)
//           .single();

//         if (error || !struct) return;

//         setSelectedBranch(struct.collegeBranchId);

//         if (struct.collegeSessionId) {
//           const { data: sessionData } = await supabase
//             .from("college_session")
//             .select("startYear, endYear")
//             .eq("collegeSessionId", struct.collegeSessionId)
//             .single();

//           if (sessionData) {
//             setSessionStart(String(sessionData.startYear));
//             setSessionEnd(String(sessionData.endYear));
//           }
//         }

//         let formattedForInput = "";
//         if (struct.dueDate) {
//           const dateObj = new Date(struct.dueDate);
//           const yyyy = dateObj.getFullYear();
//           const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
//           const dd = String(dateObj.getDate()).padStart(2, "0");
//           formattedForInput = `${yyyy}-${mm}-${dd}`;
//         }

//         if (struct.gstPercentage > 0) {
//           setGstValue(`${struct.gstPercentage}%`);
//         }

//         setMetaData({
//           dueDate: formattedForInput,
//           lateFee: String(struct.lateFeePerDay),
//           remarks: struct.remarks || "",
//         });

//         const { data: comps } = await supabase
//           .from("college_fee_components")
//           .select(`*, fee_type_master ( feeTypeName )`)
//           .eq("feeStructureId", editId)
//           .eq("isActive", true);

//         if (comps) {
//           const newFeeValues: Record<string, string> = {};
//           const newCustomFees: { id: string; label: string }[] = [];

//           comps.forEach((c) => {
//             const name = c.fee_type_master?.feeTypeName;
//             const amount = String(c.amount);

//             if (name === "Tuition Fee") newFeeValues["TUITION"] = amount;
//             else if (name === "Laboratory Fee") newFeeValues["LAB"] = amount;
//             else if (name === "Library Fee") newFeeValues["LIBRARY"] = amount;
//             else if (name === "Examination Fee") newFeeValues["EXAM"] = amount;
//             else if (name === "Hostel Accommodation Fee") {
//               newFeeValues["HOSTEL"] = amount;
//               setShowHostelFee(true);
//             } else if (name === "Miscellaneous Fee") {
//               newFeeValues["MISC"] = amount;
//               setShowMiscFee(true);
//             } else if (name !== "GST") {
//               const customId = name.toUpperCase().replace(/\s+/g, "_");
//               newCustomFees.push({ id: customId, label: name });
//               newFeeValues[customId] = amount;
//             }
//           });

//           setFeeValues(newFeeValues);
//           setCustomFees(newCustomFees);
//           setCreatedFeeOptions((prev) => [...prev, ...newCustomFees]);
//         }
//       } catch (err) {
//         console.error("Error loading edit data", err);
//         toast.error("Failed to load details for editing");
//       } finally {
//         setIsLoadingEditData(false);
//       }
//     };

//     if (financeManagerId) {
//       loadEditData();
//     }
//   }, [editMode, editId, financeManagerId]);

//   // --- CALCULATION EFFECT ---
//   useEffect(() => {
//     let total = 0;
//     if (feeValues["TUITION"]) total += Number(feeValues["TUITION"]);
//     if (feeValues["LAB"]) total += Number(feeValues["LAB"]);
//     if (feeValues["LIBRARY"]) total += Number(feeValues["LIBRARY"]);
//     if (feeValues["EXAM"]) total += Number(feeValues["EXAM"]);
//     if (showHostelFee && feeValues["HOSTEL"])
//       total += Number(feeValues["HOSTEL"]);
//     if (showMiscFee && feeValues["MISC"]) total += Number(feeValues["MISC"]);

//     customFees.forEach((fee) => {
//       if (feeValues[fee.id]) total += Number(feeValues[fee.id]);
//     });

//     if (gstValue) {
//       const gstPercent = Number(gstValue.replace(/\D/g, ""));
//       if (gstPercent > 0) {
//         total = total + total * (gstPercent / 100);
//       }
//     }
//     setTotalFee(Math.round(total));
//   }, [feeValues, showHostelFee, showMiscFee, customFees, gstValue]);

//   // --- LOAD COLLEGE DATA & SESSIONS ---
//   useEffect(() => {
//     const loadFinanceStructure = async () => {
//       if (!userId) return;
//       try {
//         const data = await getFinanceCollegeStructure(userId);
//         setCollegeName(data.collegeName);
//         setEducationType(data.educationType);
//         setCollegeId(data.collegeId);
//         setCollegeEducationId(data.collegeEducationId);
//         setBranches(data.branches);

//         // Fetch existing sessions for Additional Dues dropdown
//         if (data.collegeId) {
//           const { data: sessionData } = await supabase
//             .from("college_session")
//             .select("*")
//             .eq("collegeId", data.collegeId)
//             .eq("is_deleted", false)
//             .order("startYear", { ascending: false });

//           if (sessionData) setAvailableSessions(sessionData);
//         }

//         const { data: fmData } = await supabase
//           .from("finance_manager")
//           .select("financeManagerId")
//           .eq("userId", userId)
//           .single();

//         if (fmData) setFinanceManagerId(fmData.financeManagerId);
//       } catch (err) {
//         console.error("Error loading structure:", err);
//         toast.error("Failed to load college data");
//       }
//     };
//     loadFinanceStructure();
//   }, [userId]);

//   const handleAddCustomFeeOption = () => {
//     if (newFeeName.trim()) {
//       const newId = newFeeName.toUpperCase().replace(/\s+/g, "_");
//       const newLabel = newFeeName.trim();
//       if (!createdFeeOptions.find((f) => f.id === newId)) {
//         setCreatedFeeOptions((prev) => [
//           ...prev,
//           { id: newId, label: newLabel },
//         ]);
//       }
//       if (!customFees.find((f) => f.id === newId)) {
//         setCustomFees((prev) => [...prev, { id: newId, label: newLabel }]);
//       }
//       setNewFeeName("");
//       setShowCreateBox(false);
//     }
//   };

//   const handleDropdownChange = (value: string) => {
//     if (value === "") return;
//     if (value === "__CREATE__") {
//       setShowCreateBox(true);
//       return;
//     }
//     if (value === "HOSTEL") {
//       setShowHostelFee((prev) => !prev);
//     } else if (value === "MISC") {
//       setShowMiscFee((prev) => !prev);
//     } else {
//       const option = createdFeeOptions.find((f) => f.id === value);
//       if (option) {
//         const isVisible = customFees.find((f) => f.id === value);
//         if (isVisible) {
//           setCustomFees((prev) => prev.filter((f) => f.id !== value));
//           setFeeValues((prev) => {
//             const n = { ...prev };
//             delete n[value];
//             return n;
//           });
//         } else {
//           setCustomFees((prev) => [...prev, option]);
//         }
//       }
//     }
//   };

//   const handleSaveFeeStructure = async () => {
//     if (
//       !selectedBranch ||
//       !sessionStart ||
//       !sessionEnd ||
//       !financeManagerId ||
//       !collegeId ||
//       !collegeEducationId
//     ) {
//       toast.error(
//         "Missing required fields (Branch, Session Years, or College ID)",
//       );
//       return;
//     }

//     if (sessionStart.length !== 4 || sessionEnd.length !== 4) {
//       toast.error("Please enter valid 4-digit years for session");
//       return;
//     }
//     if (Number(sessionStart) > Number(sessionEnd)) {
//       toast.error("Start year cannot be greater than end year");
//       return;
//     }

//     let formattedDueDate = new Date().toISOString();
//     if (metaData.dueDate) {
//       if (metaData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
//         formattedDueDate = new Date(metaData.dueDate).toISOString();
//       } else if (metaData.dueDate.includes("/")) {
//         const [day, month, year] = metaData.dueDate.split("/");
//         const dateObj = new Date(`${year}-${month}-${day}`);
//         if (!isNaN(dateObj.getTime())) {
//           formattedDueDate = dateObj.toISOString();
//         }
//       }
//     }

//     setIsSaving(true);

//     try {
//       const {
//         success: sessionSuccess,
//         collegeSessionId,
//         error: sessionError,
//       } = await getOrCreateCollegeSession(
//         collegeId,
//         Number(sessionStart),
//         Number(sessionEnd),
//       );

//       if (!sessionSuccess || !collegeSessionId) {
//         throw new Error("Failed to create session: " + sessionError?.message);
//       }

//       const {
//         success: structSuccess,
//         feeStructureId,
//         error: structError,
//       } = await saveCollegeFeeStructure(
//         {
//           collegeId: collegeId,
//           collegeEducationId: collegeEducationId,
//           collegeBranchId: selectedBranch,
//           collegeSessionId: collegeSessionId,
//           dueDate: formattedDueDate,
//           lateFeePerDay: metaData.lateFee
//             ? Number(metaData.lateFee.replace(/\D/g, ""))
//             : 0,
//           remarks: metaData.remarks,
//         },
//         financeManagerId,
//       );

//       if (!structSuccess || !feeStructureId) {
//         throw new Error(
//           "Failed to save fee structure: " + structError?.message,
//         );
//       }

//       const componentsToSave: { label: string; amount: number }[] = [];
//       let runningTotalForGst = 0;

//       const pushFee = (label: string, valueKey: string) => {
//         const rawVal = feeValues[valueKey];
//         const val = Number(rawVal);
//         if (val > 0) {
//           componentsToSave.push({ label, amount: val });
//           runningTotalForGst += val;
//         }
//       };

//       pushFee("Tuition Fee", "TUITION");
//       pushFee("Laboratory Fee", "LAB");
//       pushFee("Library Fee", "LIBRARY");
//       pushFee("Examination Fee", "EXAM");

//       if (showHostelFee) pushFee("Hostel Accommodation Fee", "HOSTEL");
//       if (showMiscFee) pushFee("Miscellaneous Fee", "MISC");
//       customFees.forEach((fee) => pushFee(fee.label, fee.id));

//       if (gstValue) {
//         const gstPercent = Number(gstValue.replace(/\D/g, ""));
//         if (gstPercent > 0 && runningTotalForGst > 0) {
//           const gstAmount = Math.round(runningTotalForGst * (gstPercent / 100));
//           componentsToSave.push({ label: "GST", amount: gstAmount });
//         }
//       }

//       if (componentsToSave.length === 0) {
//         toast("No fee amounts entered", { icon: "⚠️" });
//         setIsSaving(false);
//         return;
//       }

//       for (const comp of componentsToSave) {
//         const { success: typeSuccess, feeTypeId } = await saveFeeType(
//           comp.label,
//         );
//         if (typeSuccess && feeTypeId) {
//           await saveFeeComponent({
//             feeStructureId: feeStructureId,
//             feeTypeId: feeTypeId,
//             amount: comp.amount,
//           });
//         }
//       }

//       toast.success("Fee Structure Saved Successfully!");

//       setFeeValues({});
//       setTotalFee(0);
//       setGstValue("");
//       setMetaData({ dueDate: "", lateFee: "", remarks: "" });
//       setSelectedBranch(null);
//       setSessionStart("");
//       setSessionEnd("");
//       setShowHostelFee(false);
//       setShowMiscFee(false);
//       setCustomFees([]);
//     } catch (error: any) {
//       console.error(error);
//       toast.error("Error: " + error.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // 🔥 NEW DB LOGIC FOR ADDITIONAL DUES
//   const handleSaveAdditionalDues = async () => {
//     if (
//       !selectedBranch ||
//       !selectedSessionId ||
//       !financeManagerId ||
//       !collegeId ||
//       !collegeEducationId
//     ) {
//       toast.error("Missing required fields (Branch, Session, or College ID)");
//       return;
//     }

//     let formattedDueDate = new Date().toISOString();
//     if (additionalMetaData.dueDate) {
//       if (additionalMetaData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
//         formattedDueDate = new Date(additionalMetaData.dueDate).toISOString();
//       } else if (additionalMetaData.dueDate.includes("/")) {
//         const [day, month, year] = additionalMetaData.dueDate.split("/");
//         const dateObj = new Date(`${year}-${month}-${day}`);
//         if (!isNaN(dateObj.getTime())) {
//           formattedDueDate = dateObj.toISOString();
//         }
//       }
//     }

//     setIsSaving(true);
//     const now = new Date().toISOString();

//     try {
//       // 1. Check if a structure already exists to Upsert safely
//       const { data: existingStruct } = await supabase
//         .from("college_additional_fee_structure")
//         .select("additionalFeeStructureId, createdAt")
//         .match({
//           collegeId: collegeId,
//           collegeEducationId: collegeEducationId,
//           collegeBranchId: selectedBranch,
//           collegeSessionId: Number(selectedSessionId),
//         })
//         .maybeSingle();

//       // 2. Upsert the Additional Fee Structure record
//       const { data: structData, error: structError } = await supabase
//         .from("college_additional_fee_structure")
//         .upsert(
//           {
//             collegeId: collegeId,
//             collegeEducationId: collegeEducationId,
//             collegeBranchId: selectedBranch,
//             collegeSessionId: Number(selectedSessionId),
//             dueDate: formattedDueDate,
//             lateFeePerDay: additionalMetaData.lateFee
//               ? Number(additionalMetaData.lateFee.replace(/\D/g, ""))
//               : 0,
//             remarks: additionalMetaData.remarks || null,
//             createdBy: financeManagerId,
//             isActive: true,
//             createdAt: existingStruct?.createdAt || now,
//             updatedAt: now,
//           },
//           {
//             onConflict:
//               "collegeId,collegeEducationId,collegeBranchId,collegeSessionId",
//           },
//         )
//         .select("additionalFeeStructureId")
//         .single();

//       if (structError || !structData) throw structError;

//       if (existingStruct) {
//         await supabase
//           .from("college_additional_fee_components")
//           .delete()
//           .eq(
//             "additionalFeeStructureId",
//             existingStruct.additionalFeeStructureId,
//           );
//       }

//       // 4. Insert New Components
//       const compsToInsert = additionalDuesList.map((due) => ({
//         additionalFeeStructureId: structData.additionalFeeStructureId,
//         department: due.dept,
//         courseType: due.course,
//         amount: due.amount,
//         isActive: true,
//         createdAt: now,
//         updatedAt: now,
//       }));

//       const { error: compError } = await supabase
//         .from("college_additional_fee_components")
//         .insert(compsToInsert);

//       if (compError) throw compError;

//       toast.success("Additional Dues Saved Successfully!");

//       // Reset
//       setAdditionalDuesList([]);
//       setAdditionalMetaData({ dueDate: "", lateFee: "", remarks: "" });
//       setSelectedSessionId("");
//       setSelectedBranch(null);
//     } catch (err: any) {
//       console.error("Save Additional Dues Error:", err);
//       toast.error("Error: " + err.message);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   if (isLoadingEditData) {
//     return (
//       <>
//         <div className="bg-red-00 flex">
//           <AddFeeHeader button={false} />
//         </div>
//         <CreateFeeSkeleton />
//       </>
//     );
//   }

//   return (
//     <>
//       <AnimatePresence>
//         {isAddModalOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
//           >
//             <motion.div
//               initial={{ scale: 0.95, y: 20 }}
//               animate={{ scale: 1, y: 0 }}
//               exit={{ scale: 0.95, y: 20 }}
//               className="bg-white rounded-xl shadow-2xl p-8 w-[600px] max-w-[95vw]"
//             >
//               <div className="flex justify-between items-center mb-6 ">
//                 <h2 className="text-xl font-bold text-[#282828]">
//                   Add Fee Component
//                 </h2>
//                 <button
//                   onClick={() => setIsAddModalOpen(false)}
//                   className="text-gray-500 hover:text-red-500 transition-colors"
//                 >
//                   <X size={24} weight="bold" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 gap-4 mb-4 text-[#282828]">
//                 <div className="flex flex-col">
//                   <label className="text-[#282828] font-medium mb-1">
//                     Department
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Aptitude"
//                     value={addDept}
//                     onChange={(e) => setAddDept(e.target.value)}
//                     className="border border-[#C4C4C4] p-2 rounded-md focus:outline-none focus:border-[#58AE77]"
//                   />
//                 </div>
//                 <div className="flex flex-col">
//                   <label className="text-[#282828] font-medium mb-1">
//                     Course Type
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Aptitude Training"
//                     value={addCourseType}
//                     onChange={(e) => setAddCourseType(e.target.value)}
//                     className="border border-[#C4C4C4] p-2 rounded-md focus:outline-none focus:border-[#58AE77]"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col mb-8 text-[#282828]">
//                 <label className="text-[#282828] font-medium mb-1">
//                   Amount
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="eg:3000"
//                   value={addAmount}
//                   onChange={(e) =>
//                     setAddAmount(e.target.value.replace(/\D/g, ""))
//                   }
//                   className="border border-[#C4C4C4] p-2 rounded-md focus:outline-none focus:border-[#58AE77]"
//                 />
//               </div>

//               <button
//                 onClick={handleSaveModalComponent}
//                 className="w-full bg-[#58AE77] hover:bg-[#469160] text-white font-medium py-3 rounded-md transition-colors"
//               >
//                 Save Additional Due
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="bg-red-00 flex flex-col">
//         <div className="bg-red-00 flex">
//           <AddFeeHeader button={false} />
//         </div>

//         <div className="flex justify-center my-6 w-full">
//           <div className="flex items-center gap-4 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
//             {(["academic", "additional"] as const).map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`relative px-6 py-2 cursor-pointer rounded-full font-medium text-sm transition-colors duration-200 z-10
//                       ${activeTab === tab ? "text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
//                     `}
//               >
//                 {tab === "academic" ? "Academic Fees" : "Additional Dues"}
//                 {activeTab === tab && (
//                   <motion.div
//                     layoutId="active-tab-pill"
//                     className={`absolute inset-0 rounded-full -z-10 ${tab === "academic" ? "bg-[#58AE77]" : "bg-[#58AE77]"}`}
//                     transition={{
//                       type: "spring",
//                       stiffness: 400,
//                       damping: 30,
//                     }}
//                   />
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="bg-white mt-1 rounded-md p-6 flex flex-wrap justify-between gap-2 shadow-sm">
//           {/* SHARED Header Inputs */}
//           <div className="flex flex-wrap justify-between w-[100%] gap-4">
//             <div className="flex flex-col w-[49%]">
//               <label className="text-[#282828] font-medium">College Name</label>
//               <input
//                 type="text"
//                 value={collegeName}
//                 readOnly
//                 className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed bg-gray-50"
//               />
//             </div>
//             <div className="flex flex-col w-[49%]">
//               <label className="text-[#282828] font-medium">
//                 Education Type
//               </label>
//               <input
//                 type="text"
//                 value={educationType}
//                 readOnly
//                 className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed bg-gray-50"
//               />
//             </div>
//             <div className="flex flex-col w-[49%]">
//               <label className="font-medium text-[#282828]">Branch</label>
//               <select
//                 value={selectedBranch ?? ""}
//                 onChange={(e) => setSelectedBranch(Number(e.target.value))}
//                 className="border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 text-[#898989]"
//               >
//                 <option value="">Select Branch</option>
//                 {branches.map((branch) => (
//                   <option
//                     key={branch.collegeBranchId}
//                     value={branch.collegeBranchId}
//                   >
//                     {branch.collegeBranchCode}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* 🔥 DYNAMIC: ACADEMIC SESSION INPUT */}
//             <div className="flex flex-col w-[49%]">
//               <label className="font-medium text-[#282828] ">
//                 Academic Session
//               </label>
//               {activeTab === "academic" ? (
//                 <div className="flex items-center gap-2 mt-2">
//                   <input
//                     type="text"
//                     placeholder="From"
//                     value={sessionStart}
//                     onChange={(e) =>
//                       setSessionStart(
//                         e.target.value.replace(/\D/g, "").slice(0, 4),
//                       )
//                     }
//                     className={`w-1/2 border border-[#C4C4C4] p-2 rounded-md text-[#898989] focus:outline-none
//                            ${!selectedBranch ? "bg-gray-100 cursor-not-allowed" : ""}`}
//                     disabled={!selectedBranch}
//                   />
//                   <span className="text-gray-400 font-bold">-</span>
//                   <input
//                     type="text"
//                     placeholder="To"
//                     value={sessionEnd}
//                     onChange={(e) =>
//                       setSessionEnd(
//                         e.target.value.replace(/\D/g, "").slice(0, 4),
//                       )
//                     }
//                     className={`w-1/2 border border-[#C4C4C4] p-2 rounded-md text-[#898989] focus:outline-none
//                            ${!selectedBranch ? "bg-gray-100 cursor-not-allowed" : ""}`}
//                     disabled={!selectedBranch}
//                   />
//                 </div>
//               ) : (
//                 <select
//                   value={selectedSessionId}
//                   onChange={(e) => setSelectedSessionId(e.target.value)}
//                   className={`border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 text-[#898989]
//                       ${!selectedBranch ? "bg-gray-100 cursor-not-allowed" : ""}`}
//                   disabled={!selectedBranch}
//                 >
//                   <option value="">Select Academic Session</option>
//                   {availableSessions.map((session) => (
//                     <option
//                       key={session.collegeSessionId}
//                       value={session.collegeSessionId}
//                     >
//                       {session.sessionName}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>
//           </div>

//           <div
//             className={`w-full transition-opacity duration-300 ${activeTab === "academic" ? "block" : "hidden"}`}
//           >
//             <div className="flex flex-col w-full mt-4">
//               <div className="bg-blue-00 flex justify-between items-center w-full">
//                 <h4 className="text-[#282828] font-medium text-lg">
//                   Fee Components
//                 </h4>
//                 <div className="bg-blue-00 flex items-center justify-end gap-2 w-1/2">
//                   {!showCreateBox ? (
//                     <div className="relative ">
//                       <div
//                         className="relative w-50 bg-[#16284F] pl-5 pr-12 py-2 rounded-lg text-white text-lg overflow-hidden cursor-pointer flex items-center h-[46px]"
//                         onClick={() => setIsDropdownOpen((prev) => !prev)}
//                       >
//                         <span className="whitespace-nowrap">Choose More</span>
//                         <CaretDown
//                           size={22}
//                           className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none"
//                         />
//                       </div>
//                       <select
//                         value=""
//                         onChange={(e) => handleDropdownChange(e.target.value)}
//                         className="absolute inset-0 opacity-0 cursor-pointer h-full"
//                       >
//                         <option
//                           value=""
//                           disabled
//                           style={{
//                             backgroundColor: "#FFFFFF",
//                             color: "#16284F",
//                           }}
//                         >
//                           Choose More
//                         </option>
//                         <option
//                           value="HOSTEL"
//                           style={{
//                             backgroundColor: "#FFFFFF",
//                             color: "#16284F",
//                           }}
//                         >
//                           {showHostelFee ? "✓ " : ""} Hostel Accommodation Fee
//                         </option>
//                         <option
//                           value="MISC"
//                           style={{
//                             backgroundColor: "#FFFFFF",
//                             color: "#16284F",
//                           }}
//                         >
//                           {showMiscFee ? "✓ " : ""} Miscellaneous Fee
//                         </option>
//                         {createdFeeOptions.map((fee) => {
//                           const isActive = customFees.find(
//                             (f) => f.id === fee.id,
//                           );
//                           return (
//                             <option
//                               key={fee.id}
//                               value={fee.id}
//                               style={{
//                                 backgroundColor: "#FFFFFF",
//                                 color: "#16284F",
//                               }}
//                             >
//                               {isActive ? "✓ " : ""} {fee.label}
//                             </option>
//                           );
//                         })}
//                         <option
//                           value="__CREATE__"
//                           style={{
//                             backgroundColor: "#FFFFFF",
//                             color: "#16284F",
//                             fontWeight: "600",
//                             borderTop: "1px solid #eee",
//                           }}
//                         >
//                           + Create New Fee
//                         </option>
//                       </select>
//                     </div>
//                   ) : (
//                     <div className="relative lg:w-[85%] flex gap-2 h-[46px]">
//                       <div className="flex-1 relative h-full">
//                         <input
//                           type="text"
//                           autoFocus
//                           value={newFeeName}
//                           onChange={(e) => setNewFeeName(e.target.value)}
//                           onKeyDown={(e) => {
//                             if (e.key === "Enter") handleAddCustomFeeOption();
//                           }}
//                           placeholder="Enter Fee Name"
//                           className="w-full h-full border border-[#16284F] bg-[#F5F7FA] pl-3 pr-2 rounded-lg text-[#16284F] focus:outline-none placeholder:text-gray-400"
//                         />
//                       </div>
//                       <button
//                         type="button"
//                         onClick={handleAddCustomFeeOption}
//                         className="h-full px-4 bg-[#58AE77] text-white rounded-md hover:bg-[#469160] transition-colors flex items-center gap-1 font-medium"
//                       >
//                         Add
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => setShowCreateBox(false)}
//                         className="h-full px-3 border border-[#FF3131] text-[#FF3131] rounded-md hover:bg-red-50 transition-colors flex items-center justify-center"
//                       >
//                         <X size={20} weight="bold" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-red-00 flex flex-wrap justify-between mt-3 gap-4">
//                 <div className="flex flex-col w-[49%]">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">
//                       Tution Fee
//                     </label>
//                   </div>
//                   <input
//                     type="text"
//                     value={feeValues["TUITION"] || ""}
//                     onChange={(e) => handleFeeChange("TUITION", e.target.value)}
//                     placeholder="Ex: 85000"
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>
//                 <div className="flex flex-col w-[49%]">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">
//                       Laboratory Fee
//                     </label>
//                   </div>
//                   <input
//                     type="text"
//                     value={feeValues["LAB"] || ""}
//                     onChange={(e) => handleFeeChange("LAB", e.target.value)}
//                     placeholder="Ex: 5000"
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>
//                 <div className="flex flex-col w-[49%]">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">
//                       Library Fee
//                     </label>
//                   </div>
//                   <input
//                     type="text"
//                     value={feeValues["LIBRARY"] || ""}
//                     onChange={(e) => handleFeeChange("LIBRARY", e.target.value)}
//                     placeholder="Ex: 100"
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>
//                 <div className="flex flex-col w-[49%]">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">
//                       Examination Fee
//                     </label>
//                   </div>
//                   <input
//                     type="text"
//                     value={feeValues["EXAM"] || ""}
//                     onChange={(e) => handleFeeChange("EXAM", e.target.value)}
//                     placeholder="Ex: 2000"
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>

//                 {showHostelFee && (
//                   <div className="flex flex-col w-[49%]">
//                     <div className="flex items-center justify-between">
//                       <label className="text-[#282828] font-medium">
//                         Hostel Accomodation Fee
//                       </label>
//                       <MinusCircleIcon
//                         size={18}
//                         weight="fill"
//                         className="text-[#FF3131] cursor-pointer"
//                         onClick={() => setShowHostelFee(false)}
//                       />
//                     </div>
//                     <input
//                       type="text"
//                       value={feeValues["HOSTEL"] || ""}
//                       onChange={(e) =>
//                         handleFeeChange("HOSTEL", e.target.value)
//                       }
//                       placeholder="Ex: 5000"
//                       className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                     />
//                   </div>
//                 )}

//                 {showMiscFee && (
//                   <div className="flex flex-col w-[49%]">
//                     <div className="flex items-center justify-between">
//                       <label className="text-[#282828] font-medium">
//                         Miscellaneous Fee
//                       </label>
//                       <MinusCircleIcon
//                         size={18}
//                         weight="fill"
//                         className="text-[#FF3131] cursor-pointer"
//                         onClick={() => setShowMiscFee(false)}
//                       />
//                     </div>
//                     <input
//                       type="text"
//                       value={feeValues["MISC"] || ""}
//                       onChange={(e) => handleFeeChange("MISC", e.target.value)}
//                       placeholder="Ex: 1000"
//                       className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                     />
//                   </div>
//                 )}

//                 {customFees.map((fee) => (
//                   <div key={fee.id} className="flex flex-col w-[49%]">
//                     <div className="flex items-center justify-between">
//                       <label className="text-[#282828] font-medium">
//                         {fee.label}
//                       </label>
//                       <MinusCircleIcon
//                         size={18}
//                         weight="fill"
//                         className="text-[#FF3131] cursor-pointer"
//                         onClick={() => {
//                           setCustomFees((prev) =>
//                             prev.filter((f) => f.id !== fee.id),
//                           );
//                           setFeeValues((prev) => {
//                             const n = { ...prev };
//                             delete n[fee.id];
//                             return n;
//                           });
//                         }}
//                       />
//                     </div>
//                     <input
//                       type="text"
//                       value={feeValues[fee.id] || ""}
//                       onChange={(e) => handleFeeChange(fee.id, e.target.value)}
//                       placeholder="Enter amount"
//                       className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                     />
//                   </div>
//                 ))}

//                 <div className="flex flex-col w-[49%]">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">GST</label>
//                   </div>
//                   <input
//                     type="text"
//                     value={gstValue}
//                     onChange={(e) => setGstValue(e.target.value)}
//                     placeholder="Ex: 18%"
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-pink-00 w-full mt-4 flex flex-col items-start">
//               <h4 className="font-medium text-[#282828]">
//                 Due & Late Fee Details
//               </h4>
//               <div className="bg-yellow-00 w-full flex flex-wrap justify-between mt-3">
//                 <div className="flex flex-col w-[49%]">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">
//                       Due Date
//                     </label>
//                   </div>
//                   <input
//                     type="date"
//                     value={metaData.dueDate}
//                     onChange={(e) =>
//                       handleMetaChange("dueDate", e.target.value)
//                     }
//                     placeholder="DD/MM/YYYY"
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>
//                 <div className="flex flex-col w-[49%]">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">
//                       Late Fee Rule
//                     </label>
//                   </div>
//                   <input
//                     type="text"
//                     value={metaData.lateFee}
//                     onChange={(e) =>
//                       handleMetaChange("lateFee", e.target.value)
//                     }
//                     onChangeCapture={handleIntegerInput}
//                     placeholder="₹___ /day after due date"
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>
//                 <div className="flex flex-col w-[100%] mt-3">
//                   <div className="flex items-center justify-between">
//                     <label className="text-[#282828] font-medium">
//                       Remarks (Optional)
//                     </label>
//                   </div>
//                   <input
//                     type="text"
//                     value={metaData.remarks}
//                     onChange={(e) =>
//                       handleMetaChange("remarks", e.target.value)
//                     }
//                     placeholder={`Ex “Applicable for all students of ${new Date().getFullYear()} batch.”`}
//                     className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
//                   />
//                 </div>
//                 <div className="bg-red-00 w-full mt-5">
//                   <div className="flex items-center gap-3">
//                     <h4 className="text-[#16284F] font-bold">Total Fee:</h4>
//                     <div className="p-1 px-4 border border-[#919191] rounded-md">
//                       <p className="text-[#23B362] font-bold text-md">
//                         ₹ {totalFee.toLocaleString("en-IN")}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="w-full flex items-center justify-center mt-5">
//                   <button
//                     onClick={handleSaveFeeStructure}
//                     disabled={isSaving}
//                     className={`px-5 py-2 font-medium text-[#EFEFEF] rounded-md cursor-pointer transition-colors ${
//                       isSaving
//                         ? "bg-gray-400 cursor-not-allowed"
//                         : "bg-[#58AE77] hover:bg-[#469160]"
//                     }`}
//                   >
//                     {isSaving ? "Saving..." : "Save Fee Structure"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ========================================= */}
//           {/* TAB 2: ADDITIONAL DUES (NEW UI)           */}
//           {/* ========================================= */}
//           <div
//             className={`w-full transition-opacity duration-300 mt-4 ${activeTab === "additional" ? "block" : "hidden"}`}
//           >
//             <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-300">
//               <div className="flex justify-between items-center w-full mb-4">
//                 <h4 className="text-[#282828] font-semibold text-lg">
//                   Fee Components
//                 </h4>
//                 <button
//                   onClick={() => setIsAddModalOpen(true)}
//                   className="bg-[#1F2F56] cursor-pointer hover:bg-[#15203D] text-white px-5 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
//                 >
//                   Add More
//                 </button>
//               </div>

//               {/* RENDER ADDED COMPONENTS */}
//               {additionalDuesList.length > 0 ? (
//                 <div className="space-y-4 mb-6">
//                   {additionalDuesList.map((due) => (
//                     <div
//                       key={due.id}
//                       className="grid grid-cols-1 md:grid-cols-3 gap-4 relative p-4 bg-gray-50/50 border border-gray-100 rounded-lg group"
//                     >
//                       <button
//                         onClick={() => handleRemoveAdditionalDue(due.id)}
//                         className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
//                         title="Remove Component"
//                       >
//                         <MinusCircleIcon size={20} weight="fill" />
//                       </button>

//                       <div className="flex flex-col">
//                         <label className="text-[#282828] font-medium mb-1 text-sm">
//                           Department
//                         </label>
//                         <input
//                           value={due.dept}
//                           readOnly
//                           className="border border-gray-200 p-2 rounded-md text-gray-600 bg-white outline-none text-sm"
//                         />
//                       </div>
//                       <div className="flex flex-col">
//                         <label className="text-[#282828] font-medium mb-1 text-sm">
//                           Course Type
//                         </label>
//                         <input
//                           value={due.course}
//                           readOnly
//                           className="border border-gray-200 p-2 rounded-md text-gray-600 bg-white outline-none text-sm"
//                         />
//                       </div>
//                       <div className="flex flex-col pr-6">
//                         <label className="text-[#282828] font-medium mb-1 text-sm">
//                           Amount
//                         </label>
//                         <input
//                           value={due.amount}
//                           readOnly
//                           className="border border-gray-200 p-2 rounded-md text-gray-600 bg-white outline-none text-sm"
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="w-full py-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 mb-6 bg-gray-50/30">
//                   <p className="text-sm">No additional components added yet.</p>
//                   <p className="text-xs mt-1">Click "Add More" to start.</p>
//                 </div>
//               )}

//               {/* ADDITIONAL METADATA */}
//               <div className="bg-pink-00 w-full mt-2 flex flex-col items-start pt-4 border-t border-gray-100">
//                 <h4 className="font-semibold text-[#282828]">
//                   Due & Late Fee Details
//                 </h4>
//                 <div className="w-full flex flex-wrap justify-between mt-3">
//                   <div className="flex flex-col w-[49%]">
//                     <label className="text-[#282828] font-medium mb-2">
//                       Due Date
//                     </label>
//                     <input
//                       type="date"
//                       value={additionalMetaData.dueDate}
//                       onChange={(e) =>
//                         handleAdditionalMetaChange("dueDate", e.target.value)
//                       }
//                       className="border border-[#C4C4C4] p-2 px-3 rounded-md text-[#898989] focus:outline-none focus:border-[#58AE77]"
//                     />
//                   </div>
//                   <div className="flex flex-col w-[49%]">
//                     <label className="text-[#282828] font-medium mb-2">
//                       Late Fee Rule
//                     </label>
//                     <input
//                       type="text"
//                       value={additionalMetaData.lateFee}
//                       onChange={(e) =>
//                         handleAdditionalMetaChange("lateFee", e.target.value)
//                       }
//                       onChangeCapture={handleIntegerInput}
//                       placeholder="₹___ /day after due date"
//                       className="border border-[#C4C4C4] p-2 px-3 rounded-md text-[#898989] focus:outline-none focus:border-[#58AE77]"
//                     />
//                   </div>
//                   <div className="flex flex-col w-[100%] mt-4">
//                     <label className="text-[#282828] font-medium mb-2">
//                       Remarks (Optional)
//                     </label>
//                     <input
//                       type="text"
//                       value={additionalMetaData.remarks}
//                       onChange={(e) =>
//                         handleAdditionalMetaChange("remarks", e.target.value)
//                       }
//                       placeholder={`e.g., “Applicable for all students of ${new Date().getFullYear()} batch.”`}
//                       className="border border-[#C4C4C4] p-2 px-3 rounded-md text-[#898989] focus:outline-none focus:border-[#58AE77]"
//                     />
//                   </div>

//                   {/* TOTAL DISPLAY */}
//                   <div className="w-full mt-6 flex items-center">
//                     <h4 className="text-[#16284F] font-bold text-lg mr-4">
//                       Total Fee :
//                     </h4>
//                     <div className=" px-6 border-2 border-gray-300 rounded-lg bg-white shadow-sm">
//                       <p className="text-[#23B362] font-bold text-lg">
//                         ₹ {additionalTotalFee.toLocaleString("en-IN")}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="w-full flex items-center justify-center mt-8 pb-4">
//                     <button
//                       onClick={handleSaveAdditionalDues}
//                       disabled={additionalDuesList.length === 0 || isSaving}
//                       className={`px-8 py-3 text-lg font-medium cursor-pointer text-white rounded-md transition-colors shadow-sm
//                         ${
//                           additionalDuesList.length === 0 || isSaving
//                             ? "bg-gray-300 cursor-not-allowed"
//                             : "bg-[#58AE77] hover:bg-[#469160]"
//                         }`}
//                     >
//                       {isSaving ? "Saving..." : "Save Additional Due"}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { CaretDown, MinusCircleIcon, X } from "@phosphor-icons/react";
import AddFeeHeader from "./components/Header";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { getFinanceCollegeStructure } from "@/lib/helpers/finance/financeManagerContextAPI";
import { supabase } from "@/lib/supabaseClient";

import { saveCollegeFeeStructure } from "@/lib/helpers/finance/feeStructure/academicFee/collegeFeeStructureAPI";
import { saveFeeType } from "@/lib/helpers/finance/feeStructure/academicFee/feeTypeMasterAPI";
import { saveFeeComponent } from "@/lib/helpers/finance/feeStructure/academicFee/collegeFeeComponentsAPI";
import { getOrCreateCollegeSession } from "@/lib/helpers/finance/feeStructure/academicFee/collegeSessionAPI";

import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import CreateFeeSkeleton from "./shimmer/createFeeSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { saveAdditionalFeeStructure } from "@/lib/helpers/finance/feeStructure/additionalFee/additionalFeeStructureAPI";
import { saveAdditionalFeeComponent } from "@/lib/helpers/finance/feeStructure/additionalFee/additionalFeeComponentAPI";

export default function CreateFee() {
  const { userId } = useUser();

  const [collegeName, setCollegeName] = useState("");
  const [educationType, setEducationType] = useState("");

  const [collegeId, setCollegeId] = useState<number | null>(null);
  const [collegeEducationId, setCollegeEducationId] = useState<number | null>(
    null,
  );

  const [branches, setBranches] = useState<any[]>([]);
  const [financeManagerId, setFinanceManagerId] = useState<number | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");

  const [availableSessions, setAvailableSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  const [showHostelFee, setShowHostelFee] = useState(false);
  const [showMiscFee, setShowMiscFee] = useState(false);
  const [showCreateBox, setShowCreateBox] = useState(false);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [feeValues, setFeeValues] = useState<Record<string, string>>({});
  const [gstValue, setGstValue] = useState("");
  const [metaData, setMetaData] = useState({
    dueDate: "",
    lateFee: "",
    remarks: "",
  });

  const [customFees, setCustomFees] = useState<{ id: string; label: string }[]>(
    [],
  );
  const [createdFeeOptions, setCreatedFeeOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [newFeeName, setNewFeeName] = useState("");
  const [totalFee, setTotalFee] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const searchParams = useSearchParams();
  const editMode = searchParams.get("edit") === "true";
  const editId = searchParams.get("id");

  const [isLoadingEditData, setIsLoadingEditData] = useState(editMode);

  const [activeTab, setActiveTab] = useState<"academic" | "additional">(
    "academic",
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDept, setAddDept] = useState("");
  const [addCourseType, setAddCourseType] = useState("");
  const [addAmount, setAddAmount] = useState("");

  const [additionalDuesList, setAdditionalDuesList] = useState<
    { id: number; dept: string; course: string; amount: number }[]
  >([]);
  const [additionalMetaData, setAdditionalMetaData] = useState({
    dueDate: "",
    lateFee: "",
    remarks: "",
  });
  const [additionalTotalFee, setAdditionalTotalFee] = useState(0);

  const handleFeeChange = (key: string, value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    setFeeValues((prev) => ({ ...prev, [key]: cleanValue }));
  };

  const handleMetaChange = (key: string, value: string) => {
    setMetaData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAdditionalMetaChange = (key: string, value: string) => {
    setAdditionalMetaData((prev) => ({ ...prev, [key]: value }));
  };

  const handleIntegerInput = (e: any) => {
    const value = e.target.value;
    if (value === "") return;
    e.target.value = value.replace(/\D/g, "");
  };

  // Calculate Additional Dues Total
  useEffect(() => {
    const total = additionalDuesList.reduce(
      (acc, curr) => acc + curr.amount,
      0,
    );
    setAdditionalTotalFee(total);
  }, [additionalDuesList]);

  const handleSaveModalComponent = () => {
    if (!addDept.trim() || !addCourseType.trim() || !addAmount.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setAdditionalDuesList((prev) => [
      ...prev,
      {
        id: Date.now(),
        dept: addDept,
        course: addCourseType,
        amount: Number(addAmount.replace(/\D/g, "")),
      },
    ]);

    // Reset Modal
    setAddDept("");
    setAddCourseType("");
    setAddAmount("");
    setIsAddModalOpen(false);
  };

  const handleRemoveAdditionalDue = (id: number) => {
    setAdditionalDuesList((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    const loadEditData = async () => {
      if (!editMode || !editId || !financeManagerId) return;

      setIsLoadingEditData(true);

      try {
        const { data: struct, error } = await supabase
          .from("college_fee_structure")
          .select("*")
          .eq("feeStructureId", editId)
          .single();

        if (error || !struct) return;

        setSelectedBranch(struct.collegeBranchId);

        if (struct.collegeSessionId) {
          const { data: sessionData } = await supabase
            .from("college_session")
            .select("startYear, endYear")
            .eq("collegeSessionId", struct.collegeSessionId)
            .single();

          if (sessionData) {
            setSessionStart(String(sessionData.startYear));
            setSessionEnd(String(sessionData.endYear));
          }
        }

        let formattedForInput = "";
        if (struct.dueDate) {
          const dateObj = new Date(struct.dueDate);
          const yyyy = dateObj.getFullYear();
          const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
          const dd = String(dateObj.getDate()).padStart(2, "0");
          formattedForInput = `${yyyy}-${mm}-${dd}`;
        }

        if (struct.gstPercentage > 0) {
          setGstValue(`${struct.gstPercentage}%`);
        }

        setMetaData({
          dueDate: formattedForInput,
          lateFee: String(struct.lateFeePerDay),
          remarks: struct.remarks || "",
        });

        const { data: comps } = await supabase
          .from("college_fee_components")
          .select(`*, fee_type_master ( feeTypeName )`)
          .eq("feeStructureId", editId)
          .eq("isActive", true);

        if (comps) {
          const newFeeValues: Record<string, string> = {};
          const newCustomFees: { id: string; label: string }[] = [];

          comps.forEach((c) => {
            const name = c.fee_type_master?.feeTypeName;
            const amount = String(c.amount);

            if (name === "Tuition Fee") newFeeValues["TUITION"] = amount;
            else if (name === "Laboratory Fee") newFeeValues["LAB"] = amount;
            else if (name === "Library Fee") newFeeValues["LIBRARY"] = amount;
            else if (name === "Examination Fee") newFeeValues["EXAM"] = amount;
            else if (name === "Hostel Accommodation Fee") {
              newFeeValues["HOSTEL"] = amount;
              setShowHostelFee(true);
            } else if (name === "Miscellaneous Fee") {
              newFeeValues["MISC"] = amount;
              setShowMiscFee(true);
            } else if (name !== "GST") {
              const customId = name.toUpperCase().replace(/\s+/g, "_");
              newCustomFees.push({ id: customId, label: name });
              newFeeValues[customId] = amount;
            }
          });

          setFeeValues(newFeeValues);
          setCustomFees(newCustomFees);
          setCreatedFeeOptions((prev) => [...prev, ...newCustomFees]);
        }
      } catch (err) {
        console.error("Error loading edit data", err);
        toast.error("Failed to load details for editing");
      } finally {
        setIsLoadingEditData(false);
      }
    };

    if (financeManagerId) {
      loadEditData();
    }
  }, [editMode, editId, financeManagerId]);

  useEffect(() => {
    let total = 0;
    if (feeValues["TUITION"]) total += Number(feeValues["TUITION"]);
    if (feeValues["LAB"]) total += Number(feeValues["LAB"]);
    if (feeValues["LIBRARY"]) total += Number(feeValues["LIBRARY"]);
    if (feeValues["EXAM"]) total += Number(feeValues["EXAM"]);
    if (showHostelFee && feeValues["HOSTEL"])
      total += Number(feeValues["HOSTEL"]);
    if (showMiscFee && feeValues["MISC"]) total += Number(feeValues["MISC"]);

    customFees.forEach((fee) => {
      if (feeValues[fee.id]) total += Number(feeValues[fee.id]);
    });

    if (gstValue) {
      const gstPercent = Number(gstValue.replace(/\D/g, ""));
      if (gstPercent > 0) {
        total = total + total * (gstPercent / 100);
      }
    }
    setTotalFee(Math.round(total));
  }, [feeValues, showHostelFee, showMiscFee, customFees, gstValue]);

  useEffect(() => {
    const loadFinanceStructure = async () => {
      if (!userId) return;
      try {
        const data = await getFinanceCollegeStructure(userId);
        setCollegeName(data.collegeName);
        setEducationType(data.educationType);
        setCollegeId(data.collegeId);
        setCollegeEducationId(data.collegeEducationId);
        setBranches(data.branches);

        if (data.collegeId) {
          const { data: sessionData } = await supabase
            .from("college_session")
            .select("*")
            .eq("collegeId", data.collegeId)
            .eq("is_deleted", false)
            .order("startYear", { ascending: false });

          if (sessionData) setAvailableSessions(sessionData);
        }

        const { data: fmData } = await supabase
          .from("finance_manager")
          .select("financeManagerId")
          .eq("userId", userId)
          .single();

        if (fmData) setFinanceManagerId(fmData.financeManagerId);
      } catch (err) {
        console.error("Error loading structure:", err);
        toast.error("Failed to load college data");
      }
    };
    loadFinanceStructure();
  }, [userId]);

  const handleAddCustomFeeOption = () => {
    if (newFeeName.trim()) {
      const newId = newFeeName.toUpperCase().replace(/\s+/g, "_");
      const newLabel = newFeeName.trim();
      if (!createdFeeOptions.find((f) => f.id === newId)) {
        setCreatedFeeOptions((prev) => [
          ...prev,
          { id: newId, label: newLabel },
        ]);
      }
      if (!customFees.find((f) => f.id === newId)) {
        setCustomFees((prev) => [...prev, { id: newId, label: newLabel }]);
      }
      setNewFeeName("");
      setShowCreateBox(false);
    }
  };

  const handleDropdownChange = (value: string) => {
    if (value === "") return;
    if (value === "__CREATE__") {
      setShowCreateBox(true);
      return;
    }
    if (value === "HOSTEL") {
      setShowHostelFee((prev) => !prev);
    } else if (value === "MISC") {
      setShowMiscFee((prev) => !prev);
    } else {
      const option = createdFeeOptions.find((f) => f.id === value);
      if (option) {
        const isVisible = customFees.find((f) => f.id === value);
        if (isVisible) {
          setCustomFees((prev) => prev.filter((f) => f.id !== value));
          setFeeValues((prev) => {
            const n = { ...prev };
            delete n[value];
            return n;
          });
        } else {
          setCustomFees((prev) => [...prev, option]);
        }
      }
    }
  };

  const handleSaveFeeStructure = async () => {
    if (
      !selectedBranch ||
      !sessionStart ||
      !sessionEnd ||
      !financeManagerId ||
      !collegeId ||
      !collegeEducationId
    ) {
      toast.error(
        "Missing required fields (Branch, Session Years, or College ID)",
      );
      return;
    }

    if (sessionStart.length !== 4 || sessionEnd.length !== 4) {
      toast.error("Please enter valid 4-digit years for session");
      return;
    }
    if (Number(sessionStart) > Number(sessionEnd)) {
      toast.error("Start year cannot be greater than end year");
      return;
    }

    let formattedDueDate = new Date().toISOString();
    if (metaData.dueDate) {
      if (metaData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDueDate = new Date(metaData.dueDate).toISOString();
      } else if (metaData.dueDate.includes("/")) {
        const [day, month, year] = metaData.dueDate.split("/");
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime())) {
          formattedDueDate = dateObj.toISOString();
        }
      }
    }

    setIsSaving(true);

    try {
      const {
        success: sessionSuccess,
        collegeSessionId,
        error: sessionError,
      } = await getOrCreateCollegeSession(
        collegeId,
        Number(sessionStart),
        Number(sessionEnd),
      );

      if (!sessionSuccess || !collegeSessionId) {
        throw new Error("Failed to create session: " + sessionError?.message);
      }

      const {
        success: structSuccess,
        feeStructureId,
        error: structError,
      } = await saveCollegeFeeStructure(
        {
          collegeId: collegeId,
          collegeEducationId: collegeEducationId,
          collegeBranchId: selectedBranch,
          collegeSessionId: collegeSessionId,
          dueDate: formattedDueDate,
          lateFeePerDay: metaData.lateFee
            ? Number(metaData.lateFee.replace(/\D/g, ""))
            : 0,
          remarks: metaData.remarks,
        },
        financeManagerId,
      );

      if (!structSuccess || !feeStructureId) {
        throw new Error(
          "Failed to save fee structure: " + structError?.message,
        );
      }

      const componentsToSave: { label: string; amount: number }[] = [];
      let runningTotalForGst = 0;

      const pushFee = (label: string, valueKey: string) => {
        const rawVal = feeValues[valueKey];
        const val = Number(rawVal);
        if (val > 0) {
          componentsToSave.push({ label, amount: val });
          runningTotalForGst += val;
        }
      };

      pushFee("Tuition Fee", "TUITION");
      pushFee("Laboratory Fee", "LAB");
      pushFee("Library Fee", "LIBRARY");
      pushFee("Examination Fee", "EXAM");

      if (showHostelFee) pushFee("Hostel Accommodation Fee", "HOSTEL");
      if (showMiscFee) pushFee("Miscellaneous Fee", "MISC");
      customFees.forEach((fee) => pushFee(fee.label, fee.id));

      if (gstValue) {
        const gstPercent = Number(gstValue.replace(/\D/g, ""));
        if (gstPercent > 0 && runningTotalForGst > 0) {
          const gstAmount = Math.round(runningTotalForGst * (gstPercent / 100));
          componentsToSave.push({ label: "GST", amount: gstAmount });
        }
      }

      if (componentsToSave.length === 0) {
        toast("No fee amounts entered", { icon: "⚠️" });
        setIsSaving(false);
        return;
      }

      for (const comp of componentsToSave) {
        const { success: typeSuccess, feeTypeId } = await saveFeeType(
          comp.label,
        );
        if (typeSuccess && feeTypeId) {
          await saveFeeComponent({
            feeStructureId: feeStructureId,
            feeTypeId: feeTypeId,
            amount: comp.amount,
          });
        }
      }

      toast.success("Fee Structure Saved Successfully!");

      setFeeValues({});
      setTotalFee(0);
      setGstValue("");
      setMetaData({ dueDate: "", lateFee: "", remarks: "" });
      setSelectedBranch(null);
      setSessionStart("");
      setSessionEnd("");
      setShowHostelFee(false);
      setShowMiscFee(false);
      setCustomFees([]);
    } catch (error: any) {
      console.error(error);
      toast.error("Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAdditionalDues = async () => {
    if (
      !selectedBranch ||
      !selectedSessionId ||
      !financeManagerId ||
      !collegeId ||
      !collegeEducationId
    ) {
      toast.error("Missing required fields (Branch, Session, or College ID)");
      return;
    }

    let formattedDueDate = new Date().toISOString();
    if (additionalMetaData.dueDate) {
      if (additionalMetaData.dueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDueDate = new Date(additionalMetaData.dueDate).toISOString();
      } else if (additionalMetaData.dueDate.includes("/")) {
        const [day, month, year] = additionalMetaData.dueDate.split("/");
        const dateObj = new Date(`${year}-${month}-${day}`);
        if (!isNaN(dateObj.getTime())) {
          formattedDueDate = dateObj.toISOString();
        }
      }
    }

    setIsSaving(true);

    try {
      const structResult = await saveAdditionalFeeStructure(
        {
          collegeEducationId: collegeEducationId,
          collegeBranchId: selectedBranch,
          collegeSessionId: Number(selectedSessionId),
          dueDate: formattedDueDate,
          lateFeePerDay: additionalMetaData.lateFee
            ? Number(additionalMetaData.lateFee.replace(/\D/g, ""))
            : 0,
          remarks: additionalMetaData.remarks || undefined,
        },
        financeManagerId,
      );

      if (!structResult.success || !structResult.additionalFeeStructureId) {
        throw new Error("Failed to save additional fee structure");
      }

      for (const due of additionalDuesList) {
        const compResult = await saveAdditionalFeeComponent({
          additionalFeeStructureId: structResult.additionalFeeStructureId,
          department: due.dept,
          courseType: due.course,
          amount: due.amount,
        });

        if (!compResult.success) {
          console.error("Failed to save component:", due.dept);
          toast.error(`Failed to save ${due.dept} component`);
        }
      }

      toast.success("Additional Dues Saved Successfully!");

      // 3. Reset UI state
      setAdditionalDuesList([]);
      setAdditionalMetaData({ dueDate: "", lateFee: "", remarks: "" });
      setSelectedSessionId("");
      setSelectedBranch(null);
    } catch (err: any) {
      console.error("Save Additional Dues Error:", err);
      toast.error("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingEditData) {
    return (
      <>
        <div className="bg-red-00 flex">
          <AddFeeHeader button={false} />
        </div>
        <CreateFeeSkeleton />
      </>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-8 w-[600px] max-w-[95vw]"
            >
              <div className="flex justify-between items-center mb-6 ">
                <h2 className="text-xl font-bold text-[#282828]">
                  Add Fee Component
                </h2>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X size={24} weight="bold" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-[#282828]">
                <div className="flex flex-col">
                  <label className="text-[#282828] font-medium mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Aptitude"
                    value={addDept}
                    onChange={(e) => setAddDept(e.target.value)}
                    className="border border-[#C4C4C4] p-2 rounded-md focus:outline-none focus:border-[#58AE77]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-[#282828] font-medium mb-1">
                    Course Type
                  </label>
                  <input
                    type="text"
                    placeholder="Aptitude Training"
                    value={addCourseType}
                    onChange={(e) => setAddCourseType(e.target.value)}
                    className="border border-[#C4C4C4] p-2 rounded-md focus:outline-none focus:border-[#58AE77]"
                  />
                </div>
              </div>

              <div className="flex flex-col mb-8 text-[#282828]">
                <label className="text-[#282828] font-medium mb-1">
                  Amount
                </label>
                <input
                  type="text"
                  placeholder="eg:3000"
                  value={addAmount}
                  onChange={(e) =>
                    setAddAmount(e.target.value.replace(/\D/g, ""))
                  }
                  className="border border-[#C4C4C4] p-2 rounded-md focus:outline-none focus:border-[#58AE77]"
                />
              </div>

              <button
                onClick={handleSaveModalComponent}
                className="w-full bg-[#58AE77] hover:bg-[#469160] text-white font-medium py-3 rounded-md transition-colors"
              >
                Save Additional Due
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-red-00 flex flex-col">
        <div className="bg-red-00 flex">
          <AddFeeHeader button={false} />
        </div>

        <div className="flex justify-center my-6 w-full">
          <div className="flex items-center gap-4 bg-white p-1.5 rounded-full shadow-sm border border-gray-100">
            {(["academic", "additional"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2 cursor-pointer rounded-full font-medium text-sm transition-colors duration-200 z-10
                      ${activeTab === tab ? "text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                    `}
              >
                {tab === "academic" ? "Academic Fees" : "Additional Dues"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab-pill"
                    className={`absolute inset-0 rounded-full -z-10 ${tab === "academic" ? "bg-[#58AE77]" : "bg-[#58AE77]"}`}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white mt-1 rounded-md p-6 flex flex-wrap justify-between gap-2 shadow-sm">
          <div className="flex flex-wrap justify-between w-[100%] gap-4">
            <div className="flex flex-col w-[49%]">
              <label className="text-[#282828] font-medium">College Name</label>
              <input
                type="text"
                value={collegeName}
                readOnly
                className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed bg-gray-50"
              />
            </div>
            <div className="flex flex-col w-[49%]">
              <label className="text-[#282828] font-medium">
                Education Type
              </label>
              <input
                type="text"
                value={educationType}
                readOnly
                className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed bg-gray-50"
              />
            </div>
            <div className="flex flex-col w-[49%]">
              <label className="font-medium text-[#282828]">Branch</label>
              <select
                value={selectedBranch ?? ""}
                onChange={(e) => setSelectedBranch(Number(e.target.value))}
                className="border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 text-[#898989]"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option
                    key={branch.collegeBranchId}
                    value={branch.collegeBranchId}
                  >
                    {branch.collegeBranchCode}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-[49%]">
              <label className="font-medium text-[#282828]">
                Academic Session
              </label>
              {activeTab === "academic" ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="From"
                    value={sessionStart}
                    onChange={(e) =>
                      setSessionStart(
                        e.target.value.replace(/\D/g, "").slice(0, 4),
                      )
                    }
                    className={`w-1/2 border border-[#C4C4C4] p-2 rounded-md text-[#898989] focus:outline-none 
                           ${!selectedBranch ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    disabled={!selectedBranch}
                  />
                  <span className="text-gray-400 font-bold">-</span>
                  <input
                    type="text"
                    placeholder="To"
                    value={sessionEnd}
                    onChange={(e) =>
                      setSessionEnd(
                        e.target.value.replace(/\D/g, "").slice(0, 4),
                      )
                    }
                    className={`w-1/2 border border-[#C4C4C4] p-2 rounded-md text-[#898989] focus:outline-none 
                           ${!selectedBranch ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    disabled={!selectedBranch}
                  />
                </div>
              ) : (
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className={`border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 text-[#898989] 
                      ${!selectedBranch ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  disabled={!selectedBranch}
                >
                  <option value="">Select Academic Session</option>
                  {availableSessions.map((session) => (
                    <option
                      key={session.collegeSessionId}
                      value={session.collegeSessionId}
                    >
                      {session.sessionName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div
            className={`w-full transition-opacity duration-300 ${activeTab === "academic" ? "block" : "hidden"}`}
          >
            <div className="flex flex-col w-full mt-4">
              <div className="bg-blue-00 flex justify-between items-center w-full">
                <h4 className="text-[#282828] font-medium text-lg">
                  Fee Components
                </h4>
                <div className="bg-blue-00 flex items-center justify-end gap-2 w-1/2">
                  {!showCreateBox ? (
                    <div className="relative ">
                      <div
                        className="relative w-50 bg-[#16284F] pl-5 pr-12 py-2 rounded-lg text-white text-lg overflow-hidden cursor-pointer flex items-center h-[46px]"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                      >
                        <span className="whitespace-nowrap">Choose More</span>
                        <CaretDown
                          size={22}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                        />
                      </div>
                      <select
                        value=""
                        onChange={(e) => handleDropdownChange(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer h-full"
                      >
                        <option
                          value=""
                          disabled
                          style={{
                            backgroundColor: "#FFFFFF",
                            color: "#16284F",
                          }}
                        >
                          Choose More
                        </option>
                        <option
                          value="HOSTEL"
                          style={{
                            backgroundColor: "#FFFFFF",
                            color: "#16284F",
                          }}
                        >
                          {showHostelFee ? "✓ " : ""} Hostel Accommodation Fee
                        </option>
                        <option
                          value="MISC"
                          style={{
                            backgroundColor: "#FFFFFF",
                            color: "#16284F",
                          }}
                        >
                          {showMiscFee ? "✓ " : ""} Miscellaneous Fee
                        </option>
                        {createdFeeOptions.map((fee) => {
                          const isActive = customFees.find(
                            (f) => f.id === fee.id,
                          );
                          return (
                            <option
                              key={fee.id}
                              value={fee.id}
                              style={{
                                backgroundColor: "#FFFFFF",
                                color: "#16284F",
                              }}
                            >
                              {isActive ? "✓ " : ""} {fee.label}
                            </option>
                          );
                        })}
                        <option
                          value="__CREATE__"
                          style={{
                            backgroundColor: "#FFFFFF",
                            color: "#16284F",
                            fontWeight: "600",
                            borderTop: "1px solid #eee",
                          }}
                        >
                          + Create New Fee
                        </option>
                      </select>
                    </div>
                  ) : (
                    <div className="relative lg:w-[85%] flex gap-2 h-[46px]">
                      <div className="flex-1 relative h-full">
                        <input
                          type="text"
                          autoFocus
                          value={newFeeName}
                          onChange={(e) => setNewFeeName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddCustomFeeOption();
                          }}
                          placeholder="Enter Fee Name"
                          className="w-full h-full border border-[#16284F] bg-[#F5F7FA] pl-3 pr-2 rounded-lg text-[#16284F] focus:outline-none placeholder:text-gray-400"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCustomFeeOption}
                        className="h-full px-4 bg-[#58AE77] text-white rounded-md hover:bg-[#469160] transition-colors flex items-center gap-1 font-medium"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateBox(false)}
                        className="h-full px-3 border border-[#FF3131] text-[#FF3131] rounded-md hover:bg-red-50 transition-colors flex items-center justify-center"
                      >
                        <X size={20} weight="bold" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-red-00 flex flex-wrap justify-between mt-3 gap-4">
                <div className="flex flex-col w-[49%]">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">
                      Tution Fee
                    </label>
                  </div>
                  <input
                    type="text"
                    value={feeValues["TUITION"] || ""}
                    onChange={(e) => handleFeeChange("TUITION", e.target.value)}
                    placeholder="Ex: 85000"
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>
                <div className="flex flex-col w-[49%]">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">
                      Laboratory Fee
                    </label>
                  </div>
                  <input
                    type="text"
                    value={feeValues["LAB"] || ""}
                    onChange={(e) => handleFeeChange("LAB", e.target.value)}
                    placeholder="Ex: 5000"
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>
                <div className="flex flex-col w-[49%]">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">
                      Library Fee
                    </label>
                  </div>
                  <input
                    type="text"
                    value={feeValues["LIBRARY"] || ""}
                    onChange={(e) => handleFeeChange("LIBRARY", e.target.value)}
                    placeholder="Ex: 100"
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>
                <div className="flex flex-col w-[49%]">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">
                      Examination Fee
                    </label>
                  </div>
                  <input
                    type="text"
                    value={feeValues["EXAM"] || ""}
                    onChange={(e) => handleFeeChange("EXAM", e.target.value)}
                    placeholder="Ex: 2000"
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>

                {showHostelFee && (
                  <div className="flex flex-col w-[49%]">
                    <div className="flex items-center justify-between">
                      <label className="text-[#282828] font-medium">
                        Hostel Accomodation Fee
                      </label>
                      <MinusCircleIcon
                        size={18}
                        weight="fill"
                        className="text-[#FF3131] cursor-pointer"
                        onClick={() => setShowHostelFee(false)}
                      />
                    </div>
                    <input
                      type="text"
                      value={feeValues["HOSTEL"] || ""}
                      onChange={(e) =>
                        handleFeeChange("HOSTEL", e.target.value)
                      }
                      placeholder="Ex: 5000"
                      className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                    />
                  </div>
                )}

                {showMiscFee && (
                  <div className="flex flex-col w-[49%]">
                    <div className="flex items-center justify-between">
                      <label className="text-[#282828] font-medium">
                        Miscellaneous Fee
                      </label>
                      <MinusCircleIcon
                        size={18}
                        weight="fill"
                        className="text-[#FF3131] cursor-pointer"
                        onClick={() => setShowMiscFee(false)}
                      />
                    </div>
                    <input
                      type="text"
                      value={feeValues["MISC"] || ""}
                      onChange={(e) => handleFeeChange("MISC", e.target.value)}
                      placeholder="Ex: 1000"
                      className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                    />
                  </div>
                )}

                {customFees.map((fee) => (
                  <div key={fee.id} className="flex flex-col w-[49%]">
                    <div className="flex items-center justify-between">
                      <label className="text-[#282828] font-medium">
                        {fee.label}
                      </label>
                      <MinusCircleIcon
                        size={18}
                        weight="fill"
                        className="text-[#FF3131] cursor-pointer"
                        onClick={() => {
                          setCustomFees((prev) =>
                            prev.filter((f) => f.id !== fee.id),
                          );
                          setFeeValues((prev) => {
                            const n = { ...prev };
                            delete n[fee.id];
                            return n;
                          });
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={feeValues[fee.id] || ""}
                      onChange={(e) => handleFeeChange(fee.id, e.target.value)}
                      placeholder="Enter amount"
                      className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                    />
                  </div>
                ))}

                <div className="flex flex-col w-[49%]">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">GST</label>
                  </div>
                  <input
                    type="text"
                    value={gstValue}
                    onChange={(e) => setGstValue(e.target.value)}
                    placeholder="Ex: 18%"
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>
              </div>
            </div>

            <div className="bg-pink-00 w-full mt-4 flex flex-col items-start">
              <h4 className="font-medium text-[#282828]">
                Due & Late Fee Details
              </h4>
              <div className="bg-yellow-00 w-full flex flex-wrap justify-between mt-3">
                <div className="flex flex-col w-[49%]">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">
                      Due Date
                    </label>
                  </div>
                  <input
                    type="date"
                    value={metaData.dueDate}
                    onChange={(e) =>
                      handleMetaChange("dueDate", e.target.value)
                    }
                    placeholder="DD/MM/YYYY"
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>
                <div className="flex flex-col w-[49%]">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">
                      Late Fee Rule
                    </label>
                  </div>
                  <input
                    type="text"
                    value={metaData.lateFee}
                    onChange={(e) =>
                      handleMetaChange("lateFee", e.target.value)
                    }
                    onChangeCapture={handleIntegerInput}
                    placeholder="₹___ /day after due date"
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>
                <div className="flex flex-col w-[100%] mt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[#282828] font-medium">
                      Remarks (Optional)
                    </label>
                  </div>
                  <input
                    type="text"
                    value={metaData.remarks}
                    onChange={(e) =>
                      handleMetaChange("remarks", e.target.value)
                    }
                    placeholder={`Ex “Applicable for all students of ${new Date().getFullYear()} batch.”`}
                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                  />
                </div>
                <div className="bg-red-00 w-full mt-5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-[#16284F] font-bold">Total Fee:</h4>
                    <div className="p-1 px-4 border border-[#919191] rounded-md">
                      <p className="text-[#23B362] font-bold text-md">
                        ₹ {totalFee.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full flex items-center justify-center mt-5">
                  <button
                    onClick={handleSaveFeeStructure}
                    disabled={isSaving}
                    className={`px-5 py-2 font-medium text-[#EFEFEF] rounded-md cursor-pointer transition-colors ${
                      isSaving
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#58AE77] hover:bg-[#469160]"
                    }`}
                  >
                    {isSaving ? "Saving..." : "Save Fee Structure"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`w-full transition-opacity duration-300 mt-4 ${activeTab === "additional" ? "block" : "hidden"}`}
          >
            <div className="flex flex-col w-full animate-in fade-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center w-full mb-4">
                <h4 className="text-[#282828] font-semibold text-lg">
                  Fee Components
                </h4>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#1F2F56] cursor-pointer hover:bg-[#15203D] text-white px-5 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
                >
                  Add More
                </button>
              </div>

              {additionalDuesList.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {additionalDuesList.map((due) => (
                    <div
                      key={due.id}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 relative p-4 bg-gray-50/50 border border-gray-100 rounded-lg group"
                    >
                      <button
                        onClick={() => handleRemoveAdditionalDue(due.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Component"
                      >
                        <MinusCircleIcon size={20} weight="fill" />
                      </button>

                      <div className="flex flex-col">
                        <label className="text-[#282828] font-medium mb-1 text-sm">
                          Department
                        </label>
                        <input
                          value={due.dept}
                          readOnly
                          className="border border-gray-200 p-2 rounded-md text-gray-600 bg-white outline-none text-sm"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[#282828] font-medium mb-1 text-sm">
                          Course Type
                        </label>
                        <input
                          value={due.course}
                          readOnly
                          className="border border-gray-200 p-2 rounded-md text-gray-600 bg-white outline-none text-sm"
                        />
                      </div>
                      <div className="flex flex-col pr-6">
                        <label className="text-[#282828] font-medium mb-1 text-sm">
                          Amount
                        </label>
                        <input
                          value={due.amount}
                          readOnly
                          className="border border-gray-200 p-2 rounded-md text-gray-600 bg-white outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full py-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 mb-6 bg-gray-50/30">
                  <p className="text-sm">No additional components added yet.</p>
                  <p className="text-xs mt-1">Click "Add More" to start.</p>
                </div>
              )}

              <div className="bg-pink-00 w-full mt-2 flex flex-col items-start pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-[#282828]">
                  Due & Late Fee Details
                </h4>
                <div className="w-full flex flex-wrap justify-between mt-3">
                  <div className="flex flex-col w-[49%]">
                    <label className="text-[#282828] font-medium mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={additionalMetaData.dueDate}
                      onChange={(e) =>
                        handleAdditionalMetaChange("dueDate", e.target.value)
                      }
                      className="border border-[#C4C4C4] p-2 px-3 rounded-md text-[#898989] focus:outline-none focus:border-[#58AE77]"
                    />
                  </div>
                  <div className="flex flex-col w-[49%]">
                    <label className="text-[#282828] font-medium mb-2">
                      Late Fee Rule
                    </label>
                    <input
                      type="text"
                      value={additionalMetaData.lateFee}
                      onChange={(e) =>
                        handleAdditionalMetaChange("lateFee", e.target.value)
                      }
                      onChangeCapture={handleIntegerInput}
                      placeholder="₹___ /day after due date"
                      className="border border-[#C4C4C4] p-2 px-3 rounded-md text-[#898989] focus:outline-none focus:border-[#58AE77]"
                    />
                  </div>
                  <div className="flex flex-col w-[100%] mt-4">
                    <label className="text-[#282828] font-medium mb-2">
                      Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={additionalMetaData.remarks}
                      onChange={(e) =>
                        handleAdditionalMetaChange("remarks", e.target.value)
                      }
                      placeholder={`e.g., “Applicable for all students of ${new Date().getFullYear()} batch.”`}
                      className="border border-[#C4C4C4] p-2 px-3 rounded-md text-[#898989] focus:outline-none focus:border-[#58AE77]"
                    />
                  </div>

                  {/* TOTAL DISPLAY */}
                  <div className="w-full mt-6 flex items-center">
                    <h4 className="text-[#16284F] font-bold text-md mr-4">
                      Total Fee :
                    </h4>
                    <div className=" py-1 px-6 border-2 border-gray-300 rounded-lg bg-white shadow-sm">
                      <p className="text-[#23B362] font-bold text-md">
                        ₹ {additionalTotalFee.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="w-full flex items-center justify-center mt-8 pb-4">
                    <button
                      onClick={handleSaveAdditionalDues}
                      disabled={additionalDuesList.length === 0 || isSaving}
                      className={`px-8 py-3 text-lg font-medium text-white rounded-md transition-colors shadow-sm
                        ${
                          additionalDuesList.length === 0 || isSaving
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-[#58AE77] hover:bg-[#469160]"
                        }`}
                    >
                      {isSaving ? "Saving..." : "Save Additional Due"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
