import { X } from "@phosphor-icons/react";

export default function Pill({
  children,
  onRemove,
  showRemove,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  showRemove?: boolean;
}) {
  return (
    <span className="relative inline-flex items-center rounded-full border border-[#525252] px-3 py-1 text-sm text-gray-700 mr-2 mb-2">
      <span className="pr-2">{children}</span>

      {showRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove && onRemove();
          }}
          className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
          aria-label="Remove"
        >
          <X size={12} weight="bold" />
        </button>
      )}
    </span>
  );
}