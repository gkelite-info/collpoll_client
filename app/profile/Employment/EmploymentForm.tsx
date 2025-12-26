"use client";

import { Input, Select, TextArea } from "@/app/utils/ReusableComponents";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "@phosphor-icons/react";
import { addEmployment, updateEmployment, deleteEmployment } from "@/lib/helpers/profile/employment";
import ConfirmDeleteModal from "@/lib/helpers/ConfirmDeleteModal";

export default function EmploymentForm({
    index,
    data,
    studentId,
    onSuccess,
}: {
    index: number;
    data: any;
    studentId: number;
    onSuccess: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [form, setForm] = useState({
        companyName: data?.companyName ?? "",
        designation: data?.designation ?? "",
        experienceYears: data?.experienceYears
            ? data.experienceYears >= 4
                ? "4+ Years"
                : `${data.experienceYears} ${data.experienceYears > 1 ? "Years" : "Year"}`
            : "",
        experienceMonths: data?.experienceMonths
            ? `${data.experienceMonths} ${data.experienceMonths > 1 ? "Months" : "Month"}`
            : "",

        from: data?.startDate ?? "",
        to: data?.endDate ?? "",
        description: data?.description ?? "",
    });

    const today = new Date().toISOString().split("T")[0];

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!form.companyName.trim()) return "Company Name is required";
        if (!form.designation.trim()) return "Designation is required";
        if (!form.experienceYears) return "Please select experience in years";
        if (!isFourPlusYears && !form.experienceMonths)
            return "Please select experience in months";
        if (!form.from) return "Start date is required";
        if (!form.to) return "End date is required";
        if (form.from > today) return "Start date cannot be in the future";
        if (form.to > today) return "End date cannot be in the future";
        if (form.to < form.from) return "End date cannot be before start date";
        //if (!form.description.trim()) return "Short description is required";
        return null;
    };

    const parseNumber = (val: string) =>
        Number(val.split(" ")[0]);

    const isFourPlusYears = form.experienceYears === "4+ Years";

    const parseYears = (val: string) => {
        if (val === "4+ Years") return 4;
        return Number(val.split(" ")[0]);
    };

    const parseMonths = (val: string) => {
        if (isFourPlusYears) return 0;
        return Number(val.split(" ")[0]);
    };


    const handleSubmit = async () => {
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        setIsSubmitting(true);

        const payload = {
            studentId,
            companyName: form.companyName,
            designation: form.designation,
            experienceYears: parseYears(form.experienceYears),
            experienceMonths: parseMonths(form.experienceMonths),
            startDate: form.from,
            endDate: form.to,
            description: form.description,
            updatedAt: new Date().toISOString(),
        };

        try {
            if (data?.employmentId) {
                await updateEmployment(data.employmentId, payload);
                toast.success(`Employment ${index + 1} updated`);
            } else {
                await addEmployment({
                    ...payload,
                    createdAt: new Date().toISOString(),
                });
                toast.success(`Employment ${index + 1} submitted`);
            }

            onSuccess();
        } catch (error: any) {
            console.log("Error submitting employment:", error);
            toast.error(error.message || "Failed to save employment");
        }
        finally {
            setIsSubmitting(false);
        }
    };

    const startMaxDate = form.to
        ? form.to < today ? form.to : today
        : today;

    const endMinDate = form.from || undefined;

    const handleDelete = async () => {
        if (!data?.employmentId) return;

        try {
            setIsDeleting(true);
            await deleteEmployment(data.employmentId);
            toast.success("Employment deleted successfully");
            onSuccess();
        } catch (error: any) {
            toast.error(error?.message || "Failed to delete employment");
        } finally {
            setIsDeleting(false);
            setOpenDelete(false);
        }
    };


    return (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-[#282828]">
                    Employment {index + 1}
                </h3>

                {data?.employmentId && (
                    <Trash
                        size={20}
                        className="text-red-500 cursor-pointer"
                        onClick={() => setOpenDelete(true)}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                    label="Company Name"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder="Student Attendance Tracker, AI Chatbot for College"
                />

                <Input
                    label="Designation"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="Web Development"
                />

                <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-2">Total Work Experience</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Select
                            label=""
                            name="experienceYears"
                            value={form.experienceYears}
                            options={["1 Year", "2 Years", "3 Years", "4+ Years"]}
                            onChange={handleChange}
                        />

                        <Select
                            label=""
                            name="experienceMonths"
                            value={form.experienceMonths}
                            options={["1 Month", "3 Months", "6 Months", "9 Months"]}
                            onChange={handleChange}
                            disabled={isFourPlusYears}
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-2">Working Since</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="From"
                            name="from"
                            type="date"
                            value={form.from}
                            onChange={handleChange}
                            max={startMaxDate}
                        />

                        <Input
                            label="To"
                            name="to"
                            type="date"
                            value={form.to}
                            onChange={handleChange}
                            min={endMinDate}
                            max={today}
                        />
                    </div>
                </div>

                <TextArea
                    label="Short Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Explain your role, key contributions, and skills..."
                />

                <div className="md:col-span-2 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
            <ConfirmDeleteModal
                open={openDelete}
                title="Delete Employment"
                description="Are you sure you want to delete this employment?"
                onCancel={() => setOpenDelete(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
