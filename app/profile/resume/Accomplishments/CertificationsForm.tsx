import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { X, UploadSimple, Trash } from "@phosphor-icons/react";
import { useRef } from "react";
import { Input } from "@/app/utils/ReusableComponents";
import {
  insertCertification,
  updateCertification,
  uploadCertificateFile,
} from "@/lib/helpers/student/Resume/resumeCertificationsAPI";

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

export default function CertificationsForm({
  index,
  studentId,
  onRemove,
  onSubmit,
  existingData,
}: CertificationsProps) {
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

  const toInputDate = (iso: string | null): string => {
    if (!iso) return "";
    return iso.split("T")[0];
  };

  const toISOString = (dateStr: string): string => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString();
  };

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (existingData) {
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
    }
  }, [existingData]);

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
    setForm({ ...form, [name]: value });
  };

  const validateCertification = () => {
    if (!form.name.trim()) return "Certification Name is required";
    if (form.name.length < 3) return "Certification Name must be at least 3 characters";
    if (!/^[A-Za-z0-9 .,-]+$/.test(form.name)) return "Certification Name contains invalid characters";
    if (form.id.trim()) {
      if (!/^[A-Za-z0-9\-_ ]{2,50}$/.test(form.id)) return "Completion ID format invalid";
    }
    if (!form.link.trim()) return "Certificate Link is required";
    if (!/^(https?:\/\/)[^\s]+$/.test(form.link)) return "Certificate Link must start with http or https";
    if (!form.startDate) return "Start date is required";
    return null;
  };

  const saveCertification = async () => {
    const error = validateCertification();
    if (error) return toast.error(error);

    setLoading(true);
    try {
      let uploadedUrl = existingData?.uploadCertificate ?? "";
      if (form.fileObject) {
        uploadedUrl = await uploadCertificateFile(studentId, form.fileObject);
      }

      const payload = {
        certificationName: form.name,
        certificationCompletionId: form.id,
        certificateLink: form.link,
        uploadCertificate: uploadedUrl,
        startDate: toISOString(form.startDate),
        endDate: form.endDate ? toISOString(form.endDate) : null,
      };

      if (resumeCertificateId) {
        await updateCertification(resumeCertificateId, payload);
      } else {
        const result = await insertCertification({ studentId, ...payload });
        setResumeCertificateId(result.resumeCertificateId);
      }

      toast.success(`Certification ${index + 1} saved successfully`);
      onSubmit();
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const error = validateCertification();
    if (error) {
      toast.error(error);
      return;
    }
    saveCertification();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-[#282828]">
          Certification {index + 1}
        </h3>
        {resumeCertificateId ? (
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
        <Input
          label="Certification Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Java Full Stack"
        />
        <Input
          label="Certification Completion ID"
          name="id"
          value={form.id}
          onChange={handleChange}
          placeholder="WD-12345"
        />
        <Input
          label="Certificate Link"
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="https://example.com"
        />
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-[#282828]">
            Upload Certificate
          </label>
          <CertificateUpload form={form} setForm={setForm} />
        </div>

        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
        />

        <Input
          label="End Date (Optional)"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
        />

        <div className="md:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-sm font-medium text-white cursor-pointer
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