import { motion, AnimatePresence } from "framer-motion";
import { InputField } from "./reusableComponents";

export const AdminRegistration = () => (
  <motion.div
    initial={{ opacity: 0, x: 10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -10 }}
    className="space-y-5"
  >
    <InputField label="FullName" placeholder='e.g., "Admin Mallareddy"' />
 
    <div className="grid grid-cols-2 gap-4">
      <InputField
        label="Email Address"
        placeholder='e.g., "admin.mallareddy@gmail.com"'
      />
      <div className="flex flex-col">
        <label className="text-[#333] font-semibold text-[15px] mb-1.5">
          Phone
        </label>
        <div className="flex gap-2">
          <input
            disabled
            value="+91"
            className="border border-gray-300 rounded-lg w-16 text-center text-sm text-gray-500 bg-gray-50"
          />
          <input
            placeholder="9017632946"
            className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#49C77F]"
          />
        </div>
      </div>
    </div>
 
    <div className="grid grid-cols-2 gap-4">
      <InputField label="College ID" placeholder='e.g., "MRCE001"' />
      <InputField label="College Code" placeholder='e.g., "MRCE"' />
    </div>
 
    <div>
      <h4 className="text-[#333] font-bold text-base mb-3">Security Setup</h4>
      <InputField
        label="Password"
        type="password"
        placeholder="Minimum 8 characters..."
        className="mb-4"
      />
 
      <div className="flex items-end gap-4">
        <InputField
          label="Confirm Password"
          type="password"
          placeholder="Re-enter password..."
          className="flex-[3]"
        />
      </div>
      <button className=" my-6 bg-[#49C77F] text-white h-[42px] w-[50%] rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all">
        Save
      </button>
    </div>
  </motion.div>
);