"use client";

import { useEffect, useState } from "react";
import AssignmentCard from "./assignmentCard";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { deleteFacultyAssignment } from "@/lib/helpers/faculty/deleteFacultyAssignment";

export default function AssignmentTable() {
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    const { data, error } = await supabase
      .from("faculty_assignments")
      .select("*")
      .order("assignmentId", { ascending: true });

    if (!error) {
      setAssignments(data || []);
    }
  };

  // 🔥 DELETE FUNCTION
  const handleDelete = async (id: number) => {
    const res = await deleteFacultyAssignment(id);

    if (!res.success) {
      toast.error(res.error || "Delete failed");
      return;
    }

    toast.success("Assignment deleted");

    // 🔥 Remove from UI immediately
    setAssignments(prev => prev.filter(a => a.assignmentId !== id));
  };

  const handleEdit = (assignment: any) => {
    // your existing edit code
  };

  return (
    <AssignmentCard
      cardProp={assignments}
      activeView="active"
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}
