"use client";
import { FaPlus } from "react-icons/fa6";
import CalendarTimeTable from "./timetable";
import { CheckCircle } from "@phosphor-icons/react";
import { useState } from "react";
import TaskModal from "@/app/components/modals/taskModal";

export default function CalendarRight() {

    const [openModal, setOpenModal] = useState(false);
    const [card, setCard] = useState([
        {
            title: "AI Lab",
            description: "description",
            dueDate: "2025-11-14",
            dueTime: "17:00"
        }
    ]);

    const addTask = (task: any) => {
        setCard((prev) => [...prev, task]);
    };

    return (
        <>
            <TaskModal open={openModal} onClose={() => setOpenModal(false)} onSave={addTask} />

            <div className="bg-pink-00 h-full flex flex-col justify-between">
                <CalendarTimeTable />

                <div className="bg-white h-[158px] w-[647px] rounded-lg p-3 shadow-md">
                    <div className="bg-red-00 w-full flex justify-between">
                        <h4 className="text-[#282828] font-medium">Assignments / Tasks</h4>

                        <div
                            className="rounded-full bg-[#DBF3E6] flex items-center justify-center h-[27px] w-[27px] cursor-pointer"
                            onClick={() => setOpenModal(true)}
                        >
                            <p className="text-[#69CE95] text-sm">
                                <FaPlus className="cursor-pointer" />
                            </p>
                        </div>
                    </div>

                    <div className="bg-green-00 mt-3 flex flex-wrap justify-between items-center overflow-auto gap-2 h-[90px]">
                        {card.map((sub, index) => (
                            <div
                                className="bg-[#E8F8EF] h-[72px] w-[301px] rounded-md p-2 flex justify-between items-center"
                                key={index}
                            >
                                <div className="flex flex-col bg-red-00 w-[85%] gap-1">
                                    <p className="text-[#16284F] text-sm font-medium">{sub.title}</p>
                                    <p className="text-[#454545] text-xs font-regular">{sub.description}</p>

                                    <p className="text-[#454545] text-xs font-regular">
                                        Due on : {sub.dueDate}, {sub.dueTime}
                                    </p>
                                </div>

                                <div className="bg-blue-00 w-[15%] rounded-full flex justify-end">
                                    <CheckCircle size={27} color="#282828" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
