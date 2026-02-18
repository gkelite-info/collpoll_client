export default function PillTag({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700 mx-1">
            {label}
        </span>
    );
}