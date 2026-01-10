"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { insertEducation } from "@/lib/helpers/superadmin/educationalTypeAPI";
import toast from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";

export default function EducationalType() {
    const [form, setForm] = useState({
        educationName: "",
        educationCode: "",
        educationLevel: "",
        durationYears: "",
    });

    const { userId } = useUser();

    const [errors, setErrors] = useState<Record<string, string>>({});

    const nameRegex = /^[A-Za-z.\-\s]+$/;
    const alphaRegex = /^[A-Za-z\s]+$/;
    const numberRegex = /^[0-9]+$/;
    const educationCodeRegex = /^[A-Za-z.]+$/;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const validateField = (name: string, value: string) => {
        let message = "";

        switch (name) {
            case "educationName":
                if (value && !nameRegex.test(value))
                    message = "Only letters, spaces, '.' and '-' allowed";
                break;

            case "educationCode":
                if (value && !educationCodeRegex.test(value))
                    message = "Only alphabets and '.' allowed";
                break;

            case "educationLevel":
                if (value && !alphaRegex.test(value))
                    message = "Only alphabets allowed";
                break;

            case "durationYears":
                if (value && !numberRegex.test(value))
                    message = "Only integers allowed";
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: message }));
    };

    const handleSubmit = async () => {
        try {
            const saved = await insertEducation({
                educationName: form.educationName.trim(),
                educationCode: form.educationCode.trim(),
                educationLevel: form.educationLevel.trim(),
                durationYears: Number(form.durationYears),
            },
                userId
            );
            console.log("Education saved ✅", saved);
            toast.success("Education saved successfully");
            setForm({
                educationName: "",
                educationCode: "",
                educationLevel: "",
                durationYears: ""
            })
        } catch (err: any) {
            console.error("Insert failed ❌", err.message);
            toast.error("Insert failed");
        }
    };


    const baseInput =
        "w-full h-[42px] px-3 rounded-lg border text-sm outline-none transition-all shadow-sm text-black";
    const normalBorder = "border-gray-300 focus:border-[#49C77F] focus:ring-2 focus:ring-[#49C77F]/30";
    const errorBorder = "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/30";

    const renderError = (field: string) =>
        errors[field] && (
            <p className="mt-1 text-xs text-red-500">{errors[field]}</p>
        );

    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
        >
            <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                    Education Name
                </label>
                <input
                    type="text"
                    name="educationName"
                    placeholder='e.g., "Bachelor of Technology"'
                    value={form.educationName}
                    onChange={handleChange}
                    className={`${baseInput} ${errors.educationName ? errorBorder : normalBorder}`}
                />
                {renderError("educationName")}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Education Code
                    </label>
                    <input
                        type="text"
                        name="educationCode"
                        placeholder='e.g., "B.Tech"'
                        value={form.educationCode}
                        onChange={handleChange}
                        className={`${baseInput} ${errors.educationCode ? errorBorder : normalBorder}`}
                    />
                    {renderError("educationCode")}
                </div>

                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Education Level
                    </label>
                    <input
                        type="text"
                        name="educationLevel"
                        placeholder='e.g., "Undergraduate"'
                        value={form.educationLevel}
                        onChange={handleChange}
                        className={`${baseInput} ${errors.educationLevel ? errorBorder : normalBorder}`}
                    />
                    {renderError("educationLevel")}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Duration (Years)
                    </label>
                    <input
                        type="text"
                        name="durationYears"
                        placeholder="e.g., 4"
                        value={form.durationYears}
                        onChange={handleChange}
                        className={`${baseInput} ${errors.durationYears ? errorBorder : normalBorder}`}
                    />
                    {renderError("durationYears")}
                </div>

                <button
                    onClick={handleSubmit}
                    className="mt-6 bg-[#49C77F] text-white h-[42px] rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all cursor-pointer"
                >
                    Save
                </button>
            </div>
        </motion.div>
    );
}
