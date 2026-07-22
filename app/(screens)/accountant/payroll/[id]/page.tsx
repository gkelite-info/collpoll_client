"use client";

import { notFound } from "next/navigation";
import { use } from "react";

import PayrollDetailScreen from "../components/PayrollDetailScreen";
import { staticPayrollEmployees } from "../data";

export default function AccountantPayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employee = staticPayrollEmployees.find((item) => item.payrollEntryId === Number(id));
  if (!employee) return notFound();
  return <PayrollDetailScreen employee={employee} />;
}
