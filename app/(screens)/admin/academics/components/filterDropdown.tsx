import { CaretDown } from "@phosphor-icons/react";

interface FilterProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  disabled?: boolean;
  displayModifier?: (opt: string) => string;
  placeholder?: string;
}

export const FilterDropdown = ({
  label,
  value,
  options,
  onChange,
  disabled = false,
  displayModifier,
  placeholder = "Select...",
}: FilterProps) => {
  const realOptions = options.filter((opt) => opt !== "All");
  const hasData = realOptions.length > 0;

  const selectedValue = value && value !== "All" ? value : "";

  return (
    <div className="flex flex-col gap-1 min-w-30 overflow-visible">
      <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-1">
        {label}
      </label>

      <div
        className={`relative border border-gray-300 rounded-md hover:border-gray-400 transition-colors bg-white w-[120px] overflow-visible ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <select
          value={selectedValue}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none cursor-pointer bg-transparent text-[13px] font-medium pl-2 pr-10 focus:outline-none truncate ${
            disabled ? "text-gray-400" : "text-gray-700"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {hasData ? (
            <>
              <option value="All">All</option>
              {realOptions.map((opt) => {
                const labelText = displayModifier ? displayModifier(opt) : opt;
                return (
                  <option key={opt} value={opt} title={labelText}>
                    {labelText}
                  </option>
                );
              })}
            </>
          ) : (
            <option value="" disabled>
              No data available
            </option>
          )}
        </select>

        <CaretDown
          size={12}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          weight="bold"
        />
      </div>
    </div>
  );
};
