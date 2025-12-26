export default function Field({
  label,
  value,
  type,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  type: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col ">
      <label className="form-label font-medium text-[#282828]">{label}</label>
      <input
        className="border border-[#CCCCCC] text-[#525252] rounded-md px-3 h-10 py-1 focus:outline-none"
        value={value}
        type={type}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
