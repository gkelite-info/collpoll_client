// import Skeleton from "@/app/utils/skeleton";

// export function DashboardSkeleton() {
//   return (
//     <div className="bg-red-00 flex w-full h-fit p-2 gap-4">
//       <div className="w-[100%] flex flex-col gap-6">
//         <div className="flex gap-4 flex-wrap">
//           <Skeleton className="h-32 flex-1 w-44 rounded-[20px]" />
//           <Skeleton className="h-32 flex-1 w-44 rounded-[20px]" />
//           <Skeleton className="h-32 flex-2 w-44 rounded-[20px]" />
//         </div>
//       </div>
//     </div>
//   );
// }

// export const TableSkeleton = () => {
//   return (
//     <div className="border border-gray-100 rounded-xl overflow-hidden bg-white p-4">
//       <div className="flex justify-between mb-4 border-b pb-2">
//         {[1, 2, 3, 4, 5].map((i) => (
//           <Skeleton key={i} variant="text" className="h-4 mr-1 w-20" />
//         ))}
//       </div>

//       {[1, 2, 3, 4, 5].map((row) => (
//         <div
//           key={row}
//           className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
//         >
//           <Skeleton variant="text" className="h-4 w-32 mr-1" />
//           <Skeleton variant="text" className="h-4 w-32 mr-1" />
//           <Skeleton variant="text" className="h-4 w-12 mr-1" />
//           <Skeleton variant="text" className="h-4 w-12 mr-2" />
//           <Skeleton
//             variant="circular"
//             className="h-6 w-6 mr-1 aspect-square rounded-full"
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

import Skeleton from "@/app/utils/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="bg-red-00 flex w-full h-fit p-2 gap-4 max-md:p-0">
      <div className="w-[100%] flex flex-col gap-6 max-md:gap-4">
        <div className="flex gap-4 flex-wrap max-md:grid max-md:grid-cols-[1fr_1fr] max-md:gap-3">
          <Skeleton className="h-32 flex-1 w-44 rounded-[20px] max-md:w-full max-md:h-[76px] max-md:rounded-lg" />
          <Skeleton className="h-32 flex-1 w-44 rounded-[20px] max-md:w-full max-md:h-[76px] max-md:rounded-lg" />
          <Skeleton className="h-32 flex-2 w-44 rounded-[20px] max-md:col-span-2 max-md:w-full max-md:h-32 max-md:rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export const TableSkeleton = () => {
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white p-4 max-md:p-0 max-md:border-none max-md:bg-transparent">
      <div className="hidden md:block">
        <div className="flex justify-between mb-4 border-b pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="text" className="h-4 mr-1 w-20" />
          ))}
        </div>

        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0"
          >
            <Skeleton variant="text" className="h-4 w-32 mr-1" />
            <Skeleton variant="text" className="h-4 w-32 mr-1" />
            <Skeleton variant="text" className="h-4 w-12 mr-1" />
            <Skeleton variant="text" className="h-4 w-12 mr-2" />
            <Skeleton
              variant="circular"
              className="h-6 w-6 mr-1 aspect-square rounded-full"
            />
          </div>
        ))}
      </div>

      <div className="block md:hidden flex-col w-full gap-2 mt-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div
            key={row}
            className="bg-white border-b border-gray-100 overflow-hidden last:border-b-0 py-3 flex justify-between items-center"
          >
            <div className="flex flex-col gap-1.5">
              <Skeleton variant="text" className="h-3 w-16" />
              <Skeleton variant="text" className="h-4 w-40" />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Skeleton variant="circular" className="h-6 w-6 rounded-full" />
              <Skeleton variant="circular" className="h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
