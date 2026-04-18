import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, UploadSimple, Trash } from "@phosphor-icons/react";
import { useRef } from "react";
import { Input } from "@/app/utils/ReusableComponents";
import { useRouter } from "next/navigation";
import {
  insertCertification,
  updateCertification,
  uploadCertificateFile,
} from "@/lib/helpers/student/Resume/resumeCertificationsAPI";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";

interface CertificationsProps {
  index: number;
  studentId: number;
  onRemove: () => void;
  onSubmit: () => void;
  existingData?: {
    resumeCertificateId: number;
    certificationName: string;
    certificationCompletionId: string;
    certificateLink: string;
    uploadCertificate: string;
    startDate: string;
    endDate: string | null;
  } | null;
}

// ── Sanitizers ────────────────────────────────────────────────────────────────

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

// ── Sub-component ─────────────────────────────────────────────────────────────

function CertificateUpload({ form, setForm }: any) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.type)) {
      alert("Only PNG & JPG files are allowed");
      return;
    }
    setForm({ ...form, file: file.name, fileObject: file });
  };

  const removeFile = () => {
    setForm({ ...form, file: "", fileObject: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="relative max-w-[340px]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="w-full border rounded-xl px-3 py-2 flex items-center">
        {form.file ? (
          <div className="flex items-center gap-2 bg-[#E8F9F0] text-[#43C17A] px-3 py-1 rounded-full w-fit">
            <span className="text-sm truncate max-w-[180px]">{form.file}</span>
            <button
              type="button"
              onClick={removeFile}
              className="w-[20px] h-[20px] flex items-center justify-center rounded-full border border-red-500 text-red-500 cursor-pointer hover:bg-red-100 transition"
            >
              <X size={12} weight="bold" />
            </button>
          </div>
        ) : (
          <span className="text-gray-400">Upload Certificate...</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-1/2 -translate-y-1/2 right-[-55px] w-[40px] h-[40px] rounded-full bg-[#43C17A] flex items-center justify-center cursor-pointer"
      >
        <UploadSimple size={20} color="white" weight="bold" />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function CertificationsForm({
  index,
  studentId,
  onRemove,
  onSubmit,
  existingData,
}: CertificationsProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    id: "",
    link: "",
    file: "",
    fileObject: null as File | null,
    startDate: "",
    endDate: "",
  });

  const [resumeCertificateId, setResumeCertificateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [nextLoading, setNextLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const toInputDate = (iso: string | null): string => {
    if (!iso) return "";
    return iso.split("T")[0];
  };

  const toISOString = (dateStr: string): string => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString();
  };

  // ── Pre-fill on edit ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!existingData) return;
    setResumeCertificateId(existingData.resumeCertificateId);
    setForm({
      name: existingData.certificationName,
      id: existingData.certificationCompletionId,
      link: existingData.certificateLink,
      file: existingData.uploadCertificate
        ? existingData.uploadCertificate.split("/").pop() ?? "Uploaded"
        : "",
      fileObject: null,
      startDate: toInputDate(existingData.startDate),
      endDate: toInputDate(existingData.endDate),
    });
  }, [existingData]);

  // ── Change handler ──────────────────────────────────────────────────────────

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "name") {
      setForm({ ...form, name: value.replace(/[^A-Za-z0-9 .,-]/g, "") });
      return;
    }
    if (name === "id") {
      setForm({ ...form, id: value.replace(/[^A-Za-z0-9\-_ ]/g, "") });
      return;
    }
    if (name === "link") {
      setForm({ ...form, link: value.replace(/[^A-Za-z0-9:/?&%=._\-#]/g, "") });
      return;
    }
    if (name === "startDate" || name === "endDate") {
      setForm({ ...form, [name]: sanitizeDate(value) });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  // ── Validate ────────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const trimmedName = form.name.trim();
    const trimmedLink = form.link.trim();

    // Required: Certification Name
    if (!trimmedName) {
      toast.error("Please fill Certification Name field");
      return false;
    }
    if (trimmedName.length < 3) {
      toast.error("Certification Name must be at least 3 characters");
      return false;
    }
    if (trimmedName.length > 100) {
      toast.error("Certification Name must not exceed 100 characters");
      return false;
    }
    if (!/^[A-Za-z0-9 .,-]+$/.test(trimmedName)) {
      toast.error("Certification Name contains invalid characters");
      return false;
    }

    // Required: Upload Certificate
    if (!form.file) {
      toast.error("Please upload a Certificate");
      return false;
    }

    // Optional: Completion ID format check (only if filled)
    if (form.id.trim()) {
      if (!/^[A-Za-z0-9\-_ ]{2,50}$/.test(form.id.trim())) {
        toast.error("Completion ID format is invalid");
        return false;
      }
    }

    // Optional: Certificate Link format check (only if filled)
    if (trimmedLink) {
      if (!/^(https?:\/\/)[^\s]+$/.test(trimmedLink)) {
        toast.error("Certificate Link must start with http or https");
        return false;
      }
    }

    // Optional: Start Date (validate format only if filled)
    if (form.startDate && !isValidDateString(form.startDate)) {
      toast.error("Enter a valid start date (day 1–31, month 1–12, 4-digit year)");
      return false;
    }

    // Optional: End Date (only validate if filled)
    if (form.endDate) {
      if (!isValidDateString(form.endDate)) {
        toast.error("Enter a valid end date (day 1–31, month 1–12, 4-digit year)");
        return false;
      }
      if (form.startDate && new Date(form.endDate) <= new Date(form.startDate)) {
        toast.error("End date must be after start date");
        return false;
      }
    }

    return true;
  };

  // ── API Call ────────────────────────────────────────────────────────────────

  const callApi = async (): Promise<boolean> => {
    let uploadedUrl = existingData?.uploadCertificate ?? "";
    if (form.fileObject) {
      uploadedUrl = await uploadCertificateFile(studentId, form.fileObject);
    }

    const payload = {
      certificationName: form.name.trim(),
      certificationCompletionId: form.id.trim(),
      certificateLink: form.link.trim(),
      uploadCertificate: uploadedUrl,
      startDate: toISOString(form.startDate),
      endDate: form.endDate ? toISOString(form.endDate) : null,
    };

    if (resumeCertificateId) {
      await updateCertification(resumeCertificateId, payload);
      toast.success(`Certification ${index + 1} updated successfully`);
    } else {
      const result = await insertCertification({ studentId, ...payload });
      setResumeCertificateId(result.resumeCertificateId);
      toast.success(`Certification ${index + 1} saved successfully`);
    }

    return true;
  };

  // ── Save handler ────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const success = await callApi();
      if (!success) return;
      onSubmit();
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // ── Next handler ────────────────────────────────────────────────────────────

  const handleNext = async () => {
    const isFormEmpty =
      !form.name.trim() &&
      !form.id.trim() &&
      !form.link.trim() &&
      !form.file &&
      !form.startDate &&
      !form.endDate;

    // Fully empty → skip everything, navigate directly
    if (isFormEmpty) {
      router.push("/profile?resume=competitive-exams&Step=9");
      return;
    }

    // Partially or fully filled → must validate, no API hit if invalid
    if (!validate()) return;

    setNextLoading(true);
    try {
      const success = await callApi();
      if (!success) return;
      onSubmit();
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
        name="certification"
      />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-[#282828]">
          Certification {index + 1}
        </h3>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
        >
          <Trash size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-[#282828] mb-1">
            Certification Name <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Java Full Stack"
            maxLength={100}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <Input
          label="Certification Completion ID"
          name="id"
          value={form.id}
          onChange={handleChange}
          placeholder="WD-12345"
          disabled={loading || nextLoading}
        />
        <Input
          label="Certificate Link"
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="https://example.com"
          disabled={loading || nextLoading}
        />
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-[#282828]">
            Upload Certificate <span className="text-red-500 ml-0.5">*</span>
          </label>
          <CertificateUpload form={form} setForm={setForm} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#282828] mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            disabled={loading || nextLoading}
            className="w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#282828] mb-1">
            End Date <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            disabled={loading || nextLoading || !form.startDate}
            min={form.startDate}
            className={`w-full border border-[#CCCCCC] text-[#525252] rounded-md px-3 py-2 text-sm focus:outline-none cursor-pointer ${
              !form.startDate ? "bg-gray-50 cursor-not-allowed" : ""
            }`}
          />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || nextLoading}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${
              loading || nextLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#43C17A] cursor-pointer"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading || nextLoading}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white min-w-[90px] ${
              loading || nextLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#43C17A] cursor-pointer"
            }`}
          >
            {nextLoading ? "Saving..." : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}