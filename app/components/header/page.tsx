'use client'
import { BellSimple, EnvelopeSimple, MagnifyingGlass, Megaphone, Newspaper } from "@phosphor-icons/react";

export default function Header() {
    return (
        <>
            <div className="h-[100%] w-[100%] flex justify-between gap-1 bg-[#AEAEAE] p-2">
                <div className="w-[59%] flex justify-end items-center">
                    <div className="relative lg:w-[80%] lg:h-[60%]">
                        <input
                            type="text"
                            placeholder="What do you want to find?"
                            className="rounded-full w-full h-full bg-[#EAEAEA] text-[#282828] lg:text-sm pl-5 pr-10 focus:outline-none"
                        />
                        <MagnifyingGlass
                            size={20}
                            weight="bold"
                            color="#43C17A"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="w-[40%] flex justify-between">
                    <div className="w-[40%] h-[100%] flex items-center justify-center gap-3">
                        <Newspaper size={21} color="#282828" className="cursor-pointer" />
                        <EnvelopeSimple size={21} color="#282828" className="cursor-pointer" />
                        <BellSimple size={21} color="#282828" className="cursor-pointer" />
                        <Megaphone size={20} color="#282828" className="cursor-pointer" />
                    </div>
                    <div className="bg-indigo-500 w-[60%] h-[100%]">Right</div>
                </div>
            </div>
        </>
    );
}
