import { Input, Select, TextArea } from "@/app/utils/ReusableComponents";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Trash } from "@phosphor-icons/react";
import { insertAward, updateAward } from "@/lib/helpers/student/Resume/resumeAwardsAPI";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

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
  const router = useRouter();
  const [form, setForm] = useState({
    awardName: "",
    issuedBy: "",
    dateReceived: "",
    category: "",
    description: "",
  });
  const [awardId, setAwardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const saveData = async (): Promise<AwardRecord | null> => {
    const error = validate();
    if (error) { toast.error(error); return null; }

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

    return {
      awardId: savedId!,
      awardName: form.awardName,
      issuedBy: form.issuedBy,
      dateReceived: form.dateReceived,
      category: form.category,
      description: form.description,
    };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const record = await saveData();
      if (!record) return;
      toast.success(`Award ${index + 1} saved successfully`);
      onSubmit(record);
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    setNextLoading(true);
    try {
      // ❌ REMOVE validation call
      // const success = await saveData();
      // if (!success) return;

      // ✅ Direct navigation without validation
      router.push("/profile?resume=competitive-exams&Step=9");
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong!");
    } finally {
      setNextLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onRemove();
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div>
      <ConfirmDeleteModal
        open={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isDeleting={isDeleting}
        name="award"
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-[#282828]">Award {index + 1}</h3>
        {/* Unified trash icon for both saved and unsaved — confirm modal handles both */}
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
        >
          <Trash size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 text-[#282828] gap-8">
        <Input label="Award Name" name="awardName" value={form.awardName} onChange={handleChange} placeholder="Best Coder Award" />
        <Input label="Issued By" name="issuedBy" value={form.issuedBy} onChange={handleChange} placeholder="Google Developer Student Club" />
        <Input label="Date Received" name="dateReceived" type="date" value={form.dateReceived} onChange={handleChange} />
        <Select label="Category (Optional)" name="category" value={form.category} options={["Hackathon", "Academic", "Sports", "Other"]} onChange={handleChange} />
        <TextArea label="Description" name="description" value={form.description} onChange={handleChange} placeholder="Describe your achievement..." />

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || nextLoading}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${loading || nextLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
              }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading || nextLoading}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${loading || nextLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
              }`}
          >
            {nextLoading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}