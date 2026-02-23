"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fetchUserDetails, upsertUser } from "@/lib/helpers/upsertUser";
import { supabase } from "@/lib/supabaseClient";


export default function PersonalDetails() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [linkedIn, setLinkedIn] = useState("");
    const [collegeId, setCollegeId] = useState<number | null>(null);
    const [currentCity, setCurrentCity] = useState("");
    const [workStatus, setWorkStatus] = useState<"experienced" | "fresher">("fresher");
    const [collegeCode, setCollegeCode] = useState("");


    useEffect(() => {
        async function loadData() {
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData?.user;

            if (!authUser) return;

            const res = await fetchUserDetails(authUser.id);

            if (res.success && res.user) {
                const u = res.user;

                setFullName(u.fullName || "");
                setMobile(u.mobile || "");
                setEmail(u.email || "");
                setCollegeId(u.collegeId || null);
                setWorkStatus(u.role === "experienced" ? "experienced" : "fresher");
                setCollegeCode(u.collegeCode || "");
            }
        }

        loadData();
    }, []);


    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const cityRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
    const mobileRegex = /^[0-9]{10}$/;
    const emailAllowed = /^[a-z0-9@.]+$/;

    const sanitizeName = (value: string) => {
        let clean = value.replace(/[^A-Za-z ]/g, "");
        clean = clean.replace(/\s+/g, " ");
        clean = clean.trimStart();
        clean = clean.replace(/\b\w/g, (c) => c.toUpperCase());
        return clean;
    };

    const sanitizeCity = sanitizeName;

    const sanitizeEmail = (value: string) => {
        value = value.toLowerCase().replace(/[^a-z0-9@.]/g, "");

        const parts = value.split("@");
        if (parts.length > 2) {
            return parts[0] + "@" + parts.slice(1).join("").replace(/@/g, "");
        }

        return value;
    };

    const sanitizeMobile = (value: string) =>
        value.replace(/\D/g, "").slice(0, 10);

    const sanitizeLinkedIn = (value: string) =>
        value.replace(/[^a-zA-Z0-9:/._-]/g, "");


    const handleSubmit = async () => {

        if (!fullName) return toast.error("Full Name is required!");
        if (!nameRegex.test(fullName))
            return toast.error("Full Name must contain letters only & proper format!");

        if (!mobile) return toast.error("Mobile number is required!");
        if (!mobileRegex.test(mobile))
            return toast.error("Mobile number must be exactly 10 digits!");

        if (!email) return toast.error("Email is required!");

        if (!emailAllowed.test(email))
            return toast.error("Email allows only lowercase letters, numbers, '@' and '.'");

        if ((email.match(/@/g) || []).length !== 1)
            return toast.error("Email must contain exactly one '@'!");


        if (!linkedIn) return toast.error("LinkedIn URL is required!");
        if (!linkedIn.startsWith("https://"))
            return toast.error("LinkedIn must start with https://");

        if (!currentCity) return toast.error("City name is required!");
        if (!cityRegex.test(currentCity))
            return toast.error("City must contain only letters!");

        if (!collegeId) return toast.error("College ID is required!");

        if (!collegeCode) return toast.error("CollegeCode is required");

        const payload = {
            fullName,
            mobile,
            email,
            linkedIn,
            collegeId,
            collegeCode,
            currentCity,
            workStatus,
        };

        const res = await upsertUser(payload);

        if (res.success) {
            const user = res.data;
            localStorage.setItem("userId", user.userId.toString());
            toast.success("Personal Details Saved Successfully");
        } else {
            toast.error(res.error || 'Failed to save personal details');
        }
    };

    return (
        <div className="w-full bg-[#f6f7f9] mt-2 mb-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-[#000000]">
                        Personal Details
                    </h2>
                    <button
                        onClick={() => router.push('/profile?education')}
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
                            value={mobile}
                            onChange={(e) => setMobile(sanitizeMobile(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                        />

                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            Email ID<span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Mail ID"
                            value={email}
                            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            College Code
                        </label>

                        <input
                            type="text"
                            value={collegeCode}
                            readOnly
                            disabled
                            className="w-full border rounded-md px-3 py-2
               text-[#282828] cursor-not-allowed
               outline-none border-[#CCCCCC]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#282828] mb-1">
                            LinkedIn ID<span className="text-red-500">*</span>
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
                            // value={currentCity}
                            // onChange={(e) => setCurrentCity(sanitizeCity(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
                        />
                    </div>

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

                                setCollegeId(clean === "" ? null : Number(clean));
                            }}
                            className="w-full border rounded-md px-3 py-2 text-[#282828] outline-none border-[#CCCCCC]"
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
