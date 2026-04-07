export function KeySkillsShimmer() {
  return (
    <div className="mt-4">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {["Technical Skills", "Soft Skills", "Tools & Frameworks"].map((label) => (
            <section key={label}>
              <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-3" />
              <div className="rounded-md border border-[#C0C0C0] p-3 flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}