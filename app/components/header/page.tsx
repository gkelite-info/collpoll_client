"use client";
import {
  BellSimple,
  CaretDown,
  EnvelopeSimple,
  MagnifyingGlass,
  Megaphone,
  Newspaper,
} from "@phosphor-icons/react";
import { useState } from "react";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    setSearchValue(value);
  };

  return (
    <>
      <div className="h-[100%] w-[100%] flex justify-between gap-1 p-2">
        <div className="w-[59%] flex justify-end items-center">
          <div className="relative lg:w-[80%] lg:h-[60%]">
            <input
              type="text"
              value={searchValue}
              onChange={handleChange}
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
            <EnvelopeSimple
              size={21}
              color="#282828"
              className="cursor-pointer"
            />
            <BellSimple size={21} color="#282828" className="cursor-pointer" />
            <Megaphone size={20} color="#282828" className="cursor-pointer" />
          </div>

          <div className="w-[60%] h-[100%] flex">
            <div className="w-[25%] h-[100%] bg-green-00 flex items-center justify-center">
              <div className="bg-black w-13 h-13 rounded-full flex items-center justify-center text-white">
                V
              </div>
            </div>
            <div className="bg-pink-00 w-[75%] flex flex-col items-start justify-center gap-2 px-2 text-[#282828] font-semibold">
              <div className="flex items-center justify-between w-[100%] bg-gray-00">
                <p className="text-sm text-[#282828]">Firstname</p>
                <CaretDown
                  size={20}
                  weight="bold"
                  color="#282828"
                  className="cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between w-[100%]">
                <p style={{ fontSize: 12 }}>B.Tech CSE</p>
                <p style={{ fontSize: 12, color: "#43C17A" }}>
                  ID -{" "}
                  <span style={{ fontSize: 12, color: "#454545" }}>
                    2112121
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
