"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "../utils/context/UserContext";
import { fetchCollegeCode, fetchPersonalDetails, savePersonalDetails, updateUserBasic } from "@/lib/helpers/profile/personalDetailsAPI";
import PersonalDetailsSkeleton from "./shimmers/PersonalDetailsSkeleton";

export default function ProfilePersonalDetails() {
    const router = useRouter();
    const { userId, fullName: ctxFullName, setFullName: setCtxFullName, mobile, email, collegeId, role } = useUser();

    const [fullName, setFullName] = useState("");
    const [linkedIn, setLinkedIn] = useState("");
    const [currentCity, setCurrentCity] = useState("");
    const [workStatus, setWorkStatus] = useState<"experience" | "fresher">("fresher");
    const [collegeCode, setCollegeCode] = useState("");
    const [personalDetailsId, setPersonalDetailsId] = useState<number | null>(null);
    const [isLoading, setIsloading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const isSuperAdmin = role === "SuperAdmin";

    useEffect(() => {
        if (!userId) return;
        setFullName(ctxFullName || "");
    }, [userId, ctxFullName]);

    useEffect(() => {
        loadData();
    }, [userId, collegeId]);

    async function loadData() {
        if (!userId) return;
        setIsPageLoading(true);
        try {
            const [pdRes, collegeRes] = await Promise.all([
                fetchPersonalDetails(userId!),
                collegeId ? fetchCollegeCode(collegeId) : Promise.resolve(null),
            ]);
            if (pdRes?.data) {
                setPersonalDetailsId(pdRes.data.personalDetailsId);
                setLinkedIn(pdRes.data.linkedIn || "");
                setCurrentCity(pdRes.data.currentCity || "");
                setWorkStatus(pdRes.data.workStatus);
            }
            if (collegeRes?.success && collegeRes.data) {
                setCollegeCode(collegeRes.data.collegeCode || "");
            }
        } catch (err) {
            toast.error("Failed to load personal details");
        } finally {
            setIsPageLoading(false);
        }
    }

    const reloadData = async () => {
        if (!userId) return;
        setIsPageLoading(true);
        try {
            const pdRes = await fetchPersonalDetails(userId);
            if (pdRes?.data) {
                setPersonalDetailsId(pdRes.data.personalDetailsId);
                setLinkedIn(pdRes.data.linkedIn || "");
                setCurrentCity(pdRes.data.currentCity || "");
                setWorkStatus(pdRes.data.workStatus);
            }
        } catch (error) {
            toast.error("Failed to load personal details");
        } finally {
            setIsPageLoading(false);
        }
    };

    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const emailAllowed = /^[a-z0-9@.]+$/;
    const linkedInRegex = /^https:\/\/(www\.)?linkedin\.com\/.+$/;

    const sanitizeCity = (value: string) => {
        let clean = value.replace(/[^A-Za-z ]/g, "");
        clean = clean.replace(/\s+/g, " ");
        return clean.replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const sanitizeName = (value: string) => {
        let clean = value.replace(/[^A-Za-z ]/g, "");
        clean = clean.replace(/\s+/g, " ");
        clean = clean.trimStart();
        clean = clean.replace(/\b\w/g, (c) => c.toUpperCase());
        return clean;
    };

    const sanitizeLinkedIn = (value: string) =>
        value.replace(/[^a-zA-Z0-9:/._-]/g, "");

    const handleSubmit = async () => {
        if (!userId) return
        if (!fullName) return toast.error("Full Name is required!");
        if (!nameRegex.test(fullName))
            return toast.error("Full Name must contain letters only & proper format!");
        if (!mobile) return toast.error("Mobile number is required!");
        if (!email) return toast.error("Email is required!");
        if (!emailAllowed.test(email))
            return toast.error("Email allows only lowercase letters, numbers, '@' and '.'");
        if ((email.match(/@/g) || []).length !== 1)
            return toast.error("Email must contain exactly one '@'!");
        if (linkedIn && !linkedInRegex.test(linkedIn)) {
            return toast.error("Enter valid LinkedIn URL");
        }
        if (!isSuperAdmin) {
            if (!collegeId) return toast.error("College ID is required!");
            if (!collegeCode) return toast.error("CollegeCode is required");
        }
        setIsloading(true);
        const [userRes, pdRes] = await Promise.all([
            updateUserBasic({ userId, fullName }),
            savePersonalDetails({
                personalDetailsId: personalDetailsId || undefined,
                userId,
                workStatus,
                currentCity,
                linkedIn,
            }),
        ]);

        if (!userRes.success || !pdRes.success) {
            setIsloading(false);
            return toast.error("Failed to update personal details. Please try again.");
        }
        setCtxFullName(fullName);
        await reloadData();
        setIsloading(false);
        toast.success("Personal details updated successfully");
    };
    if (isPageLoading) {
        return <PersonalDetailsSkeleton />;
    }
    return (
        <div className="w-full bg-[#f6f7f9] mt-2 mb-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-[#000000]">
                        Personal Details
                    </h2>
                    <button
                        onClick={() => router.push('/profile?profile=education&Step=2')}
                        className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium">
                        Next
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Full Name<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(sanitizeName(e.target.value))}
                            className="w-full border border-[#CCCCCC] text-[#282828] rounded-md px-3 py-2 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Mobile Number<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Mobile Number"
                            value={mobile!}
                            disabled
                            className="w-full border cursor-not-allowed rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Email ID<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Mail ID"
                            value={email!}
                            disabled
                            className="w-full cursor-not-allowed border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                        />
                    </div>

                    {!isSuperAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-[#282828] mb-1">
                                College Code
                            </label>

                            <input
                                type="text"
                                value={collegeCode}
                                readOnly
                                disabled
                                className="w-full border rounded-md px-3 py-2 text-[#282828] cursor-not-allowed outline-none border-[#CCCCCC]"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            LinkedIn ID
                        </label>
                        <input
                            type="text"
                            placeholder="Enter LinkedIn ID"
                            value={linkedIn}
                            onChange={(e) => setLinkedIn(sanitizeLinkedIn(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Current City
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Current City"
                            value={currentCity}
                            onChange={(e) => setCurrentCity(sanitizeCity(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                        />
                    </div>
                    {!isSuperAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-[#282828] mb-1">
                                College ID<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter College ID"
                                value={collegeId !== null ? collegeId : ""}
                                onChange={(e) => {
                                    let clean = e.target.value.replace(/\D/g, "");
                                    if (clean === "0") clean = "";
                                    if (clean.startsWith("0")) clean = clean.replace(/^0+/, "");
                                }}
                                disabled
                                className="w-full cursor-not-allowed border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-[#282828] mb-2">
                        Work Status
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div
                            onClick={() => setWorkStatus("experience")}
                            className={`border rounded-md p-4 cursor-pointer transition-all
                                ${workStatus === "experience"
                                    ? "border-[#43C17A] bg-green-50"
                                    : "hover:border-[#43C17A] border-[#CCCCCC]"
                                }`}
                        >
                            <p className={`font-medium ${workStatus === "experience" ? "text-[#43C17A]" : "text-[#282828]"}`}>
                                I’m experienced
                            </p>
                            <p className="text-sm mt-1 text-[#525252]">
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
                            <p className={`font-medium ${workStatus === "fresher" ? "text-[#43C17A]" : "text-[#282828]"}`}>
                                I’m a fresher
                            </p>
                            <p className="text-sm mt-1 text-[#525252]">
                                i am a student/Haven’t worked after graduation
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        className={`bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium ${isLoading && "opacity-50 cursor-not-allowed"}`}
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "Submmiting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}
