"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CaretLeft, UserCircle } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import CardComponent, { CardProps } from "./totalUsersCard";
import FacultyView from "./facultyView";
import { useTotalUsers } from "../../hooks/useTotalUsers";
import { useAdmin } from "@/app/utils/context/admin/useAdmin";
import { fetchAdminEducationTypes, fetchEducations } from "@/lib/helpers/admin/academics/academicDropdowns";
import { FilterDropdown } from "../../assignments/components/filterDropdown";
import RoleUsersTable, { type DashboardRoleKey } from "./RoleUsersTable";
import AdminEducationTable from "./AdminEducationTable";
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
    collegeEducationId,
    userId,
    loading: adminContextLoading,
  } = useAdmin();

  const [educations, setEducations] = useState<any[]>([]);
  const [educationFilter, setEducationFilter] = useState<string>("All");
  const [education, setEducation] = useState<any>(null);
  const [branchFilter, setBranchFilter] = useState<string>("All");
  const roleFromUrl = searchParams.get("role") as DashboardRoleKey | null;
  const [selectedRole, setSelectedRole] = useState<DashboardRoleKey>(roleFromUrl || "ADMIN");
  const [roleEducationIds, setRoleEducationIds] = useState<number[]>([]);
  const [branchPage, setBranchPage] = useState(1);
  const branchPageSize = 10;

  useEffect(() => {
    const loadEducations = async () => {
      if (!userId) return;
      try {
        let edus = await fetchAdminEducationTypes(userId);
        if ((!edus || edus.length === 0) && collegeId) {
          edus = await fetchEducations(collegeId);
        }
        setEducations(edus || []);
        if (collegeEducationId && edus) {
          const edu = edus.find((e: any) => e.collegeEducationId === collegeEducationId);
          if (edu) setEducation(edu);
        }
      } catch (err) {
        console.error("Failed to load educations", err);
      }
    };
    loadEducations();
  }, [userId, collegeId, collegeEducationId]);

  const activeEducationId = educationFilter !== "All" ? Number(educationFilter) : null;

  useEffect(() => {
    if (!collegeId || selectedRole === "PARENT") { setRoleEducationIds([]); return; }
    const loadRoleEducations = async () => {
      let ids: number[] = [];
      if (selectedRole === "FACULTY" || selectedRole === "STUDENT") {
        const table = selectedRole === "FACULTY" ? "faculty" : "students";
        const { data } = await supabase.from(table).select("collegeEducationId").eq("collegeId", collegeId).eq("isActive", true);
        ids = (data ?? []).map((row) => row.collegeEducationId);
      } else if (selectedRole === "FINANCE" || selectedRole === "FINANCE_MANAGER") {
        const type = selectedRole === "FINANCE" ? "executive" : "manager";
        const { data } = await supabase.from("finance_manager").select("finance_manager_education_types(collegeEducationId)").eq("collegeId", collegeId).eq("type", type).eq("isActive", true).eq("is_deleted", false);
        ids = (data ?? []).flatMap((row: any) => (row.finance_manager_education_types ?? []).map((item: any) => item.collegeEducationId));
      } else if (selectedRole === "ACCOUNTANT") {
        const { data } = await supabase.from("accountants").select("accountant_education_types(collegeEducationId)").eq("collegeId", collegeId).eq("isActive", true).eq("is_deleted", false);
        ids = (data ?? []).flatMap((row: any) => (row.accountant_education_types ?? []).map((item: any) => item.collegeEducationId));
      } else if (selectedRole === "WELLBEING_EXECUTIVE" || selectedRole === "WELLBEING_MANAGER") {
        const roleType = selectedRole === "WELLBEING_EXECUTIVE" ? "wellbeingExecutive" : "wellbeingManager";
        const { data: wellbeingRows } = await supabase.from("well_beings").select("wellBeingId, byManager").eq("collegeId", collegeId).eq("roleType", roleType).eq("isActive", true).eq("is_deleted", false);
        const wellbeingIds = (wellbeingRows ?? []).map((row) => row.wellBeingId);
        if (wellbeingIds.length) {
          const { data: details } = await supabase.from("wellbeing_college_details").select("collegeEducationId").in("wellBeingId", wellbeingIds);
          ids = (details ?? []).map((item) => item.collegeEducationId);
        }
        if (selectedRole === "WELLBEING_EXECUTIVE") {
          const managerUserIds = [...new Set((wellbeingRows ?? []).map((row) => row.byManager).filter(Boolean))] as number[];
          if (managerUserIds.length) {
            const { data: managers } = await supabase.from("well_beings").select("wellBeingId").in("userId", managerUserIds).eq("roleType", "wellbeingManager").eq("isActive", true).eq("is_deleted", false);
            const managerWellbeingIds = (managers ?? []).map((row) => row.wellBeingId);
            if (managerWellbeingIds.length) {
              const { data: inheritedDetails } = await supabase.from("wellbeing_college_details").select("collegeEducationId").in("wellBeingId", managerWellbeingIds);
              ids.push(...(inheritedDetails ?? []).map((item) => item.collegeEducationId));
            }
          }
        }
      } else if (selectedRole === "ADMIN") {
        ids = educations.map((item) => item.collegeEducationId);
      }
      const unique = [...new Set(ids.filter(Boolean))];
      setRoleEducationIds(unique);
      if (unique.length === 1) setEducationFilter(String(unique[0]));
      else setEducationFilter("All");
      setBranchFilter("All");
    };
    loadRoleEducations();
  }, [collegeId, educations, selectedRole]);

  const {
    roles,
    departments,
    loading: dataLoading,
  } = useTotalUsers(collegeId, activeEducationId);

  const branchOptions = useMemo(() => {
    return departments?.map((d) => ({
      label: d.departmentName,
      value: String(d.departmentId),
    })) || [];
  }, [departments]);
  const roleEducations = useMemo(() => educations.filter((education) => roleEducationIds.includes(education.collegeEducationId)), [educations, roleEducationIds]);
  const roleEducationOptions = useMemo(() => roleEducations.map((item) => ({ id: item.collegeEducationId, label: item.collegeEducationType })), [roleEducations]);

  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    if (branchFilter === "All") return departments;
    return departments.filter(d => String(d.departmentId) === branchFilter);
  }, [departments, branchFilter]);
  const pagedDepartments = useMemo(
    () => filteredDepartments.slice((branchPage - 1) * branchPageSize, branchPage * branchPageSize),
    [filteredDepartments, branchPage],
  );

  const deptId = searchParams.get("deptId");
  const deptName = searchParams.get("deptName");
  const detailEducationId = Number(searchParams.get("educationId"));

  // Determine global loading state for shimmers
  const isLoading = adminContextLoading || dataLoading;
  const branchFacultyTotal = departments.reduce(
    (total, department) => total + department.faculty,
    0,
  );
  const branchStudentTotal = departments.reduce(
    (total, department) => total + department.students,
    0,
  );

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
      value: branchFacultyTotal.toString(),
      label: "Faculty",
      bgColor: "bg-[#FFEDDA]",
      icon: <UserCircle />,
      iconBgColor: "bg-[#FFFFFF]",
      iconColor: "text-[#FFBB70]",
    },
    {
      roleKey: "STUDENT",
      value: branchStudentTotal.toString(),
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
      iconBgColor: "bg-[#FFFFFF]",
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
        departmentId={Number(deptId)}
        departmentName={deptName}
        collegeId={collegeId}
        collegeEducationId={detailEducationId}
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
        <article className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth
         custom-scrollbar
         ">
          {isLoading
            ?
            [...Array(12)].map((_, i) => (
              <div
                key={`shimmer-card-${i}`}
                className="min-w-[22.5%] shrink-0 h-[135px] rounded-lg bg-gray-200 animate-pulse snap-start"
              />
            ))
            :
            cardData.map((item, index) => (
              <div key={index} className="min-w-[22.5%] shrink-0 snap-start">
                <CardComponent
                  {...item}
                  selected={selectedRole === item.roleKey}
                  onClick={() => {
                    setSelectedRole(item.roleKey);
                    setEducationFilter("All");
                    setBranchFilter("All");
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

      {selectedRole !== "PARENT" && (roleEducationIds.length > 1 || selectedRole === "FACULTY" || selectedRole === "STUDENT" || selectedRole === "WELLBEING_EXECUTIVE" || selectedRole === "WELLBEING_MANAGER") && <div className="flex gap-4 mb-4">
        {(roleEducationIds.length > 1 || selectedRole === "WELLBEING_EXECUTIVE" || selectedRole === "WELLBEING_MANAGER") && <FilterDropdown
          label="Education"
          value={educationFilter}
          options={[
            { label: "All", value: "All" },
            ...roleEducations.map((e) => ({
              label: e.collegeEducationType,
              value: String(e.collegeEducationId),
            })),
          ]}
          onChange={(val) => {
            setEducationFilter(val);
            setBranchFilter("All");
            setBranchPage(1);
            const edu = educations.find((e) => String(e.collegeEducationId) === val);
            if (edu) setEducation(edu);
          }}
        />}

        {(selectedRole === "FACULTY" || selectedRole === "STUDENT" || selectedRole === "WELLBEING_EXECUTIVE") && <FilterDropdown
          label={education?.collegeEducationType === "Inter" ? "Group" : "Branch"}
          value={branchFilter}
          disabled={educationFilter === "All"}
          options={[
            { label: "All", value: "All" },
            ...branchOptions
          ]}
          onChange={(val) => {
            setBranchFilter(val);
            setBranchPage(1);
          }}
        />}
      </div>}

      {selectedRole === "ADMIN" && collegeId ? (
        <AdminEducationTable collegeId={collegeId} educationFilter={educationFilter} />
      ) : selectedRole !== "FACULTY" && selectedRole !== "STUDENT" && collegeId ? (
        <RoleUsersTable collegeId={collegeId} role={selectedRole} educationFilter={educationFilter} branchFilter={branchFilter} educations={roleEducationOptions} />
      ) : <div className="bg-white rounded-2xl shadow-sm overflow-auto md:overflow-hidden lg:overflow-hidden">
        <table className="w-full text-left border-collapse overflow-auto">
          <thead>
            <tr className="bg-[#F1F2F4] overflow-auto">
              <th className="py-4 px-8 font-semibold text-[#4A5568] text-sm">
                Branches
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
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </td>
                  <td className="py-4 px-8">
                    <div className="h-4 bg-gray-200 rounded w-1/2 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredDepartments?.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No Branches found
                </td>
              </tr>
            ) : (
              pagedDepartments.map((dept) => (
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
                        const params = new URLSearchParams(
                          searchParams.toString(),
                        );
                        params.set("deptId", dept.departmentId.toString());
                        params.set("deptName", dept.departmentName);
                        params.set("educationId", dept.collegeEducationId.toString());
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
            totalItems={filteredDepartments.length}
            itemsPerPage={branchPageSize}
            onPageChange={setBranchPage}
            alwaysShow
          />
        )}
      </div>}
    </div>
  );
};

export default TotalUsersView;
