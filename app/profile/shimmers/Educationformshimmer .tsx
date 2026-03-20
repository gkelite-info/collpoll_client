export default function EducationFormShimmer() {
  return (
    <div className="space-y-8 rounded-xl p-6 w-[85%] mx-auto animate-pulse">
      <ShimmerSection fields={5} />
    </div>
  );
}

function ShimmerSection({ fields }: { fields: number }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center w-[85%] mb-3">
        <div className="h-4 w-36 rounded-md bg-gray-200" />
        <div className="w-5 h-5 rounded-full bg-gray-200" />
      </div>

      {Array.from({ length: fields }).map((_, i) => (
        <ShimmerInput key={i} />
      ))}
    </div>
  );
}

function ShimmerInput() {
  return (
    <div className="space-y-1 w-[85%]">
      <div className="h-3 w-28 rounded bg-gray-200" />
      <div className="h-9 w-full rounded-md bg-gray-100" />
    </div>
  );
}

export function PrimaryShimmer() {
  return (
    <div className="space-y-4 animate-pulse">
      <ShimmerSectionHeader />
      {Array.from({ length: 5 }).map((_, i) => <ShimmerInput key={i} />)}
    </div>
  );
}

export function SecondaryShimmer() {
  return (
    <div className="space-y-4 animate-pulse">
      <ShimmerSectionHeader />
      {Array.from({ length: 6 }).map((_, i) => <ShimmerInput key={i} />)}
    </div>
  );
}

export function UndergraduateShimmer() {
  return (
    <div className="space-y-4 animate-pulse">
      <ShimmerSectionHeader />
      {Array.from({ length: 5 }).map((_, i) => <ShimmerInput key={i} />)}
      <div className="flex gap-5 w-[85%]">
        <ShimmerInput />
        <ShimmerInput />
      </div>
    </div>
  );
}

export function PhdShimmer() {
  return (
    <div className="space-y-4 animate-pulse">
      <ShimmerSectionHeader />
      {Array.from({ length: 3 }).map((_, i) => <ShimmerInput key={i} />)}
      <div className="flex gap-5 w-[85%]">
        <ShimmerInput />
        <ShimmerInput />
      </div>
    </div>
  );
}

function ShimmerSectionHeader() {
  return (
    <div className="flex justify-between items-center w-[85%] mb-3">
      <div className="h-4 w-36 rounded-md bg-gray-200" />
      {/* <div className="w-5 h-5 rounded-full bg-gray-200" /> */}
    </div>
  );
}