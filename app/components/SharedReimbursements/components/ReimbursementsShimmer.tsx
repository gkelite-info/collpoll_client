export default function ReimbursementsShimmer() {
  return <div className="w-full animate-pulse">
    <div className="mb-6 flex items-center justify-between"><div><div className="h-8 w-52 rounded bg-gray-200"/><div className="mt-2 h-4 w-72 rounded bg-gray-200"/></div><div className="h-11 w-44 rounded-md bg-gray-200"/></div>
    <div className="mb-5 flex gap-4 overflow-hidden">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[108px] min-w-[235px] flex-1 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"><div className="h-4 w-28 rounded bg-gray-200"/><div className="mt-5 h-8 w-14 rounded bg-gray-200"/></div>)}</div>
    <section className="overflow-hidden rounded-[10px] bg-white shadow-sm"><div className="flex items-center justify-between px-6 py-5"><div className="h-6 w-40 rounded bg-gray-200"/><div className="h-6 w-16 rounded bg-gray-200"/></div><div className="h-12 bg-gray-100"/><div>{Array.from({ length: 5 }, (_, row) => <div key={row} className="grid grid-cols-7 gap-5 border-b border-gray-100 px-8 py-5">{Array.from({ length: 7 }, (_, column) => <div key={column} className="h-4 rounded bg-gray-200"/>)}</div>)}</div><div className="h-16 border-t border-gray-100 bg-white"/></section>
  </div>;
}
