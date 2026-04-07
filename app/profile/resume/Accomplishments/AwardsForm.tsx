import { Input, Select, TextArea } from "@/app/utils/ReusableComponents";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { insertAward, updateAward } from "@/lib/helpers/student/Resume/resumeAwardsAPI";

interface AwardRecord {
  awardId: number;
  awardName: string;
  issuedBy: string;
  dateReceived: string;
  category: string;
  description: string;
}

interface AwardProps {
  index: number;
  onSubmit: (record: AwardRecord) => void;
  onRemove: () => void;
  studentId: number;
  existingData?: AwardRecord | null;
}

export default function AwardsForm({ index, onSubmit, onRemove, studentId, existingData }: AwardProps) {
  const [form, setForm] = useState({
    awardName: "",
    issuedBy: "",
    dateReceived: "",
    category: "",
    description: "",
  });
  const [awardId, setAwardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!existingData) return;
    setAwardId(existingData.awardId);
    setForm({
      awardName: existingData.awardName,
      issuedBy: existingData.issuedBy,
      dateReceived: existingData.dateReceived,
      category: existingData.category ?? "",
      description: existingData.description,
    });
  }, [existingData?.awardId]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "awardName" || name === "issuedBy") {
      setForm({ ...form, [name]: value.replace(/[^A-Za-z ]/g, "") });
      return;
    }
    if (name === "description") {
      setForm({ ...form, description: value.replace(/[^A-Za-z \n]/g, "") });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const validate = (): string | null => {
    const onlyLetters = /^[A-Za-z ]+$/;
    if (!form.awardName.trim()) return "Award Name is required";
    if (!onlyLetters.test(form.awardName)) return "Award Name should contain only letters";
    if (!form.issuedBy.trim()) return "Issued By is required";
    if (!onlyLetters.test(form.issuedBy)) return "Issued By should contain only letters";
    if (!form.dateReceived) return "Date Received is required";
    if (!form.description.trim()) return "Description is required";
    if (!onlyLetters.test(form.description.replace(/\n/g, " "))) return "Description should contain only letters";
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) { toast.error(error); return; }

    setLoading(true);
    try {
      const payload = {
        studentId,
        awardName: form.awardName,
        issuedBy: form.issuedBy,
        dateReceived: form.dateReceived,
        category: form.category,
        description: form.description,
      };

      let savedId = awardId;
      if (awardId) {
        await updateAward(awardId, payload);
      } else {
        const result = await insertAward(payload);
        savedId = result.awardId;
        setAwardId(result.awardId);
      }

      toast.success(`Award ${index + 1} saved successfully`);
      onSubmit({
        awardId: savedId!,
        awardName: form.awardName,
        issuedBy: form.issuedBy,
        dateReceived: form.dateReceived,
        category: form.category,
        description: form.description,
      });
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-base font-semibold text-[#282828] mb-4">Award {index + 1}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 text-[#282828] gap-8">
        <Input label="Award Name" name="awardName" value={form.awardName} onChange={handleChange} placeholder="Best Coder Award" />
        <Input label="Issued By" name="issuedBy" value={form.issuedBy} onChange={handleChange} placeholder="Google Developer Student Club" />
        <Input label="Date Received" name="dateReceived" type="date" value={form.dateReceived} onChange={handleChange} />
        <Select label="Category (Optional)" name="category" value={form.category} options={["Hackathon", "Academic", "Sports", "Other"]} onChange={handleChange} />
        <TextArea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Describe your achievement..." />
        <div className="md:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"}`}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}