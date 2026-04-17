import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export default function ClubHeader() {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold text-[#282828]">Clubs</h1>
                <p className="text-[#282828] mt-1">Review student requests and manage club members efficiently</p>
            </div>
            <div className="w-[320px]">
                <CourseScheduleCard />
            </div>
        </div>
    );
}