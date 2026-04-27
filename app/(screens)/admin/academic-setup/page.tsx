"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AddAcademicSetup, { AcademicData } from "./components/AddAcademicSetup";
import ViewAcademicStructure, { AcademicViewData } from "./components/ViewAcademicStructure";
import ViewSubjects, { SubjectViewData } from "./components/ViewSubjects";
import AddSubject, { SubjectFormData, SubjectUIState } from "./components/AddSubject";
import toast from "react-hot-toast";
import { getAcademicSubjectById, resolveSubjectUIFromIds, upsertAcademicSubject, resolveSubjectIds } from "@/lib/helpers/admin/academicSetup/academicSubjectsAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import {
  deleteSubjectImageByUrl,
  uploadSubjectImage,
} from "@/lib/helpers/admin/academicSetup/subjectImageStorageAPI";

type Tab = "view" | "add" | "view-subject" | "add-subject";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong";

const extractSingleValue = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  if (Array.isArray(value)) {
    const firstValid = value.find(Boolean);
    return extractSingleValue(firstValid);
  }
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(
      item.name ?? item.code ?? item.label ?? item.value ?? "",
    );
  }
  return "";
};

export default function AcademicSetup() {
  const [activeTab, setActiveTab] = useState<Tab>("view");
  const [editData, setEditData] = useState<AcademicData | null>(null);

  const [editSubject, setEditSubject] = useState<SubjectFormData | null>(null);
  const [editSubjectUi, setEditSubjectUi] = useState<SubjectUIState | null>(
    null,
  );
  const [isFetchingSubject, setIsFetchingSubject] = useState(false);

  const { userId } = useUser();

  const tabs = [
    { id: "view", label: "View Academic Structure" },
    { id: "add", label: "Add Academic Setup" },
    { id: "add-subject", label: "Add Subject" },
    { id: "view-subject", label: "View Subjects" },
  ];

  const handleEdit = (row: AcademicViewData) => {
    const sanitizedData: AcademicData = {
      id: row.id,
      degree: row.degree,
      dept: row.dept,
      branch: row.branch,
      year: extractSingleValue(row.year),
      sections: Array.isArray(row.sections)
        ? row.sections
          .map((s: unknown) =>
            typeof s === "string"
              ? s
              : extractSingleValue(s),
          )
          .filter(Boolean)
        : [],
    };
    setEditData(sanitizedData);
    setActiveTab("add");
  };

  const handleSaveSuccess = () => {
    setEditData(null);
    setActiveTab("view");
  };

  const handleSubjectEdit = async (row: SubjectViewData) => {
    try {
      setIsFetchingSubject(true);
      const res = await getAcademicSubjectById(row.id);

      if (!res.success || !res.data) {
        toast.error("Failed to load subject details", { id: "subject-edit" });
        return;
      }

      const mappedForm: SubjectFormData = {
        id: res.data.collegeSubjectId,
        collegeEducationId: res.data.collegeEducationId,
        collegeBranchId: res.data.collegeBranchId,
        collegeAcademicYearId: res.data.collegeAcademicYearId,
        collegeSemesterId: res.data.collegeSemesterId,
        subjectName: res.data.subjectName,
        subjectCode: res.data.subjectCode,
        subjectKey: res.data.subjectKey ?? "",
        credits: res.data.credits,
        image: res.data.image ?? "",
      };

      const uiValues = await resolveSubjectUIFromIds({
        collegeEducationId: res.data.collegeEducationId,
        collegeBranchId: res.data.collegeBranchId,
        collegeAcademicYearId: res.data.collegeAcademicYearId,
        collegeSemesterId: res.data.collegeSemesterId,
      });

      setEditSubject(mappedForm);
      setEditSubjectUi(uiValues);
      setActiveTab("add-subject");

      toast.success("Subject loaded", { id: "subject-edit" });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Something went wrong", {
        id: "subject-edit",
      });
    } finally {
      setIsFetchingSubject(false);
    }
  };

  const handleSubjectSave = async (
    form: SubjectFormData,
    ui: SubjectUIState,
    imageFile: File | null,
  ) => {
    try {
      if (!userId) {
        toast.error("User not found");
        return;
      }

      const { collegeId, adminId } = await fetchAdminContext(userId);

      const resolvedIds = await resolveSubjectIds({
        education: ui.education,
        branch: ui.branch,
        year: ui.year,
        semester: ui.semester,
        collegeId,
      });

      let finalImageUrl = form.image || null;

      if (imageFile) {
        finalImageUrl = await uploadSubjectImage(imageFile, collegeId, adminId);
      }

      const payload = {
        ...(form.id && { collegeSubjectId: form.id }),
        subjectName: form.subjectName,
        subjectCode: form.subjectCode,
        subjectKey: form.subjectKey,
        credits: form.credits,
        image: finalImageUrl,
        ...resolvedIds,
        collegeId,
        createdBy: adminId,
      };

      const res = await upsertAcademicSubject(payload);

      if (!res.success) {
        if (imageFile && finalImageUrl) {
          await deleteSubjectImageByUrl(finalImageUrl);
        }
        throw new Error(res.error);
      }

      setEditSubject(null);
      setEditSubjectUi(null);
      setActiveTab("view-subject");
      toast.success(
        form.id ? "Subject updated successfully" : "Subject added successfully",
      );
    } catch (error: unknown) {
      toast.error(getErrorMessage(error) || "Subject save failed");
      throw error;
    }
  };

  return (
    <section className="min-h-[85vh] p-2 relative">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-8 min-h-[84vh]">
        {isFetchingSubject && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[#43C17A] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[#16284F] font-medium text-sm">
                Fetching subject details...
              </span>
            </div>
          </div>
        )}

        <h1 className="text-xl font-bold text-[#282828] mb-1">
          Academic Structure
        </h1>
        <p className="text-[#5C5C5C] mb-8 text-sm">
          Add new academic structures for your institution.
        </p>

        <div className="flex justify-center mb-10">
          <div className="relative flex items-center bg-gray-100 p-1.5 rounded-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  if (tab.id !== "add-subject") {
                    setEditSubject(null);
                  }
                  if (tab.id === "add") {
                    setEditData(null);
                  }
                }}
                className={`relative cursor-pointer px-6 py-2 text-sm font-semibold z-10 ${activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="academic-pill"
                    className="absolute shadow-[0_2px_8px_rgba(16,185,129,0.4)] inset-0 rounded-full -z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "view" && <ViewAcademicStructure onEdit={handleEdit} />}
        {activeTab === "add" && (
          <AddAcademicSetup editData={editData} onSuccess={handleSaveSuccess} />
        )}
        {activeTab === "view-subject" && (
          <ViewSubjects onEdit={handleSubjectEdit} />
        )}
        {activeTab === "add-subject" && (
          <AddSubject
            editData={editSubject}
            editUi={editSubjectUi}
            onSave={handleSubjectSave}
          />
        )}
      </div>
    </section>
  );
}
