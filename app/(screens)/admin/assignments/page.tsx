import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import CourseCard from "./components/courseCard";
import { mockCourses } from "./data";

const page = () => {
  return (
    <div className="flex flex-col m-4 relative">
      <div className="mb-3 flex justify-between items-center">
        <div className="w-50% flex-0.5">
          <div className="flex items-center gap-2 group w-fit cursor-pointer">
            <h1 className="text-xl font-bold text-[#282828]">
              CSE — Assignment Overview
            </h1>
          </div>
          <p className="text-[#282828] mt-1 text-sm">
            Track subjects, faculty who created assignments, raised issues, and
            submission progress.
          </p>
        </div>
        <div className="w-80">
          <CourseScheduleCard />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {mockCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
};

export default page;
