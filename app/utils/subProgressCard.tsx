import TinyDonut from "./pieChart";

const subjects = [
    {
        title: "Data Structures and Algorithms",
        professor: "Prof. Ramesh Kumar",
        image: "dsa.jpg",
        percentage: 85,
        radialStart: "#10FD77",
        radialEnd: "#1C6B3F",
        remainingColor: "#A1FFCA",
    },
    {
        title: "Object-Oriented Programming",
        professor: "Prof. Anita Sharma",
        image: "oops.jpg",
        percentage: 85,
        radialStart: "#EFEDFF",
        radialEnd: "#705CFF",
        remainingColor: "#E8E4FF",
    },
    {
        title: "Computer Organization and Architecture",
        professor: "Prof. Suresh Reddy",
        image: "coa.jpg",
        percentage: 85,
        radialStart: "#FFFFFF",
        radialEnd: "#FFBE48",
        remainingColor: "#F7EBD5",
    },
    {
        title: "Discrete Mathematics",
        professor: "Prof. Rajesh Gupta",
        image: "dm.jpg",
        percentage: 85,
        radialStart: "#FEFFFF",
        radialEnd: "#008993",
        remainingColor: "#C4FBFF",
    },
];

export default function SubjectProgressCards() {
    return (
        <div className="flex flex-col gap-2 overflow-y-auto">
            {subjects.map((subject, index) => (
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
                                style={{ fontSize: 10, fontWeight: "600", color: "#16284F" }}
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
    );
}
