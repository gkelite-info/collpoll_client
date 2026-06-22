"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, UploadSimple, X, FileImage, MicrosoftExcelLogoIcon } from "@phosphor-icons/react";
import { useFaculty } from "@/app/utils/context/faculty/useFaculty";
import { fetchAcademicDropdowns } from "@/lib/helpers/faculty/academicDropdown.helper";

interface DropdownOption {
  label: string;
  value: number | string;
}

export default function UploadResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [academicYears, setAcademicYears] = useState<DropdownOption[]>([]);
  const [branches, setBranches] = useState<DropdownOption[]>([]);
  const [semesters, setSemesters] = useState<DropdownOption[]>([]);
  const [sections, setSections] = useState<DropdownOption[]>([]);

  const [formData, setFormData] = useState({
    academicYearId: "",
    branchId: "",
    semesterId: "",
    sectionId: "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  // Set the default branch from faculty
  const { 
    collegeId, 
    collegeEducationId, 
    collegeBranchId, 
    college_branch,
    collegeAcademicYears,
    sections: facultySections 
  } = useFaculty();

  useEffect(() => {
    if (collegeBranchId && college_branch) {
      setBranches([{ label: college_branch, value: collegeBranchId }]);
      setFormData((prev) => ({ ...prev, branchId: String(collegeBranchId) }));
    }
  }, [collegeBranchId, college_branch]);

  useEffect(() => {
    if (collegeAcademicYears && collegeAcademicYears.length > 0) {
      setAcademicYears(collegeAcademicYears.map(y => ({ label: y.collegeAcademicYear, value: y.collegeAcademicYearId })));
    }
  }, [collegeAcademicYears]);

  useEffect(() => {
    if (collegeId && collegeEducationId && formData.academicYearId) {
      // Fetch semesters for the selected academic year
      fetchAcademicDropdowns({
        type: "semester",
        collegeId,
        educationId: collegeEducationId,
        academicYearId: Number(formData.academicYearId),
      })
        .then((res) => {
          setSemesters(res.map((s) => ({ label: `Semester ${s.collegeSemester}`, value: s.collegeSemesterId })));
        })
        .catch(console.error);

      // Filter sections assigned to the faculty for the selected academic year
      const filteredSections = facultySections.filter(s => s.collegeAcademicYearId === Number(formData.academicYearId));
      const uniqueSections = Array.from(new Map(filteredSections.map(s => [s.collegeSectionsId, s])).values());
      setSections(uniqueSections.map(s => ({ 
        label: s.college_sections?.collegeSections ? `Section ${s.college_sections.collegeSections}` : "Unknown", 
        value: s.collegeSectionsId 
      })));
    } else {
      setSemesters([]);
      setSections([]);
    }
  }, [collegeId, collegeEducationId, formData.academicYearId, facultySections]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: "banner" | "excel") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "banner") {
        const validExtensions = [".png", ".jpg", ".jpeg", ".pdf"];
        const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
          alert("Only PNG, JPG, JPEG, and PDF are allowed for the banner.");
          return;
        }
        setBannerFile(file);
      }
      if (type === "excel") {
        const validExtensions = [".xlsx", ".xls", ".csv"];
        const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        if (!validExtensions.includes(fileExtension)) {
          alert("Only Excel formats (.xlsx, .xls, .csv) are allowed for results upload.");
          return;
        }
        setExcelFile(file);
      }
    }
  };

  const handleGoBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = () => {
    console.log("Upload Results Button Pressed");
    console.log("Form Data:", formData);
    console.log("Banner File:", bannerFile?.name);
    console.log("Excel File:", excelFile?.name);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={handleGoBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} weight="bold" className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-[#282828] text-2xl font-bold">Results Upload</h1>
          <p className="text-gray-600 text-sm mt-1">Upload and manage class results</p>
        </div>
      </div>

      <div className="bg-white border border-gray-150 rounded-2xl shadow-sm p-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Academic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Branch/Department <span className="text-red-500">*</span></label>
              <select
                value={formData.branchId}
                onChange={(e) => handleInputChange("branchId", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:bg-white transition-all"
              >
                <option value="" disabled>Select branch</option>
                {branches.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Academic Year <span className="text-red-500">*</span></label>
              <select
                value={formData.academicYearId}
                onChange={(e) => handleInputChange("academicYearId", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:bg-white transition-all"
                disabled={!formData.branchId}
              >
                <option value="" disabled>Select year</option>
                {academicYears.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Semester <span className="text-red-500">*</span></label>
              <select
                value={formData.semesterId}
                onChange={(e) => handleInputChange("semesterId", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:bg-white transition-all"
                disabled={!formData.academicYearId}
              >
                <option value="" disabled>Select semester</option>
                {semesters.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Section <span className="text-red-500">*</span></label>
              <select
                value={formData.sectionId}
                onChange={(e) => handleInputChange("sectionId", e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#43C17A] focus:bg-white transition-all"
                disabled={!formData.academicYearId || !formData.branchId}
              >
                <option value="" disabled>Select section</option>
                {sections.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-150 my-6"></div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Upload Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileImage size={18} className="text-blue-500" weight="fill" />
                Upload College Banner
              </label>
              <div className="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center relative cursor-pointer group">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => handleFileChange(e, "banner")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
                  <UploadSimple size={24} className="text-gray-500" />
                </div>
                {bannerFile ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{bannerFile.name}</p>
                    <button
                      onClick={(e) => { e.preventDefault(); setBannerFile(null); }}
                      className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1 hover:underline relative z-10"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or PDF (max. 800x400px)</p>
                  </>
                )}
              </div>
            </div>

            {/* Excel Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MicrosoftExcelLogoIcon size={18} className="text-green-500" weight="fill" />
                Bulk Result Upload <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl p-6 flex flex-col items-center justify-center text-center relative cursor-pointer group">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileChange(e, "excel")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
                  <UploadSimple size={24} className="text-gray-500" />
                </div>
                {excelFile ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{excelFile.name}</p>
                    <button
                      onClick={(e) => { e.preventDefault(); setExcelFile(null); }}
                      className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1 hover:underline relative z-10"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-800">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">Only Excel formats (.xlsx, .xls, .csv)</p>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>

        <div className="border-t border-gray-150 my-6"></div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel Upload
          </button>
          <button
            onClick={() => console.log("Save as Draft clicked")}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-[#43C17A] text-[#43C17A] font-semibold text-sm hover:bg-[#E6FBEA] transition-colors"
          >
            Save as Draft
          </button>
          <button
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#43C17A] hover:bg-[#38A166] text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
            disabled={!formData.branchId || !formData.academicYearId || !formData.semesterId || !formData.sectionId || !excelFile}
          >
            Submit
          </button>
        </div>

      </div>
    </div>
  );
}
