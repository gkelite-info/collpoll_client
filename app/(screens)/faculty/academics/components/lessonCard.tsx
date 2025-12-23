import { CheckCircle, FilePdf } from "@phosphor-icons/react";
import { LessonData } from "./subjectDetails";

interface LessonCardProps {
  lesson: LessonData;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <div className="w-full bg-white border-[1.5px] border-[#E0D7FB] rounded-2xl p-6 shadow-sm mb-6">
      <h2 className="text-[#7051E1] text-2xl font-bold mb-6">
        Lesson {lesson.lessonNumber} - {lesson.lessonTitle}
      </h2>

      <div className="space-y-4">
        {lesson.topics.map((topic, index) => (
          <div key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <CheckCircle
                size={24}
                weight="fill"
                className={
                  topic.isCompleted ? "text-[#9B83F4]" : "text-gray-300"
                }
              />
              <span className="text-[#282828] text-lg font-normal">
                • {topic.title}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-[#EBEBFF] px-4 py-1 rounded-full">
                <span className="text-[#9B83F4] text-sm font-medium">
                  {topic.date}
                </span>
              </div>

              <button className="text-[#9B83F4] hover:bg-gray-100 p-1.5 rounded-full transition-colors border border-[#E0D7FB]">
                <FilePdf size={20} weight="regular" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 relative h-3 w-full bg-[#EBEBFF] rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-[60%] bg-gradient-to-r from-[#9B83F4] to-[#7051E1] rounded-full" />
        <div className="absolute top-1/2 left-[60%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-[#7051E1] rounded-full shadow-md" />
      </div>
    </div>
  );
}
