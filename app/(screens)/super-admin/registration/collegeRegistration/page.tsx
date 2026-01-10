import { motion } from "framer-motion";
import { InputField, SelectField } from "../components/reusableComponents";

export const CollegeRegistration = () => (
    <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        className="space-y-5"
    >
        <div className="grid xl:grid-cols-2 gap-3">
            <InputField
                label="College Name"
                placeholder="Enter the full official name of the institution."
            />

            <InputField
                label="College Code"
                placeholder="eg:- MRIT"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
                label="College Email"
                placeholder='e.g., "admin@stjosephs.edu"'
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

        <div>
            <h4 className="text-[#333] font-bold text-base mb-3">
                Verification Details
            </h4>
            <div className="flex flex-col gap-1.5">
                <label className="text-[#333] font-semibold text-[14px]">Proof</label>
                <div className="flex gap-4">
                    <button className="bg-[#142444] text-white px-8 py-2.5 rounded-md text-sm font-semibold flex-shrink-0 hover:bg-[#0d182d] transition-all">
                        Upload File
                    </button>
                    <div className="border border-dashed border-gray-300 rounded-lg flex-1 flex items-center px-4 text-xs text-gray-500">
                        Upload any government/board affiliation proof (PDF, PNG, JPG)
                    </div>
                </div>
            </div>
        </div>

        <div>
            <h4 className="text-[#333] font-bold text-base mb-3">Location Details</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <SelectField label="Country" placeholder="Select Country" />
                <SelectField label="State" placeholder="Select State" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <InputField label="City" placeholder='e.g., "Chennai"' />
                <InputField label="Zip / Pincode" placeholder='e.g., "600040"' />
            </div>

            <div className="flex items-end gap-4">
                <InputField
                    label="Address"
                    placeholder='e.g., "Chennai"'
                    className="flex-[3]"
                />
                <button className="flex-3 bg-[#49C77F] text-white h-[42px] rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all">
                    Save
                </button>
            </div>
        </div>
    </motion.div>
);