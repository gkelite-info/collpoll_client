import React, { useMemo } from "react";
import { CustomMultiSelect, CustomSingleSelect } from "@/app/(screens)/admin/(dashboard)/components/modal/userModalComponents";

interface StaffRegistrationFieldsProps {
  dbData: any;
  basicData: any;
  handleBasicChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isFinance: boolean;
  isFinanceManager: boolean;
  isAccountant: boolean;
  showFinanceFields: boolean;
  selectedFinanceEducationTypes: string[];
  setSelectedFinanceEducationTypes: React.Dispatch<React.SetStateAction<string[]>>;
  isPlacement: boolean;
  selectedEducationId: number | null;
  setSelectedEducationId: (val: number | null) => void;
  isWellbeing: boolean;
  selectedWellbeingRegistrationType: string;
  isWellbeingHostel: boolean;
  isWellbeingCollege: boolean;
  selectedWellbeingEducationTypes: string[];
  setSelectedWellbeingEducationTypes: React.Dispatch<React.SetStateAction<string[]>>;
  handleSingleSelect: (value: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => void;
  toggleMultiSelectValue: (value: string, setList: React.Dispatch<React.SetStateAction<string[]>>) => void;
  adminEducationOptions: any[];
  user?: any;
}

export const StaffRegistrationFields: React.FC<StaffRegistrationFieldsProps> = ({
  dbData,
  basicData,
  handleBasicChange,
  isFinance,
  isFinanceManager,
  isAccountant,
  showFinanceFields,
  selectedFinanceEducationTypes,
  setSelectedFinanceEducationTypes,
  isPlacement,
  selectedEducationId,
  setSelectedEducationId,
  isWellbeing,
  selectedWellbeingRegistrationType,
  isWellbeingHostel,
  isWellbeingCollege,
  selectedWellbeingEducationTypes,
  setSelectedWellbeingEducationTypes,
  handleSingleSelect,
  toggleMultiSelectValue,
  adminEducationOptions,
  user
}) => {

  const degreeOptions = useMemo(() => dbData.educations.map((e: any) => e.collegeEducationType), [dbData.educations]);

  return (
    <>
      {showFinanceFields && !user && (
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Education Type <span className="text-red-600">*</span>
          </label>
          <div className={isFinanceManager ? "pointer-events-none opacity-50" : ""}>
            {isAccountant ? (
              <CustomMultiSelect
                options={adminEducationOptions.map((e: any) => e.collegeEducationType)}
                selectedValues={selectedFinanceEducationTypes}
                onChange={(val) => toggleMultiSelectValue(val, setSelectedFinanceEducationTypes)}
                onRemove={(val) => toggleMultiSelectValue(val, setSelectedFinanceEducationTypes)}
                placeholder="Select multiple Education Types"
              />
            ) : (
              <CustomSingleSelect
                options={adminEducationOptions.map((e: any) => e.collegeEducationType)}
                selectedValue={selectedFinanceEducationTypes[0] || ""}
                onChange={(val) => handleSingleSelect(val, setSelectedFinanceEducationTypes)}
                placeholder="Select Education Type"
              />
            )}
          </div>
          {isFinanceManager && (
            <span className="text-xs text-gray-500 mt-1">
              Note: Executive managers are assigned to specific education types automatically.
            </span>
          )}
        </div>
      )}

      {isPlacement && (
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D3748]">
            Education Type <span className="text-red-600">*</span>
          </label>
          <CustomSingleSelect
            options={degreeOptions}
            selectedValue={
              selectedEducationId
                ? dbData.educations.find((e: any) => e.collegeEducationId === selectedEducationId)?.collegeEducationType || ""
                : ""
            }
            onChange={(value) => {
              const ed = dbData.educations.find((e: any) => e.collegeEducationType === value);
              setSelectedEducationId(ed?.collegeEducationId || null);
            }}
            placeholder="Select degree"
          />
        </div>
      )}

      {isWellbeing && (
        <>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3748]">
              Registration Type <span className="text-red-600">*</span>
            </label>
            <select
              value={selectedWellbeingRegistrationType}
              onChange={(e) => {
                const value = e.target.value;
                handleBasicChange({ target: { name: "wellbeingRegistrationType", value } } as any);
                if (value === "Hostel") {
                  setSelectedWellbeingEducationTypes([]);
                }
              }}
              className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer"
            >
              <option value="" disabled>Select Type</option>
              <option value="Hostel">Hostel Manager</option>
              <option value="College">College Manager</option>
              <option value="Both">Both (Hostel & College)</option>
            </select>
          </div>

          {isWellbeingHostel && (
            <div className="grid landscape:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Block <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="hostelBlock"
                  value={basicData.hostelBlock}
                  onChange={handleBasicChange}
                  placeholder="e.g. Block A"
                  className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Building Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="buildingNumber"
                  value={basicData.buildingNumber}
                  onChange={handleBasicChange}
                  placeholder="e.g. B-12"
                  className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D3748]">
                  Hostel Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="hostelType"
                  value={basicData.hostelType}
                  onChange={handleBasicChange}
                  className="w-full border border-gray-200 rounded-md px-3 py-1 text-sm outline-none focus:ring-1 focus:ring-[#48C78E] cursor-pointer"
                >
                  <option value="" disabled>Select Type</option>
                  <option value="Boys">Boys Hostel</option>
                  <option value="Girls">Girls Hostel</option>
                </select>
              </div>
            </div>
          )}

          {isWellbeingCollege && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2D3748]">
                College Education Type <span className="text-red-600">*</span>
              </label>
              <CustomMultiSelect
                options={adminEducationOptions.map((e: any) => e.collegeEducationType)}
                selectedValues={selectedWellbeingEducationTypes}
                onChange={(val) => toggleMultiSelectValue(val, setSelectedWellbeingEducationTypes)}
                onRemove={(val) => toggleMultiSelectValue(val, setSelectedWellbeingEducationTypes)}
                placeholder="Select Education Types"
              />
            </div>
          )}
        </>
      )}
    </>
  );
};
