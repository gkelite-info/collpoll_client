import Header from "@/app/components/header/page";
import StudentNavbar from "@/app/components/navbar/studentNavbar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen">
      <div className="w-[17%] bg-[#43C17A]">
        <StudentNavbar />
      </div>

      <div className="flex flex-col w-[83%]">
        <div className="h-[13%] bg-[#F4F4F4] flex justify-end">
          <Header />
        </div>

        <div className="h-[87%] bg-[#F4F4F4] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
