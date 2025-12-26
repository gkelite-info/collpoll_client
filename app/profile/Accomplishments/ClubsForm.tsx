import { Input, TextArea } from "@/app/utils/ReusableComponents";
import { useState } from "react";
<<<<<<< Updated upstream:app/profile/Accomplishments/ClubsForm.tsx
=======
import { Input, Select, TextArea } from "../../../utils/ReusableComponents";
>>>>>>> Stashed changes:app/(screens)/profile/Accomplishments/ClubsForm.tsx
import toast from "react-hot-toast";
import { upsertClubCommittee } from "@/lib/helpers/upsertClubCommittee";

interface ClubProps {
    index: number;
    onSubmit: () => void;
    studentId: number;
}

export default function ClubsForm({ index, onSubmit, studentId }: ClubProps) {
    const [form, setForm] = useState({
        clubName: "",
        role: "",
        fromDate: "",
        toDate: "",
        description: "",
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        if (name === "clubName" || name === "role") {
            const cleaned = value.replace(/[^A-Za-z ]/g, "");
            setForm({ ...form, [name]: cleaned });
            return;
        }

        if (name === "fromDate" || name === "toDate") {
            let cleaned = value.replace(/[^0-9]/g, ""); 

            if (cleaned.length >= 5) {
                cleaned = cleaned.replace(
                    /(\d{2})(\d{2})(\d{0,4})/,
                    "$1/$2/$3"
                );
            } else if (cleaned.length >= 3) {
                cleaned = cleaned.replace(/(\d{2})(\d{1,2})/, "$1/$2");
            }

            cleaned = cleaned.slice(0, 10);
            setForm({ ...form, [name]: cleaned });
            return;
        }

        if (name === "description") {
            const cleaned = value.replace(/[^A-Za-z \n]/g, "");
            setForm({ ...form, description: cleaned });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    const validateCommittee = () => {
        const onlyLetters = /^[A-Za-z ]+$/;
        const descriptionRegex = /^[A-Za-z \n]+$/;

        const dateRegex =
            /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/[0-9]{4}$/;

        if (!form.clubName.trim())
            return "Club/Committee Name is required";

        if (!onlyLetters.test(form.clubName))
            return "Club/Committee Name should only contain letters and spaces";

      
        if (!form.role.trim())
            return "Role/Position Held is required";

        if (!onlyLetters.test(form.role))
            return "Role/Position Held should only contain letters and spaces";

       
        if (!form.fromDate.trim())
            return "From Date is required";

        if (!dateRegex.test(form.fromDate))
            return "From Date must be in DD/MM/YYYY format";

      
        if (!form.toDate.trim())
            return "To Date is required";

        if (!dateRegex.test(form.toDate))
            return "To Date must be in DD/MM/YYYY format";

      
        const convert = (d: string) => {
            const [dd, mm, yyyy] = d.split("/").map(Number);
            return new Date(yyyy, mm - 1, dd);
        };

        const from = convert(form.fromDate);
        const to = convert(form.toDate);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (from > today)
            return "From Date cannot be in the future";

        if (to > today)
            return "To Date cannot be in the future";

        if (to < from)
            return "To Date cannot be before From Date";

        if (!form.description.trim())
            return "Description is required";

        if (!descriptionRegex.test(form.description))
            return "Description should contain only letters and spaces";

        return null;
    };

  
    const saveCommittee = async () => {
        const error = validateCommittee();
        if (error) return toast.error(error);

        const payload = {
            clubcommiteeId: undefined,
            studentId,
            clubName: form.clubName,
            role: form.role,
            fromDate: form.fromDate,
            toDate: form.toDate,
            description: form.description,
        };

        console.log(" CLUB PAYLOAD:", payload);

        const response = await upsertClubCommittee(payload);

        if (response.success) {
            toast.success(`Club/Committee ${index + 1} saved successfully`);
            onSubmit();
        } else {
            toast.error(response.error || "Something went wrong!");
        }
    };


    const handleSubmit = () => {
        const error = validateCommittee();
        if (error) return toast.error(error);

        saveCommittee();
    };

    return (
        <div>
            <h3 className="text-base font-semibold text-[#282828] mb-4">
                Club & Committee {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Club/Committee Name" name="clubName" value={form.clubName} onChange={handleChange} placeholder="Google Developer Student Club" />
                <Input label="Role/Position Held" name="role" value={form.role} onChange={handleChange} placeholder="Core Member" />
                <div className="md:col-span-2 text-[#282828]">
                    <p className="text-sm font-medium mb-2">Duration</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            label="From"
                            name="fromDate"
                            value={form.fromDate}
                            onChange={handleChange}
                            placeholder="01/10/2024"
                        />

                        <Input
                            label="To"
                            name="toDate"
                            value={form.toDate}
                            onChange={handleChange}
                            placeholder="01/11/2024"
                        />

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