"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, ClockCountdownIcon, UploadSimple, X } from "@phosphor-icons/react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAllActiveWellbeingCategories } from "@/lib/helpers/wellbeingCategories/wellbeingCategoryAPI";
import type { WellbeingCategoryWithSubs } from "@/lib/helpers/wellbeingCategories/types";
import {
  createWellbeingSupportIssue,
  updateWellbeingSupportIssue,
} from "@/lib/helpers/wellbeingSupportIssues/wellbeingSupportIssueAPI";
import type {
  StudentWellbeingIssueListItem,
  WellbeingIssuePriority,
  WellbeingIssueRaisedRole,
  WellbeingIssueVisibilityRole,
} from "@/lib/helpers/wellbeingSupportIssues/types";
import CustomSelect from "@/app/utils/CustomSelect";
import Field from "@/app/utils/Field";

type IssueFormProps = {
  editingIssue?: StudentWellbeingIssueListItem | null;
  onCancelEdit?: () => void;
  onEditComplete?: () => void;
};

const issueRaisedRoles: WellbeingIssueRaisedRole[] = [
  "SuperAdmin",
  "CollegeAdmin",
  "Admin",
  "Faculty",
  "Finance",
  "CollegeHr",
  "PlacementOfficer",
  "WellbeingExecutive",
  "WellbeingManager",
  "FinanceManager",
];

function getIssueRaisedRole(role: string | null): WellbeingIssueRaisedRole {
  return issueRaisedRoles.includes(role as WellbeingIssueRaisedRole)
    ? (role as WellbeingIssueRaisedRole)
    : "Admin";
}

function IssueFormShimmer() {
  return (
    <div className="mx-auto mt-8 flex min-h-[600px] w-full max-w-2xl flex-1 animate-pulse flex-col overflow-hidden rounded-2xl bg-[#E8E8E8] shadow-sm">
      <div className="relative h-52 overflow-hidden bg-gradient-to-r from-[#205B3A] to-[#43C17A] px-5 py-6 sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute rounded-full bg-white/25"
          style={{ width: 150, height: 150, right: -25, top: -55 }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-white/20"
          style={{ width: 80, height: 80, right: 75, bottom: -40 }}
        />
        <div className="relative z-10 h-6 w-56 rounded bg-white/35" />
        <div className="relative z-10 mt-5 h-4 w-full max-w-md rounded bg-white/25" />
        <div className="relative z-10 mt-3 h-4 w-3/4 max-w-sm rounded bg-white/25" />
      </div>

      <div className="flex-1 px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-y-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <div className="mb-2 h-4 w-28 rounded bg-gray-300" />
              <div className="h-10 rounded border border-gray-200 bg-gray-100" />
            </div>
          ))}
          <div className="sm:col-span-2">
            <div className="mb-2 h-4 w-28 rounded bg-gray-300" />
            <div className="h-28 rounded border border-gray-200 bg-gray-100" />
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 h-4 w-28 rounded bg-gray-300" />
            <div className="h-32 rounded-xl border border-dashed border-gray-300 bg-gray-100" />
          </div>
        </div>
        <div className="mt-6 h-14 rounded-lg border border-gray-200 bg-gray-100" />
        <div className="mx-auto mt-8 h-12 w-full max-w-[250px] rounded-lg bg-gray-300 sm:h-14" />
      </div>
    </div>
  );
}

export default function IssueForm({
  editingIssue = null,
  onCancelEdit,
  onEditComplete,
}: IssueFormProps) {
  const { fullName, email, collegeId, userId, role, loading: userLoading } = useUser();
  const isEditing = Boolean(editingIssue);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [issueTitle, setIssueTitle] = useState("");
  const [isExecutiveSelected, setIsExecutiveSelected] = useState(false);
  const [appliesTo, setAppliesTo] = useState<"college" | "hostel" | "both">("college");
  const [priority, setPriority] = useState<WellbeingIssuePriority>("medium");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [attachmentIdsToRemove, setAttachmentIdsToRemove] = useState<number[]>([]);

  const [categories, setCategories] = useState<WellbeingCategoryWithSubs[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function getCategories() {
      if (!collegeId) {
        setCategoriesLoaded(false);
        return;
      }

      setLoadingCategories(true);
      setCategoriesLoaded(false);
      try {
        const data = await fetchAllActiveWellbeingCategories(collegeId);
        setCategories(data);
      } catch {
        toast.error("Failed to load categories. Please try again later.");
      } finally {
        setLoadingCategories(false);
        setCategoriesLoaded(true);
      }
    }

    getCategories();
  }, [collegeId]);

  useEffect(() => {
    if (!editingIssue) return;

    setIssueTitle(editingIssue.title);
    setIsExecutiveSelected(editingIssue.issueVisibilityRole === "both");
    setAppliesTo(editingIssue.appliesTo);
    setPriority(editingIssue.priority);
    setSelectedCategoryId(editingIssue.categoryId);
    setSelectedSubCategoryId(editingIssue.subCategoryId);
    setDescription(editingIssue.description);
    setFiles([]);
    setAttachmentIdsToRemove([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [editingIssue]);

  if (userLoading || !fullName || !email || !collegeId || !categoriesLoaded) {
    return <IssueFormShimmer />;
  }

  const filteredCategories = categories.filter((cat) => {
    if (appliesTo === "both") return true;
    return cat.appliesTo === appliesTo || cat.appliesTo === "both";
  });

  const activeCategory = categories.find((cat) => cat.categoryId === selectedCategoryId);
  const subCategoryOptions = activeCategory
    ? activeCategory.wellbeing_sub_categories.map((sub) => ({
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
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(droppedFiles)]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingAttachment = (attachmentId: number) => {
    setAttachmentIdsToRemove((prev) =>
      prev.includes(attachmentId) ? prev : [...prev, attachmentId],
    );
  };

  const resetForm = () => {
    setIssueTitle("");
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setAppliesTo("college");
    setPriority("medium");
    setIsExecutiveSelected(false);
    setDescription("");
    setAttachmentIdsToRemove([]);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelEdit = () => {
    resetForm();
    onCancelEdit?.();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!fullName || !email || !collegeId || !userId) {
      toast.error("User details are still loading. Please try again.");
      return;
    }
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

    const issueVisibilityRole: WellbeingIssueVisibilityRole = isExecutiveSelected
      ? "both"
      : "wellbeingmanager";

    setSubmitting(true);
    try {
      if (editingIssue) {
        await updateWellbeingSupportIssue({
          wellbeingSupportIssueId: Number(editingIssue.id),
          issueTitle,
          issueVisibilityRole,
          categoryId: selectedCategoryId,
          subCategoryId: selectedSubCategoryId,
          appliesTo,
          priority,
          description,
          createdBy: userId,
          collegeId,
          filesToAdd: files,
          attachmentIdsToRemove,
        });
        toast.success("Wellbeing issue updated successfully!");
        onEditComplete?.();
      } else {
        await createWellbeingSupportIssue({
          fullName,
          email,
          issueTitle,
          issueVisibilityRole,
          issueRaisedRole: getIssueRaisedRole(role),
          categoryId: selectedCategoryId,
          subCategoryId: selectedSubCategoryId,
          appliesTo,
          priority,
          description,
          createdBy: userId,
          collegeId,
          files,
        });
        toast.success("Wellbeing issue raised successfully!");
      }

      window.dispatchEvent(new Event("wellbeing-issue-created"));
      resetForm();
    } catch (error: unknown) {
      console.error("saveWellbeingSupportIssue error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save wellbeing issue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-8 flex min-h-[600px] w-full max-w-2xl flex-1 flex-col overflow-hidden rounded-2xl bg-[#E8E8E8] shadow-sm">
      <div className="relative flex-shrink-0 overflow-hidden bg-gradient-to-r from-[#205B3A] to-[#43C17A] px-5 py-6 text-white sm:px-8 sm:py-8">
        <div
          className="pointer-events-none absolute rounded-full bg-white/25"
          style={{ width: 150, height: 150, right: -25, top: -55 }}
        />
        <div
          className="pointer-events-none absolute rounded-full bg-white/20"
          style={{ width: 80, height: 80, right: 75, bottom: -40 }}
        />
        <h1 className="relative z-10 text-lg font-bold sm:text-xl">
          {isEditing ? "Edit Wellbeing Issue" : "Raise Wellbeing Issue"}
        </h1>
        <p className="relative z-10 mt-1.5 max-w-md text-xs leading-snug text-white/90 sm:mt-2 sm:text-sm">
          Fill in the details below. Every submission is tracked and resolved transparently.
        </p>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 sm:gap-y-5">
          <Field label="Full Name">
            <input
              value={fullName}
              readOnly
              placeholder="Full Name"
              className="h-10 w-full rounded border border-[#D0D0D0] bg-transparent px-4 text-sm text-[#555555] outline-none"
            />
          </Field>

          <Field label="Email address">
            <input
              value={email}
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
                className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded border text-xs transition-colors sm:gap-2 sm:text-sm ${
                  isExecutiveSelected
                    ? "border-[#16284F] bg-[#16284F] text-white hover:bg-[#0f1c38]"
                    : "border-[#D0D0D0] text-[#555555] hover:bg-black/5"
                }`}
              >
                {isExecutiveSelected ? (
                  <CheckCircle size={16} weight="fill" />
                ) : (
                  <div className="h-4 w-4 flex-shrink-0 rounded-full border border-gray-400 bg-transparent" />
                )}
                Executive
              </button>

              <button
                type="button"
                className="flex h-10 cursor-default items-center justify-center gap-1.5 rounded border border-[#16284F] bg-[#16284F] text-xs text-white opacity-100 transition-colors sm:gap-2 sm:text-sm"
              >
                <CheckCircle size={16} weight="fill" />
                Manager
              </button>
            </div>
          </Field>

          <Field label="Applies To">
            <div className="flex w-full flex-wrap items-center gap-6 rounded border border-[#D0D0D0] bg-transparent px-4 py-[9px] max-[350px]:gap-3">
              {(["college", "hostel", "both"] as const).map((option) => {
                const isSelected = appliesTo === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleAppliesToChange(option)}
                    className="flex cursor-pointer items-center gap-2 text-sm capitalize text-[#555555]"
                  >
                    {isSelected ? (
                      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#16284F]">
                        <div className="h-3 w-3 rounded-full border border-[#FFFFFF] bg-[#16284F]" />
                      </div>
                    ) : (
                      <div className="h-4 w-4 flex-shrink-0 rounded-full border border-gray-400 bg-transparent" />
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
              options={[
                { label: "High", value: "high" },
                { label: "Medium", value: "medium" },
                { label: "Low", value: "low" },
              ]}
              value={priority}
              onChange={(val) => setPriority(val as WellbeingIssuePriority)}
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
                className="h-28 w-full resize-none rounded border border-[#D0D0D0] bg-transparent px-4 py-3 text-sm text-[#555555] outline-none placeholder:text-[#8A8A8A] sm:h-32"
              />
            </Field>
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Field label={isEditing ? "Add Attachments" : "Attachments"} htmlFor="file-attachments">
              <div className={`flex w-full gap-3 sm:gap-4 ${files.length > 0 ? "flex-col items-stretch sm:h-44 sm:flex-row" : "flex-col"}`}>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[#43C17A] bg-[#F3F3F3] text-center transition-colors hover:bg-[#43C17A]/5 ${
                    files.length > 0 ? "min-h-[120px] w-full p-4 sm:min-h-0 sm:w-1/2" : "min-h-32 w-full p-6"
                  }`}
                >
                  <UploadSimple
                    size={files.length > 0 ? 32 : 42}
                    className="text-[#8A8A8A]"
                  />
                  <p className={`text-[#8A8A8A] ${files.length > 0 ? "mt-1.5 hidden text-xs sm:block" : "mt-2 text-sm"}`}>
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
                      files.length > 0 ? "mt-2 text-[11px]" : "mt-2 text-xs sm:text-sm"
                    }`}
                  >
                    Browse Files
                  </button>
                </div>

                {files.length > 0 && (
                  <div className="custom-scrollbar flex h-36 w-full flex-col gap-2.5 overflow-y-auto sm:h-full sm:w-1/2 sm:pr-1.5">
                    {files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-[#E0E0E0] bg-white p-2.5 shadow-sm transition-all hover:border-[#CCCCCC] hover:shadow-md"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden sm:gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#E9F5EE] text-[#43C17A] sm:h-9 sm:w-9">
                            <UploadSimple size={16} weight="bold" className="sm:h-[18px] sm:w-[18px]" />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-xs font-semibold text-[#282828] sm:text-sm" title={file.name}>
                              {file.name}
                            </span>
                            <span className="text-[10px] font-medium text-[#8A8A8A] sm:text-[11px]">
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
                          <X size={14} weight="bold" className="sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Field>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-5 rounded-lg border border-[#D0D0D0] bg-white/50 px-4 py-3">
            <p className="text-sm font-bold text-[#282828]">Existing Attachments</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {editingIssue?.attachments.filter(
                (attachment) => !attachmentIdsToRemove.includes(attachment.id),
              ).length ? (
                editingIssue.attachments
                  .filter((attachment) => !attachmentIdsToRemove.includes(attachment.id))
                  .map((attachment) => (
                    <span
                      key={attachment.id}
                      className="inline-flex items-center gap-2 rounded-full border border-[#D7D7D7] bg-white px-3 py-1.5 text-xs font-semibold text-[#555555]"
                    >
                      <span className="max-w-[260px] truncate" title={attachment.name}>
                        {attachment.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(attachment.id)}
                        className="cursor-pointer rounded-full p-0.5 text-[#8A8A8A] transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remove attachment"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </span>
                  ))
              ) : (
                <span className="text-xs font-medium text-[#8A8A8A]">
                  No existing attachments.
                </span>
              )}
            </div>
          </div>
        ) : null}

        <div className="mt-6 flex w-full items-center gap-3 rounded-lg border border-[#0090FF24] bg-[#0083E80D] px-4 py-3 sm:mt-8">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#0090FF24] text-[#0084E8] sm:h-10 sm:w-10">
            <ClockCountdownIcon size={20} className="sm:h-[22px] sm:w-[22px]" />
          </div>
          <p className="text-[11px] font-semibold leading-snug text-[#0585D9] sm:text-xs">
            Our team will review your complaint and respond within 24-48 hours.
          </p>
        </div>

        <div className="mb-4 mt-8 flex justify-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={submitting}
              className="h-12 w-full max-w-[180px] cursor-pointer rounded-lg border border-[#16284F] text-base font-semibold text-[#16284F] transition-colors hover:bg-[#16284F]/5 disabled:cursor-not-allowed disabled:opacity-70 sm:h-14 sm:text-lg"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-12 w-full max-w-[250px] cursor-pointer rounded-lg bg-[#16284F] text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#0f1c38] disabled:cursor-not-allowed disabled:opacity-70 sm:h-14 sm:text-lg"
          >
            {submitting ? (isEditing ? "Saving..." : "Submitting...") : isEditing ? "Save Changes" : "Submit"}
          </button>
        </div>
      </div>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
    </div>
  );
}
