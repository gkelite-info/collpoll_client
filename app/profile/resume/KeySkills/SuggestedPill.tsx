import { Plus } from "@phosphor-icons/react";

export default function SuggestedPill({
  label,
  onAdd,
  disabled,
  onDismiss: _onDismiss, // kept in props signature so existing code doesn't break, but not rendered
}: {
  label: string;
  onAdd: () => void;
  disabled?: boolean;
  onDismiss?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#43C17A] px-3 py-1 text-sm text-[#43C17A] mr-2 mb-2 hover:bg-[#43C17A15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <Plus size={11} weight="bold" />
      {label}
    </button>
  );
}