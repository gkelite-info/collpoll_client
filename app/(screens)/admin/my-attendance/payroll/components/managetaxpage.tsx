"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CaretDown,
    DownloadSimple,
    FileMagnifyingGlass,
    CheckCircle,
    ArrowRight
} from "@phosphor-icons/react";
import { Loader } from '@/app/(screens)/(student)/calendar/right/timetable';
import { useUser } from "@/app/utils/context/UserContext";
import { upsertTaxDeclaration } from "@/lib/helpers/Hr/payroll/taxDeclarationAPI";
import toast from "react-hot-toast";

function ManageTaxPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mainParam = searchParams.get("main") || "payroll";
    const subParam = searchParams.get("sub") || "manageTax";
    const viewParam = (searchParams.get("taxView") as "declaration" | "forms" | "taxFiling" | "taxSaving") || "declaration";

    const [activeTab, setActiveTab] = useState(viewParam);

    useEffect(() => {
        if (viewParam !== activeTab) {
            setActiveTab(viewParam);
        }
    }, [viewParam, activeTab]);

    const handleTabSwitch = (tab: string) => {
        if (tab === activeTab) return;
        setActiveTab(tab as any);
        router.push(`?main=${mainParam}&sub=${subParam}&taxView=${tab}`, { scroll: false });
    };

    const { userId: loggedInUserId, collegeId } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [taxData, setTaxData] = useState({
        section80C: "",
        section80D: "",
        hraExemption: "",
    });

    const handleTaxSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loggedInUserId || !collegeId) return;
        setIsSubmitting(true);
        try {
            await upsertTaxDeclaration(
                Number(loggedInUserId), 
                Number(collegeId), 
                "2025-26", 
                taxData
            );
            toast.success("Tax declaration submitted successfully!");
        } catch (error) {
            toast.error("Failed to submit tax declaration");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col h-[600px] text-left">
            <div className="flex-shrink-0 text-[14px] font-bold mb-6 flex flex-wrap items-center gap-y-2 gap-x-1 sm:gap-x-2">
                {["declaration", "forms", "taxFiling", "taxSaving"].map((tab, index) => (
                    <React.Fragment key={tab}>
                        <span
                            onClick={() => handleTabSwitch(tab)}
                            className={`cursor-pointer transition-colors ${activeTab === tab ? "text-[#43C17A] underline decoration-2 underline-offset-4" : "text-[#333333] hover:text-[#43C17A]"}`}
                        >
                            {tab === "taxSaving" ? "Tax Saving Investment" : tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
                        </span>
                        {index < 3 && <span className="text-gray-400 mx-2">/</span>}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex-1  overflow-y-auto custom-scrollbar pr-2 pb-6">
                {activeTab === "declaration" && (
                    <div className="bg-white rounded-md p-6 shadow-[0px_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
                        <h3 className="text-[#43C17A] font-bold text-[18px] mb-4">Investment Declaration</h3>
                        <form onSubmit={handleTaxSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Section 80C (PPF, ELSS, LIC, etc.)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={taxData.section80C}
                                        onChange={(e) => setTaxData({...taxData, section80C: e.target.value})}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#43C17A]"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Section 80D (Medical Insurance)</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={taxData.section80D}
                                        onChange={(e) => setTaxData({...taxData, section80D: e.target.value})}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#43C17A]"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">HRA Exemption</label>
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={taxData.hraExemption}
                                        onChange={(e) => setTaxData({...taxData, hraExemption: e.target.value})}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#43C17A]"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#43C17A] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#38A166] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Declaration"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                {activeTab === "forms" && (
                    <div className="flex relative flex-col gap-4">
                        <div className="bg-white rounded-md p-6 shadow-[0px_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                                <h3 className="text-[#43C17A] font-bold text-[18px]">Form 16</h3>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <div className="relative flex items-center">
                                        <select className="appearance-none bg-[#43C17A] text-white text-[11px] font-bold pl-3 pr-8 py-1.5 rounded-md outline-none cursor-pointer">
                                            <option>APR 2024 - MAR 2025</option>
                                        </select>
                                        <CaretDown size={14} weight="bold" className="absolute right-2 text-white pointer-events-none" />
                                    </div>
                                    <button className="bg-[#43C17A] text-white text-[11px] font-bold px-4 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-[#3aa869] transition-colors">
                                        Download <DownloadSimple size={14} weight="bold" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[#1F2937] text-base mb-8 leading-relaxed">
                                Form 16 Summarizes your salary, deductions and tax paid and is needed for filing tax returns.
                            </p>
                            <div className="flex flex-col items-center justify-center py-6 text-center border-t border-gray-50 mt-4">
                                <div className="text-gray-300 mb-4 opacity-50">
                                    <FileMagnifyingGlass size={80} weight="light" />
                                </div>
                                <p className="text-[#1F2937] text-base mb-6 max-w-[320px]">
                                    Form 16 has not been released by the admin for the selected financial year.
                                </p>
                                <button className="border border-gray-300 text-[#1F2937] text-base px-8 py-2.5 rounded-md hover:bg-gray-50 transition-all shadow-sm">
                                    Received Form 16 Outside ? File ITR Using Quicko
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-md p-6 shadow-[0px_2px_10px_rgba(0,0,0,0.04)] border border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                                <h3 className="text-[#43C17A] font-bold text-[18px]">Form 12 BB</h3>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <div className="relative flex items-center">
                                        <select className="appearance-none bg-[#43C17A] text-white text-[11px] font-bold pl-3 pr-8 py-1.5 rounded-md outline-none cursor-pointer">
                                            <option>APR 2024 - MAR 2025</option>
                                        </select>
                                        <CaretDown size={14} weight="bold" className="absolute right-2 text-white pointer-events-none" />
                                    </div>
                                    <button className="bg-[#43C17A] text-white text-[11px] font-bold px-4 py-1.5 rounded-md flex items-center gap-1.5 hover:bg-[#3aa869] transition-colors">
                                        Download <DownloadSimple size={14} weight="bold" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-[#1F2937] text-base leading-relaxed">
                                Form 12BB has details about your proposed investments & expenses that are tax deductible.
                            </p>
                        </div>

                    </div>
                )}
                {activeTab === "taxFiling" && (
                    <div className="bg-white relative rounded-lg p-8 border border-gray-200 shadow-sm">
                        <h3 className="text-[#43C17A] font-bold text-[20px] mb-2">
                            Tax Filing
                        </h3>
                        <p className="text-[#1F2937] text-base mb-6">
                            E-file your income tax returns easily through trusted HRMS Partners.
                        </p>
                        <div className="border border-gray-400 rounded-md px-4 py-3 mb-6 w-fit bg-white">
                            <p className="text-black text-sm font-regular border-[#5E5E5E]">
                                Filing due date for FY 2024-25 (AY 2025-26) is{" "}
                                <span className="text-base">September 15, 2025</span>
                            </p>
                        </div>
                        <div className="border border-gray-300 rounded-md p-6 bg-white">
                            <h4 className="text-[#1F2937] font-semibold text-lg mb-2">
                                GK's Choice
                            </h4>

                            <p className="text-[#1F2937] text-base leading-relaxed mb-6">
                                SmartTax is a government-authorized e-filing platform integrated with
                                HRMS to simplify tax filing for employees. It enables auto-fetching of
                                Form 16, deductions, and investment details directly from your HRMS
                                portal — making filing accurate and hassle-free.
                            </p>
                            <div className="mb-6">
                                <h5 className="text-[#1F2937] font-semibold text-base mb-3">
                                    Why Choose GK :
                                </h5>

                                <ul className="space-y-2">
                                    {[
                                        "Trusted by 1.5M+ employees across India",
                                        "Auto-imports Form 16 & deduction data from GK HRMS",
                                        "Instant tax refund calculation",
                                        "Step-by-step guided filing",
                                        "Expert review option available",
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-base text-[#1F2937]">
                                            <CheckCircle
                                                size={18}
                                                weight="fill"
                                                className="text-[#43C17A]"
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-[#1F2937] font-semibold text-base mb-3">
                                    How to File Via Smart Tax
                                </h5>

                                <ol className="space-y-2 text-base text-[#1F2937]">
                                    <li>1. Log in to SmartTax through your GK HRMS account</li>
                                    <li>2. Verify pre-filled details (income, deductions, and PAN info)</li>
                                    <li>3. Review tax summary and select "File ITR"</li>
                                    <li>4. Download acknowledgment instantly</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === "taxSaving" && (
                    <div className="bg-white relative rounded-lg p-8 border border-gray-200 shadow-sm flex flex-col gap-6">
                        <div>
                            <h3 className="text-[#43C17A] font-bold text-[20px] mb-2">
                                Tax Saving Investment
                            </h3>

                            <p className="text-[#1F2937] text-base">
                                Grow your savings smartly while reducing your taxable income.
                            </p>
                        </div>
                        <div className="border border-black rounded-md p-6 bg-white">
                            <h4 className="text-[#1F2937] font-semibold text-base mb-4">
                                Wondering how to save tax and build wealth together?
                            </h4>

                            <ul className="space-y-3 text-base text-[#1F2937]">
                                {[
                                    "Save up to ₹46,800 in taxes annually by investing in top-performing ELSS mutual funds.",
                                    "InvestEase automatically monitors and rebalances your investment portfolio for optimal returns.",
                                    "Enjoy a fully digital, paperless, and zero-commission investment process.",
                                    "Complete your investment in under 5 minutes using your GK HRMS credentials.",
                                    "Gain access to diversified funds with high returns and low lock-in periods.",
                                    "Track all your tax-saving investments in one place directly from your HRMS."
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="mt-[7px] w-[5px] h-[5px] bg-black rounded-full shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="border border-black rounded-md p-6 bg-white">
                            <h4 className="text-[#1F2937] font-semibold text-base mb-4">
                                Grow Your Financial Wellness
                            </h4>

                            <ul className="space-y-3 text-base text-[#1F2937]">
                                {[
                                    "Divert your taxable income into smart investments like ELSS, NPS, and Insurance.",
                                    "Get personalized suggestions through TaxOptimizer+ integrated in GK HRMS.",
                                    "Track your portfolio performance anytime from the My Finances section.",
                                    "Transparent dashboard — view total savings, investment growth, and tax benefit summaries.",
                                    "Start your journey toward smart, goal-based investing today!"
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="mt-[7px] w-[5px] h-[5px] bg-black rounded-full shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-sm "> <Loader /> </div>}>
            <ManageTaxPage />
        </Suspense>
    );

}