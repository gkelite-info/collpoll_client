"use client";
import {
  BellSimple,
  CaretDown,
  EnvelopeSimple,
  MagnifyingGlass,
  Megaphone,
  Newspaper,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NotificationsModal from "../modals/NotificationsModal";
import NewsModal from "../modals/NewsModal";
import EmailModal from "../modals/EmailModal";
import AnnouncementModal from "../modals/AnnouncementModal";
import DailyNewsModal from "../modals/DailyNewsModal";



export default function Header() {
    const router = useRouter();
    const [openProfile, setOpenProfile] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isNewsOpen, setIsNewsOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
    const [dailyMode, setDailyMode] = useState<"article" | "pdf">("article");

    function openPDFModal() {
      setIsNewsOpen(false);          // close small modal
      setDailyMode("pdf");           // set PDF mode
      setTimeout(() => {
        setIsDailyModalOpen(true);   // open big modal
      }, 150);                       // wait for exit animation
    }



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1);
      }
      setSearchValue(value);
    };

    useEffect(() => {
      const handler = () => setOpenProfile(true);
      document.addEventListener("open-profile", handler);
      return () => document.removeEventListener("open-profile", handler);
    }, []);


    return (
      <>
    <div className="h-full w-full flex justify-between gap-1 p-2">
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
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="w-[40%] flex justify-between">
          {/* Icons */}
          <div className="w-[40%] h-[100%] flex items-center justify-center gap-3">
            <button
              onClick={() => setIsNewsOpen(true)}
              className="relative"
            >
              <Newspaper size={21} color="#282828" className="cursor-pointer" />
            </button>

            <button
              onClick={() => setIsEmailOpen(true)}
              className="relative"
            >
              <EnvelopeSimple size={21} color="#282828" className="cursor-pointer" />
            </button>


            {/* 🔔 Bell with modal trigger */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative"
            >
              <BellSimple size={21} color="#282828" className="cursor-pointer" />
              {/* unread dot */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button
              onClick={() => setIsAnnouncementOpen(true)}
              className="relative"
            >
              <Megaphone size={20} color="#282828" className="cursor-pointer" />
            </button>

          </div>

    <div className="w-[60%] h-full flex bg-[#43C17A] cursor-pointer rounded-l-full"
      //  onClick={()=>router.push('/profile')}
      onClick={() => setOpenProfile(true)}
    >
      <div className="w-[25%] h-full bg-green-00 flex items-center justify-center">
        <div className="bg-black w-13 h-13 border-2 rounded-full flex items-center justify-center text-white">
          V
        </div>
      </div>
      <div className="bg-pink-00 w-[75%] flex flex-col items-start justify-center gap-2 px-2 text-[#282828] font-semibold">
        <div className="flex items-center justify-between w-full bg-gray-00">
          <p className="text-sm text-[#ffffff]">Firstname</p>
                <CaretDown
                  size={20}
                  weight="bold"
                  color="#ffffff"
                  className="cursor-pointer"
                />
              </div>
    <div className="flex items-center justify-between text-[#E5E5E5] w-full text-xs">
      <p style={{ fontSize: 12, color: "#E5E5E5" }}>B.Tech CSE</p>
      <p style={{ fontSize: 12, color: "#E5E5E5" }}>
        ID -{" "}
        <span style={{ fontSize: 12, color: "#E5E5E5" }}>
          2112121
        </span>
          </p>
        </div>
    </div>
          </div >
        </div >
      </div >

      {/* 🔔 Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      {/* ⭐ UPDATED NEWS MODAL WITH onOpenPDF */}
      <NewsModal
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
        onOpenPDF={openPDFModal}     // ⭐ HERE!
      />

      <EmailModal
        isOpen={isEmailOpen}
        onClose={() => setIsEmailOpen(false)}
        mail={{
          initials: "",
          color: "",
          sender: "",
          email: "",
          subject: "",
          desc: "",
          time: "",
          date: "",
          body: "",
          Subject: "",
        }}
      />


      <AnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
      />

      {/* ⭐ DAILY NEWS / PDF MODAL */}
      <DailyNewsModal
        isOpen={isDailyModalOpen}
        mode={dailyMode}
        onClose={() => setIsDailyModalOpen(false)}
      />
    </>
  );
  }
