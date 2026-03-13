export function ValueShimmer() {
  return (
    <span className="relative inline-flex w-16 h-6 rounded-md overflow-hidden
      bg-gray-100 animate-pulse align-middle">
      <span
        className="absolute inset-0
        animate-[shimmer_1s_infinite]
        bg-gradient-to-r from-transparent via-gray-300/60 to-transparent"
      />
    </span>
  );
}