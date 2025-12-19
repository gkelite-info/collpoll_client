import { useState } from "react";
import { Input, Select, TextArea } from "../../../utils/ReusableComponents";
import toast from "react-hot-toast";

interface AwardProps {
    index : number
    onSubmit : ()=>void
}

export default function AwardsForm({index, onSubmit}: AwardProps) {
    const [form, setForm] = useState({
        awardName: "",
        issuedBy: "",
        date: "",
        category: "",
        description: "",
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log(`awards_${index + 1}`, form);
        onSubmit();
        toast.success(`Award ${index + 1} submitted successfully`);
    };
    return (
        <div>
            <h3 className="text-base font-semibold text-[#282828] mb-4">
                Award {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Award Name" name="awardName" value={form.awardName} onChange={handleChange} placeholder="Best Coder Award" />
                <Input label="Issued By" name="issuedBy" value={form.issuedBy} onChange={handleChange} placeholder="Google Developer Student Club" />
                <Input label="Date Received" name="date" value={form.date} onChange={handleChange} placeholder="01/11/2024" />
                <Select
                    label="Category (Optional)"
                    name="category"
                    value={form.category}
                    options={["Hackathon", "Academic", "Sports", "Other"]}
                    onChange={handleChange}
                />
                <TextArea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Secured 1st place in a 24-hour hackathon for developing an AI chatbot for campus queries."
                />
                <div className="md:col-span-2 flex justify-end">
                    <button
                        type="button"
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