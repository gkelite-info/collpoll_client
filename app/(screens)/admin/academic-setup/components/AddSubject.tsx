"use client";

import { Upload, X } from "lucide-react";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { useUser } from "@/app/utils/context/UserContext";
import { validateSubjectImageFile } from "@/lib/helpers/admin/academicSetup/subjectImageStorageAPI";
import { fetchSubjectOptions } from "@/lib/helpers/admin/academicSetup/subjectDropdownsAPI";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export type SubjectFormData = {
  id?: number;
  collegeEducationId: number;
  collegeBranchId: number;
  collegeAcademicYearId: number;
  collegeSemesterId: number;
  subjectName: string;
  subjectCode: string;
  subjectKey: string;
  credits: number;
  image: string;
};

export type SubjectUIState = {
  education: string;
  branch: string;
  year: string;
  semester: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const defaultFormState: SubjectFormData = {
  collegeEducationId: 0,
  collegeBranchId: 0,
  collegeAcademicYearId: 0,
  collegeSemesterId: 0,
  subjectName: "",
  subjectCode: "",
  subjectKey: "",
  credits: 0,
  image: "",
};

const normalizeFormData = (
  data: Partial<SubjectFormData> | null | undefined,
): SubjectFormData => ({
  ...defaultFormState,
  ...data,
  subjectName: data?.subjectName ?? "",
  subjectCode: data?.subjectCode ?? "",
  subjectKey: data?.subjectKey ?? "",
  credits: typeof data?.credits === "number" ? data.credits : 0,
  image: data?.image ?? "",
  collegeEducationId:
    typeof data?.collegeEducationId === "number" ? data.collegeEducationId : 0,
  collegeBranchId:
    typeof data?.collegeBranchId === "number" ? data.collegeBranchId : 0,
  collegeAcademicYearId:
    typeof data?.collegeAcademicYearId === "number"
      ? data.collegeAcademicYearId
      : 0,
  collegeSemesterId:
    typeof data?.collegeSemesterId === "number" ? data.collegeSemesterId : 0,
});

export default function AddSubject({
  editData,
  editUi,
  onSave,
  onFormReady,
}: {
  editData: SubjectFormData | null;
  editUi: SubjectUIState | null;
  onSave: (
    form: SubjectFormData,
    ui: SubjectUIState,
    imageFile: File | null,
  ) => Promise<void>;
  onFormReady?: () => void;
}) {
  const { userId } = useUser();
  const { collegeEducationType } = useAdmin();

  const [form, setForm] = useState<SubjectFormData>(defaultFormState);

  const [ui, setUi] = useState<SubjectUIState>({
    education: "",
    branch: "",
    year: "",
    semester: "",
  });

  const [options, setOptions] = useState({
    educations: [] as { id: number; label: string }[],
    branches: [] as { id: number; label: string }[],
    years: [] as { id: number; label: string }[],
    semesters: [] as { id: number; label: string }[],
  });

  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadOptions = async () => {
    if (!userId) return;
    setIsLoadingOptions(true);
    try {
      const { collegeId } = await fetchAdminContext(userId);
      const newOptions = await fetchSubjectOptions(collegeId, ui);
      setOptions(newOptions);
    } catch {
      toast.error("Failed to load dropdowns");
    } finally {
      setIsLoadingOptions(false);
      if (onFormReady) onFormReady();
    }
  };

  useEffect(() => {
    loadOptions();
  }, [ui.education, ui.branch, ui.year]);

  useEffect(() => {
    if (editData && editUi) {
      setForm(normalizeFormData(editData));
      setUi(editUi);
      setImageFile(null);
      setImagePreview(editData.image ?? "");
    }
  }, [editData, editUi]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (["education", "branch", "year", "semester"].includes(name)) {
      setUi((prev) => ({
        ...prev,
        [name]: value,
        ...(name === "education" && { branch: "", year: "", semester: "" }),
        ...(name === "branch" && { year: "", semester: "" }),
        ...(name === "year" && { semester: "" }),
      }));
      return;
    }

    if (name === "subjectName") {
      const cleaned = value.replace(/\s{2,}/g, " ");

      setForm({ ...form, [name]: cleaned });
      return;
    }
    if (name === "subjectCode") {
      setForm({
        ...form,
        subjectCode: value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      });
      return;
    }
    if (name === "subjectKey") {
      const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);

      setForm({
        ...form,
        subjectKey: cleaned,
      });
      return;
    }
    if (name === "credits") {
      const numValue = value === "" ? 0 : Number(value);
      setForm({ ...form, credits: numValue });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      validateSubjectImageFile(file);
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Invalid subject image");
      e.target.value = "";
    }
  };

  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview("");
    setForm((prev) => ({
      ...prev,
      image: "",
    }));

    const input = document.getElementById("subjectImageInput") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ui.education) return toast.error("Please select Education");
    if (!ui.branch) return toast.error("Please select Branch");
    if (!ui.year) return toast.error("Please select Year");

    if (!["Inter"].includes(collegeEducationType!)) {
      if (!ui.semester) return toast.error("Please select Semester");
    }
    if (!form.subjectName.trim())
      return toast.error("Please enter Subject Name");
    if (!form.subjectCode.trim())
      return toast.error("Please enter Subject Code");
    if (!form.subjectKey.trim()) return toast.error("Please enter Subject Key");
    if (!form.image && !imageFile && !imagePreview) {
      return toast.error("Please upload Subject Image");
    }

    if (!["Inter"].includes(collegeEducationType!)) {
      if (!form.credits) return toast.error("Please enter Credits");
    }

    setIsSubmitting(true);

    try {
      await onSave(form, ui, imageFile);
    } catch (error) {
      console.error("Save error in form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-8 rounded-xl">
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Education Type <span className="text-red-500">*</span>
            </label>
            {isLoadingOptions && options.educations.length === 0 ? (
              <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                Loading options...
              </div>
            ) : (
              <select
                name="education"
                value={ui.education}
                onChange={handleChange}
                className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full"
              >
                <option value="">Select Education</option>
                {options.educations.map((e) => (
                  <option key={e.id}>{e.label}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              {collegeEducationType === "Inter" ? "Group Type" : "Branch Type"} <span className="text-red-500">*</span>
            </label>
            {isLoadingOptions && ui.education && !ui.branch ? (
              <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                Loading options...
              </div>
            ) : (
              <select
                name="branch"
                value={ui.branch}
                onChange={handleChange}
                disabled={!ui.education}
                className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="">{collegeEducationType === "Inter" ? "Select Group" : "Select Branch"}</option>
                {ui.education &&
                  options.branches.map((b) => (
                    <option key={b.id}>{b.label}</option>
                  ))}
              </select>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            {isLoadingOptions && ui.branch && !ui.year ? (
              <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                Loading options...
              </div>
            ) : (
              <select
                name="year"
                value={ui.year}
                onChange={handleChange}
                className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full"
              >
                <option value="">Select Year</option>
                {options.years.map((y) => (
                  <option key={y.id}>{y.label}</option>
                ))}
              </select>
            )}
          </div>
          {!["Inter"].includes(collegeEducationType!) && (
            <div>
              <label className="block text-sm font-medium text-[#16284F] mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              {isLoadingOptions && ui.year && !ui.semester ? (
                <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                  Loading options...
                </div>
              ) : (
                <select
                  name="semester"
                  value={ui.semester}
                  onChange={handleChange}
                  className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full"
                >
                  <option value="">Select Semester</option>
                  {options.semesters.map((s) => (
                    <option key={s.id}>{s.label}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              name="subjectName"
              value={form.subjectName}
              onChange={handleChange}
              placeholder="e.g. Data Structures"
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-3 py-2 rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              name="subjectCode"
              value={form.subjectCode}
              onChange={handleChange}
              placeholder="e.g. CS201"
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-3 py-2 rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Key <span className="text-red-500">*</span>
            </label>
            <input
              name="subjectKey"
              value={form.subjectKey}
              onChange={handleChange}
              placeholder="e.g. DS"
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-3 py-2 rounded-lg w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Credits <span className="text-red-500">*</span>
              {collegeEducationType === "Inter" && (
                <span className="ml-1 text-[#16284F] text-sm">(Optional)</span>
              )}
            </label>
            <input
              type="number"
              name="credits"
              step="0.01"
              min="0"
              max="10"
              value={form.credits === 0 ? "" : form.credits}
              onFocus={(e) => e.target.select()}
              placeholder="e.g. 4.0"
              onChange={(e) => {
                const value = e.target.value;

                if (/^\d*\.?\d{0,2}$/.test(value) && Number(value) <= 10) {
                  handleChange(e);
                }
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => e.currentTarget.blur()}
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-3 py-2 rounded-lg w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Image <span className="text-red-500">*</span>
            </label>
            <input
              id="subjectImageInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
            {!imagePreview ? (
              <button
                type="button"
                onClick={() =>
                  document.getElementById("subjectImageInput")?.click()
                }
                className="w-full rounded-lg border border-[#CCCCCC] bg-white text-left shadow-sm hover:bg-white transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <span className="truncate text-sm text-gray-400">
                    e.g. Upload subject image
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#49C77F] px-4 py-2 text-sm font-semibold text-white">
                    <Upload size={14} />
                    Upload
                  </span>
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-[#D7D7D7] bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={imagePreview}
                      alt={form.subjectName || "Subject preview"}
                      className="h-11 w-11 rounded-lg border border-[#DCE7E2] object-cover"
                    />
                    <div>
                      <p className="max-w-[220px] truncate font-medium text-[#16284F]">
                        {imageFile ? imageFile.name : "Current subject image"}
                      </p>
                      <p className="text-sm text-[#5C5C5C]">
                        {imageFile
                          ? "Ready to upload on save"
                          : "Existing uploaded image"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("subjectImageInput")?.click()
                      }
                      className="rounded-lg border border-[#D8D8D8] bg-white px-3 py-2 text-sm text-[#16284F] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="rounded-lg border border-[#F3C5C5] bg-white px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1">
                        <X size={14} />
                        Remove
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {form.image && !imageFile && imagePreview && (
              <div className="mt-2 text-xs text-[#5C5C5C]">
                Existing image will be kept unless you change or remove it.
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#43C17A] cursor-pointer text-white px-10 py-2 rounded-lg font-semibold hover:bg-[#3ab06e] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? editData
                ? "Updating..."
                : "Saving..."
              : editData
                ? "Update Subject"
                : "Save Subject"}
          </button>
        </div>
      </form>
    </div>
  );
}
