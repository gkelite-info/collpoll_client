interface TextAreaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
}
export function Input({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = "text",
    min,
    max,
    disabled = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-[#282828] mb-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                max={max}
                disabled={disabled}
                className="h-10 px-3 border border-[#CCCCCC] text-[#525252] rounded-md text-sm focus:outline-none"
            />
        </div>
    );
}

export function Select({
    label,
    name,
    value,
    options,
    onChange,
    disabled = false,
}: {
    label: string;
    name: string;
    value: string;
    options: string[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col">
            <label className="text-sm font-medium text-[#282828] mb-1">
                {label}
            </label>
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="h-10 px-3 text-[#282828] cursor-pointer border border-[#CCCCCC] rounded-md text-sm bg-white focus:outline-none"
            >
                <option value="">Select</option>
                {options.map((opt) => (
                    <option key={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

export function TextArea({ label, ...props }: TextAreaProps) {
    return (
        <div className="flex flex-col md:col-span-2">
            <label className="text-sm font-medium text-[#282828] mb-1">
                {label}
            </label>
            <div className="relative">
                <textarea
                    {...props}
                    maxLength={500}
                    rows={4}
                    className="px-3 py-2 w-full text-[#282828] border border-[#CCCCCC] rounded-md text-sm resize-none focus:outline-none"
                />
                <span className="absolute bottom-3 right-3 text-xs text-[#6B7280]">
                    {(props.value?.toString().length ?? 0)}/{props.maxLength ?? 500}
                </span>
            </div>
        </div>
    );
}