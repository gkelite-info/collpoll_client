import StuDashLeft from "./left";
import StuDashRight from "./right";

export default function StuDashboard() {
  return (
    <>
      <div className="flex items-start justify-start pb-5">
        <div className="w-full lg:w-[68%]">
          <StuDashLeft />
        </div>

        <div className="hidden lg:block w-[32%]">
          <StuDashRight />
        </div>
      </div>
    </>
  );
}

