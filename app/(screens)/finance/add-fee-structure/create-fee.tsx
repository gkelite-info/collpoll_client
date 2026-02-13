'use client'
import { CaretDown, CaretDownIcon, MinusCircleIcon } from "@phosphor-icons/react";
import AddFeeHeader from "./components/Header";


export default function CreateFee() {

    const handleIntegerInput = (e: any) => {
        const value = e.target.value;
        if (value === "") return;
        e.target.value = value.replace(/\D/g, "");
    };


    return (
        <>
            <div className="bg-red-00 flex flex-col">
                <div className="bg-red-00 flex">
                    <AddFeeHeader
                        button={false}
                    />
                </div>
                <div className="bg-white mt-1 rounded-md p-6 flex flex-wrap justify-between gap-2 shadow-sm">
                    <div className="flex flex-wrap justify-between w-[100%] gap-4">
                        <div className="flex flex-col w-[49%]">
                            <label
                                className="text-[#282828] font-medium"
                            >
                                College Name
                            </label>
                            <input type="text"
                                placeholder="ABC Institute of Technology"
                                className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-col w-[49%]">
                            <label
                                className="text-[#282828] font-medium"
                            >
                                Education Type
                            </label>
                            <input type="text"
                                placeholder="B.Tech"
                                className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-col w-[49%]">
                            <label
                                className="font-medium text-[#282828]"
                            >
                                Branch
                            </label>
                            <select
                                className="border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 text-[#898989]"
                            >
                                <option value="">Select</option>
                                <option value="">EEE</option>
                            </select>
                        </div>
                        <div className="flex flex-col w-[49%]">
                            <label
                                className="font-medium text-[#282828]"
                            >
                                Academic Year
                            </label>
                            <select
                                className="border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 text-[#898989]"
                            >
                                <option value="">Select</option>
                                <option value="">1st Year</option>
                                <option value="">2nd Year</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col w-full">
                        <div className="bg-blue-00 flex justify-between items-center w-full">
                            <h4 className="text-[#282828] font-medium text-lg">Fee Components</h4>
                            <div className="relative bg-blue-00 flex items-center justify-end">
                                <select
                                    className="bg-[#16284F] lg:w-[65%] px-7 pl-3 py-1.5 flex justify-center items-center gap-1 rounded-md cursor-pointer appearance-none">
                                    <option className="text-black bg-white">Choose More</option>
                                    <option className="text-black bg-white">Hostel Accomodation Fee</option>
                                    <option className="text-black bg-white">Miscellaneous Fee</option>
                                    <option className="text-black bg-white"></option>
                                    <option className="text-black bg-white"></option>
                                    <option className="text-black bg-white"></option>
                                </select>
                                <CaretDown
                                    size={14}
                                    className="text-[#EFEFEF] absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                />
                            </div>
                        </div>
                        <div className="bg-red-00 flex flex-wrap justify-between mt-3 gap-4">
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Tution Fee
                                    </label>
                                </div>
                                <input type="text"
                                    onChange={handleIntegerInput}
                                    placeholder="Ex: 85000"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Laboratory Fee
                                    </label>
                                </div>
                                <input type="text"
                                    onChange={handleIntegerInput}
                                    placeholder="Ex: 5000"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Library Fee
                                    </label>
                                </div>
                                <input type="text"
                                    onChange={handleIntegerInput}
                                    placeholder="Ex: 100"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Examination Fee
                                    </label>
                                </div>
                                <input type="text"
                                    onChange={handleIntegerInput}
                                    placeholder="Ex: 2000"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Hostel Accomodation Fee
                                    </label>
                                    <MinusCircleIcon size={18} weight="fill" className="text-[#FF3131] cursor-pointer" />
                                </div>
                                <input type="text"
                                    placeholder="Ex: 5000"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Miscellaneous Fee
                                    </label>
                                    <MinusCircleIcon size={18} weight="fill" className="text-[#FF3131] cursor-pointer" />
                                </div>
                                <input type="text"
                                    placeholder="Ex: 1000"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        GST
                                    </label>
                                </div>
                                <input type="text"
                                    onChange={handleIntegerInput}
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
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Due Date
                                    </label>
                                </div>
                                <input type="text"
                                    placeholder="DD/MM/YYYY"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[49%]">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Late Fee Rule
                                    </label>
                                </div>
                                <input type="text"
                                    onChange={handleIntegerInput}
                                    placeholder="₹___ /day after due date"
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="flex flex-col w-[100%] mt-3">
                                <div className="flex items-center justify-between">
                                    <label
                                        className="text-[#282828] font-medium"
                                    >
                                        Remarks (Optional)
                                    </label>
                                </div>
                                <input type="text"
                                    placeholder={`Ex “Applicable for all students of ${new Date().getFullYear()} batch.”`}
                                    className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                />
                            </div>
                            <div className="bg-red-00 w-full mt-5">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-[#16284F] font-bold">Total Fee:</h4>
                                    <div className="p-1 px-4 border border-[#919191] rounded-md">

                                        <p className="text-[#23B362] font-bold text-md">₹ 10,000</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full flex items-center justify-center mt-5">
                                <button className="px-5 py-2 bg-[#58AE77] font-medium text-[#EFEFEF] rounded-md cursor-pointer">
                                    Save Fee Structure
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}