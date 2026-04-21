"use client";

import { useState } from "react";
import PlacementCompanyCard from "./PlacementCompanyCard";
import { PlacementCompany } from "./mockData";

type CompanyManagementViewProps = {
  companies: PlacementCompany[];
  onCardClick: (companyId: number) => void;
  onCreateCompany: () => void;
};

export default function CompanyManagementView({
  companies,
  onCardClick,
  onCreateCompany,
}: CompanyManagementViewProps) {
  const [isAddingCompany, setIsAddingCompany] = useState(false);

  const handleCreateCompany = () => {
    setIsAddingCompany(true);
    onCreateCompany();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCreateCompany}
          disabled={isAddingCompany}
          className="flex h-8 min-w-[112px] cursor-pointer items-center justify-center rounded-lg bg-[#16284F] px-3 text-[14px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isAddingCompany ? "Loading..." : "Add Company"}
        </button>
      </div>

      {companies.map((company) => (
        <PlacementCompanyCard
          key={company.id}
          company={company}
          onClick={() => onCardClick(company.id)}
          onEdit={handleCreateCompany}
        />
      ))}
    </div>
  );
}
