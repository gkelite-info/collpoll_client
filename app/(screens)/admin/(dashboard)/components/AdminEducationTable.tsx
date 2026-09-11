"use client";
import RoleUsersTable from "./RoleUsersTable";

export default function AdminEducationTable({ collegeId, educationFilter, branchFilter = "All" }: {
  collegeId: number; educationFilter: string; branchFilter?: string;
}) {
  return <RoleUsersTable key={`${collegeId}:${educationFilter}:${branchFilter}`} collegeId={collegeId} role="ADMIN" educationFilter={educationFilter} branchFilter={branchFilter} />;
}
