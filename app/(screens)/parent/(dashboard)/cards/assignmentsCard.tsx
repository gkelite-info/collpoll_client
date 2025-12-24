'use client'
import { Clipboard } from "@phosphor-icons/react";

type AssignmentProps = {
    completed: number;
    total: number;
    nextDate: string;
};

type AssignMentCardProps = {
    props: AssignmentProps[];
};

export default function AssignMentCard({ props }: AssignMentCardProps) {
    const assignment = props[0];

    if (!assignment) return null;

    const percentage = Math.min(
        Math.round((assignment.completed / assignment.total) * 100),
        100
    );

    return (
        <div className="bg-white h-[200px] w-[32%] rounded-lg p-2 flex flex-col gap-2 shadow-md">
            <div className="w-[75%] h-[20%] flex items-center justify-between">
                <div className="bg-[#E1F4E8] rounded-lg p-1">
                    <Clipboard size={22} weight="fill" color="#6ECC90" />
                </div>
                <h4 className="text-lg font-medium text-[#282828]">
                    Assignments
                </h4>
            </div>

            <div className="w-full h-[70%]">
                <div className="h-[80%] flex items-center justify-center">
                    <div className="bg-[#E6E3FF] rounded-full h-14 w-14 flex items-center justify-center">
                        <p className="text-[#604DDC] font-semibold text-sm">
                            {assignment.completed}/{assignment.total}
                        </p>
                    </div>
                </div>
                <div className="h-[30%] flex flex-col justify-start gap-1">
                    <h5 className="text-[#16284F] text-xs font-medium">
                        Next Date:
                        <span className="text-[#604DDC] ml-1">
                            {assignment.nextDate}
                        </span>
                    </h5>
                    <div className="bg-[#DDDDDD] rounded-full w-full h-4 overflow-hidden">
                        <div
                            className="bg-[#A2D884] h-full rounded-full transition-all duration-600"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
