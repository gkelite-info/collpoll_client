"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import InternshipForm, { InternshipFormData } from "./internshipForm";

import {
  fetchResumeInternships,
  deleteResumeInternship,
  ResumeInternship,
} from "@/lib/helpers/student/Resume/resumeInternshipsAPI";
import ResumeInternshipsShimmer from "../../shimmers/ResumeInternshipsShimmer";
import InternshipCard from "./internshipCard";


interface InternshipEntry {
  dbId: number;
  data: InternshipFormData;
  isEditing: boolean;
}

const emptyForm: InternshipFormData = {
  organization: "",
  role: "",
  startDate: "",
  endDate: "",
  projectName: "",
  projectUrl: "",
  location: "",
  domain: "",
  description: "",
};

export default function Internships() {
  const { studentId } = useUser();

  const [entries, setEntries] = useState<InternshipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0); // resets form after submit

  // ── Load existing internships ──────────────────────────────────
  useEffect(() => {
    if (!studentId) return;

    const load = async () => {
      try {
        const rows: ResumeInternship[] = await fetchResumeInternships(studentId);
        const mapped: InternshipEntry[] = rows.map((r) => ({
          dbId: r.resumeInternshipId!,
          isEditing: false,
          data: {
            organization: r.organizationName,
            role: r.role,
            startDate: r.startDate ? r.startDate.slice(0, 10) : "",
            endDate: r.endDate ? r.endDate.slice(0, 10) : "",
            projectName: r.projectName ?? "",
            projectUrl: r.projectUrl ?? "",
            location: r.location ?? "",
            domain: r.domain ?? "",
            description: r.description ?? "",
          },
        }));
        setEntries(mapped);
      } catch (err) {
        console.error("Failed to load internships:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [studentId]);

  // ── Add new internship ─────────────────────────────────────────
  const handleAddSubmitted = (data: InternshipFormData, newDbId?: number) => {
    if (newDbId) {
      setEntries((prev) => [...prev, { dbId: newDbId, data, isEditing: false }]);
    }
    setFormKey((k) => k + 1); // reset form fields
  };

  // ── Edit existing internship ───────────────────────────────────
  const handleEditSubmitted = (dbId: number) => (data: InternshipFormData) => {
    setEntries((prev) =>
      prev.map((e) => (e.dbId === dbId ? { ...e, data, isEditing: false } : e))
    );
  };

  const toggleEdit = (dbId: number) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.dbId === dbId ? { ...e, isEditing: !e.isEditing } : e
      )
    );
  };

  // ── Delete internship ──────────────────────────────────────────
  const handleDelete = async (dbId: number) => {
    setDeletingId(dbId);
    try {
      await deleteResumeInternship(dbId);
      setEntries((prev) => prev.filter((e) => e.dbId !== dbId));
    } catch {
      console.error("Failed to delete internship");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || !studentId) return <ResumeInternshipsShimmer />;

  return (
    <div className="mt-3">
      <div className="bg-white rounded-lg shadow-sm p-6">

        {/* Header */}
        <h2 className="text-lg font-semibold text-[#282828] mb-4">Internships</h2>

        {/* Internship Cards */}
        {entries.length > 0 && (
          <div className="space-y-4 mb-6">
            {entries.map((entry) => (
              <div key={entry.dbId}>
                <InternshipCard
                  data={entry.data}
                  onEdit={() => toggleEdit(entry.dbId)}
                  onDelete={() => handleDelete(entry.dbId)}
                  isDeleting={deletingId === entry.dbId}
                />
                {entry.isEditing && (
                  <div className="mt-2 border border-[#C0C0C0] rounded-lg p-4">
                    <InternshipForm
                      studentId={studentId}
                      internshipId={entry.dbId}
                      initialData={entry.data}
                      onSubmitted={handleEditSubmitted(entry.dbId)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Always-visible Add Form */}
        <InternshipForm
          key={formKey}
          studentId={studentId}
          onSubmitted={handleAddSubmitted}
        />

      </div>
    </div>
  );
}