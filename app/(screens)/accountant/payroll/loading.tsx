import PayrollQueueShimmer from "./components/PayrollQueueShimmer";

export default function AccountantPayrollLoading() {
  return (
    <main className="min-h-[calc(100dvh-92px)] w-full bg-[#f5f6f8] p-3 text-[#142038] sm:p-5 lg:p-6">
      <header className="mb-5">
        <div className="h-7 w-52 animate-pulse rounded-lg bg-[#e5e8ed]" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded-lg bg-[#e5e8ed]" />
      </header>
      <PayrollQueueShimmer />
    </main>
  );
}
