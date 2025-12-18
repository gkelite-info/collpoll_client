
export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="flex flex-col w-[100%]">
        <div className="h-[87%] bg-[#F4F4F4] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
