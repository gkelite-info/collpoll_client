import { useState } from "react";
import { Input, TextArea } from "../../../utils/ReusableComponents";
import toast from "react-hot-toast";

interface ClubProps {
    index: number
    onSubmit: () => void
}

export default function ClubsForm({ index, onSubmit }: ClubProps) {
    const [form, setForm] = useState({
        clubName: "",
        role: "",
        from: "",
        to: "",
        description: "",
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log(`clubs_${index + 1}`, form);
        onSubmit();
        toast.success(`Club & Committee ${index + 1} submitted successfully`);
    };
    return (
        <div>
            <h3 className="text-base font-semibold text-[#282828] mb-4">
                Club & Committee {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Club/Committee Name" name="clubName" value={form.clubName} onChange={handleChange} placeholder="Google Developer Student Club" />
                <Input label="Role/Position Held" name="role" value={form.role} onChange={handleChange} placeholder="Core Member" />
                <div className="md:col-span-2">
                    <p className="text-sm font-medium mb-2">Duration</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="From" name="from" value={form.from} onChange={handleChange} placeholder="01/10/2024" />
                        <Input label="To" name="to" value={form.to} onChange={handleChange} placeholder="01/11/2024" />
                    </div>
                </div>
                <TextArea
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Organized workshop on AI and Cloud Computing for 200+ Students"
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