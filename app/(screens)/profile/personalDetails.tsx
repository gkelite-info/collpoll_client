"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function PersonalDetails() {
    const [workStatus, setWorkStatus] = useState<"experienced" | "fresher">("fresher");
    const router = useRouter();

    const handleSubmit = () => {
        toast.success("Personal Details Submitted");
        console.log("Form submitted");
    }

    return (
        <div className="w-full bg-[#f6f7f9] mt-2 mb-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-[#000000]">
                        Personal Details
                    </h2>
                    <button
                    onClick={()=>router.push('/profile?education')}
                     className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium">
                        Next
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Full Name"
                            className="w-full border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Mobile Number
                        </label>
                        <input
                            type="number"
                            placeholder="Enter Mobile Number"
                            className="w-full border rounded-md px-3 py-2 outline-none border-[#CCCCCC] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Mail ID
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Mail ID"
                            className="w-full border rounded-md px-3 py-2 outline-none border-[#CCCCCC]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            LinkedIn ID
                        </label>
                        <input
                            type="text"
                            placeholder="Enter LinkedIn ID"
                            className="w-full border rounded-md px-3 py-2 outline-none border-[#CCCCCC]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Current City
                        </label>
                        <input
                            type="text"
                            defaultValue=""
                            placeholder="Enter Current City"
                            className="w-full border rounded-md px-3 py-2 outline-none border-[#CCCCCC]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            College ID
                        </label>
                        <input
                            type="text"
                            placeholder="Enter College ID"
                            className="w-full border rounded-md px-3 py-2 outline-none border-[#CCCCCC]"
                        />
                    </div>
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-[#282828] mb-2">
                        Work Status
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div
                            onClick={() => setWorkStatus("experienced")}
                            className={`border rounded-md p-4 cursor-pointer transition-all
                ${workStatus === "experienced"
                                    ? "border-[#43C17A] bg-green-50"
                                    : "hover:border-[#43C17A] border-[#CCCCCC]"
                                }`}
                        >
                            <p
                                className={`font-medium ${workStatus === "experienced"
                                    ? "text-[#43C17A]"
                                    : "text-[#282828]"
                                    }`}
                            >
                                I’m experienced
                            </p>
                            <p
                                className="text-sm mt-1 text-[#525252]"
                            >
                                i have work experience (excluding internships)
                            </p>
                        </div>

                        <div
                            onClick={() => setWorkStatus("fresher")}
                            className={`border rounded-md p-4 cursor-pointer transition-all
                ${workStatus === "fresher"
                                    ? "border-[#43C17A] bg-green-50"
                                    : "hover:border-[#43C17A] border-[#CCCCCC]"
                                }`}
                        >
                            <p
                                className={`font-medium ${workStatus === "fresher"
                                    ? "text-[#43C17A]"
                                    : "text-[#282828]"
                                    }`}
                            >
                                I’m a fresher
                            </p>
                            <p
                                className="text-sm mt-1 text-[#525252]"
                            >
                                i am a student/Haven’t worked after graduation
                            </p>
                        </div>

                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
