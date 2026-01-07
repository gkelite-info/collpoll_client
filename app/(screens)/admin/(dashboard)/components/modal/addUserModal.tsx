"use client";
import React from "react";
import { X, CaretDown } from "@phosphor-icons/react";
import { createUser } from "@/lib/helpers/admin/createUser";
import { useState } from "react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    role: "STUDENT",
    departmentId: 1,

    year: 1,
    section: "A",
  });

  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-999 text-black flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-[460px] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#2D3748]">Add User</h2>
          <X
            size={18}
            weight="bold"
            className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
            onClick={onClose}
          />
        </div>
        <div className="p-5 flex flex-col gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Full Name
            </label>
            <input
              type="text"
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3EAD6F] outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">Email ID</label>
            <input
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@gmail.com"
              className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-1 focus:ring-[#3EAD6F] outline-none placeholder:text-gray-300 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">ID</label>
              <input
                type="text"
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="ID9876345678"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Contact
              </label>
              <input
                type="text"
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="9023456789"
                className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none placeholder:text-gray-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                Department
              </label>
              <div className="relative">
                <select className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600">
                  <option value={"CSE"}>CSE</option>
                  <option value={"ECE"}>ECE</option>
                  <option value={"AI"}>AI</option>
                  <option value={"MECH"}>MECH</option>
                  <option value={"CIVIL"}>CIVIL</option>
                  <option value={"IT"}>IT</option>
                  <option value={"CHEMICAL"}>CHEMICAL</option>
                  <option value={"BIOTECH"}>BIOTECH</option>
                  <option value={"AERO"}>AERO</option>
                  <option value={"ME"}>ME</option>
                  <option value={"EEE"}>EEE</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Role</label>
              <div className="relative">
                <select
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600"
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="PARENT">Parent</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Year</label>
              <div className="relative">
                <select
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600"
                  onChange={(e) =>
                    setForm({ ...form, year: Number(e.target.value) })
                  }
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">Sec</label>
              <div className="relative">
                <select
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none appearance-none bg-white text-gray-600"
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                >
                  <option value={"A"}>A section</option>
                  <option value={"B"}>B section</option>
                  <option value={"C"}>C section</option>
                  <option value={"D"}>D section</option>
                </select>
                <CaretDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-5 pb-5 pt-1 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#48C78E] cursor-pointer text-white text-sm font-bold py-2 rounded-lg hover:bg-[#3ead6f] active:scale-[0.98] transition-all"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 border cursor-pointer border-gray-200 text-gray-500 text-sm font-bold py-2 rounded-lg hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default AddUserModal;

/////////////////

// "use client";

// import React, { useState } from "react";
// import { X, CaretDown } from "@phosphor-icons/react";
// import { createUser } from "@/lib/helpers/admin/createUser";

// interface AddUserModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose }) => {
//   if (!isOpen) return null;

//   const [form, setForm] = useState({
//     fullName: "",
//     email: "",
//     mobile: "",
//     role: "STUDENT",
//     departmentId: 1,
//     year: 1,
//     section: "A",
//   });

//   const [loading, setLoading] = useState(false);

//   return (
//     <div
//       onClick={onClose}
//       className="fixed inset-0 z-999 text-black flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4"
//     >
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className="bg-white w-full max-w-[460px] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200"
//       >
//         <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100">
//           <h2 className="text-base font-bold text-[#2D3748]">Add User</h2>
//           <X
//             size={18}
//             weight="bold"
//             className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
//             onClick={onClose}
//           />
//         </div>

//         <div className="p-5 flex flex-col gap-3">
//           <div className="space-y-1">
//             <label className="text-xs font-bold text-[#2D3748]">
//               Full Name
//             </label>
//             <input
//               type="text"
//               className="w-full border border-gray-200 rounded-lg p-2 text-sm"
//               onChange={(e) => setForm({ ...form, fullName: e.target.value })}
//             />
//           </div>

//           <div className="space-y-1">
//             <label className="text-xs font-bold text-[#2D3748]">Email ID</label>
//             <input
//               type="email"
//               className="w-full border border-gray-200 rounded-lg p-2 text-sm"
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-x-4 gap-y-3">
//             <div className="space-y-1">
//               <label className="text-xs font-bold text-[#2D3748]">
//                 Contact
//               </label>
//               <input
//                 type="text"
//                 className="w-full border border-gray-200 rounded-lg p-2 text-sm"
//                 onChange={(e) => setForm({ ...form, mobile: e.target.value })}
//               />
//             </div>

//             <div className="space-y-1">
//               <label className="text-xs font-bold text-[#2D3748]">Role</label>
//               <div className="relative">
//                 <select
//                   className="w-full border border-gray-200 rounded-lg p-2 text-sm"
//                   onChange={(e) => setForm({ ...form, role: e.target.value })}
//                 >
//                   <option value="STUDENT">Student</option>
//                   <option value="FACULTY">Faculty</option>
//                   <option value="ADMIN">Admin</option>
//                 </select>
//                 <CaretDown
//                   size={12}
//                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                 />
//               </div>
//             </div>

//             <div className="space-y-1">
//               <label className="text-xs font-bold text-[#2D3748]">Year</label>
//               <select
//                 className="w-full border border-gray-200 rounded-lg p-2 text-sm"
//                 onChange={(e) =>
//                   setForm({ ...form, year: Number(e.target.value) })
//                 }
//               >
//                 <option value={1}>1st Year</option>
//                 <option value={2}>2nd Year</option>
//                 <option value={3}>3rd Year</option>
//                 <option value={4}>4th Year</option>
//               </select>
//             </div>

//             <div className="space-y-1">
//               <label className="text-xs font-bold text-[#2D3748]">
//                 Section
//               </label>
//               <select
//                 className="w-full border border-gray-200 rounded-lg p-2 text-sm"
//                 onChange={(e) => setForm({ ...form, section: e.target.value })}
//               >
//                 <option value="A">A</option>
//                 <option value="B">B</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="px-5 pb-5 pt-1 flex gap-3">
//           <button
//             onClick={async () => {
//               try {
//                 setLoading(true);
//                 await createUser({
//                   fullName: form.fullName,
//                   email: form.email,
//                   mobile: form.mobile,
//                   role: form.role as any,
//                   collegeId: 1,
//                   departmentId: form.departmentId,
//                   year: form.year,
//                   section: form.section,
//                 });
//                 onClose();
//                 window.location.reload();
//               } catch (e) {
//                 console.error(e);
//                 alert("Failed to add user");
//               } finally {
//                 setLoading(false);
//               }
//             }}
//             className="flex-1 bg-[#48C78E] text-white text-sm font-bold py-2 rounded-lg"
//           >
//             {loading ? "Saving..." : "Save"}
//           </button>

//           <button
//             onClick={onClose}
//             className="flex-1 border border-gray-200 text-gray-500 text-sm font-bold py-2 rounded-lg"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddUserModal;
