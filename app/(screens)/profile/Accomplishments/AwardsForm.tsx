import { useState } from "react";
import { Input, Select, TextArea } from "../../../utils/ReusableComponents";
import toast from "react-hot-toast";
import { upsertAward } from "@/lib/helpers/upsertAward";

interface AwardProps {
    index: number;
    onSubmit: () => void;
    studentId: number;
}

export default function AwardsForm({ index, onSubmit, studentId }: AwardProps) {
    const [form, setForm] = useState({
        awardName: "",
        issuedBy: "",
        dateReceived: "",
        category: "",
        description: "",
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;

        if (name === "awardName" || name === "issuedBy") {
            const cleaned = value.replace(/[^A-Za-z ]/g, "");
            setForm({ ...form, [name]: cleaned });
            return;
        }

        if (name === "dateReceived") {
            let cleaned = value.replace(/[^0-9]/g, ""); 

            
            if (cleaned.length >= 5) {
                cleaned = cleaned.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
            } else if (cleaned.length >= 3) {
                cleaned = cleaned.replace(/(\d{2})(\d{1,2})/, "$1/$2");
            }

            cleaned = cleaned.slice(0, 10); 
            setForm({ ...form, dateReceived: cleaned });
            return;
        }

        if (name === "category") {
            const allowed = ["Hackathon", "Academic", "Sports", "Other"];
            if (!allowed.includes(value)) return; 
            setForm({ ...form, category: value });
            return;
        }

        if (name === "description") {
            const cleaned = value.replace(/[^A-Za-z \n]/g, "");
            setForm({ ...form, description: cleaned });
            return;
        }

        setForm({ ...form, [name]: value });
    };


    const validateAwards = () => {
        const onlyLettersRegex = /^[A-Za-z ]+$/;

        if (!form.awardName.trim())
            return "Award Name is required";

        if (!onlyLettersRegex.test(form.awardName))
            return "Award Name should contain only letters and spaces";


        if (!form.issuedBy.trim())
            return "Issued By is required";

        if (!onlyLettersRegex.test(form.issuedBy))
            return "Issued By should contain only letters and spaces";

        const dateRegex =   /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/[0-9]{4}$/;
        if (!form.dateReceived.trim())
            return "Date Received is required";

        if (!dateRegex.test(form.dateReceived))
            return "Date must be in DD/MM/YYYY format";

        const allowedCategories = ["Hackathon", "Academic", "Sports", "Other"];

        if (form.category && !allowedCategories.includes(form.category))
            return "Please select a valid Category";


        const descriptionRegex = /^[A-Za-z \n]+$/;

        if (!form.description.trim())
            return "Description is required";

        if (!descriptionRegex.test(form.description))
            return "Description should contain only letters and spaces (no numbers or symbols)";

        return null;
    };

    const saveAward = async () => {
        const error = validateAwards();
        if (error) return toast.error(error);

        const payload = {
            awardId: undefined,
            studentId,
            awardName: form.awardName,
            issuedBy: form.issuedBy,
            dateReceived: form.dateReceived, 
            category: form.category,
            description: form.description,
        };

        console.log(" Award Payload:", payload);

        const response = await upsertAward(payload);

        if (response.success) {
            toast.success(`Award ${index + 1} submitted successfully`);
            onSubmit();
        } else {
            toast.error(response.error || "Something went wrong!");
        }
    };

    const handleSubmit = () => {
        const error = validateAwards();
        if (error) return toast.error(error);
        saveAward();
    };
    return (
        <div>
            <h3 className="text-base font-semibold text-[#282828] mb-4">
                Award {index + 1}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 text-[#282828] gap-8">

             
                <Input
                    label="Award Name"
                    name="awardName"
                    value={form.awardName}
                    onChange={handleChange}
                    placeholder="Best Coder Award"
                />

              
                <Input
                    label="Issued By"
                    name="issuedBy"
                    value={form.issuedBy}
                    onChange={handleChange}
                    placeholder="Google Developer Student Club"
                />

              
                <Input
                    label="Date Received"
                    name="dateReceived"
                    value={form.dateReceived}
                    onChange={handleChange}
                    placeholder="DD/MM/YYYY"
                />

             
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
                    placeholder="Describe your achievement..."
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