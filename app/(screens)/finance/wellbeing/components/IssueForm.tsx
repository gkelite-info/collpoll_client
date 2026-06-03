"use client";

import { useRef, useState, useEffect } from "react";
import { CheckCircle, UploadSimple, X, ClockCountdownIcon } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAllActiveWellbeingCategories } from "@/lib/helpers/wellbeingCategories/wellbeingCategoryAPI";
import toast, { Toaster } from "react-hot-toast";
import CustomSelect from "@/app/utils/CustomSelect";
import Field from "@/app/utils/Field";

export default function IssueForm() {
  const { fullName, email, collegeId } = useUser();
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [issueTitle, setIssueTitle] = useState("");
  const [isExecutiveSelected, setIsExecutiveSelected] = useState(false);
  const [appliesTo, setAppliesTo] = useState<"college" | "hostel" | "both">("college");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    async function getCategories() {
      if (!collegeId) return;
      setLoadingCategories(true);
      try {
        const data = await fetchAllActiveWellbeingCategories(collegeId);
        setCategories(data);
      } catch (err) {
        toast.error("Failed to load categories. Please try again later.");
      } finally {
        setLoadingCategories(false);
      }
    }

    getCategories();
  }, [collegeId]);

  const filteredCategories = categories.filter((cat) => {
    if (appliesTo === "both") return true;
    return cat.appliesTo === appliesTo || cat.appliesTo === "both";
  });

  const activeCategory = categories.find((cat) => cat.categoryId === selectedCategoryId);
  const subCategoryOptions = activeCategory
    ? activeCategory.wellbeing_sub_categories.map((sub: any) => ({
        label: sub.subCategoryName,
        value: sub.subCategoryId,
      }))
    : [];

  const handleAppliesToChange = (val: "college" | "hostel" | "both") => {
    setAppliesTo(val);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
  };

  const handleCategoryChange = (catId: number) => {
    setSelectedCategoryId(catId);
    setSelectedSubCategoryId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = () => {
    if (!issueTitle.trim()) {
      toast.error("Please enter an issue title");
      return;
    }
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!selectedSubCategoryId) {
      toast.error("Please select a subcategory");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe your issue");
      return;
    }

    toast.success("Wellbeing issue raised successfully!");

    setIssueTitle("");
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setAppliesTo("college");
    setPriority("Medium");
    setIsExecutiveSelected(false);
    setDescription("");
    setFiles([]);
  };

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl flex flex-col flex-1 min-h-[600px] overflow-hidden rounded-2xl bg-[#E8E8E8] shadow-sm">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#205B3A] to-[#43C17A] px-5 sm:px-8 py-6 sm:py-8 text-white flex-shrink-0">
        <div
          className="pointer-events-none absolute rounded-full bg-white/25"
          style={{ width: 150, height: 150, right: -25, top: -55 }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-white/20"
          style={{ width: 80, height: 80, right: 75, bottom: -40 }}
        />
        <h1 className="relative z-10 text-lg sm:text-xl font-bold">Raise Wellbeing Issue</h1>
        <p className="relative z-10 mt-1.5 sm:mt-2 max-w-md text-xs sm:text-sm leading-snug text-white/90">
          Fill in the details below. Every submission is tracked and resolved transparently.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-5">
          <Field label="Full Name">
            <input
              value={fullName || ""}
              readOnly
              placeholder="Full Name"
              className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none"
            />
          </Field>

          <Field label="Email address">
            <input
              value={email || ""}
              readOnly
              placeholder="Email address"
              className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none"
            />
          </Field>

          <Field label="Issue Title" htmlFor="issue-title">
            <input
              id="issue-title"
              type="text"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="Enter Issue Title"
              className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none placeholder:text-[#8A8A8A]"
            />
          </Field>

          <Field label="Issue Visibility">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsExecutiveSelected(!isExecutiveSelected)}
                className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 sm:gap-2 rounded border transition-colors text-xs sm:text-sm ${
                  isExecutiveSelected
                    ? "bg-[#16284F] border-[#16284F] text-white hover:bg-[#0f1c38]"
                    : "border-[#D0D0D0] text-[#555555] hover:bg-black/5"
                }`}
              >
                {isExecutiveSelected ? (
                  <CheckCircle size={16} weight="fill" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-gray-400 bg-transparent flex-shrink-0" />
                )}
                Executive
              </button>

              <button
                type="button"
                className="flex h-10 items-center justify-center gap-1.5 sm:gap-2 rounded border transition-colors text-xs sm:text-sm bg-[#16284F] border-[#16284F] text-white opacity-100 cursor-default"
              >
                <CheckCircle size={16} weight="fill" />
                Manager
              </button>
            </div>
          </Field>

          <Field label="Applies To">
           <div className="flex flex-wrap py-[9px] w-full items-center max-[350px]:gap-3 gap-6 rounded border border-[#D0D0D0] bg-transparent px-4">
              {(["college", "hostel", "both"] as const).map((option) => {
                const isSelected = appliesTo === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAppliesToChange(option)}
                    className="flex cursor-pointer items-center gap-2 text-sm text-[#555555] capitalize"
                  >
                    {isSelected ? (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#16284F] flex-shrink-0">
                        <div className="h-3 w-3 rounded-full bg-[#16284F] border border-[#FFFFFF]" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-400 bg-transparent flex-shrink-0" />
                    )}
                    {option}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Priority" htmlFor="priority-select">
            <CustomSelect
              id="priority-select"
              label="Select Priority"
              options={["High", "Medium", "Low"]}
              value={priority}
              onChange={(val) => setPriority(val)}
            />
          </Field>

          <Field label="Category" htmlFor="category-select">
            <CustomSelect
              id="category-select"
              label={loadingCategories ? "Loading..." : "Select category"}
              options={filteredCategories.map((cat) => ({
                label: cat.categoryName,
                value: cat.categoryId,
              }))}
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              disabled={loadingCategories}
            />
          </Field>

          <Field label="Subcategory" htmlFor="subcategory-select">
            <CustomSelect
              id="subcategory-select"
              label="Select Subcategory"
              options={subCategoryOptions}
              value={selectedSubCategoryId}
              onChange={(val) => setSelectedSubCategoryId(val)}
              disabled={!selectedCategoryId}
            />
          </Field>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Description" htmlFor="description">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe you issue in detail................"
                className="h-28 sm:h-32 w-full resize-none rounded border border-[#D0D0D0] bg-transparent px-4 py-3 text-sm text-[#555555] outline-none placeholder:text-[#8A8A8A]"
              />
            </Field>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Field label="Attachments" htmlFor="file-attachments">
              <div className={`flex gap-3 sm:gap-4 w-full ${files.length > 0 ? 'flex-col sm:flex-row sm:h-44 items-stretch' : 'flex-col'}`}>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#43C17A] bg-[#F3F3F3] text-center transition-colors hover:bg-[#43C17A]/5 ${
                    files.length > 0 ? 'w-full sm:w-1/2 p-4 min-h-[120px] sm:min-h-0' : 'w-full min-h-32 p-6'
                  }`}
                >
                  <UploadSimple 
                    size={files.length > 0 ? 32 : 42} 
                    className="text-[#8A8A8A]" 
                  />
                  <p className={`text-[#8A8A8A] ${files.length > 0 ? 'mt-1.5 text-xs hidden sm:block' : 'mt-2 text-sm'}`}>
                    Drag & Drop Your File here or
                  </p>
                  <input 
                    id="file-attachments"
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded bg-[#43C17A] px-4 py-1.5 font-semibold text-white transition-colors hover:bg-[#38a869] ${
                      files.length > 0 ? 'mt-2 text-[11px]' : 'mt-2 text-xs sm:text-sm'
                    }`}
                  >
                    Browse Files
                  </button>
                </div>

                {files.length > 0 && (
                  <div className="w-full sm:w-1/2 h-36 sm:h-full overflow-y-auto custom-scrollbar flex flex-col gap-2.5 sm:pr-1.5">
                    {files.map((file, index) => (
                      <div 
                        key={`${file.name}-${index}`} 
                        className="flex items-center justify-between rounded-lg border border-[#E0E0E0] bg-white p-2.5 shadow-sm transition-all hover:shadow-md hover:border-[#CCCCCC]"
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden">
                          <div className="flex h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 items-center justify-center rounded bg-[#E9F5EE] text-[#43C17A]">
                            <UploadSimple size={16} weight="bold" className="sm:w-[18px] sm:h-[18px]" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-xs sm:text-sm font-semibold text-[#282828]" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-medium text-[#8A8A8A]">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-2 flex-shrink-0 cursor-pointer rounded-full p-1.5 text-[#8A8A8A] transition-colors hover:bg-red-50 hover:text-red-500"
                          title="Remove file"
                        >
                          <X size={14} weight="bold" className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 flex w-full items-center gap-3 rounded-lg bg-[#0083E80D] px-4 py-3 border border-[#0090FF24]">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#0090FF24] text-[#0084E8]">
            <ClockCountdownIcon size={20} className="sm:w-[22px] sm:h-[22px]" />
          </div>
          <p className="text-[11px] sm:text-xs font-semibold leading-snug text-[#0585D9]">
            Our team will review your complaint and respond within 24-48 hours.
          </p>
        </div>

        <div className="mt-8 mb-4 flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            className="h-12 w-full max-w-[250px] sm:h-14 cursor-pointer rounded-lg bg-[#16284F] text-base sm:text-lg font-semibold text-white transition-colors hover:bg-[#0f1c38] shadow-sm"
          >
            Submit
          </button>
        </div>
      </div>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
    </div>
  );
}


