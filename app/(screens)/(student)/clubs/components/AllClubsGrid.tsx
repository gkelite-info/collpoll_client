"use client";
import Image from "next/image";

const MOCK_CLUBS = [
    { id: "1", name: "All Stars Sports Club", active: 25, inactive: 25, logo: "/clubimage1.png" },
    { id: "2", name: "HR Club", active: 25, inactive: 25, logo: "/clubimage2.png" },
    { id: "3", name: "Culture Club", active: 25, inactive: 25, logo: "/clubimage3.png" },
    { id: "4", name: "Financial Club", active: 25, inactive: 25, logo: "/clubimage4.png" },
    { id: "5", name: "Community Club", active: 25, inactive: 25, logo: "/clubimage5.png" },
    { id: "6", name: "Nature's Club", active: 25, inactive: 25, logo: "/clubimage6.png" },
];

export default function AllClubsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-24 pt-16 content-start animate-in fade-in duration-500">
            {MOCK_CLUBS.map((club) => (
                <div key={club.id} className="bg-[#FB8000]/10 rounded-2xl flex flex-col items-center px-5 pb-5 pt-[70px] relative">
                    <div className="absolute -top-[60px] w-[140px] h-[140px] rounded-full bg-white border-4 border-white flex items-center justify-center shadow-md overflow-hidden">
                        <Image src={club.logo} alt={club.name} height={140} width={140} className="w-full h-full object-cover" />
                    </div>

                    <h3 className="text-[#282828] font-bold text-lg mb-4 text-center mt-8">{club.name}</h3>

                    <div className="flex gap-3 w-full mb-6">
                        <div className="flex-1 bg-[#43C17A]/20 text-[#43C17A] text-[12px] py-2 rounded-md text-center font-bold">
                            Active : {club.active}
                        </div>
                        <div className="flex-1 bg-[#FF2A2A]/20 text-[#FF2A2A] text-[12px] py-2 rounded-md text-center font-bold">
                            Inactive : {club.inactive}
                        </div>
                    </div>

                    <button className="w-full bg-[#16284F] cursor-pointer text-white py-3 rounded-xl text-base font-bold hover:bg-[#0f1b35] transition-all active:scale-95 shadow-lg">
                        Join Club
                    </button>
                </div>
            ))}
        </div>
    );
}