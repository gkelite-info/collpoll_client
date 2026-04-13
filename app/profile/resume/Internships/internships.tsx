"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import InternshipForm, { InternshipFormData } from "./internshipForm";
import { useRouter } from "next/navigation";

import {
  fetchResumeInternships,
  deleteResumeInternship,
  ResumeInternship,
} from "@/lib/helpers/student/Resume/resumeInternshipsAPI";
import ResumeInternshipsShimmer from "../../shimmers/ResumeInternshipsShimmer";
import InternshipCard from "./internshipCard";
import toast from "react-hot-toast";


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
  const router = useRouter();

  const [entries, setEntries] = useState<InternshipEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [showForm, setShowForm] = useState(false); // ← controls Add form visibility

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
        setShowForm(rows.length === 0);
      } catch (err) {
        setShowForm(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [studentId]);

  const handleAddSubmitted = (data: InternshipFormData, newDbId?: number) => {
    if (newDbId) {
      setEntries((prev) => [...prev, { dbId: newDbId, data, isEditing: false }]);
    }
    setFormKey((k) => k + 1);
    setShowForm(false); // hide form after submit
  };

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

  const handleDelete = async (dbId: number) => {
    setDeletingId(dbId);
    try {
      await deleteResumeInternship(dbId);
      setEntries((prev) => prev.filter((e) => e.dbId !== dbId));
      toast.success("Internship deleted");
    } catch {
      toast.error("Failed to delete internship");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddClick = () => {
    if (showForm) {
      toast.error("Please submit the current form before adding a new one");
      return;
    }
    setShowForm(true);
  };

  if (loading || !studentId) return <ResumeInternshipsShimmer />;

  return (
    <div className="mt-3">
      <div className="bg-white rounded-lg shadow-sm p-6">

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#282828]">Internships</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddClick}
              className="bg-[#43C17A] cursor-pointer text-white px-4 py-1.5 rounded-md text-sm font-medium"
            >
              Add +
            </button>
            <button
              type="button"
              onClick={() => router.push("/profile?resume=projects&Step=6")}
              className="bg-[#43C17A] cursor-pointer text-white px-6 py-1.5 rounded-md text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>

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
        {showForm && (
          <div className={entries.length > 0 ? "border border-[#C0C0C0] rounded-lg p-4" : ""}>
            {/* minus button to close form — same as Education */}
            {/* <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormKey((k) => k + 1);
                }}
                className="w-5 h-5 flex cursor-pointer items-center justify-center rounded-full bg-red-500 hover:bg-red-600"
              >
                <span className="block w-3 h-[3px] bg-white rounded-full" />
              </button>
            </div> */}
            <InternshipForm
              key={formKey}
              studentId={studentId}
              onSubmitted={handleAddSubmitted}
            />
          </div>
        )}

      </div>
    </div>
  );
}