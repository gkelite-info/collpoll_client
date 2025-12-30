"use client";

import {
  deleteInternshipAction,
  getInternshipsAction,
} from "@/lib/helpers/profile/actions/internship.actions";
import { Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InternshipCard from "./internshipCard";
import InternshipForm, { InternshipFormData } from "./internshipForm";

interface InternshipState {
  uiId: string | number;
  dbId?: number;
  submitted: boolean;
  data?: InternshipFormData;
  isDeleting?: boolean;
}

export default function Internships() {
  const [forms, setForms] = useState<InternshipState[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    index: number;
    dbId: number;
  } | null>(null);

  const router = useRouter();
  const studentId = 1;

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const data = await getInternshipsAction(studentId);

        if (data && data.length > 0) {
          const formatted: InternshipState[] = data.map((item: any) => ({
            uiId: item.internshipId,
            dbId: item.internshipId,
            submitted: true,
            data: {
              organization: item.organizationName,
              role: item.role,
              startDate: item.startDate,
              endDate: item.endDate,
              projectName: item.projectName,
              projectUrl: item.projectUrl || "",
              location: item.location,
              domain: item.domain,
              description: item.description || "",
            },
          }));
          setForms(formatted);
        } else {
          setForms([{ uiId: "init-1", submitted: false }]);
        }
      } catch (error) {
        console.error("Failed to load internships", error);
        toast.error("Failed to load saved internships");
        setForms([{ uiId: "init-1", submitted: false }]);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  const handleAdd = () => {
    const last = forms[forms.length - 1];

    if (last && !last.submitted) {
      toast.error(
        "Please submit the current internship before adding a new one."
      );
      return;
    }

    setForms((prev) => [
      ...prev,
      { uiId: `new-${Date.now()}`, submitted: false },
    ]);
  };

  const handleEdit = (index: number) => {
    setForms((prev) =>
      prev.map((f, i) => (i === index ? { ...f, submitted: false } : f))
    );
  };

  // CHANGED: Trigger function that decides whether to delete immediately (local) or open modal (db)
  const handleDeleteClick = (index: number, dbId?: number) => {
    if (!dbId) {
      setForms((prev) => {
        const filtered = prev.filter((_, i) => i !== index);
        return filtered.length
          ? filtered
          : [{ uiId: `new-${Date.now()}`, submitted: false }];
      });
      return;
    }

    // Prepare state and open modal
    setItemToDelete({ index, dbId });
    setDeleteModalOpen(true);
  };

  // NEW: Action function called when "Delete" is clicked in the modal
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const { index, dbId } = itemToDelete;

    // Close modal
    setDeleteModalOpen(false);

    setForms((prev) =>
      prev.map((f, i) => (i === index ? { ...f, isDeleting: true } : f))
    );

    try {
      await deleteInternshipAction(dbId);
      toast.success("Internship deleted successfully");

      setForms((prev) => {
        const filtered = prev.filter((_, i) => i !== index);
        return filtered.length
          ? filtered
          : [{ uiId: `new-${Date.now()}`, submitted: false }];
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete internship");
      setForms((prev) =>
        prev.map((f, i) => (i === index ? { ...f, isDeleting: false } : f))
      );
    } finally {
      setItemToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-3 p-6 bg-white rounded-lg shadow-sm text-center text-gray-500">
        Loading internships...
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <h2 className="text-2xl font-medium text-[#282828]">Internships</h2>

          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              type="button"
              className="inline-flex cursor-pointer items-center gap-2 bg-[#43C17A] text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-emerald-600 transition-colors"
            >
              Add <Plus size={14} />
            </button>

            <button
              type="button"
              onClick={() => router.push("/profile?projects")}
              className="inline-flex items-center cursor-pointer bg-[#43C17A] text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-emerald-600 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {forms.map((f, index) => (
            <div
              key={f.uiId}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              {f.submitted && f.data ? (
                <div className="mt-6">
                  <InternshipCard
                    data={f.data}
                    onEdit={() => handleEdit(index)}
                    onDelete={() => handleDeleteClick(index, f.dbId)}
                    isDeleting={f.isDeleting || false}
                  />
                </div>
              ) : (
                <>
                  <h3 className="mt-6 text-lg font-semibold text-[#282828] -mb-1">
                    Internship {index + 1}
                  </h3>
                  <InternshipForm
                    studentId={studentId}
                    initialData={f.data}
                    internshipId={f.dbId}
                    onSubmitted={(data: InternshipFormData, newDbId?: number) =>
                      setForms((prev) =>
                        prev.map((x) =>
                          x.uiId === f.uiId
                            ? {
                                ...x,
                                submitted: true,
                                data: data,
                                dbId: newDbId || x.dbId,
                              }
                            : x
                        )
                      )
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold text-[#282828]">
              Delete Internship
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this internship? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
