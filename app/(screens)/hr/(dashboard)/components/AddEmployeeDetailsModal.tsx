// "use client";

// import React from "react";

// interface AddEmployeeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function AddEmployeeModal({
//   isOpen,
//   onClose,
// }: AddEmployeeModalProps) {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-lg w-full max-w-[900px] max-h-[95vh] overflow-y-auto p-6 shadow-2xl custom-scrollbar flex flex-col gap-4">
//         <h2 className="text-[18px] font-bold text-[#333]">
//           Add Employee Details
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* PERSONAL INFORMATION */}
//           <div className="border border-gray-200 rounded-lg p-4">
//             <h3 className="text-[#43C17A] font-semibold text-[14px] mb-4">
//               Personal Information
//             </h3>
//             <div className="flex flex-col gap-3 text-[13px]">
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[120px]">
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   defaultValue="Harsha Sharma"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[120px]">
//                   Branch
//                 </label>
//                 <input
//                   type="text"
//                   defaultValue="CSE"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[120px]">
//                   Mobile
//                 </label>
//                 <input
//                   type="text"
//                   defaultValue="9076544897"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[120px]">Email</label>
//                 <input
//                   type="text"
//                   defaultValue="harshasharma@123"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[120px]">
//                   Date of Joining
//                 </label>
//                 <input
//                   type="text"
//                   defaultValue="12 July 2019"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[120px]">
//                   Experience
//                 </label>
//                 <input
//                   type="text"
//                   defaultValue="6 Years"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-start mt-1">
//                 <label className="font-bold text-[#333] w-[130px]">
//                   Gender
//                 </label>
//                 <div className="flex items-center gap-4 flex-1">
//                   <label className="flex items-center gap-1.5 cursor-pointer text-[#555]">
//                     <input
//                       type="radio"
//                       name="gender"
//                       className="w-3.5 h-3.5 accent-[#43C17A]"
//                     />{" "}
//                     Female
//                   </label>
//                   <label className="flex items-center gap-1.5 cursor-pointer text-[#555]">
//                     <input
//                       type="radio"
//                       name="gender"
//                       className="w-3.5 h-3.5 accent-[#43C17A]"
//                     />{" "}
//                     Male
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* PAYMENT INFORMATION */}
//           <div className="border border-gray-200 rounded-lg p-4">
//             <h3 className="text-[#43C17A] font-semibold text-[14px] mb-4">
//               Payment Information
//             </h3>
//             <div className="flex flex-col gap-3 text-[13px]">
//               <div className="flex items-center justify-between mb-1">
//                 <label className="font-bold text-[#333] w-[140px]">
//                   Salary Payment Mode
//                 </label>
//                 <select className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A] bg-white">
//                   <option>Bank Transfer</option>
//                 </select>
//               </div>

//               <h4 className="text-[#16284F] font-bold text-[13px] mt-1">
//                 Bank Information
//               </h4>

//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[140px]">
//                   Bank Name
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter Bank Name"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[140px]">
//                   Account Number
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter account number"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[140px]">
//                   IFSC Code
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter IFSC Code"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[140px]">
//                   Name on the Account
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter name on the account"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//               <div className="flex items-center justify-between">
//                 <label className="font-bold text-[#333] w-[140px]">
//                   Branch
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="N/A"
//                   className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* IDENTITY & BANK INFORMATION */}
//         <div className="border border-gray-200 rounded-lg p-4">
//           <h3 className="text-[#43C17A] font-semibold text-[14px] mb-4">
//             Identity & Bank Information
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
//             {/* Left Column - Aadhaar */}
//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">
//                 Aadhaar Number
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter Aadhaar number"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>
//             {/* Right Column - PAN */}
//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">
//                 Permanent Account Number
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter IFSC Code"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">
//                 Date of Birth
//               </label>
//               <input
//                 type="date"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 text-gray-500 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">
//                 Date of Birth :
//               </label>
//               <input
//                 type="date"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 text-gray-500 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">Address</label>
//               <input
//                 type="text"
//                 placeholder="Enter address"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">Name :</label>
//               <input
//                 type="text"
//                 placeholder="Enter Name"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">
//                 Enrollment Number
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter enrollment"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>
//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">
//                 Father's Name :
//               </label>
//               <input
//                 type="text"
//                 placeholder="Enter Father's Name"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <label className="font-bold text-[#333] w-[130px]">Name</label>
//               <input
//                 type="text"
//                 placeholder="Enter name"
//                 className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
//               />
//             </div>

//             {/* Empty space for grid alignment to push buttons to bottom right */}
//             <div className="flex justify-end gap-3 mt-4 md:col-start-2 md:row-start-5 md:row-span-2 items-end">
//               <button
//                 onClick={onClose}
//                 className="px-8 py-2 bg-gray-200 hover:bg-gray-300 text-[#333] font-bold rounded transition-colors"
//               >
//                 Cancel
//               </button>
//               <button className="px-8 py-2 bg-[#43C17A] hover:bg-[#3ba869] text-white font-bold rounded transition-colors">
//                 Save Employee
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  saveEmployeeOnboardingDetails,
  StaffOnboardingRecord,
} from "@/lib/helpers/Hr/dashboard/onboardingAPI";
import React, { useState } from "react";
import toast from "react-hot-toast";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: StaffOnboardingRecord;
  onSuccess: () => void;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: AddEmployeeModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Payment
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    branch: "",
    // Aadhaar
    aadhaarNumber: "",
    aadhaarDob: "",
    address: "",
    enrollmentNumber: "",
    nameOnAadhaar: "",
    gender: "",
    // PAN
    panNumber: "",
    panDob: "",
    nameOnPan: "",
    fatherName: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    setFormData({
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      accountHolderName: "",
      branch: "",
      aadhaarNumber: "",
      aadhaarDob: "",
      address: "",
      enrollmentNumber: "",
      nameOnAadhaar: "",
      gender: "",
      panNumber: "",
      panDob: "",
      nameOnPan: "",
      fatherName: "",
    });

    onClose();
  };
  const handleSave = async () => {
    // 1. Basic Validations
    if (
      !formData.bankName ||
      !formData.accountNumber ||
      !formData.ifscCode ||
      !formData.accountHolderName
    ) {
      toast.error("Please fill in all mandatory Bank Details.");
      return;
    }
    if (
      formData.aadhaarNumber.length !== 12 ||
      isNaN(Number(formData.aadhaarNumber))
    ) {
      toast.error("Aadhaar Number must be exactly 12 digits.");
      return;
    }
    if (formData.panNumber.length !== 10) {
      toast.error("PAN Number must be exactly 10 characters.");
      return;
    }
    if (!formData.aadhaarDob || !formData.panDob) {
      toast.error("Please provide both Dates of Birth.");
      return;
    }
    if (
      !formData.nameOnAadhaar ||
      !formData.nameOnPan ||
      !formData.fatherName
    ) {
      toast.error("Please provide all mandatory Identity names.");
      return;
    }

    // 2. Submit
    setIsSaving(true);
    const toastId = toast.loading("Saving employee details...");

    const result = await saveEmployeeOnboardingDetails(user.userId, formData);

    if (result.success) {
      toast.success("Employee onboarded successfully!", { id: toastId });
      onSuccess(); // Refresh the parent table
      // Wait 2 seconds before closing
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 2000);
    } else {
      toast.error(result.error || "Failed to onboard employee.", {
        id: toastId,
      });
      setIsSaving(false);
    }
  };

  // Helper for read-only fields
  const ReadOnlyInput = ({ value }: { value: string }) => (
    <input
      type="text"
      readOnly
      value={value}
      className="bg-gray-50 border border-gray-200 text-gray-500 rounded px-2.5 py-1.5 flex-1 cursor-not-allowed outline-none font-medium"
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg w-full max-w-[900px] max-h-[95vh] overflow-y-auto p-6 shadow-2xl custom-scrollbar flex flex-col gap-4 relative text-[#282828]">
        <h2 className="text-[18px] font-bold text-[#333]">
          Add Employee Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PERSONAL INFORMATION (Pre-filled & Read-Only) */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-[#43C17A] font-semibold text-[14px] mb-4">
              Personal Information
            </h3>
            <div className="flex flex-col gap-3 text-[13px]">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[120px]">
                  Full Name
                </label>
                <ReadOnlyInput value={user.name} />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[120px]">
                  Branch
                </label>
                <ReadOnlyInput value={user.branch} />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[120px]">
                  Mobile
                </label>
                <ReadOnlyInput value={user.mobile} />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[120px]">Email</label>
                <ReadOnlyInput value={user.email} />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[120px]">
                  Date of Joining
                </label>
                <ReadOnlyInput value={user.joiningDate} />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[120px]">
                  Experience
                </label>
                <ReadOnlyInput value={user.experience} />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[120px]">
                  Gender
                </label>
                <ReadOnlyInput value={user.gender} />
              </div>
            </div>
          </div>

          {/* PAYMENT INFORMATION */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-[#43C17A] font-semibold text-[14px] mb-4">
              Payment Information
            </h3>
            <div className="flex flex-col gap-3 text-[13px]">
              {/* <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-[#333] w-[140px]">
                  Salary Payment Mode
                </label>
                <select className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A] bg-white cursor-pointer">
                  <option>Bank Transfer</option>
                </select>
              </div> */}

              <h4 className="text-[#16284F] font-bold text-[13px] mt-1">
                Bank Information
              </h4>

              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[140px]">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Enter Bank Name"
                  className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[140px]">
                  Account Number
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[140px]">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="Enter IFSC Code"
                  className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[140px]">
                  Name on the Account
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  placeholder="Enter name on the account"
                  className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#333] w-[140px]">
                  Branch
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="N/A"
                  className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* IDENTITY & BANK INFORMATION */}
        <div className="border border-gray-200 rounded-lg p-4 relative">
          {/* Overlay to block inputs while saving */}
          {isSaving && (
            <div className="absolute inset-0 z-10 bg-white/40 cursor-not-allowed"></div>
          )}

          <h3 className="text-[#43C17A] font-semibold text-[14px] mb-4">
            Identity & Bank Information
          </h3>
          <h4 className="font-bold text-[#333] text-[13px] mb-3">Photo ID</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
            {/* Left Column - Aadhaar */}
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">
                Aadhaar Number
              </label>
              <input
                type="text"
                maxLength={12}
                name="aadhaarNumber"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                placeholder="Enter 12-digit Aadhaar"
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
              />
            </div>
            {/* Right Column - PAN */}
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">
                Permanent Account Number
              </label>
              <input
                type="text"
                maxLength={10}
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="Enter 10-char PAN"
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A] uppercase"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">
                Date of Birth
              </label>
              <input
                type="date"
                name="aadhaarDob"
                value={formData.aadhaarDob}
                onChange={handleChange}
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A] cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">
                Date of Birth :
              </label>
              <input
                type="date"
                name="panDob"
                value={formData.panDob}
                onChange={handleChange}
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">Name :</label>
              <input
                type="text"
                name="nameOnPan"
                value={formData.nameOnPan}
                onChange={handleChange}
                placeholder="Name on PAN"
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">
                Enrollment Number
              </label>
              <input
                type="text"
                name="enrollmentNumber"
                value={formData.enrollmentNumber}
                onChange={handleChange}
                placeholder="Optional"
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">
                Father's Name :
              </label>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleChange}
                placeholder="Enter Father's Name"
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="font-bold text-[#333] w-[130px]">Name</label>
              <input
                type="text"
                name="nameOnAadhaar"
                value={formData.nameOnAadhaar}
                onChange={handleChange}
                placeholder="Name on Aadhaar"
                className="border border-gray-300 rounded px-2.5 py-1.5 flex-1 focus:outline-none focus:border-[#43C17A]"
              />
            </div>

            {/* Buttons aligned to Bottom Right */}
            <div className="flex justify-end gap-3 mt-4 md:col-start-2 md:row-start-5 md:row-span-2 items-end z-20">
              <button
                onClick={handleClose}
                disabled={isSaving}
                className={`px-8 py-2 bg-gray-200 hover:bg-gray-300 text-[#333] font-bold rounded transition-colors ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-8 py-2 bg-[#43C17A] hover:bg-[#3ba869] text-white font-bold rounded transition-all flex items-center justify-center min-w-[150px] ${isSaving ? "opacity-80 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {isSaving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Employee"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
