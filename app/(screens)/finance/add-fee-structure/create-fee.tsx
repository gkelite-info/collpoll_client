'use client'
import { CaretDown, CaretDownIcon, MinusCircleIcon } from "@phosphor-icons/react";
import AddFeeHeader from "./components/Header";
import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import { getFinanceCollegeStructure } from "@/lib/helpers/finance/financeManagerContextAPI";



export default function CreateFee() {
    const { userId } = useUser();

    const [collegeName, setCollegeName] = useState("");
    const [educationType, setEducationType] = useState("");
    const [branches, setBranches] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
    const [selectedExtraFee, setSelectedExtraFee] = useState("");
    const [showHostelFee, setShowHostelFee] = useState(false);
    const [showMiscFee, setShowMiscFee] = useState(false);
    const [showCreateBox, setShowCreateBox] = useState(false);
    const [newFeeName, setNewFeeName] = useState("");
    const [customFees, setCustomFees] = useState<
        { id: string; label: string }[]
    >([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleIntegerInput = (e: any) => {
        const value = e.target.value;
        if (value === "") return;
        e.target.value = value.replace(/\D/g, "");
    };

    useEffect(() => {
        const loadFinanceStructure = async () => {
            if (!userId) {
                return;
            }

            try {
                const data = await getFinanceCollegeStructure(userId);
                setCollegeName(data.collegeName);
                setEducationType(data.educationType);
                setBranches(data.branches);
                setAcademicYears(data.academicYears);
            } catch (err) {
            }
        };

        loadFinanceStructure();
    }, [userId]);



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
                            <input
                                type="text"
                                value={collegeName}
                                readOnly
                                className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed"
                            />

                        </div>
                        <div className="flex flex-col w-[49%]">
                            <label
                                className="text-[#282828] font-medium"
                            >
                                Education Type
                            </label>
                            <input
                                type="text"
                                value={educationType}
                                readOnly
                                className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none cursor-not-allowed"
                            />

                        </div>
                        <div className="flex flex-col w-[49%]">
                            <label className="font-medium text-[#282828]">
                                Branch
                            </label>

                            <select
                                value={selectedBranch ?? ""}
                                onChange={(e) => {
                                    const branchId = Number(e.target.value);
                                    setSelectedBranch(branchId);
                                    setSelectedAcademicYear(null);
                                }}
                                className="border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 text-[#898989]"
                            >
                                <option value="">Select</option>

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
                            <label
                                className="font-medium text-[#282828]"
                            >
                                Academic Year
                            </label>
                            <select
                                value={selectedAcademicYear ?? ""}
                                onChange={(e) => setSelectedAcademicYear(Number(e.target.value))}
                                disabled={!selectedBranch}   // 🔥 THIS LINE
                                className={`border border-[#C4C4C4] focus:outline-none mt-2 rounded-md p-2 
    ${!selectedBranch ? "bg-gray-100 cursor-not-allowed text-gray-400" : "text-[#898989]"}
  `}
                            >
                                <option value="">Select</option>

                                {academicYears
                                    .filter((year) =>
                                        selectedBranch
                                            ? year.collegeBranchId === selectedBranch
                                            : false
                                    )
                                    .map((year) => (
                                        <option
                                            key={year.collegeAcademicYearId}
                                            value={year.collegeAcademicYearId}
                                        >
                                            {year.collegeAcademicYear}
                                        </option>
                                    ))}
                            </select>

                        </div>
                    </div>
                    <div className="mt-4 flex flex-col w-full">
                        <div className="bg-blue-00 flex justify-between items-center w-full">
                            <h4 className="text-[#282828] font-medium text-lg">Fee Components</h4>
                            <div className="bg-blue-00 flex items-center justify-end gap-2">
                                <div className="relative lg:w-[85%]">
                                    <div
                                        className="relative w-full bg-[#16284F] pl-5 pr-12 py-2 rounded-lg text-white text-lg overflow-hidden cursor-pointer"
                                        onClick={() => setIsDropdownOpen(prev => !prev)}
                                    >
                                        <div className="overflow-hidden whitespace-nowrap">
                                            <div
                                                className={`inline-block ${selectedExtraFee.length > 10 ? "animate-marquee" : ""
                                                    }`}
                                            >
                                                {selectedExtraFee === "HOSTEL"
                                                    ? "Hostel Accommodation Fee"
                                                    : selectedExtraFee === "MISC"
                                                        ? "Miscellaneous Fee"
                                                        : "Choose More"}
                                            </div>
                                        </div>
                                        <CaretDown
                                            size={22}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                                        />
                                    </div>
                                    <select
                                        value={selectedExtraFee}
                                        onChange={(e) => {
                                            if (e.target.value === "__CREATE__") {
                                                setShowCreateBox(true);
                                                setSelectedExtraFee("");
                                                return;
                                            }
                                            setSelectedExtraFee(e.target.value);
                                        }}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    >
                                        <option
                                            value=""
                                            style={{ backgroundColor: "#FFFFFF", color: "#16284F" }}
                                        >
                                            Choose More
                                        </option>

                                        {!showHostelFee && (
                                            <option
                                                value="HOSTEL"
                                                style={{ backgroundColor: "#FFFFFF", color: "#16284F" }}
                                            >
                                                Hostel Accommodation Fee
                                            </option>
                                        )}

                                        {!showMiscFee && (
                                            <option
                                                value="MISC"
                                                style={{ backgroundColor: "#FFFFFF", color: "#16284F" }}
                                            >
                                                Miscellaneous Fee
                                            </option>
                                        )}
                                        {customFees.map((fee) => (
                                            <option
                                                key={fee.id}
                                                value={fee.id}
                                                style={{ backgroundColor: "#FFFFFF", color: "#16284F" }}
                                            >
                                                {fee.label}
                                            </option>
                                        ))}


                                        <option
                                            value="__CREATE__"
                                            style={{ backgroundColor: "#FFFFFF", color: "#16284F", fontWeight: "600" }}
                                        >
                                            + Create New Fee
                                        </option>
                                    </select>
                                    <style jsx>{`
    @keyframes marquee {
      0% { transform: translateX(0%); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee {
      animation: marquee 6s linear infinite;
    }
  `}</style>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (showCreateBox && newFeeName.trim()) {

                                            const newId = newFeeName
                                                .toUpperCase()
                                                .replace(/\s+/g, "_");
                                            if (!customFees.find(f => f.id === newId)) {
                                                setCustomFees(prev => [
                                                    ...prev,
                                                    { id: newId, label: newFeeName }
                                                ]);
                                            }
                                            setSelectedExtraFee(newId);

                                            setShowCreateBox(false);
                                            setNewFeeName("");
                                            return;
                                        }
                                        if (selectedExtraFee === "HOSTEL") {
                                            setShowHostelFee(true);
                                        }

                                        if (selectedExtraFee === "MISC") {
                                            setShowMiscFee(true);
                                        }
                                        const custom = customFees.find(f => f.id === selectedExtraFee);
                                        if (custom) {
                                        }

                                        setSelectedExtraFee("");
                                    }}


                                    className="px-3 py-1 bg-[#58AE77] text-white rounded-md"
                                >
                                    Add
                                </button>
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
                                            onClick={() =>
                                                setCustomFees((prev) =>
                                                    prev.filter((f) => f.id !== fee.id)
                                                )
                                            }
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter amount"
                                        className="border border-[#C4C4C4] p-2 px-3 rounded-md mt-2 text-[#898989] focus:outline-none text-md"
                                    />
                                </div>
                            ))}


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