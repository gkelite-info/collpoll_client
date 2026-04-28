"use client";

import { useState } from "react";
import ConfirmDeleteModal from "@/app/(screens)/admin/calendar/components/ConfirmDeleteModal";
import PlacementCompanyCard from "./PlacementCompanyCard";
import { PlacementCompany } from "./mockData";

type CompanyManagementViewProps = {
  companies: PlacementCompany[];
  onCardClick: (companyId: number) => void;
  onCreateCompany: () => void;
  onEditCompany: (companyId: number) => void;
  onDeleteCompany: (company: PlacementCompany) => Promise<void>;
};

export default function CompanyManagementView({
  companies,
  onCardClick,
  onCreateCompany,
  onEditCompany,
  onDeleteCompany,
}: CompanyManagementViewProps) {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<PlacementCompany | null>(null);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);

  const handleCreateCompany = () => {
    setIsAddingCompany(true);
    onCreateCompany();
  };

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return;

    setIsDeletingCompany(true);
    try {
      await onDeleteCompany(companyToDelete);
      setCompanyToDelete(null);
    } catch {
      // Error feedback is handled by the parent action.
    } finally {
      setIsDeletingCompany(false);
    }
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <div className="mb-4 flex shrink-0 justify-end">
          <button
            type="button"
            onClick={handleCreateCompany}
            disabled={isAddingCompany}
            className="flex h-8 min-w-28 cursor-pointer items-center justify-center rounded-lg bg-[#16284F] px-3 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isAddingCompany ? "Loading..." : "Add Company"}
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto  pb-4">
          {companies.map((company) => (
            <PlacementCompanyCard
              key={company.id}
              company={company}
              onClick={() => onCardClick(company.id)}
              onEdit={() => onEditCompany(company.id)}
              onDelete={() => setCompanyToDelete(company)}
            />
          ))}
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!companyToDelete}
        onCancel={() => {
          if (!isDeletingCompany) setCompanyToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingCompany}
        confirmText="Delete"
        loadingText="Deleting..."
        name="company"
        itemName={companyToDelete?.name}
        customDescription={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-700">
              {companyToDelete?.name}
            </span>
            ? This company will be hidden from active placement companies.
          </>
        }
      />
    </>
  );
}
