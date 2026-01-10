"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InputField } from "../components/reusableComponents";

export default function EducationalType() {
    const [form, setForm] = useState({
        educationName: "",
        educationCode: "",
        educationLevel: "",
        durationYears: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const nameRegex = /^[A-Za-z.\-\s]+$/;
    const alphaRegex = /^[A-Za-z\s]+$/;
    const numberRegex = /^[0-9]+$/;
    const createdByRegex = /^[A-Za-z0-9]+$/;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    const validateField = (name: string, value: string) => {
        let message = "";

        switch (name) {
            case "educationName":
                if (!nameRegex.test(value))
                    message = "Only letters, spaces, '.' and '-' allowed";
                break;

            case "educationCode":
                if (!alphaRegex.test(value))
                    message = "Only alphabets allowed (no numbers or symbols)";
                break;

            case "educationLevel":
                if (!alphaRegex.test(value))
                    message = "Only alphabets allowed";
                break;

            case "durationYears":
                if (!numberRegex.test(value))
                    message = "Only integers allowed";
                break;

            case "createdBy":
                if (!createdByRegex.test(value))
                    message = "Invalid Created By format";
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: message }));
    };

    const handleSubmit = () => {
        const hasErrors = Object.values(errors).some(Boolean);
        if (hasErrors) return alert("Please fix validation errors");

        console.log("Final Payload:", form);
    };

    /* ================= UI ================= */
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-5"
        >

            <InputField
                label="Education Name"
                name="educationName"
                placeholder='e.g., "B.Tech - CSE"'
                value={form.educationName}
                onChange={handleChange}
                error={errors.educationName}
            />

            <div className="grid grid-cols-2 gap-4">
                <InputField
                    label="Education Code"
                    name="educationCode"
                    placeholder='e.g., "BTECH"'
                    value={form.educationCode}
                    onChange={handleChange}
                    error={errors.educationCode}
                />

                <InputField
                    label="Education Level"
                    name="educationLevel"
                    placeholder='e.g., "Undergraduate"'
                    value={form.educationLevel}
                    onChange={handleChange}
                    error={errors.educationLevel}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <InputField
                    label="Duration (Years)"
                    name="durationYears"
                    placeholder="e.g., 4"
                    value={form.durationYears}
                    onChange={handleChange}
                    error={errors.durationYears}
                />
                <button
                    onClick={handleSubmit}
                    className="my-7 bg-[#49C77F] text-white h-[42px]  rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all cursor-pointer"
                >
                    Save
                </button>
            </div>

        </motion.div>
    );
}
