"use client";

import React, { useState, useEffect } from "react";
import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyView from "./facultyView";
import { useTotalUsers } from "../../hooks/useTotalUsers";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchAdminEducationTypes, fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import { FilterDropdown } from "../../assignments/components/filterDropdown";
import RoleUsersTable, { type DashboardRoleKey } from "./RoleUsersTable";
import { isSchoolEducation } from "@/lib/helpers/admin/academicSetup/schoolHelper";
import { supabase } from "@/lib/supabaseClient";
import { Pagination } from "../../academic-setup/components/pagination";

interface TotalUsersProps {
  onBack: () => void;
}

const TotalUsersView: React.FC<TotalUsersProps> = ({ onBack }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    collegeId,
    adminId,
    loading: adminContextLoading,
  } = useAdmin();

  const [educations, setEducations] = useState<{ collegeEducationId: number; collegeEducationType: string }[]>([]);
  const [educationFilter, setEducationFilter] = useState<string>("All");
  const [subFilter, setSubFilter] = useState<string>("All");
  const roleFromUrl = searchParams.get("role") as DashboardRoleKey | null;
  const [selectedRole, setSelectedRole] = useState<DashboardRoleKey>(roleFromUrl || "ADMIN");
  const [branches, setBranches] = useState<{ collegeBranchId: number; collegeBranchType: string }[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [academicYears, setAcademicYears] = useState<{ collegeAcademicYearId: number; collegeAcademicYear: string }[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [branchPage, setBranchPage] = useState(1);
  const branchPageSize = 10;

  useEffect(() => {
    let mounted = true;
    const loadEducations = async () => {
      if (!adminId) return;
      try {
        let edus = await fetchAdminEducationTypes(adminId);
        if ((!edus || edus.length === 0) && collegeId) {
          edus = await fetchEducations(collegeId);
        }
        if (mounted) setEducations(edus || []);
      } catch (err) {
        console.error("Failed to load educations", err);
      }
    };
    loadEducations();
    return () => { mounted = false; };
  }, [adminId, collegeId]);

  const activeEducationId = educationFilter !== "All" ? Number(educationFilter) : null;
  const activeSubId = subFilter === "All" ? null : Number(subFilter);
  const selectedEducation = educations.find((item) => item.collegeEducationId === activeEducationId);
  const schoolOnly = selectedEducation ? isSchoolEducation(selectedEducation.collegeEducationType) : educations.length > 0 && educations.every((item) => isSchoolEducation(item.collegeEducationType));

  useEffect(() => {
    let mounted = true;
    async function loadBranches() {
      if (!collegeId) return;
      setBranchesLoading(true);
      setBranches([]);
      let query = supabase.from("college_branch").select("collegeBranchId, collegeBranchType")
        .eq("collegeId", collegeId).eq("isActive", true).is("deletedAt", null);
      if (activeEducationId) query = query.eq("collegeEducationId", activeEducationId);
      const { data, error } = await query.order("collegeBranchType");
      if (error) console.error("Failed to load branch options", error);
      if (mounted) { setBranches(data ?? []); setBranchesLoading(false); }
    }
    if (!schoolOnly) {
      void loadBranches();
    } else {
      setBranches([]);
      setBranchesLoading(false);
    }
    return () => { mounted = false; };
  }, [collegeId, activeEducationId, schoolOnly]);

  useEffect(() => {
    let mounted = true;
    async function loadAcademicYears() {
      if (!collegeId) return;
      setYearsLoading(true);
      setAcademicYears([]);
      let query = supabase.from("college_academic_year").select("collegeAcademicYearId, collegeAcademicYear")
        .eq("collegeId", collegeId).eq("isActive", true).is("deletedAt", null);
      if (activeEducationId) query = query.eq("collegeEducationId", activeEducationId);
      const { data, error } = await query.order("collegeAcademicYearId");
      if (error) console.error("Failed to load academic year options", error);
      if (mounted) { setAcademicYears(data ?? []); setYearsLoading(false); }
    }
    if (schoolOnly) {
      void loadAcademicYears();
    } else {
      setAcademicYears([]);
      setYearsLoading(false);
    }
    return () => { mounted = false; };
  }, [collegeId, activeEducationId, schoolOnly]);

  const { roles, departments, totalDepartments, loading: dataLoading, error: dataError } = useTotalUsers(
    collegeId,
    activeEducationId,
    activeSubId,
    branchPage,
    branchPageSize,
    schoolOnly
  );

  const branchOptions = branches.map((branch) => ({ label: branch.collegeBranchType, value: String(branch.collegeBranchId) }));
  const yearOptions = academicYears.map((yr) => ({ label: yr.collegeAcademicYear, value: String(yr.collegeAcademicYearId) }));

  const deptId = searchParams.get("deptId");
  const deptName = searchParams.get("deptName");
  const detailEducationId = Number(searchParams.get("educationId"));

  // Determine global loading state for shimmers
  const isLoading = adminContextLoading || dataLoading;
  const cardData: (CardProps & { roleKey: DashboardRoleKey })[] = [
    {
      roleKey: "ADMIN",
      value: roles?.ADMIN?.toString() || "0",
      label: "Admin",
      bgColor: "bg-[#E2DAFF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#6C20CA]",
    },
    {
      roleKey: "FACULTY",
      value: roles.FACULTY.toString(),
      label: "Faculty",
      bgColor: "bg-[#FFEDDA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#FFBB70]",
    },
    {
      roleKey: "STUDENT",
      value: roles.STUDENT.toString(),
      label: "Students",
      bgColor: "bg-[#E6FBEA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#3DAD6E]",
    },
    {
      roleKey: "PARENT",
      value: roles?.PARENT?.toString() || "0",
      label: "Parent",
      bgColor: "bg-[#EAF4FF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#4A90E2]",
    },
    {
      roleKey: "FINANCE",
      value: roles?.FINANCE?.toString() || "0",
      label: "Finance Executive",
      bgColor: "bg-[#FFE4E6]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#E11D48]",
    },
    {
      roleKey: "FINANCE_MANAGER",
      value: roles?.FINANCE_MANAGER?.toString() || "0",
      label: "Finance Manager",
      bgColor: "bg-[#FCE7F3]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#BE185D]",
    },
    {
      roleKey: "ACCOUNTANT",
      value: roles?.ACCOUNTANT?.toString() || "0",
      label: "Accountant",
      bgColor: "bg-[#E0F2FE]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#0284C7]",
    },
    {
      roleKey: "COLLEGE_HR",
      value: roles?.COLLEGE_HR?.toString() || "0",
      label: "College HR",
      bgColor: "bg-[#FEF3C7]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#D97706]",
    },
    {
      roleKey: "PLACEMENT_OFFICER",
      value: roles?.PLACEMENT_OFFICER?.toString() || "0",
      label: "Placement Officer",
      bgColor: "bg-[#F3E8FF]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#9333EA]",
    },
    {
      roleKey: "WELLBEING_EXECUTIVE",
      value: roles?.WELLBEING_EXECUTIVE?.toString() || "0",
      label: "Wellbeing Executive",
      bgColor: "bg-[#CCFBF1]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#0F766E]",
      iconColor: "text-[#0F766E]",
    },
    {
      roleKey: "WELLBEING_MANAGER",
      value: roles?.WELLBEING_MANAGER?.toString() || "0",
      label: "Wellbeing Manager",
      bgColor: "bg-[#FEF9C3]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#A16207]",
    },
    {
      roleKey: "GROUND_STAFF",
      value: roles?.GROUND_STAFF?.toString() || "0",
      label: "Ground Staff",
      bgColor: "bg-[#DCFCE7]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#15803D]",
    },
  ];

  if (deptId && deptName && collegeId && detailEducationId) {
    return (
      <FacultyView
        departmentId={Number(deptId) < 0 ? null : Number(deptId)}
        departmentName={deptName}
        collegeId={collegeId}
        collegeEducationId={detailEducationId}
        educationType={educations.find((item) => item.collegeEducationId === detailEducationId)?.collegeEducationType}
        onBack={() => router.push(`?view=TOTAL_USERS&role=${selectedRole}`)}
      />
    );
  }

  return (
    <div className="bg-red-00 flex flex-col w-[92.5vw] landscape:w-[96.5vw] md:w-full landscape:md:w-full lg:w-full min-h-screen p-1 md:p-0 lg:p-0 pb-7 md:pb-0 lg:pb-0">
      <div className="mb-3">
        <div className="flex items-center gap-2 w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-bold text-[#282828]">Total Users</h1>
        </div>
        <p className="text-[#282828] mt-1 ml-8 text-sm">
          Overview of all user roles in the system
        </p>
      </div>

      <div className="w-full mb-4 grid">
        <article className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth custom-scrollbar">
          {isLoading
            ? [...Array(12)].map((_, i) => (
              <div
                key={`shimmer-card-${i}`}
                className="min-w-[22.5%] shrink-0 h-[135px] rounded-lg bg-gray-200 animate-pulse snap-start"
              />
            ))
            : cardData.map((item, index) => (
              <div key={index} className="min-w-[22.5%] shrink-0 snap-start">
                <CardComponent
                  {...item}
                  selected={selectedRole === item.roleKey}
                  onClick={() => {
                    setSelectedRole(item.roleKey);
                    setEducationFilter("All");
                    setSubFilter("All");
                    setBranchPage(1);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("role", item.roleKey);
                    ["deptId", "deptName", "educationId", "tab", "yearId", "sectionId"].forEach((key) => params.delete(key));
                    router.replace(`?${params.toString()}`);
                  }}
                />
              </div>
            ))}
        </article>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <FilterDropdown
          label="Education Type"
          value={educationFilter}
          options={[
            { label: "All", value: "All" },
            ...educations.map((e) => ({
              label: e.collegeEducationType,
              value: String(e.collegeEducationId),
            })),
          ]}
          onChange={(val) => {
            setEducationFilter(val);
            setSubFilter("All");
            setBranchPage(1);
          }}
        />

        {(selectedRole === "FACULTY" || selectedRole === "STUDENT") && (
          <FilterDropdown
            label={schoolOnly ? "Year" : selectedEducation?.collegeEducationType === "Inter" ? "Group" : "Branch"}
            value={subFilter}
            disabled={schoolOnly ? yearsLoading : branchesLoading}
            options={[
              { label: "All", value: "All" },
              ...(schoolOnly ? yearOptions : branchOptions)
            ]}
            onChange={(val) => {
              setSubFilter(val);
              setBranchPage(1);
            }}
          />
        )}
      </div>

      {dataError && <p role="alert" className="mb-3 text-red-600">{dataError}</p>}
      {selectedRole !== "FACULTY" && selectedRole !== "STUDENT" && collegeId ? (
        <RoleUsersTable key={`${collegeId}:${selectedRole}:${educationFilter}`} collegeId={collegeId} role={selectedRole} educationFilter={educationFilter} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-auto md:overflow-hidden lg:overflow-hidden">
          <table className="w-full text-left border-collapse overflow-auto">
            <thead>
              <tr className="bg-[#F1F2F4] overflow-auto">
                <th className="py-4 px-8 font-semibold text-[#4A5568] text-sm">
                  {schoolOnly ? "Year" : selectedEducation?.collegeEducationType === "Inter" ? "Group" : educationFilter === "All" ? "Education Type / Branch" : "Branch"}
                </th>
                <th className="py-4 px-4 font-semibold text-[#4A5568] text-sm text-center">
                  {selectedRole === "FACULTY" ? "Faculty" : "Students"}
                </th>
                <th className="py-4 px-8 font-semibold text-[#4A5568] text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={`shimmer-row-${i}`} className="animate-pulse bg-white">
                    <td className="py-4 px-8">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </td>
                    <td className="py-4 px-8">
                      <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : departments?.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-gray-500">
                    No {schoolOnly ? "years" : selectedEducation?.collegeEducationType === "Inter" ? "groups" : "branches"} found
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr
                    key={dept.departmentId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-8 text-[#2D3748] font-medium">
                      {dept.departmentName}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">
                      {selectedRole === "FACULTY" ? dept.faculty : dept.students}
                    </td>
                    <td className="py-3 px-8 text-right">
                      <button
                        onClick={() => {
                          const params = new URLSearchParams(searchParams.toString());
                          if (dept.school) {
                            params.set("deptId", "-1");
                            params.set("deptName", dept.departmentName);
                            params.set("educationId", dept.collegeEducationId.toString());
                            if (dept.collegeAcademicYearId) {
                              params.set("yearId", dept.collegeAcademicYearId.toString());
                            }
                          } else {
                            params.set("deptId", dept.departmentId.toString());
                            params.set("deptName", dept.departmentName);
                            params.set("educationId", dept.collegeEducationId.toString());
                          }
                          params.set("role", selectedRole);
                          params.set("tab", selectedRole === "STUDENT" ? "Students" : "Faculty");
                          router.push(`?${params.toString()}`);
                        }}
                        className="text-green-500 cursor-pointer font-bold hover:underline decoration-2 underline-offset-4 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {!isLoading && (
            <Pagination
              currentPage={branchPage}
              totalItems={totalDepartments}
              itemsPerPage={branchPageSize}
              onPageChange={setBranchPage}
              alwaysShow
            />
          )}
        </div>
      )}
    </div>
  );
};

export default TotalUsersView;
