import { CaretLeft } from "@phosphor-icons/react";
import React from "react";
import PolicyTable from "./tables/policyTable";

interface TotalAutomationsProps {
  onBack: () => void;
}

const PolicyManagement: React.FC<TotalAutomationsProps> = ({ onBack }) => {
  const handleRowClick = (id: string) => {
    console.log("Automation ID:", id);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <div className="mb-5">
        <div className="flex items-center gap-2 group w-fit">
          <CaretLeft
            onClick={onBack}
            size={24}
            weight="bold"
            className="text-[#2D3748] cursor-pointer group-hover:-translate-x-1 transition-transform"
          />
          <h1 className="text-2xl font-medium text-[#282828]">
            Policy Setup & Management
          </h1>
        </div>
        <p className="text-[#282828] mt-2 ml-8 text-sm">
          Manage and update policies.
        </p>
      </div>

      <article className="">
        <PolicyTable />
      </article>
    </div>
  );
};

export default PolicyManagement;
