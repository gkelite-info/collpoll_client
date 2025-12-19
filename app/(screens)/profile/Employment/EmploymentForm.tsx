import { useState } from "react";
import toast from "react-hot-toast";
import { Input, Select, TextArea } from "../../../utils/ReusableComponents";

export default function EmploymentForm({
    index,
    onSubmit,
}: {
    index: number;
    onSubmit: () => void;
}) {
    const [form, setForm] = useState({
        companyName: "",
        designation: "",
        experienceYears: "",
        experienceMonths: "",
        from: "",
        to: "",
        description: "",
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log(`employment_${index + 1}`, form);
        toast.success(`Employment ${index + 1} submitted successfully`);
        onSubmit();
    };

    return (
        <div className="mb-12">
            <h3 className="text-base font-semibold text-[#282828] mb-4">
                Employment {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                    label="Company Name"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    placeholder='Student Attendance Tracker, AI Chatbot for College'
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
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-2">Working Since</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            label="From"
                            name="from"
                            value={form.from}
                            onChange={handleChange}
                            placeholder="DD/MM/YYYY"
                        />
                        <Input
                            label="To"
                            name="to"
                            value={form.to}
                            onChange={handleChange}
                            placeholder="DD/MM/YYYY"
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
                        className="bg-[#43C17A] cursor-pointer text-white px-6 py-2 rounded-md text-sm font-medium"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
