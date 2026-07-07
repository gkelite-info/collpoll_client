"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AddAcademicSetup, { AcademicData } from "./components/AddAcademicSetup";
import ViewAcademicStructure, { AcademicViewData } from "./components/ViewAcademicStructure";
import ViewSubjects, { SubjectViewData } from "./components/ViewSubjects";
import AddSubject, { SubjectFormData, SubjectUIState } from "./components/AddSubject";
import AttendanceEligibility from "./components/AttendanceEligibility";
import toast from "react-hot-toast";
import { getAcademicSubjectById, resolveSubjectUIFromIds, upsertAcademicSubject, resolveSubjectIds } from "@/lib/helpers/admin/academicSetup/academicSubjectsAPI";
import { useUser } from "@/app/utils/context/UserContext";
import { fetchAdminContext } from "@/app/utils/context/admin/adminContextAPI";
import {
  deleteSubjectImageByUrl,
  uploadSubjectImage,
} from "@/lib/helpers/admin/academicSetup/subjectImageStorageAPI";
import BiometricStructure from "./components/BiometricStructure";
import CollegeTimingsStructure from "./components/collegetimings/CollegeTimingsStructure";
import CollegeMediaStructure from "./components/collegemedia/CollegeMediaStructure";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense } from "react";

type Tab =
  | "view"
  | "add"
  | "view-subject"
  | "add-subject"
  | "attendance-eligibility"
  | "biometric-structure"
  | "college-timings"
  | "college-media";

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

function AcademicSetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queryTab = searchParams.get("tab") as Tab | null;
  const activeTab = queryTab || "view";

  const setActiveTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

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
    { id: "attendance-eligibility", label: "Attendance Eligibility" },
  ];
  const pageHeader =
    activeTab === "attendance-eligibility"
      ? {
        title: "Attendance Eligibility Criteria",
        description:
          "Configure minimum overall attendance criteria for students.",
      }
      : activeTab === "biometric-structure"
        ? {
          title: "Biometric Structure",
          description: "Manage rooms and biometric devices in your institution.",
        }
        : activeTab === "college-timings"
          ? {
            title: "College Timings Structure",
            description: "Configure college operational hours and shifts.",
          }
          : activeTab === "college-media"
            ? {
              title: "College Media",
              description: "Upload and manage college logo and banner.",
            }
            : {
              title: "Academic Structure",
              description: "Add new academic structures for your institution.",
            };

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
      batch: row.batch || "",
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
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm p-4 sm:p-6 md:p-8 min-h-[84vh]">
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

        <div className="mb-6 border-b border-gray-100 pb-1">
          <div className="flex flex-row items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl font-bold w-full overflow-x-auto custom-scrollbar whitespace-nowrap pb-3">
            <button
              onClick={() => {
                setActiveTab("view");
                setEditSubject(null);
                setEditData(null);
              }}
              className={`transition-all duration-200 cursor-pointer flex-shrink-0 ${activeTab !== "biometric-structure" && activeTab !== "college-timings" && activeTab !== "college-media"
                ? "text-[#43C17A]"
                : "text-[#282828] hover:text-[#16284F]"
                }`}
            >
              Academic Structure
            </button>
            <span className="text-gray-300 font-light text-xl md:text-2xl flex-shrink-0">/</span>
            <button
              onClick={() => {
                setActiveTab("biometric-structure");
              }}
              className={`transition-all duration-200 cursor-pointer flex-shrink-0 ${activeTab === "biometric-structure"
                ? "text-[#43C17A]"
                : "text-[#282828] hover:text-[#16284F]"
                }`}
            >
              Biometric Structure
            </button>
            <span className="text-gray-300 font-light text-xl md:text-2xl flex-shrink-0">/</span>
            <button
              onClick={() => {
                setActiveTab("college-timings");
              }}
              className={`transition-all duration-200 cursor-pointer flex-shrink-0 ${activeTab === "college-timings"
                ? "text-[#43C17A]"
                : "text-[#282828] hover:text-[#16284F]"
                }`}
            >
              College Timings Structure
            </button>
            <span className="text-gray-300 font-light text-xl md:text-2xl flex-shrink-0">/</span>
            <button
              onClick={() => {
                setActiveTab("college-media");
              }}
              className={`transition-all duration-200 cursor-pointer flex-shrink-0 ${activeTab === "college-media"
                ? "text-[#43C17A]"
                : "text-[#282828] hover:text-[#16284F]"
                }`}
            >
              College Media
            </button>
          </div>
        </div>

        {activeTab !== "biometric-structure" && activeTab !== "college-timings" && activeTab !== "college-media" ? (
          <>
            {pageHeader.title !== "Academic Structure" && (
              <h1 className="text-xl font-bold text-[#282828] mb-1">
                {pageHeader.title}
              </h1>
            )}
            <p className="text-[#5C5C5C] mb-8 text-sm">
              {pageHeader.description}
            </p>

            <div className="flex mx-auto mb-5">
              <div className="relative flex mx-auto items-center bg-gray-100 p-1.5 rounded-full">
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
          </>
        ) : (
          <p className="text-[#5C5C5C] mb-8 text-sm">
            {pageHeader.description}
          </p>
        )}

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
        {activeTab === "attendance-eligibility" && <AttendanceEligibility />}

        {activeTab === "biometric-structure" && (
          <BiometricStructure />
        )}

        {activeTab === "college-timings" && (
          <CollegeTimingsStructure />
        )}

        {activeTab === "college-media" && (
          <CollegeMediaStructure />
        )}
      </div>
    </section>
  );
}

export default function AcademicSetup() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#43C17A] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#16284F] font-medium text-sm">Loading setup...</span>
        </div>
      </div>
    }>
      <AcademicSetupContent />
    </Suspense>
  );
}
