
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="flex flex-col">
        <div className="h-auto bg-[#F4F4F4] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
