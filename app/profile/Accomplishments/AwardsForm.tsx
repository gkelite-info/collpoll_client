import { Input, Select, TextArea } from "@/app/utils/ReusableComponents";
import { useState } from "react";
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

    const [loading, setLoading] = useState(false);

    const handleChange = (e: any) => {


        const { name, value } = e.target;

        if (name === "awardName" || name === "issuedBy") {
            const cleaned = value.replace(/[^A-Za-z ]/g, "");
            setForm({ ...form, [name]: cleaned });
            return;
        }

        if (name === "dateReceived") {
            const iso = value; // YYYY-MM-DD from <input type="date">
            const converted = toDDMMYYYY(iso);
            setForm({ ...form, dateReceived: converted });
            return;
        }


        if (name === "category") {
            const allowed = ["Hackathon", "Academic", "Sports", "Other"];
            if (!allowed.includes(value)) return; // ignore invalid selection

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

    // Convert YYYY-MM-DD → DD-MM-YYYY
    const toDDMMYYYY = (iso: string) => {
        if (!iso) return "";
        const [year, month, day] = iso.split("-");
        return `${day}-${month}-${year}`;
    };

    // Convert DD-MM-YYYY → YYYY-MM-DD
    const toISO = (ddmmyyyy: string) => {
        if (!ddmmyyyy) return "";
        const [day, month, year] = ddmmyyyy.split("-");
        return `${year}-${month}-${day}`;
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

        const dateRegex = /^([0-2][0-9]|3[0-1])-(0[1-9]|1[0-2])-[0-9]{4}$/;
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

    // ⭐ Updated saveAward with loading features
    const saveAward = async () => {
        const error = validateAwards();
        if (error) return toast.error(error);

        setLoading(true);

        try {
            const payload = {
                awardId: undefined,
                studentId,
                awardName: form.awardName,
                issuedBy: form.issuedBy,
                dateReceived: form.dateReceived,
                category: form.category,
                description: form.description,
            };

            const response = await upsertAward(payload);

            if (response.success) {
                toast.success(`Award ${index + 1} submitted successfully`);
                onSubmit();
            } else {
                toast.error(response.error || "Something went wrong!");
            }
        } catch (err) {
            toast.error("Something went wrong!");
        } finally {
            setLoading(false);
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
                    type="date"
                    value={form.dateReceived ? toISO(form.dateReceived) : ""}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}  // cannot pick future dates
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
                   // ⭐ Updated Submit Button
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-2 rounded-md text-sm font-medium text-white
        ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A]"}
    `}
                    >
                        {loading ? "Saving..." : "Submit"}
                    </button>

                </div>

            </div>
        </div>
    );
}