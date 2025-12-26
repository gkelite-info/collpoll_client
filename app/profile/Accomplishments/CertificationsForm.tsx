import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { upsertCertification } from "@/lib/helpers/upsertCertification";
import { X, UploadSimple } from "@phosphor-icons/react";
import { useRef } from "react";
import { Input } from "@/app/utils/ReusableComponents";

interface CertificationsProps {
  index: number;
  studentId: number;
  onRemove: () => void;
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

    setForm({ ...form, file: file.name });
  };

  const removeFile = () => {
    setForm({ ...form, file: "" });
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
            <span className="text-sm">{form.file}</span>

            <button
              type="button"
              onClick={removeFile}
              className="
                w-[20px]
                h-[20px]
                flex
                items-center
                justify-center
                rounded-full
                border
                border-red-500
                text-red-500
                cursor-pointer
                hover:bg-red-100
                transition
              "
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
        className="
          absolute
          top-1/2
          -translate-y-1/2
          right-[-55px]
          w-[40px]
          h-[40px]
          rounded-full
          bg-[#43C17A]
          flex
          items-center
          justify-center
          cursor-pointer
        "
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
}: CertificationsProps) {
  const [form, setForm] = useState({
    name: "",
    id: "",
    link: "",
    file: "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "name") {
      const cleaned = value.replace(/[^A-Za-z0-9 .,-]/g, "");
      setForm({ ...form, name: cleaned });
      return;
    }

    if (name === "id") {
      const cleaned = value.replace(/[^A-Za-z0-9\-_ ]/g, "");
      setForm({ ...form, id: cleaned });
      return;
    }

    if (name === "link") {
      const cleaned = value.replace(/[^A-Za-z0-9:/?&%=._\-#]/g, "");
      setForm({ ...form, link: cleaned });
      return;
    }

    if (name === "startDate" || name === "endDate") {
      let cleaned = value.replace(/-/g, "/").replace(/[^0-9/]/g, "");

      if (cleaned.length === 8 && !cleaned.includes("/")) {
        cleaned = cleaned.replace(/(\d{2})(\d{2})(\d{4})/, "$1/$2/$3");
      }

      setForm({ ...form, [name]: cleaned });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  
  const validateCertification = () => {
    if (!form.name.trim()) return "Certification Name is required";

    if (form.name.length < 3)
      return "Certification Name must be at least 3 characters";

    const nameRegex = /^[A-Za-z0-9 .,-]+$/;
    if (!nameRegex.test(form.name))
      return "Certification Name contains invalid characters";

    if (form.id.trim()) {
      const idRegex = /^[A-Za-z0-9\-_ ]{2,50}$/;
      if (!idRegex.test(form.id))
        return "Completion ID format invalid";
    }

    if (!form.link.trim()) return "Certificate Link is required";

    const urlRegex = /^(https?:\/\/)[^\s]+$/;
    if (!urlRegex.test(form.link))
      return "Certificate Link must start with http or https";

    if (form.file.trim()) {
      const allowed = /\.(png|jpg|jpeg|pdf)$/i;
      if (!allowed.test(form.file))
        return "Only JPG, PNG or PDF files allowed";
    }

    const dateRegex = /^([0-2][0-9]|3[0-1])[\/-](0[1-9]|1[0-2])[\/-][0-9]{4}$/;

    if (!form.startDate.trim()) return "Start Date is required";
    if (!dateRegex.test(form.startDate))
      return "Start Date must be in DD/MM/YYYY format";

    if (!form.endDate.trim()) return "End Date is required";
    if (!dateRegex.test(form.endDate))
      return "End Date must be in DD/MM/YYYY format";

    const toDate = (d: string) => {
      const [day, month, year] = d.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    const start = toDate(form.startDate);
    const end = toDate(form.endDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start > today) return "Start Date cannot be in future";
    if (end > today) return "End Date cannot be in future";
    if (end < start) return "End Date cannot be before Start Date";

    return null;
  };

  const convertToIntDate = (dateStr: string) => {
    const cleaned = dateStr.replace(/-/g, "/");
    const [d, m, y] = cleaned.split("/");
    return Number(`${y}${m}${d}`);
  };

  
  const saveCertification = async () => {
    const error = validateCertification();
    if (error) return toast.error(error);

    const payload = {
      studentId,
      certificationName: form.name,
      certification_completionId: form.id,
      certificateLink: form.link,
      uploadCertificate: form.file,

   
     startDate: form.startDate,  
  endDate: form.endDate,       
    };

    const response = await upsertCertification(payload);

    if (response.success) {
      toast.success(`Certification ${index + 1} saved successfully`);
    } else {
      toast.error(response.error ?? "Something went wrong!");
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
      <h3 className="text-base font-semibold text-[#282828] mb-4">
        Certification {index + 1}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input
          label="Certification Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder='Java Full Stack'
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
          value={form.startDate}
          onChange={handleChange}
          placeholder="DD/MM/YYYY"
        />

        <Input
          label="End Date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          placeholder="DD/MM/YYYY"
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
