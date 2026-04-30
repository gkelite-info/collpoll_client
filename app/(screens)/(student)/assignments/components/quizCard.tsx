// "use client";

// import {
//   Alarm,
//   ArrowLeft,
//   CalendarDotsIcon,
//   ClockCountdownIcon,
//   Question,
//   RepeatIcon,
//   UserCircle,
// } from "@phosphor-icons/react";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { useEffect, useState } from "react";

// export const STATIC_ONGOING_QUIZZES = [
//   {
//     id: 1,
//     courseName: "Operating Systems",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#481451]",
//   },
//   {
//     id: 2,
//     courseName: "Web Technologies",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#182142]",
//   },
//   {
//     id: 3,
//     courseName: "Data Structures",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#1B1A40]",
//   },
//   {
//     id: 4,
//     courseName: "Database Management Systems",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#1D17A]",
//   },
//   {
//     id: 5,
//     courseName: "Software Engineering",
//     topic: "Agile Methodologies & Scrum",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#2E1851]",
//   },
//   {
//     id: 6,
//     courseName: "Computer Networks",
//     topic: "OSI Model & TCP/IP Protocols",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#0A2647]",
//   },
//   {
//     id: 7,
//     courseName: "Artificial Intelligence",
//     topic: "Heuristic Search Algorithms",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#3A1015]",
//   },
//   {
//     id: 8,
//     courseName: "Machine Learning",
//     topic: "Supervised Learning Models",
//     facultyName: "Dr. Priya Sharma",
//     attemptsLeft: 3,
//     quizDuration: "07/01/2025",
//     timeLimit: "30 mins",
//     bgColor: "bg-[#1E3A8A]",
//   },
// ];

// export const STATIC_ATTEMPTED_QUIZZES = [
//   {
//     id: 1,
//     courseName: "Operating Systems",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptedOn: "08/01/2025",
//     questionsAttempted: "28/30",
//     attemptsUsed: "1 of 3",
//     score: "25/30",
//     bgColor: "bg-[#481451]",
//   },
//   {
//     id: 2,
//     courseName: "Web Technologies",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptedOn: "08/01/2025",
//     questionsAttempted: "28/30",
//     attemptsUsed: "1 of 3",
//     score: "25/30",
//     bgColor: "bg-[#182142]",
//   },
//   {
//     id: 3,
//     courseName: "Data Structures",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptedOn: "08/01/2025",
//     questionsAttempted: "28/30",
//     attemptsUsed: "1 of 3",
//     score: "25/30",
//     bgColor: "bg-[#1B1A40]",
//   },
//   {
//     id: 4,
//     courseName: "Database Management Systems",
//     topic: "Process Scheduling & Deadlocks",
//     facultyName: "Dr. Priya Sharma",
//     attemptedOn: "08/01/2025",
//     questionsAttempted: "28/30",
//     attemptsUsed: "1 of 3",
//     score: "25/30",
//     bgColor: "bg-[#1D17A]",
//   },
// ];

// export default function QuizCard({ data }: { data: any }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const handleStartQuiz = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("action", "attempt");
//     params.set("quizId", data.id.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };
//   return (
//     <div className="flex items-stretch justify-between p-3.5 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-4 border border-gray-100">
//       <div className="flex items-stretch gap-5 h-full w-full">
//         <div
//           className={`rounded-lg flex items-center justify-center ${data.bgColor} overflow-hidden relative flex-shrink-0`}
//         >
//           <img
//             src="/quiz.png"
//             alt="Course Cover"
//             className="object-cover w-full h-full opacity-80 "
//           />
//         </div>

//         <div className="flex flex-col justify-between h-full w-full">
//           <div className="flex items-center justify-between">
//             <div className="flex flex-col gap-1">
//               <h3 className="text-lg font-bold text-[#282828]">
//                 {data.courseName}
//               </h3>
//               <p className="text-[#282828] font-medium text-sm mb-4">
//                 {data.topic}
//               </p>
//             </div>
//             <div className="flex flex-col h-full justify-start items-end self-start">
//               <button
//                 onClick={handleStartQuiz}
//                 className="bg-[#43C17A] text-white px-5 py-2 rounded-md cursor-pointer text-sm font-semibold"
//               >
//                 Start Quiz
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
//             <div className="flex items-center gap-2 text-xs text-[#282828]">
//               <div className="bg-[#43C07A24] rounded-full p-1">
//                 <UserCircle
//                   size={16}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-semibold text-[#282828] text-sm">
//                 Faculty Name :
//               </span>{" "}
//               <span className="text-[#282828] text-sm">{data.facultyName}</span>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-[#282828]">
//               <div className="bg-[#43C07A24] rounded-full p-1">
//                 <RepeatIcon
//                   size={16}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-semibold text-sm text-[#282828]">
//                 Attempts Left :
//               </span>{" "}
//               <span className="text-[#282828]">{data.attemptsLeft}</span>
//             </div>
//             <div className="flex items-center gap-2 whitespace-nowrap">
//               <div className="bg-[#43C07A24] rounded-full p-1 shrink-0">
//                 <CalendarDotsIcon
//                   size={16}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>

//               {/* Label and Value */}
//               <div className="flex items-center gap-1.5">
//                 <span className="font-semibold text-sm text-[#282828]">
//                   Quiz Duration:
//                 </span>
//                 <span className="text-xs font-medium text-[#282828]">
//                   {data.quizDuration}
//                 </span>
//               </div>
//             </div>
//             {/* <div className="flex items-center gap-2 text-xs text-[#282828]">
//                             <div className="bg-[#43C07A24] rounded-full p-1">
//                                 <ClockCountdownIcon size={16} className="text-[#43C17A]" weight="regular" />
//                             </div>
//                             <span className="font-semibold text-sm text-[#282828]">Time Limit :</span> <span className="text-[#282828]">{data.timeLimit}</span>
//                         </div> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function AttemptedQuizCard({ data }: { data: any }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const handleOpenModal = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("modal", "performance");
//     params.set("quizId", data.id.toString());
//     params.set("submissionId", data.submissionId.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const attemptsUsedNumber = parseInt(data.attemptsUsed?.split(" of ")[0]) || 0;
//   const maxAttempts = parseInt(data.attemptsUsed?.split(" of ")[1]) || 3;
//   const allAttemptsUsed = attemptsUsedNumber >= maxAttempts;

//   return (
//     <div
//       onClick={handleOpenModal}
//       className="flex items-stretch cursor-pointer justify-between p-3.5 bg-[#E7E7E7] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-4 border border-gray-100"
//     >
//       <div className="flex items-stretch gap-5 h-full w-full">
//         <div
//           className={`rounded-lg flex items-center justify-center ${data.bgColor} overflow-hidden relative flex-shrink-0`}
//         >
//           <img
//             src="/quiz.png"
//             alt="Course Cover"
//             className="object-cover w-full h-full opacity-80"
//           />
//         </div>

//         <div className="flex flex-col justify-between h-full w-full">
//           <div className="flex items-center justify-between">
//             <div className="flex flex-col gap-1">
//               <h3 className="text-lg font-bold text-[#282828]">
//                 {data.courseName}
//               </h3>
//               <p className="text-[#282828] font-medium text-sm mb-4">
//                 {data.topic}
//               </p>
//             </div>
//             <div className="flex flex-col h-full justify-start items-end self-start">
//               <div className="bg-[#43C17A] text-[#EFEFEF] px-4 py-1.5 rounded-md text-base font-bold">
//                 {data.score}
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
//             <div className="flex items-center gap-2 text-xs text-[#282828]">
//               <div className="bg-[#43C07A24] rounded-full p-1">
//                 <UserCircle
//                   size={16}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-semibold text-[#282828] text-sm">
//                 Faculty Name :
//               </span>{" "}
//               <span className="text-[#282828]">{data.facultyName}</span>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-[#282828]">
//               <div className="bg-[#43C07A24] rounded-full p-1">
//                 <UserCircle
//                   size={16}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-semibold text-sm text-[#282828]">
//                 Attempted On :
//               </span>{" "}
//               <span className="text-[#282828]">{data.attemptedOn}</span>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-[#282828]">
//               <div className="bg-[#43C07A24] rounded-full p-1">
//                 <Question
//                   size={16}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-semibold text-sm text-[#282828]">
//                 Questions Attempted :
//               </span>{" "}
//               <span className="text-[#282828]">{data.questionsAttempted}</span>
//             </div>
//             <div className="flex items-center gap-2 text-xs text-[#282828]">
//               <div className="bg-[#43C07A24] rounded-full p-1">
//                 <RepeatIcon
//                   size={16}
//                   className="text-[#43C17A]"
//                   weight="regular"
//                 />
//               </div>
//               <span className="font-semibold text-sm text-[#282828]">
//                 Attempts Used :
//               </span>{" "}
//               <span className="text-[#282828]">{data.attemptsUsed}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export function QuizAttemptScreenOld({ quiz }: { quiz: any }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const MOCK_QUESTIONS = Array.from({ length: 10 }, (_, i) => ({
//     id: i + 1,
//     question: `Q${i + 1}. Which of the following is not a valid CPU scheduling algorithm?`,
//     options: [
//       "Round Robin",
//       "Shortest Job Next",
//       "FCFS (First Come First Serve)",
//       "Bubble Sort",
//     ],
//   }));

//   const [answers, setAnswers] = useState<Record<number, string>>({});

//   const initialMinutes = parseInt(quiz?.timeLimit.split(" ")[0]) || 30;
//   const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const formatTime = (seconds: number) => {
//     const m = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const s = (seconds % 60).toString().padStart(2, "0");
//     return `${m}:${s}`;
//   };

//   const handleOptionChange = (questionId: number, option: string) => {
//     setAnswers((prev) => ({ ...prev, [questionId]: option }));
//   };

//   const handleBack = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("action");
//     params.delete("quizId");
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handleSubmit = () => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.delete("action");
//     params.delete("quizId");
//     params.set("tab", "quiz");
//     params.set("quizView", "attempted");
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const progressCount = Object.keys(answers).length;
//   const progressPercentage = (progressCount / MOCK_QUESTIONS.length) * 100;

//   return (
//     <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative">
//       <div className="flex justify-between items-start mb-2">
//         <div className="flex flex-col gap-1">
//           <ArrowLeft
//             size={24}
//             className="text-[#282828] cursor-pointer hover:text-gray-600 mb-2"
//             weight="bold"
//             onClick={handleBack}
//           />
//           <h2 className="text-xl font-bold text-[#282828]">
//             {quiz?.courseName || "N/A"}
//           </h2>
//           <p className="text-sm font-medium text-[#282828]">
//             {quiz?.topic || "N/A"}
//           </p>
//         </div>

//         <div className="flex items-center gap-2 bg-[#182142] text-white px-4 py-2 rounded-md">
//           <Alarm size={20} weight="fill" className="text-[#87cefa]" />
//           <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
//         </div>
//       </div>

//       <div className="mb-6">
//         <div className="flex justify-end mb-2">
//           <span className="text-[#43C17A] font-bold text-base">
//             {progressCount.toString().padStart(2, "0")} of{" "}
//             {MOCK_QUESTIONS.length}
//           </span>
//         </div>
//         <div className="h-2.5 w-full bg-[#43C17A2B] rounded-full overflow-hidden">
//           <div
//             className="h-full bg-[#43C17A] transition-all duration-300 ease-in-out"
//             style={{ width: `${progressPercentage}%` }}
//           />
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto max-h-screen pb-5 space-y-4">
//         {MOCK_QUESTIONS.map((q) => (
//           <div
//             key={q.id}
//             className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
//           >
//             <h4 className="text-base font-semibold text-[#282828] mb-4">
//               {q.question}
//             </h4>
//             <div className="flex flex-col gap-3">
//               {q.options.map((opt, idx) => {
//                 const isSelected = answers[q.id] === opt;
//                 return (
//                   <label
//                     key={idx}
//                     className="flex items-center gap-3 cursor-pointer group"
//                   >
//                     <div
//                       className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "border-[#43C17A]" : "border-gray-400 group-hover:border-[#43C17A]"}`}
//                     >
//                       {isSelected && (
//                         <div className="w-2 h-2 rounded-full bg-[#43C17A]" />
//                       )}
//                     </div>
//                     <span
//                       className={`text-sm ${isSelected ? "text-[#282828]" : "text-gray-500"}`}
//                     >
//                       {opt}
//                     </span>
//                     <input
//                       type="radio"
//                       name={`question-${q.id}`}
//                       value={opt}
//                       checked={isSelected}
//                       onChange={() => handleOptionChange(q.id, opt)}
//                       className="hidden"
//                     />
//                   </label>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="pt-4 flex justify-end">
//         <button
//           onClick={handleSubmit}
//           className="bg-[#43C17A] cursor-pointer text-white px-6 py-2.5 rounded-md font-bold text-sm"
//         >
//           Submit Quiz
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

import {
  Alarm,
  ArrowLeft,
  CalendarDotsIcon,
  ClockCountdownIcon,
  Question,
  RepeatIcon,
  UserCircle,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const STATIC_ONGOING_QUIZZES = [
  {
    id: 1,
    courseName: "Operating Systems",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#481451]",
  },
  {
    id: 2,
    courseName: "Web Technologies",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#182142]",
  },
  {
    id: 3,
    courseName: "Data Structures",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#1B1A40]",
  },
  {
    id: 4,
    courseName: "Database Management Systems",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#1D17A]",
  },
  {
    id: 5,
    courseName: "Software Engineering",
    topic: "Agile Methodologies & Scrum",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#2E1851]",
  },
  {
    id: 6,
    courseName: "Computer Networks",
    topic: "OSI Model & TCP/IP Protocols",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#0A2647]",
  },
  {
    id: 7,
    courseName: "Artificial Intelligence",
    topic: "Heuristic Search Algorithms",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#3A1015]",
  },
  {
    id: 8,
    courseName: "Machine Learning",
    topic: "Supervised Learning Models",
    facultyName: "Dr. Priya Sharma",
    attemptsLeft: 3,
    quizDuration: "07/01/2025",
    timeLimit: "30 mins",
    bgColor: "bg-[#1E3A8A]",
  },
];

export const STATIC_ATTEMPTED_QUIZZES = [
  {
    id: 1,
    courseName: "Operating Systems",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptedOn: "08/01/2025",
    questionsAttempted: "28/30",
    attemptsUsed: "1 of 3",
    score: "25/30",
    bgColor: "bg-[#481451]",
  },
  {
    id: 2,
    courseName: "Web Technologies",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptedOn: "08/01/2025",
    questionsAttempted: "28/30",
    attemptsUsed: "1 of 3",
    score: "25/30",
    bgColor: "bg-[#182142]",
  },
  {
    id: 3,
    courseName: "Data Structures",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptedOn: "08/01/2025",
    questionsAttempted: "28/30",
    attemptsUsed: "1 of 3",
    score: "25/30",
    bgColor: "bg-[#1B1A40]",
  },
  {
    id: 4,
    courseName: "Database Management Systems",
    topic: "Process Scheduling & Deadlocks",
    facultyName: "Dr. Priya Sharma",
    attemptedOn: "08/01/2025",
    questionsAttempted: "28/30",
    attemptsUsed: "1 of 3",
    score: "25/30",
    bgColor: "bg-[#1D17A]",
  },
];

export default function QuizCard({ data }: { data: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Assignment.student"); // Hook

  const handleStartQuiz = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("action", "attempt");
    params.set("quizId", data.id.toString());
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <div className="flex items-stretch justify-between p-3.5 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-4 border border-gray-100">
      <div className="flex items-stretch gap-5 h-full w-full">
        <div
          className={`rounded-lg flex items-center justify-center ${data.bgColor} overflow-hidden relative flex-shrink-0`}
        >
          <img
            src="/quiz.png"
            alt="Course Cover"
            className="object-cover w-full h-full opacity-80 "
          />
        </div>

        <div className="flex flex-col justify-between h-full w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#282828]">
                {data.courseName}
              </h3>
              <p className="text-[#282828] font-medium text-sm mb-4">
                {data.topic}
              </p>
            </div>
            <div className="flex flex-col h-full justify-start items-end self-start">
              <button
                onClick={handleStartQuiz}
                className="bg-[#43C17A] text-white px-5 py-2 rounded-md cursor-pointer text-sm font-semibold"
              >
                {t("Start Quiz")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#282828]">
              <div className="bg-[#43C07A24] rounded-full p-1">
                <UserCircle
                  size={16}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-semibold text-[#282828] text-sm">
                {t("Faculty Name :")}
              </span>{" "}
              <span className="text-[#282828] text-sm">{data.facultyName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#282828]">
              <div className="bg-[#43C07A24] rounded-full p-1">
                <RepeatIcon
                  size={16}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-semibold text-sm text-[#282828]">
                {t("Attempts Left :")}
              </span>{" "}
              <span className="text-[#282828]">{data.attemptsLeft}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="bg-[#43C07A24] rounded-full p-1 shrink-0">
                <CalendarDotsIcon
                  size={16}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-[#282828]">
                  {t("Quiz Duration:")}
                </span>
                <span className="text-xs font-medium text-[#282828]">
                  {data.quizDuration}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttemptedQuizCard({ data }: { data: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("Assignment.student"); // Hook

  const handleOpenModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("modal", "performance");
    params.set("quizId", data.id.toString());
    params.set("submissionId", data.submissionId.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const attemptsUsedNumber = parseInt(data.attemptsUsed?.split(" of ")[0]) || 0;
  const maxAttempts = parseInt(data.attemptsUsed?.split(" of ")[1]) || 3;

  return (
    <div
      onClick={handleOpenModal}
      className="flex items-stretch cursor-pointer justify-between p-3.5 bg-[#E7E7E7] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-4 border border-gray-100"
    >
      <div className="flex items-stretch gap-5 h-full w-full">
        <div
          className={`rounded-lg flex items-center justify-center ${data.bgColor} overflow-hidden relative flex-shrink-0`}
        >
          <img
            src="/quiz.png"
            alt="Course Cover"
            className="object-cover w-full h-full opacity-80"
          />
        </div>

        <div className="flex flex-col justify-between h-full w-full">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-[#282828]">
                {data.courseName}
              </h3>
              <p className="text-[#282828] font-medium text-sm mb-4">
                {data.topic}
              </p>
            </div>
            <div className="flex flex-col h-full justify-start items-end self-start">
              <div className="bg-[#43C17A] text-[#EFEFEF] px-4 py-1.5 rounded-md text-base font-bold">
                {data.score}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
            <div className="flex items-center gap-2 text-xs text-[#282828]">
              <div className="bg-[#43C07A24] rounded-full p-1">
                <UserCircle
                  size={16}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-semibold text-[#282828] text-sm">
                {t("Faculty Name :")}
              </span>{" "}
              <span className="text-[#282828]">{data.facultyName}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#282828]">
              <div className="bg-[#43C07A24] rounded-full p-1">
                <UserCircle
                  size={16}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-semibold text-sm text-[#282828]">
                {t("Attempted On :")}
              </span>{" "}
              <span className="text-[#282828]">{data.attemptedOn}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#282828]">
              <div className="bg-[#43C07A24] rounded-full p-1">
                <Question
                  size={16}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-semibold text-sm text-[#282828]">
                {t("Questions Attempted :")}
              </span>{" "}
              <span className="text-[#282828]">{data.questionsAttempted}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#282828]">
              <div className="bg-[#43C07A24] rounded-full p-1">
                <RepeatIcon
                  size={16}
                  className="text-[#43C17A]"
                  weight="regular"
                />
              </div>
              <span className="font-semibold text-sm text-[#282828]">
                {t("Attempts Used :")}
              </span>{" "}
              <span className="text-[#282828]">{data.attemptsUsed}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuizAttemptScreenOld({ quiz }: { quiz: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const MOCK_QUESTIONS = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    question: `Q${i + 1}. Which of the following is not a valid CPU scheduling algorithm?`,
    options: [
      "Round Robin",
      "Shortest Job Next",
      "FCFS (First Come First Serve)",
      "Bubble Sort",
    ],
  }));

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const initialMinutes = parseInt(quiz?.timeLimit.split(" ")[0]) || 30;
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleOptionChange = (questionId: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    params.delete("quizId");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSubmit = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("action");
    params.delete("quizId");
    params.set("tab", "quiz");
    params.set("quizView", "attempted");
    router.push(`${pathname}?${params.toString()}`);
  };

  const progressCount = Object.keys(answers).length;
  const progressPercentage = (progressCount / MOCK_QUESTIONS.length) * 100;

  return (
    <div className="flex flex-col h-full bg-[#f4f4f4] rounded-lg -m-2 p-4 relative">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col gap-1">
          <ArrowLeft
            size={24}
            className="text-[#282828] cursor-pointer hover:text-gray-600 mb-2"
            weight="bold"
            onClick={handleBack}
          />
          <h2 className="text-xl font-bold text-[#282828]">
            {quiz?.courseName || "N/A"}
          </h2>
          <p className="text-sm font-medium text-[#282828]">
            {quiz?.topic || "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#182142] text-white px-4 py-2 rounded-md">
          <Alarm size={20} weight="fill" className="text-[#87cefa]" />
          <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-end mb-2">
          <span className="text-[#43C17A] font-bold text-base">
            {progressCount.toString().padStart(2, "0")} of{" "}
            {MOCK_QUESTIONS.length}
          </span>
        </div>
        <div className="h-2.5 w-full bg-[#43C17A2B] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#43C17A] transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-screen pb-5 space-y-4">
        {MOCK_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
          >
            <h4 className="text-base font-semibold text-[#282828] mb-4">
              {q.question}
            </h4>
            <div className="flex flex-col gap-3">
              {q.options.map((opt, idx) => {
                const isSelected = answers[q.id] === opt;
                return (
                  <label
                    key={idx}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "border-[#43C17A]" : "border-gray-400 group-hover:border-[#43C17A]"}`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-[#43C17A]" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${isSelected ? "text-[#282828]" : "text-gray-500"}`}
                    >
                      {opt}
                    </span>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleOptionChange(q.id, opt)}
                      className="hidden"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-[#43C17A] cursor-pointer text-white px-6 py-2.5 rounded-md font-bold text-sm"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
