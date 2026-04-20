import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Trash } from "@phosphor-icons/react";
import { insertClub, updateClub } from "@/lib/helpers/student/Resume/resumeClubsAPI";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const toInputDate = (iso: string): string => {
  if (!iso) return "";
  return iso.split("T")[0];
};

const toISO = (dateStr: string): string => {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString();
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

export default function ClubsForm({
  index,
  onSubmit,
  onRemove,
  studentId,
  existingData,
}: ClubProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    clubName: "",
    role: "",
    fromDate: "",
    toDate: "",
    description: "",
  });
  const [resumeClubCommitteeId, setResumeClubCommitteeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const showSuccessToast = (message: string) =>
    toast.success(message, { duration: 3000 });

  const waitForToast = () =>
    new Promise((resolve) => setTimeout(resolve, 700));

  // ── Pre-fill on edit ────────────────────────────────────────────────────────

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

  // ── Change handler ──────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "clubName" || name === "role") {
      setForm((prev) => ({ ...prev, [name]: sanitizeText(value) }));
      return;
    }
    if (name === "fromDate" || name === "toDate") {
      setForm((prev) => ({ ...prev, [name]: sanitizeDate(value) }));
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
    const trimmedName = form.clubName.trim();
    const trimmedRole = form.role.trim();

    // Required: Club Name
    if (!trimmedName) {
      toast.error("Please fill Club/Committee Name field");
      return false;
    }
    if (trimmedName.length < 2) {
      toast.error("Club/Committee Name must be at least 2 characters");
      return false;
    }
    if (trimmedName.length > 100) {
      toast.error("Club/Committee Name must not exceed 100 characters");
      return false;
    }

    // Required: Role
    if (!trimmedRole) {
      toast.error("Please fill Role/Position Held field");
      return false;
    }
    if (trimmedRole.length < 2) {
      toast.error("Role/Position Held must be at least 2 characters");
      return false;
    }
    if (trimmedRole.length > 100) {
      toast.error("Role/Position Held must not exceed 100 characters");
      return false;
    }

    // Required: From Date
    if (!form.fromDate) {
      toast.error("Please fill From Date field");
      return false;
    }
    if (!isValidDateString(form.fromDate)) {
      toast.error("Enter a valid From date (day 1–31, month 1–12, 4-digit year)");
      return false;
    }

    // Optional: To Date (only validate if filled)
    if (form.toDate) {
      if (!isValidDateString(form.toDate)) {
        toast.error("Enter a valid To date (day 1–31, month 1–12, 4-digit year)");
        return false;
      }
      if (new Date(form.toDate) < new Date(form.fromDate)) {
        toast.error("To Date cannot be before From Date");
        return false;
      }
    }

    return true;
  };

  // ── API Call ────────────────────────────────────────────────────────────────

  const callApi = async (): Promise<ClubRecord | null> => {
    const payload = {
      studentId,
      clubName: form.clubName.trim(),
      role: form.role.trim(),
      fromDate: toISO(form.fromDate),
      toDate: form.toDate ? toISO(form.toDate) : "",
      description: form.description.trim(),
    };

    let savedId = resumeClubCommitteeId;

    if (resumeClubCommitteeId) {
      await updateClub(resumeClubCommitteeId, payload);
      showSuccessToast(`Club/Committee ${index + 1} updated successfully`);
    } else {
      const result = await insertClub(payload);
      savedId = result.resumeClubCommitteeId;
      setResumeClubCommitteeId(result.resumeClubCommitteeId);
      showSuccessToast(`Club/Committee ${index + 1} saved successfully`);
    }

    return {
      resumeClubCommitteeId: savedId!,
      clubName: form.clubName.trim(),
      role: form.role.trim(),
      fromDate: toISO(form.fromDate),
      toDate: form.toDate ? toISO(form.toDate) : "",
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
      await Promise.resolve(onSubmit(record));
    } catch {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // ── Next handler ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    const isFormEmpty =
      !form.clubName.trim() &&
      !form.role.trim() &&
      !form.fromDate &&
      !form.toDate &&
      !form.description.trim();

    // Fully empty → navigate directly, no toast, no API
    if (isFormEmpty) {
      router.push("/profile?resume=competitive-exams&Step=8");
      return;
    }

    // Partially or fully filled → validate first, no API if invalid
    if (!validate()) return;

    setNextLoading(true);
    try {
      const record = await callApi();
      if (!record) return;
      await Promise.resolve(onSubmit(record));
      await waitForToast();
      router.push("/profile?resume=competitive-exams&Step=8");
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
        name="club & committee"
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-[#282828]">Club & Committee {index + 1}</h3>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
        >
          <Trash size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#282828]">

        {/* Club Name — required */}
        <div>
          <FieldLabel label="Club/Committee Name" required />
          <input
            name="clubName"
            value={form.clubName}
            onChange={handleChange}
            placeholder="Google Developer Student Club"
            maxLength={100}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Role — required */}
        <div>
          <FieldLabel label="Role/Position Held" required />
          <input
            name="role"
            value={form.role}
            onChange={handleChange}
            placeholder="Core Member"
            maxLength={100}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        {/* Duration */}
        <div className="md:col-span-2">
          <p className="text-sm font-medium mb-2">Duration</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* From — required */}
            <div>
              <FieldLabel label="From" required />
              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                disabled={loading || nextLoading}
                className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer"
              />
            </div>

            {/* To — optional */}
            <div>
              <FieldLabel label="To" />
              <input
                type="date"
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                disabled={loading || nextLoading || !form.fromDate}
                min={form.fromDate}
                className={`w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer ${
                  !form.fromDate ? "bg-gray-50 cursor-not-allowed" : ""
                }`}
              />
            </div>

          </div>
        </div>

        {/* Description — optional */}
        <div className="md:col-span-2">
          <FieldLabel label="Description" />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Organized workshop on AI and Cloud Computing for 200+ Students"
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
            className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${
              loading || nextLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading || nextLoading}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${
              loading || nextLoading ? "bg-gray-400 cursor-not-allowed" : "bg-[#43C17A] cursor-pointer"
            }`}
          >
            {nextLoading ? "Saving..." : "Next"}
          </button>
        </div>

      </div>
    </div>
  );
}
