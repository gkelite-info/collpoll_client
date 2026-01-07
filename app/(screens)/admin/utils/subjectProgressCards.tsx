"use client";
import TinyDonut from "@/app/utils/pieChart";
import { FaChevronRight } from "react-icons/fa6";

type SubjectProgressCard = {
  title: string;
  professor: string;
  image: string;
  percentage: number;
  radialStart: string;
  radialEnd: string;
  remainingColor: string;
};

type SubjectProgressCardProps = {
  props: SubjectProgressCard[];
};

export default function SubjectProgressCards({
  props,
}: SubjectProgressCardProps) {
  return (
    <>
      <div className="bg-white h-64 rounded-lg w-[49%] p-4 shadow-md flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <h6 className="text-[#282828] font-semibold">Subjects Progress</h6>
          <FaChevronRight className="cursor-pointer text-black" />
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">
          {props.map((subject, index) => (
            <div
              key={index}
              className="h-20 flex items-center rounded-lg p-2 gap-1 bg-[#E8F8EF]"
            >
              <div className="h-full w-[22%] rounded-md flex items-center justify-center">
                <img src={subject.image} className="rounded-md" />
              </div>
              <div className="h-full w-[78%] rounded-md p-2 flex justify-between">
                <div className="flex flex-col gap-2 w-auto">
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: "#16284F",
                    }}
                  >
                    {subject.title}
                  </p>
                  <p style={{ fontSize: 10, color: "#454545" }}>
                    {subject.professor}
                  </p>
                </div>
                <div className="w-auto">
                  <TinyDonut
                    percentage={subject.percentage}
                    width={50}
                    height={50}
                    radialStart={subject.radialStart}
                    radialEnd={subject.radialEnd}
                    remainingColor={subject.remainingColor}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
