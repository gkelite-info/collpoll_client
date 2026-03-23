export default function FacultyQuizCard({ data, onViewSubmissions }: { data: any, onViewSubmissions?: (quizId: number) => void; }) {
    return (
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-3">
            <div>
                <h3 className="text-base font-bold text-[#282828]">{data.title}</h3>
                <p className="text-sm font-medium text-gray-500 mt-0.5">{data.subtitle}</p>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-[#282828] w-28">Duration</span>
                    <span className="bg-[#F3F0FF] text-[#8B5CF6] px-2 py-0.5 rounded-md text-xs font-semibold">
                        {data.duration}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-[#282828] w-28">Total Questions</span>
                    <span className="text-gray-600 font-medium">{data.totalQuestions}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-[#282828] w-28">Total Marks</span>
                        <span className="text-gray-600 font-medium">{data.totalMarks}</span>
                    </div>
                    <span
                        onClick={() => {
                            console.log("data:", data)
                            onViewSubmissions?.(data.quizId)
                        }}
                        className="text-[#43C17A] font-semibold cursor-pointer hover:underline"
                    >
                        View Submissions
                    </span>
                </div>
            </div>
        </div >
    );
}