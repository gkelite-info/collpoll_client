"use client";

import { Upload, X } from "lucide-react";
import { CaretDown } from "@phosphor-icons/react";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { useUser } from "@/app/utils/context/UserContext";
import { validateSubjectImageFile } from "@/lib/helpers/admin/academicSetup/subjectImageStorageAPI";
import { fetchSubjectOptions } from "@/lib/helpers/admin/academicSetup/subjectDropdownsAPI";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";

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
  const [selectFocus, setSelectFocus] = useState({ education: false, branch: false, year: false, semester: false });

  const loadOptions = async () => {
    if (!userId) return;
    setIsLoadingOptions(true);
    try {
      const { collegeId } = await fetchAdminContext(userId);
      const newOptions = await fetchSubjectOptions(collegeId, ui);
      setOptions(newOptions);
    } catch {
      toast.error("Failed to load dropdowns", { id: "add-subject-load-dropdowns" });
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
      toast.error(getErrorMessage(error) || "Invalid subject image", { id: "add-subject-invalid-image" });
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

  const isSchool = isSchoolEducation(ui.education || collegeEducationType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ui.education) return toast.error("Please select Education", { id: "add-subject-edu-req" });
    
    if (!isSchool) {
      if (!ui.branch) return toast.error("Please select Branch", { id: "add-subject-branch-req" });
    }
    
    if (!ui.year) return toast.error("Please select Year", { id: "add-subject-year-req" });

    if (!isSchool && !["Inter"].includes(ui.education)) {
      if (!ui.semester) return toast.error("Please select Semester", { id: "add-subject-sem-req" });
    }
    if (!form.subjectName.trim())
      return toast.error("Please enter Subject Name", { id: "add-subject-name-req" });
      
    if (!isSchool) {
      if (!form.subjectCode.trim())
        return toast.error("Please enter Subject Code", { id: "add-subject-code-req" });
      if (!form.subjectKey.trim()) return toast.error("Please enter Subject Key", { id: "add-subject-key-req" });
    }

    if (!isSchool && !["Inter"].includes(ui.education)) {
      if (!form.credits) return toast.error("Please enter Credits", { id: "add-subject-credits-req" });
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Education Type <span className="text-red-500">*</span>
            </label>
            {isLoadingOptions && options.educations.length === 0 ? (
              <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                Loading options...
              </div>
            ) : (
              <div className="relative">
                <select
                  name="education"
                  value={ui.education}
                  onClick={() => setSelectFocus(p => ({ ...p, education: !p.education }))}
                  onBlur={() => setSelectFocus(p => ({ ...p, education: false }))}
                  onChange={(e) => {
                    handleChange(e);
                    setSelectFocus(p => ({ ...p, education: false }));
                  }}
                  className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full appearance-none"
                >
                  <option value="">Select Education</option>
                  {options.educations.map((e) => (
                    <option key={e.id}>{e.label}</option>
                  ))}
                </select>
                <CaretDown
                  size={14}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${selectFocus.education ? "rotate-180" : ""}`}
                />
              </div>
            )}
          </div>

          {!isSchool && (
            <div>
              <label className="block text-sm font-medium text-[#16284F] mb-1">
                {ui.education === "Inter" ? "Group Type" : "Branch Type"} <span className="text-red-500">*</span>
              </label>
              {isLoadingOptions && ui.education && !ui.branch ? (
                <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                  Loading options...
                </div>
              ) : (
                <div className="relative">
                  <select
                    name="branch"
                    value={ui.branch}
                    disabled={!ui.education}
                    onClick={() => setSelectFocus(p => ({ ...p, branch: !p.branch }))}
                    onBlur={() => setSelectFocus(p => ({ ...p, branch: false }))}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectFocus(p => ({ ...p, branch: false }));
                    }}
                    className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full appearance-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{ui.education === "Inter" ? "Select Group" : "Select Branch"}</option>
                    {ui.education &&
                      options.branches.map((b) => (
                        <option key={b.id}>{b.label}</option>
                      ))}
                  </select>
                  <CaretDown
                    size={14}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${selectFocus.branch ? "rotate-180" : ""}`}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            {isLoadingOptions && (isSchool ? ui.education : ui.branch) && !ui.year ? (
              <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                Loading options...
              </div>
            ) : (
              <div className="relative">
                <select
                  name="year"
                  value={ui.year}
                  onClick={() => setSelectFocus(p => ({ ...p, year: !p.year }))}
                  onBlur={() => setSelectFocus(p => ({ ...p, year: false }))}
                  onChange={(e) => {
                    handleChange(e);
                    setSelectFocus(p => ({ ...p, year: false }));
                  }}
                  className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full appearance-none"
                >
                  <option value="">Select Year</option>
                  {options.years.map((y) => (
                    <option key={y.id}>{y.label}</option>
                  ))}
                </select>
                <CaretDown
                  size={14}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${selectFocus.year ? "rotate-180" : ""}`}
                />
              </div>
            )}
          </div>

          {!isSchool && !["Inter"].includes(ui.education) && (
            <div>
              <label className="block text-sm font-medium text-[#16284F] mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              {isLoadingOptions && ui.year && !ui.semester ? (
                <div className="border border-[#CCCCCC] bg-gray-50 animate-pulse p-2 rounded-lg w-full h-[42px] flex items-center text-gray-400 text-sm">
                  Loading options...
                </div>
              ) : (
                <div className="relative">
                  <select
                    name="semester"
                    value={ui.semester}
                    onClick={() => setSelectFocus(p => ({ ...p, semester: !p.semester }))}
                    onBlur={() => setSelectFocus(p => ({ ...p, semester: false }))}
                    onChange={(e) => {
                      handleChange(e);
                      setSelectFocus(p => ({ ...p, semester: false }));
                    }}
                    className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full appearance-none"
                  >
                    <option value="">Select Semester</option>
                    {options.semesters.map((s) => (
                      <option key={s.id}>{s.label}</option>
                    ))}
                  </select>
                  <CaretDown
                    size={14}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${selectFocus.semester ? "rotate-180" : ""}`}
                  />
                </div>
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
              Subject Code {!isSchool && <span className="text-red-500">*</span>}
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
              Subject Key {!isSchool && <span className="text-red-500">*</span>}
            </label>
            <input
              name="subjectKey"
              value={form.subjectKey}
              onChange={handleChange}
              placeholder="e.g. DS"
              className="text-[#16284F] border border-[#CCCCCC] outline-none px-3 py-2 rounded-lg w-full"
            />
          </div>

          {!isSchool && (
            <div>
              <label className="block text-sm font-medium text-[#16284F] mb-1">
                Credits
                {ui.education === "Inter" ? (
                  <span className="ml-1 text-[#16284F] text-sm">(Optional)</span>
                ) : (
                  <span className="text-red-500 ml-1">*</span>
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
          )}

          <div>
            <label className="block text-sm font-medium text-[#16284F] mb-1">
              Subject Image
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
                className="w-full rounded-lg border border-[#CCCCCC] bg-white text-left shadow-sm hover:bg-white transition-colors cursor-pointer overflow-hidden h-[42px]"
              >
                <div className="flex items-center justify-between gap-4 px-3 py-1">
                  <span className="truncate text-sm text-gray-400">
                    e.g. Upload subject image
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#49C77F] px-3 py-1 text-sm font-semibold text-white">
                    <Upload size={14} />
                    Upload
                  </span>
                </div>
              </button>
            ) : (
              <div className="rounded-lg border border-[#CCCCCC] bg-white px-3 py-1 shadow-sm h-[42px] flex items-center">
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <img
                      src={imagePreview}
                      alt={form.subjectName || "Subject preview"}
                      className="h-8 w-8 rounded border border-[#DCE7E2] object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="max-w-[150px] truncate font-medium text-sm text-[#16284F] leading-tight">
                        {imageFile ? imageFile.name : "Current image"}
                      </p>
                      <p className="text-[10px] text-[#5C5C5C] leading-none mt-0.5">
                        {imageFile ? "Ready to upload" : "Existing image"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("subjectImageInput")?.click()
                      }
                      className="rounded border border-[#D8D8D8] bg-white px-2 py-1 text-xs font-medium text-[#16284F] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={clearImageSelection}
                      className="rounded border border-[#F3C5C5] bg-white px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <X size={12} />
                      Remove
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
