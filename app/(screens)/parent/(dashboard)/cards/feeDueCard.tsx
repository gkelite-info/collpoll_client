'use client'
import { CurrencyInr, Money } from "@phosphor-icons/react";
import { Bank } from "@phosphor-icons/react/dist/ssr";
import { FaChevronRight } from "react-icons/fa";

type FeeDueCardProps = {
    totalFee: string;
    feePaid: string;
}

export default function FeeDueCard({ totalFee, feePaid }: FeeDueCardProps) {
    return (
        <>
            <div className="bg-white w-[32%] lg:h-[220px] shadow-md rounded-lg p-2.5 flex flex-col justify-between pb-4">
                <div className="bg-red-00 lg:w-[62%] flex items-center justify-between">
                    <div className="bg-[#E1F4E8] lg:p-2 rounded-lg">
                        <Bank size={22} weight="fill" color="#47CE68" />
                    </div>
                    <h5 className="text-[#282828] font-semibold">Fee Due</h5>
                </div>
                <div className="bg-green-00 mt-2 flex flex-col h-auto">
                    <div className="flex justify-between gap-2">
                        <div className="bg-gradient-to-b from-[#FFEDD9] to-[#FFBB70] lg:h-[90.31px] lg:w-[101.1px] rounded-lg p-2 flex flex-col justify-between">
                            <div className="bg-white rounded-lg lg:h-8 lg:w-8 flex items-center justify-center">
                                <Money size={22} weight="fill" color="#FFBB70" />
                            </div>
                            <p className="text-xs text-white">Total Fee</p>
                            <div className="flex items-center">
                                <CurrencyInr size={15} color="white" />
                                <span className="text-white font-extrabold text-sm">{totalFee}</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-b from-[#CEE6FF] to-[#61AEFF] lg:h-[90.31px] lg:w-[101.1px] rounded-lg p-2 flex flex-col justify-between">
                            <div className="bg-white rounded-lg lg:h-8 lg:w-8 flex items-center justify-center">
                                <Money size={22} weight="fill" color="#61AEFF" />
                            </div>
                            <p className="text-xs text-white">Fee Paid</p>
                            <div className="flex items-center">
                                <CurrencyInr size={15} color="white" />
                                <span className="text-white font-extrabold text-sm">{feePaid}</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#A2D784] mt-2 lg:h-[42px] rounded-full flex items-center justify-between p-2">
                        <div className="bg-red-00 w-[65%] h-full rounded-full flex items-center justify-end">
                            <h5 className="text-white font-semibold text-md">Pay Now</h5>
                        </div>
                        <div className="bg-white rounded-full lg:h-8 lg:w-8 flex items-center justify-center cursor-pointer">
                            <FaChevronRight
                                size={14}
                                className="text-[#A2D784] cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}