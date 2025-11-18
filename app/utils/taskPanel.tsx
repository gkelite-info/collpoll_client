'use client'

import { CheckCircle } from "@phosphor-icons/react"

type Task = {
    title: string;
    description: string;
    time: string;
}

type TaskPanelProps = {
    tasks: Task[];
}

export default function TaskPanel({ tasks }: TaskPanelProps) {

    return (
        <>
            <div className="bg-white mt-5 rounded-md shadow-md flex flex-col p-4 h-[345px]">
                <div className="bg-green-00 flex justify-between items-center">
                    <div className="rounded-full p-1 pl-0 flex items-center justify-center gap-4">
                        <div className="bg-[#E7F7EE] rounded-full p-1">
                            <CheckCircle size={22} weight="fill" color="#43C17A" />
                        </div>
                        <p style={{ fontSize: 14, color: "#43C17A" }}>My Tasks / <span style={{ color: "black" }}>Faculty Tasks</span></p>
                    </div>
                    <div className="rounded-full h-[80%] w-[25%] flex items-center justify-center gap-2 bg-[#43C17A] cursor-pointer">
                        <p style={{ fontSize: 12, color: "#FFFFFF", }}>+</p>
                        <p style={{ fontSize: 12, color: "#FFFFFF" }}>Add task</p>
                    </div>
                </div>
                {tasks.map((tas, index) => (
                    <div className="bg-[#E8F8EF] rounded-md mt-3 p-2 flex h-[81px] flex justify-between" key={index}>
                        <div className="w-[80%] bg-indigo-00 gap-1">
                            <h5 style={{ color: "#16284F", fontSize: 14, fontWeight: "600" }}>{tas.title}</h5>
                            <p style={{ fontSize: 12, color: "#454545" }}>{tas.description}</p>
                        </div>
                        <div className="w-[20%] bg-yellow-00 flex flex-col items-center justify-between py-2">
                            <p style={{ fontSize: 12, color: "#454545" }}>{tas.time}</p>
                            <CheckCircle size={22} color="#282828" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}