"use client";

import { PencilSimpleIcon } from "@phosphor-icons/react";
import Image from "next/image";

interface ClubsListProps {
    onEdit: (id: string) => void;
}

const MOCK_CLUBS = [
    { id: "1", name: "All Stars Sports Club", active: 25, inactive: 25, logo: "/clubimage1.png" },
    { id: "2", name: "HR Club", active: 25, inactive: 25, logo: "/clubimage2.png" },
    { id: "3", name: "Culture Club", active: 25, inactive: 25, logo: "/clubimage3.png" },
    { id: "4", name: "Financial Club", active: 25, inactive: 25, logo: "/clubimage4.png" },
    { id: "5", name: "Community Club", active: 25, inactive: 25, logo: "/clubimage5.png" },
    { id: "6", name: "Nature's Club", active: 25, inactive: 25, logo: "/clubimage6.png" },
];

export default function ClubsList({ onEdit }: ClubsListProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24 pt-20 min-h-[80vh] content-start">
            {MOCK_CLUBS.map((club) => (
                <div key={club.id} className="bg-[#FB800024] rounded-xl flex flex-col items-center px-5 pb-5 pt-[65px] relative h-full">

                    <div className="absolute -top-[55px] w-[150px] h-[150px] rounded-full bg-white border-4 border-white flex items-center justify-center shadow-sm overflow-hidden">
                        <Image src={club.logo} alt={club.name} height={150} width={150} className="w-full h-full object-cover" />
                    </div>

                    <h3 className="text-[#282828] font-bold text-lg mb-4 text-center mt-10">{club.name}</h3>

                    <div className="flex flex-col md:flex-row gap-3 w-full mb-5 mt-auto">
                        <div className="flex-1 bg-[#43C17A2E] text-[#43C17A] text-sm py-2 rounded-md text-center font-bold">
                            Active : {club.active}
                        </div>
                        <div className="flex-1 bg-[#FF2A2A2E] text-[#FF2A2A] text-sm py-2 rounded-md text-center font-bold">
                            Inactive : {club.inactive}
                        </div>
                    </div>

                    <button
                        onClick={() => onEdit(club.id)}
                        className="w-full bg-[#16284F] cursor-pointer text-white py-2.5 rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-[#121e36] transition-colors shadow-sm"
                    >
                        <PencilSimpleIcon size={20} weight="fill"/>
                        Edit
                    </button>
                </div>
            ))}
        </div>
    );
}