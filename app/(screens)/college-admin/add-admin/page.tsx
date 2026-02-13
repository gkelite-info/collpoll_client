"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { InputField, SelectField } from "../../super-admin/registration/components/reusableComponents";
import { upsertAdminEntry, upsertUser } from "@/lib/helpers/upsertUser";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeSlash } from "@phosphor-icons/react";

type AdminForm = {
    fullName: string;
    email: string;
    countryCode: string;
    phone: string;
    collegeId: string;
    educationType: string;
    password: string;
    confirmPassword: string;
    gender: "Male" | "Female" | "";
};

const initialFormState: AdminForm = {
    fullName: "",
    email: "",
    countryCode: "+91",
    phone: "",
    collegeId: "",
    educationType: "",
    password: "",
    confirmPassword: "",
    gender: "",
};

export default function AdminRegistration() {
    const [form, setForm] = useState<AdminForm>(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [educations, setEducations] = useState<any[]>([]);

    const handleChange = (key: keyof AdminForm, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    
    useEffect(() => {
        const fetchLoggedInCollege = async () => {

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("users")
                .select("collegeId")
                .eq("auth_id", user.id)
                .single();

            if (data?.collegeId) {
               setForm((prev) => ({
                    ...prev,
                    collegeId: String(data.collegeId),
                }));
            }
        };

        fetchLoggedInCollege();
    }, []);

    useEffect(() => {
        if (!form.collegeId) {
            return;
        }

        const fetchEducations = async () => {
            const { data, error } = await supabase
                .from("college_education")
                .select("collegeEducationId, collegeEducationType")
                .eq("collegeId", Number(form.collegeId))
                .eq("isActive", true);

            if (error) {
                return;
            }
            setEducations(data || []);
        };

        fetchEducations();
    }, [form.collegeId]);

    const handleSubmit = async () => {
        let createdUserId: number | null = null;

        try {
            setIsLoading(true);

            if (!form.fullName || !form.email)
                return toast.error("Required fields missing.");

            if (!form.educationType)
                return toast.error("Select Education Type.");

            if (!form.gender)
                return toast.error("Select Gender.");

            if (!form.password || form.password !== form.confirmPassword)
                return toast.error("Check passwords.");

            const { data: authData, error: authError } =
                await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                });

            if (authError || !authData.user) {
                throw new Error(authError?.message || "Auth creation failed");
            }

            const authId = authData.user.id;
            const userRes = await upsertUser({
                auth_id: authId,
                fullName: form.fullName,
                email: form.email.toLowerCase(),
                mobile: `+91${form.phone}`,
                role: "Admin",
                collegeId: Number(form.collegeId),
                collegePublicId: form.collegeId,
                gender: form.gender,
            });

            if (!userRes.success || !userRes.data) {
                throw new Error(userRes.error || "User creation failed");
            }

            createdUserId = userRes.data.userId;

            const adminRes = await upsertAdminEntry({
                userId: createdUserId!,
                fullName: form.fullName,
                email: form.email,
                mobile: `+91${form.phone}`,
                gender: form.gender,
                collegePublicId: form.collegeId,
                collegeCode: form.collegeId.replace(/\d+/g, ""),
            });

            if (!adminRes.success) {
                throw new Error(adminRes.error || "Admin creation failed");
            }

            toast.success("Admin Created Successfully");
            setForm(initialFormState);

        } catch (e: any) {
            console.error(" ERROR:", e);

            if (createdUserId) {
                console.log("⚠ Rolling back user:", createdUserId);
                await supabase.from("users").delete().eq("userId", createdUserId);
            }

            toast.error(e.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="bg-white rounded-2xl shadow-sm p-8 max-w-4xl mx-auto"
        >
            <h2 className="text-2xl font-bold text-[#333] mb-2">
                Admin Registration
            </h2>
            <p className="text-gray-500 text-sm mb-8">
                Add a new Admin to the CollPoll network by providing verified details
                below.
            </p>
            <InputField
                label="Full Name"
                value={form.fullName}
                placeholder='e.g., "Admin Mallareddy"'
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange("fullName", e.target.value)
                }
            />
            <div className="grid md:grid-cols-2 gap-6 mt-5">
                <InputField
                    label="Email ID"
                    value={form.email}
                    placeholder="admin@gmail.com"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("email", e.target.value.toLowerCase())
                    }
                />

                <div>
                    <label className="text-[#282828] font-semibold text-[15px] mb-1.5 block">
                        Phone
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value="+91"
                            readOnly
                            className="border border-[#CCCCCC] rounded-lg w-20 px-2 py-2.5 
             text-sm text-[#282828] text-center  
             bg-white 
             focus:outline-none 
             shadow-sm"
                        />
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            value={form.phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value.replace(/\D/g, ""); 
                                if (value.length <= 10) {
                                    handleChange("phone", value);
                                }
                            }}
                            placeholder="Enter mobile"
                            className="border border-[#CCCCCC] rounded-lg px-4 py-2.5 text-sm w-full 
             focus:outline-none focus:border-[#49C77F] 
             text-[#282828] placeholder:text-gray-400 shadow-sm"
                        />

                    </div>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-5">
                <InputField
                    label="College ID"
                    value={form.collegeId}
                    placeholder="Enter college ID"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleChange("collegeId", e.target.value.toUpperCase())
                    }
                />

                <div className="flex flex-col w-full">
                    <label className="text-[#282828] font-semibold text-[15px] mb-1.5">
                        Role
                    </label>
                    <div className="border border-[#CCCCCC] bg-gray-100 text-[#525252] rounded-lg px-4 py-2.5 text-sm shadow-sm">
                        Admin
                    </div>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-5">

                <div className="flex flex-col w-full">
                    <label className="text-[#282828] font-semibold text-[15px] mb-1.5">
                        Education Type
                    </label>

                    <select
                        value={form.educationType}
                        onChange={(e) => handleChange("educationType", e.target.value)}
                        className="
                w-full
                border border-[#CCCCCC]
                rounded-lg
                px-4 py-2.5
                text-sm
                text-[#282828]
                bg-white
                shadow-sm
                outline-none
                focus:border-[#49C77F]
                focus:ring-1 focus:ring-[#49C77F]
                transition-all
                cursor-pointer
            "
                    >
                        <option value="">
                            {educations.length === 0
                                ? "No Education Types Available"
                                : "Select Education Type"}
                        </option>

                        {educations.map((edu) => (
                            <option
                                key={edu.collegeEducationId}
                                value={String(edu.collegeEducationId)}
                            >
                                {edu.collegeEducationType}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-[#282828] font-semibold text-[15px] mb-3 block">
                        Gender
                    </label>

                    <div className="flex gap-10 mt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={form.gender === "Male"}
                                onChange={() => handleChange("gender", "Male")}
                                className="hidden"
                            />
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.gender === "Male"
                                    ? "border-[#49C77F]"
                                    : "border-gray-400"
                                    }`}
                            >
                                {form.gender === "Male" && (
                                    <div className="w-2.5 h-2.5 bg-[#49C77F] rounded-full" />
                                )}
                            </div>
                            <span className="text-[#333]">Male</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={form.gender === "Female"}
                                onChange={() => handleChange("gender", "Female")}
                                className="hidden"
                            />
                            <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.gender === "Female"
                                    ? "border-[#49C77F]"
                                    : "border-gray-400"
                                    }`}
                            >
                                {form.gender === "Female" && (
                                    <div className="w-2.5 h-2.5 bg-[#49C77F] rounded-full" />
                                )}
                            </div>
                            <span className="text-[#333]">Female</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-5">             
                <div className="flex flex-col w-full">
                    <label className="text-[#282828] font-semibold text-[15px] mb-1.5">
                        Password
                    </label>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            className="border border-[#CCCCCC] rounded-lg px-4 py-2.5 text-sm w-full 
                   focus:outline-none focus:border-[#49C77F] 
                   text-[#282828] placeholder:text-gray-400 shadow-sm pr-10"
                        />

                        <div
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Eye size={18} /> : <EyeSlash size={18} />}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col w-full">
                    <label className="text-[#282828] font-semibold text-[15px] mb-1.5">
                        Confirm Password
                    </label>

                    <input
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={(e) => handleChange("confirmPassword", e.target.value)}
                        className="border border-[#CCCCCC] rounded-lg px-4 py-2.5 text-sm w-full 
                 focus:outline-none focus:border-[#49C77F] 
                 text-[#282828] placeholder:text-gray-400 shadow-sm"
                    />
                </div>
            </div>
            <div className="flex justify-center mt-10">
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-[#49C77F] hover:bg-[#3fb070] text-white font-bold text-lg px-16 py-2.5 rounded-lg shadow-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isLoading ? "Registering…" : "Register"}
                </button>
            </div>
        </motion.div >
    );
}
