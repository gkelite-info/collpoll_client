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

// ── Sanitizers ────────────────────────────────────────────────────────────────

const sanitizeText = (value: string) =>
  value.replace(/[^A-Za-z\s\-&.,()']/g, "");

const sanitizeDate = (value: string): string => {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  const cappedYear = (year || "").slice(0, 4);
  return [cappedYear, month, day].join("-");
};

// ── Validators ────────────────────────────────────────────────────────────────

const isValidDateString = (val: string): boolean => {
  if (!val || val.trim() === "") return false;
  const parts = val.split("-");
  if (parts.length !== 3) return false;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (yearStr.length !== 4) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

// ── FieldLabel ────────────────────────────────────────────────────────────────

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-[#282828] mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AwardsForm({
  index,
  onSubmit,
  onRemove,
  studentId,
  existingData,
}: AwardProps) {
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

  // ── Pre-fill on edit ────────────────────────────────────────────────────────
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

  // ── Change handler ──────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "awardName" || name === "issuedBy") {
      setForm((prev) => ({ ...prev, [name]: sanitizeText(value) }));
      return;
    }
    if (name === "dateReceived") {
      setForm((prev) => ({ ...prev, dateReceived: sanitizeDate(value) }));
      return;
    }
    if (name === "description") {
      setForm((prev) => ({ ...prev, description: value }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const trimmedName = form.awardName.trim();
    const trimmedIssuedBy = form.issuedBy.trim();

    if (!trimmedName) {
      toast.error("Please fill Award Name field"); return false;
    }
    if (trimmedName.length < 2) {
      toast.error("Award Name must be at least 2 characters"); return false;
    }
    if (trimmedName.length > 100) {
      toast.error("Award Name must not exceed 100 characters"); return false;
    }
    if (!trimmedIssuedBy) {
      toast.error("Please fill Issued By field"); return false;
    }
    if (trimmedIssuedBy.length < 2) {
      toast.error("Issued By must be at least 2 characters"); return false;
    }
    if (trimmedIssuedBy.length > 100) {
      toast.error("Issued By must not exceed 100 characters"); return false;
    }
    if (!form.dateReceived) {
      toast.error("Please fill Date Received field"); return false;
    }
    if (!isValidDateString(form.dateReceived)) {
      toast.error("Enter a valid date received (day 1–31, month 1–12, 4-digit year)"); return false;
    }

    return true;
  };

  // ── API Call ────────────────────────────────────────────────────────────────
  const callApi = async (): Promise<AwardRecord | null> => {
    const payload = {
      studentId,
      awardName: form.awardName.trim(),
      issuedBy: form.issuedBy.trim(),
      dateReceived: form.dateReceived,
      category: form.category,
      description: form.description.trim(),
    };

    let savedId = awardId;

    if (awardId) {
      await updateAward(awardId, payload);
      toast.success(`Award ${index + 1} updated successfully`);
    } else {
      const result = await insertAward(payload);
      savedId = result.awardId;
      setAwardId(result.awardId);
      toast.success(`Award ${index + 1} saved successfully`);
    }

    return {
      awardId: savedId!,
      awardName: form.awardName.trim(),
      issuedBy: form.issuedBy.trim(),
      dateReceived: form.dateReceived,
      category: form.category,
      description: form.description.trim(),
    };
  };

  // ── Save handler ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const record = await callApi();
      if (!record) return;
      onSubmit(record);
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // ── Next handler ────────────────────────────────────────────────────────────
  const handleNext = async () => {
    const isFormEmpty =
      !form.awardName.trim() &&
      !form.issuedBy.trim() &&
      !form.dateReceived &&
      !form.category &&
      !form.description.trim();

    // fully empty → skip everything
    if (isFormEmpty) {
      router.push("/profile?resume=competitive-exams&Step=9");
      return;
    }

    // partially filled → MUST validate
    const isValid = validate();

     if (!isValid) {
    //   toast.error("Please fill all required fields");
      return;
     }

    setNextLoading(true);
    try {
      const record = await callApi();
      if (!record) return;

      onSubmit(record);
      router.push("/profile?resume=competitive-exams&Step=9");
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong!");
    } finally {
      setNextLoading(false);
    }
  };

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onRemove();
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
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
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
        >
          <Trash size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 text-[#282828] gap-6">

        {/* Award Name — required */}
        <div>
          <FieldLabel label="Award Name" required />
          <input
            name="awardName"
            value={form.awardName}
            onChange={handleChange}
            placeholder="Best Coder Award"
            maxLength={100}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Issued By — required */}
        <div>
          <FieldLabel label="Issued By" required />
          <input
            name="issuedBy"
            value={form.issuedBy}
            onChange={handleChange}
            placeholder="Google Developer Student Club"
            maxLength={100}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Date Received — required */}
        <div>
          <FieldLabel label="Date Received" required />
          <input
            type="date"
            name="dateReceived"
            value={form.dateReceived}
            onChange={handleChange}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer"
          />
        </div>

        {/* Category — optional */}
        <div>
          <FieldLabel label="Category" />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer bg-white"
          >
            <option value="">Select category (optional)</option>
            {["Hackathon", "Academic", "Sports", "Other"].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* Description — optional */}
        <div className="md:col-span-2">
          <FieldLabel label="Description" />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your achievement..."
            rows={4}
            maxLength={500}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.description.length}/500</p>
        </div>

        {/* Buttons */}
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