import { CaretDown } from "@phosphor-icons/react/dist/ssr";
 
type InputFieldProps = {
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  value?: string;
  name?: string;
  uppercase?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rightIcon?: React.ReactNode;
};
 
export const InputField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  rightIcon,
  uppercase,
}: InputFieldProps) => (
  <div className={`flex flex-col w-full ${className}`}>
    <label className="text-[#282828] font-semibold text-[15px] mb-1.5">
      {label}
    </label>
    <div className="relative flex items-center justify-center">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`border border-[#CCCCCC] rounded-lg px-4 py-2.5 pr-10 text-sm text-[#525252] placeholder:text-gray-400 focus:outline-none focus:border-[#49C77F] transition-colors shadow-sm w-full ${
          uppercase ? "uppercase" : ""
        }`}
        onWheel={(e) => e.currentTarget.blur()}
      />
 
      {rightIcon && (
        <div className="absolute right-3 flex text-gray-500">{rightIcon}</div>
      )}
    </div>
    {/* <input
    name={name}                
      value={value ?? ""}        
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:border-[#49C77F] transition-colors shadow-sm"
      onWheel={(e) => e.currentTarget.blur()}
    /> */}
  </div>
);
 
// export const SelectField = ({ label,  name = "", value = "", onChange= () => {}, type,  placeholder, className = "" }: any) => (
//     <input
//     name={name}
//       value={value ?? ""}
//       onChange={onChange}
//       type={type}
//       placeholder={placeholder}
//       className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none focus:border-[#49C77F] transition-colors shadow-sm"
//       onWheel={(e) => e.currentTarget.blur()}
//     />
//   </div>
// );
 
export const SelectField = ({
  label,
  name = "",
  value = "",
  onChange = () => {},
  placeholder,
  className = "",
}: any) => (
  <div className={`flex flex-col w-full relative ${className}`}>
    <label className="text-[#333] font-semibold text-[15px] mb-1.5">
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        // defaultValue=""
        className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-600 w-full focus:outline-none focus:border-[#49C77F] bg-white cursor-pointer shadow-sm"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        <option value="1">Option 1</option>
      </select>
      <CaretDown
        size={18}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
    </div>
  </div>
);
 