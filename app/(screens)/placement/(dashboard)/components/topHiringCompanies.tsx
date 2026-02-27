import React from "react";

export interface TopHiringCompaniesProps {
  companies: string[];
}

export const TopHiringCompanies: React.FC<TopHiringCompaniesProps> = ({
  companies,
}) => {
  const renderCompanyLogo = (company: string) => {
    switch (company.toLowerCase()) {
      case "tcs":
        return (
          <div className="bg-[#0C121D] w-full h-full rounded flex flex-col items-center justify-center leading-none">
            <span className="text-[#FF2A2A] font-bold text-[14px] tracking-tighter">
              tcs
            </span>
            <span className="text-white text-[4px] mt-[1px] opacity-70">
              TATA CONSULTANCY
            </span>
          </div>
        );
      case "wipro":
        return (
          <div className="bg-white w-full h-full rounded flex items-center justify-center">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-[2px] border-dotted border-blue-500/80"></div>
              <span className="text-[#1D2B4A] font-bold text-[10px] tracking-tight">
                wipro
              </span>
            </div>
          </div>
        );
      case "infosys":
        return (
          <div className="bg-[#007CC3] w-full h-full rounded flex items-center justify-center">
            <span className="text-white font-bold text-[11px] tracking-wide">
              Infosys
            </span>
          </div>
        );
      case "accenture":
        return (
          <div className="bg-white w-full h-full rounded flex items-center justify-center">
            <span className="text-black font-bold text-[10px] tracking-tight">
              accenture<span className="text-purple-600 font-black">{">"}</span>
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-[12px] p-4 shadow-sm border border-gray-100/50">
      <h2 className="text-[15px] font-bold text-[#1F2937] mb-3">
        Top Hiring Companies
      </h2>
      <div className="grid grid-cols-4 gap-2">
        {companies.map((company, idx) => (
          <div
            key={idx}
            className="bg-[#E8F5EE] rounded-md h-[48px] flex items-center justify-center p-1.5"
          >
            {renderCompanyLogo(company)}
          </div>
        ))}
      </div>
    </div>
  );
};
