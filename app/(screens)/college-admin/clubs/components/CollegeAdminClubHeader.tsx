import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export default function CollegeAdminClubHeader() {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-[#282828]">Clubs</h1>
                <p className="text-[#282828] mt-1">Manage and view all clubs in your college</p>
            </div>
            <div className="w-[320px]">
                <CourseScheduleCard isVisibile={false}/>
            </div>
        </div>
    );
}