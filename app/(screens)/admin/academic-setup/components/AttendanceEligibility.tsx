"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../../calendar/components/ConfirmDeleteModal";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import {
  fetchAcademicYears,
  fetchBranches,
  fetchEducations,
  fetchSemesters,
} from "@/lib/helpers/admin/academics/academicDropdowns";
import {
  deleteAttendancePolicy,
  fetchAttendancePolicies,
  upsertAttendancePolicy,
  type AttendancePolicyRow,
} from "@/lib/helpers/admin/academicSetup/attendancePoliciesAPI";

type EducationOption = {
  collegeEducationId: number;
  collegeEducationType: string;
};

type BranchOption = {
  collegeBranchId: number;
  collegeBranchType: string | null;
  collegeBranchCode: string | null;
};

type AcademicYearOption = {
  collegeAcademicYearId: number;
  collegeAcademicYear: string;
};

type SemesterOption = {
  collegeSemesterId: number;
  collegeSemester: string | number;
};

export default function AttendanceEligibility() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    adminId,
    collegeId,
    collegeEducationId,
    collegeEducationType,
    loading: adminLoading,
  } = useAdmin();
  const branchLabel = collegeEducationType === "Inter" ? "Group Type" : "Branch Type";

  const [educations, setEducations] = useState<EducationOption[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [years, setYears] = useState<AcademicYearOption[]>([]);
  const [semesters, setSemesters] = useState<SemesterOption[]>([]);

  const [selectedEducationId, setSelectedEducationId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [minAttendance, setMinAttendance] = useState("");
  const [editingPolicyId, setEditingPolicyId] = useState<number | null>(null);
  const [policies, setPolicies] = useState<AttendancePolicyRow[]>([]);

  const [isLoadingEducations, setIsLoadingEducations] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingSemesters, setIsLoadingSemesters] = useState(false);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [isOpeningEdit, setIsOpeningEdit] = useState(false);
  const [deletingPolicyId, setDeletingPolicyId] = useState<number | null>(null);
  const [policyToDelete, setPolicyToDelete] =
    useState<AttendancePolicyRow | null>(null);
  const skipAutoLoadRef = useRef(false);
  const isInitialLoading =
    adminLoading || isLoadingEducations || isLoadingPolicies;

  const updateEditRoute = useCallback(
    (policyId: number | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (policyId) {
        params.set("attendancePolicyId", String(policyId));
      } else {
        params.delete("attendancePolicyId");
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const loadPolicies = useCallback(async (educationIds: number[]) => {
    try {
      setIsLoadingPolicies(true);
      const res = await fetchAttendancePolicies(educationIds);

      if (!res.success) {
        toast.error(res.error || "Failed to load attendance policies");
        setPolicies([]);
        return;
      }

      setPolicies(res.data);
    } finally {
      setIsLoadingPolicies(false);
    }
  }, []);

  useEffect(() => {
    if (adminLoading || !collegeId) return;

    const loadEducations = async () => {
      try {
        setIsLoadingEducations(true);
        const educationData = await fetchEducations(collegeId);
        const adminEducations = collegeEducationId
          ? educationData.filter(
            (education) =>
              education.collegeEducationId === collegeEducationId,
          )
          : educationData;

        setEducations(adminEducations);
        await loadPolicies(
          adminEducations.map((education) => education.collegeEducationId),
        );

        const defaultEducation = adminEducations[0];
        setSelectedEducationId(
          defaultEducation ? String(defaultEducation.collegeEducationId) : "",
        );
      } catch (error) {
        console.error("Failed to load attendance education options", error);
        setEducations([]);
        setSelectedEducationId("");
      } finally {
        setIsLoadingEducations(false);
      }
    };

    loadEducations();
  }, [adminLoading, collegeEducationId, collegeId, loadPolicies]);

  useEffect(() => {
    if (!collegeId || !selectedEducationId) {
      setBranches([]);
      setSelectedBranchId("");
      return;
    }
    if (skipAutoLoadRef.current) return;

    const loadBranches = async () => {
      try {
        setIsLoadingBranches(true);
        setBranches([]);
        setYears([]);
        setSemesters([]);
        setSelectedBranchId("");
        setSelectedYearId("");
        setSelectedSemesterId("");

        const branchData = await fetchBranches(
          collegeId,
          Number(selectedEducationId),
        );

        setBranches(branchData);
      } catch (error) {
        console.error("Failed to load attendance branch options", error);
        setBranches([]);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    loadBranches();
  }, [collegeId, selectedEducationId]);

  useEffect(() => {
    if (!collegeId || !selectedEducationId || !selectedBranchId) {
      setYears([]);
      setSelectedYearId("");
      return;
    }
    if (skipAutoLoadRef.current) return;

    const loadYears = async () => {
      try {
        setIsLoadingYears(true);
        setYears([]);
        setSemesters([]);
        setSelectedYearId("");
        setSelectedSemesterId("");

        const yearData = await fetchAcademicYears(
          collegeId,
          Number(selectedEducationId),
          Number(selectedBranchId),
        );

        setYears(yearData);
      } catch (error) {
        console.error("Failed to load attendance year options", error);
        setYears([]);
      } finally {
        setIsLoadingYears(false);
      }
    };

    loadYears();
  }, [collegeId, selectedBranchId, selectedEducationId]);

  useEffect(() => {
    if (!collegeId || !selectedEducationId || !selectedYearId) {
      setSemesters([]);
      setSelectedSemesterId("");
      return;
    }
    if (skipAutoLoadRef.current) return;

    const loadSemesters = async () => {
      try {
        setIsLoadingSemesters(true);
        setSemesters([]);
        setSelectedSemesterId("");

        const semesterData = await fetchSemesters(
          collegeId,
          Number(selectedEducationId),
          Number(selectedYearId),
        );

        setSemesters(semesterData);
      } catch (error) {
        console.error("Failed to load attendance semester options", error);
        setSemesters([]);
      } finally {
        setIsLoadingSemesters(false);
      }
    };

    loadSemesters();
  }, [collegeId, selectedEducationId, selectedYearId]);

  const resetForm = () => {
    setEditingPolicyId(null);
    setSelectedBranchId("");
    setSelectedYearId("");
    setSelectedSemesterId("");
    setMinAttendance("");
    updateEditRoute(null);
  };


  const handleSubmit = async () => {
    const isEditing = Boolean(editingPolicyId);

    if (
      !selectedEducationId ||
      !selectedBranchId ||
      !selectedYearId ||
      !selectedSemesterId
    ) {
      toast.error("Please select all required fields");
      return;
    }

    if (!adminId) {
      toast.error("Admin not found");
      return;
    }

    if (!/^\d{2}$/.test(minAttendance)) {
      toast.error("Minimum attendance must be exactly 2 digits");
      return;
    }

    try {
      setIsSavingPolicy(true);
      const res = await upsertAttendancePolicy({
        ...(editingPolicyId && {
          collegeAttendancePolicyId: editingPolicyId,
        }),
        collegeEducationId: Number(selectedEducationId),
        collegeBranchId: Number(selectedBranchId),
        collegeAcademicYearId: Number(selectedYearId),
        collegeSemesterId: Number(selectedSemesterId),
        minAttendance: Number(minAttendance),
        createdBy: adminId,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to save criteria");
        return;
      }

      toast.success(
        isEditing
          ? "Attendance criteria updated successfully"
          : "Attendance criteria saved successfully",
        { id: "attendance-policy-save" },
      );
      resetForm();
      await loadPolicies(
        educations.map((education) => education.collegeEducationId),
      );
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const openPolicyForEdit = useCallback(async (
    policy: AttendancePolicyRow,
    options: { showToast?: boolean; updateRoute?: boolean } = {},
  ) => {
    if (!collegeId) {
      toast.error("College not found");
      return;
    }

    try {
      setIsOpeningEdit(true);

      const [branchData, yearData, semesterData] = await Promise.all([
        fetchBranches(collegeId, policy.collegeEducationId),
        fetchAcademicYears(
          collegeId,
          policy.collegeEducationId,
          policy.collegeBranchId,
        ),
        fetchSemesters(
          collegeId,
          policy.collegeEducationId,
          policy.collegeAcademicYearId,
        ),
      ]);

      skipAutoLoadRef.current = true;
      setBranches(branchData);
      setYears(yearData);
      setSemesters(semesterData);
      setEditingPolicyId(policy.collegeAttendancePolicyId);
      setSelectedEducationId(String(policy.collegeEducationId));
      setSelectedBranchId(String(policy.collegeBranchId));
      setSelectedYearId(String(policy.collegeAcademicYearId));
      setSelectedSemesterId(String(policy.collegeSemesterId));
      setMinAttendance(
        String(policy.minAttendance).padStart(2, "0").slice(0, 2),
      );

      if (options.updateRoute !== false) {
        updateEditRoute(policy.collegeAttendancePolicyId);
      }

      if (options.showToast !== false) {
        toast.success("Attendance criteria opened for editing", {
          id: "attendance-policy-edit-open",
        });
      }
    } catch (error) {
      console.error("Failed to open attendance policy for edit", error);
      toast.error("Failed to open attendance criteria");
    } finally {
      setIsOpeningEdit(false);
      window.setTimeout(() => {
        skipAutoLoadRef.current = false;
      }, 300);
    }
  }, [collegeId, updateEditRoute]);

  const handleEdit = (policy: AttendancePolicyRow) => {
    openPolicyForEdit(policy);
  };

  useEffect(() => {
    const routePolicyId = Number(searchParams.get("attendancePolicyId"));

    if (!routePolicyId || policies.length === 0) return;
    if (editingPolicyId === routePolicyId) return;

    const policy = policies.find(
      (item) => item.collegeAttendancePolicyId === routePolicyId,
    );

    if (policy) {
      openPolicyForEdit(policy, {
        showToast: false,
        updateRoute: false,
      });
    }
  }, [editingPolicyId, openPolicyForEdit, policies, searchParams]);

  const handleDeleteClick = (policy: AttendancePolicyRow) => {
    setPolicyToDelete(policy);
  };

  const handleConfirmDelete = async () => {
    if (!policyToDelete) return;

    try {
      const policyId = policyToDelete.collegeAttendancePolicyId;
      setDeletingPolicyId(policyId);
      const res = await deleteAttendancePolicy(policyId);

      if (!res.success) {
        toast.error(res.error || "Failed to delete criteria");
        return;
      }

      if (editingPolicyId === policyId) {
        resetForm();
      }
      setPolicyToDelete(null);
      toast.success("Attendance criteria deleted successfully", {
        id: "attendance-policy-delete",
      });
      await loadPolicies(
        educations.map((education) => education.collegeEducationId),
      );
    } finally {
      setDeletingPolicyId(null);
    }
  };

  return (
    <div className="w-full mx-auto space-y-8">
      <div className="w-full mx-auto bg-white px-8 pt-4 pb-8 rounded-xl">
        {isInitialLoading ? (
          <AttendanceEligibilityFormShimmer />
        ) : (
          <form className="space-y-6" autoComplete="off">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Education Type" required>
                <select
                  value={selectedEducationId}
                  onChange={(event) => {
                    setSelectedEducationId(event.target.value);
                  }}
                  disabled={educations.length === 0}
                  className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Education</option>
                  {educations.map((education) => (
                    <option
                      key={education.collegeEducationId}
                      value={education.collegeEducationId}
                    >
                      {education.collegeEducationType}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={branchLabel} required>
                {isLoadingBranches ? (
                  <ShimmerBlock className="h-[42px] w-full rounded-lg" />
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(event) => {
                      setSelectedBranchId(event.target.value);
                    }}
                    disabled={!selectedEducationId || branches.length === 0}
                    className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select {branchLabel}</option>
                    {branches.map((branch) => (
                      <option
                        key={branch.collegeBranchId}
                        value={branch.collegeBranchId}
                      >
                        {branch.collegeBranchType || branch.collegeBranchCode || "-"}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Field label="Year" required>
                {isLoadingYears ? (
                  <ShimmerBlock className="h-[42px] w-full rounded-lg" />
                ) : (
                  <select
                    value={selectedYearId}
                    onChange={(event) => {
                      setSelectedYearId(event.target.value);
                    }}
                    disabled={!selectedBranchId || years.length === 0}
                    className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option
                        key={year.collegeAcademicYearId}
                        value={year.collegeAcademicYearId}
                      >
                        {year.collegeAcademicYear}
                      </option>
                    ))}
                  </select>
                )}
              </Field>

              <Field label="Semester" required>
                {isLoadingSemesters ? (
                  <ShimmerBlock className="h-[42px] w-full rounded-lg" />
                ) : (
                  <select
                    value={selectedSemesterId}
                    onChange={(event) => {
                      setSelectedSemesterId(event.target.value);
                    }}
                    disabled={!selectedYearId || semesters.length === 0}
                    className="text-[#16284F] border border-[#CCCCCC] outline-none cursor-pointer p-2 rounded-lg w-full disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((semester) => (
                      <option
                        key={semester.collegeSemesterId}
                        value={semester.collegeSemesterId}
                      >
                        {semester.collegeSemester}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Field label="Minimum Attendance %" required>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{2}"
                    maxLength={2}
                    placeholder="00"
                    value={minAttendance}
                    onChange={(event) => {
                      const digitsOnly = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 2);
                      setMinAttendance(digitsOnly);
                    }}
                    className="text-[#16284F] border border-[#CCCCCC] outline-none px-3 py-2 pr-9 rounded-lg w-full"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#5C5C5C]">
                    %
                  </span>
                </div>
              </Field>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="button"
                disabled={isSavingPolicy}
                onClick={handleSubmit}
                className="bg-[#43C17A] cursor-pointer text-white px-10 py-2 rounded-lg font-semibold hover:bg-[#3ab06e] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingPolicy
                  ? "Saving..."
                  : editingPolicyId
                    ? "Update Criteria"
                    : "Save Criteria"}
              </button>
              {editingPolicyId && (
                <button
                  type="button"
                  disabled={isSavingPolicy}
                  onClick={resetForm}
                  className="ml-3 cursor-pointer rounded-lg border border-gray-300 px-6 py-2 font-semibold text-[#525252] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="w-[95%] mx-auto bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#282828]">
            Existing Eligibility Criteria
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-[#2D3748]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left text-[#2D3748]">Education Type</th>
                <th className="p-3 text-left text-[#2D3748]">{branchLabel}</th>
                <th className="p-3 text-left text-[#2D3748]">Year</th>
                <th className="p-3 text-left text-[#2D3748]">Semester</th>
                <th className="p-3 text-left text-[#2D3748]">Min %</th>
                <th className="p-3 text-left text-[#2D3748]">Action</th>
              </tr>
            </thead>

            <tbody>
              {isInitialLoading ? (
                <EligibilityTableShimmerRows />
              ) : (
                policies.length > 0 ? (
                  policies.map((row) => (
                    <tr
                      key={row.collegeAttendancePolicyId}
                      className="hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                    >
                      <td className="p-3">{row.education}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3">{row.year}</td>
                      <td className="p-3">{row.semester}</td>
                      <td className="p-3">{row.minAttendance}%</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(row)}
                          disabled={isOpeningEdit}
                          className="mr-4 underline cursor-pointer text-[#16284F] hover:text-[#43C17A] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isOpeningEdit &&
                          editingPolicyId === row.collegeAttendancePolicyId
                            ? "Opening..."
                            : "Edit"}
                        </button>
                        <button
                          type="button"
                          disabled={
                          deletingPolicyId === row.collegeAttendancePolicyId
                        }
                        onClick={() => handleDeleteClick(row)}
                        className="underline cursor-pointer text-red-500 hover:text-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                      >
                          {deletingPolicyId === row.collegeAttendancePolicyId
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-6 text-center text-sm italic text-gray-400"
                    >
                      No attendance eligibility criteria found.
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmDeleteModal
        open={Boolean(policyToDelete)}
        onCancel={() => {
          if (!deletingPolicyId) {
            setPolicyToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={Boolean(deletingPolicyId)}
        title="Delete"
        name="attendance criteria"
        confirmText="Delete"
        loadingText="Deleting..."
        customDescription={
          policyToDelete ? (
            <>
              Are you sure you want to delete the attendance criteria for{" "}
              <span className="font-semibold text-gray-700">
                {policyToDelete.education} - {policyToDelete.branch},{" "}
                {policyToDelete.year}, Semester {policyToDelete.semester}
              </span>
              ?
            </>
          ) : undefined
        }
      />
    </div>
  );
}

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative block overflow-hidden bg-gray-100 ${className}`}
      aria-hidden="true"
    >
      <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.2s_infinite] bg-gradient-to-r from-transparent via-gray-300/70 to-transparent" />
    </span>
  );
}

function AttendanceEligibilityFormShimmer() {
  return (
    <div className="space-y-6" aria-label="Loading attendance eligibility form">
      <div className="grid grid-cols-2 gap-6">
        <ShimmerField />
        <ShimmerField />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <ShimmerField />
        <ShimmerField />
      </div>
      <div className="grid grid-cols-2 gap-6">
        <ShimmerField />
      </div>
      <div className="flex justify-center pt-4">
        <ShimmerBlock className="h-[40px] w-[150px] rounded-lg" />
      </div>
    </div>
  );
}

function ShimmerField() {
  return (
    <div>
      <ShimmerBlock className="mb-2 h-4 w-36 rounded" />
      <ShimmerBlock className="h-[42px] w-full rounded-lg" />
    </div>
  );
}

function EligibilityTableShimmerRows() {
  return (
    <>
      {Array.from({ length: 4 }, (_, rowIndex) => (
        <tr
          key={`eligibility-shimmer-${rowIndex}`}
          className="border-b border-gray-50 last:border-b-0"
        >
          {Array.from({ length: 6 }, (_, columnIndex) => (
            <td key={columnIndex} className="p-3">
              <ShimmerBlock
                className={`h-4 rounded ${columnIndex === 5 ? "w-12" : "w-24"
                  }`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#16284F] mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
