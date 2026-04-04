export const StatCardShimmer = () => (
  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-md p-5 flex flex-col justify-between h-[120px] shadow-xs animate-pulse">
    <div className="bg-gray-300 w-8 h-8 aspect-square rounded-sm flex items-center justify-center mb-1" />
    <div>
      <div className="h-6 bg-gray-300 rounded w-16 mb-2" />
      <div className="h-4 bg-gray-300 rounded w-24" />
    </div>
  </div>
);
