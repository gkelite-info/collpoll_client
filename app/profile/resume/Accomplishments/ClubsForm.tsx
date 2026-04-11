import { Input, TextArea } from "@/app/utils/ReusableComponents";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Trash } from "@phosphor-icons/react";
import { insertClub, updateClub } from "@/lib/helpers/student/Resume/resumeClubsAPI";

interface ClubRecord {
  resumeClubCommitteeId: number;
  clubName: string;
  role: string;
  fromDate: string;
  toDate: string;
  description: string;
}

interface ClubProps {
  index: number;
  onSubmit: (record: ClubRecord) => void;
  onRemove: () => void;
  studentId: number;
  existingData?: ClubRecord | null;
}

const toInputDate = (iso: string): string => {
  if (!iso) return "";
  return iso.split("T")[0];
};

const toISO = (dateStr: string): string => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString();
};

export default function ClubsForm({ index, onSubmit, onRemove, studentId, existingData }: ClubProps) {
  const [form, setForm] = useState({
    clubName: "",
    role: "",
    fromDate: "",
    toDate: "",
    description: "",
  });
  const [resumeClubCommitteeId, setResumeClubCommitteeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!existingData) return;
    setResumeClubCommitteeId(existingData.resumeClubCommitteeId);
    setForm({
      clubName: existingData.clubName,
      role: existingData.role,
      fromDate: toInputDate(existingData.fromDate),
      toDate: toInputDate(existingData.toDate),
      description: existingData.description,
    });
  }, [existingData?.resumeClubCommitteeId]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "clubName" || name === "role") {
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
    if (!form.clubName.trim()) return "Club/Committee Name is required";
    if (!onlyLetters.test(form.clubName)) return "Club/Committee Name should only contain letters";
    if (!form.role.trim()) return "Role/Position Held is required";
    if (!onlyLetters.test(form.role)) return "Role/Position Held should only contain letters";
    if (!form.fromDate) return "From Date is required";
    if (!form.toDate) return "To Date is required";
    if (new Date(form.toDate) < new Date(form.fromDate)) return "To Date cannot be before From Date";
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
        clubName: form.clubName,
        role: form.role,
        fromDate: toISO(form.fromDate),
        toDate: toISO(form.toDate),
        description: form.description,
      };

      let savedId = resumeClubCommitteeId;
      if (resumeClubCommitteeId) {
        await updateClub(resumeClubCommitteeId, payload);
      } else {
        const result = await insertClub(payload);
        savedId = result.resumeClubCommitteeId;
        setResumeClubCommitteeId(result.resumeClubCommitteeId);
      }

      toast.success(`Club/Committee ${index + 1} saved successfully`);
      onSubmit({
        resumeClubCommitteeId: savedId!,
        clubName: form.clubName,
        role: form.role,
        fromDate: toISO(form.fromDate),
        toDate: toISO(form.toDate),
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
      {/* ← ADDED: header with trash icon (saved) or minus button (new) */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-[#282828]">Club & Committee {index + 1}</h3>
        {resumeClubCommitteeId ? (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
          >
            <Trash size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onRemove}
            className="w-5 h-5 flex cursor-pointer items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
          >
            <span className="block w-3 h-[3px] bg-white rounded-full" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input label="Club/Committee Name" name="clubName" value={form.clubName} onChange={handleChange} placeholder="Google Developer Student Club" />
        <Input label="Role/Position Held" name="role" value={form.role} onChange={handleChange} placeholder="Core Member" />
        <div className="md:col-span-2 text-[#282828]">
          <p className="text-sm font-medium mb-2">Duration</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="From" name="fromDate" type="date" value={form.fromDate} onChange={handleChange} />
            <Input label="To" name="toDate" type="date" value={form.toDate} onChange={handleChange} />
          </div>
        </div>
        <TextArea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Organized workshop on AI and Cloud Computing for 200+ Students" />
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