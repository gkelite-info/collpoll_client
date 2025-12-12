"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import {
    TextT,
    ShieldCheck,
    Key,
    Envelope,
    BellSimple,
    Globe,
    UserCircle,
    LockKey,
    CaretRight
} from "@phosphor-icons/react";

export default function StudentSettings() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between">
                <div className="text-xl font-semibold flex flex-col">
                    <div className="flex justify-start items-center gap-2">
                        {/* <Gear size={20} /> */}
                        ⚙️
                        Settings
                    </div>
                    <p className="text-gray-500 text-sm">Manage your account and preferences</p>
                </div>
                <div className="w-[32%]">
                    <CourseScheduleCard />
                </div>
            </div>

            <div className="bg-white shadow-md rounded-xl p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <Key size={22} weight="fill" className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Change Password</p>
                            <p className="text-sm text-gray-500">Update your account password</p>
                        </div>
                    </div>
                    <span className="text-gray-400"><CaretRight className="text-[#282828]"/></span>
                </div>

                <hr className="text-[#CECECE]"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <Envelope weight="fill" size={22} className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Email Alerts</p>
                            <p className="text-sm text-gray-500">
                                Receive important updates via email
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked
                            aria-label="Toggle email alerts"
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#16284F] rounded-full transition"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                    </label>
                </div>

                <hr className="text-[#CECECE]"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <BellSimple weight="fill" size={22} className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Assignment / Event / Class Reminders</p>
                            <p className="text-sm text-gray-500">Manage notification preferences</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked
                            aria-label="Toggle reminders"
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#16284F] rounded-full transition"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                    </label>
                </div>

                <hr className="text-[#CECECE]"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <TextT weight="bold" size={22} className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Font Size</p>
                            <p className="text-sm text-gray-500">Adjust text size for optimum readability</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-40">
                        <span className="text-2xl text-[#282828] font-medium">A</span>
                        <input
                            type="range"
                            aria-label="Adjust font size"
                            className="w-full h-1"
                        />
                        <span className="text-sm text-[#282828]">A</span>
                    </div>
                </div>

                <hr className="text-[#CECECE]"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <Globe weight="fill" size={22} className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Language Preferences</p>
                            <p className="text-sm text-gray-500">Choose your preferred language</p>
                        </div>
                    </div>
                    <span className="text-gray-400"><CaretRight className="text-[#282828]"/></span>
                </div>

                <hr className="text-[#CECECE]"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <UserCircle weight="fill" size={22} className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Manage Linked Accounts</p>
                            <p className="text-sm text-gray-500">
                                Connect or disconnect third-party accounts
                            </p>
                        </div>
                    </div>
                    <span className="text-gray-400"><CaretRight className="text-[#282828]"/></span>
                </div>

                <hr className="text-[#CECECE]"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <LockKey weight="fill" size={22} className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Two-Step Verification</p>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                    </div>
                    <span className="text-gray-400"><CaretRight className="text-[#282828]"/></span>
                </div>

                <hr className="text-[#CECECE]"/>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3 items-start">
                        <div className="p-2 rounded-full bg-[#43C17A26]">
                            <ShieldCheck weight="fill" size={22} className="text-[#43C17A]" />
                        </div>
                        <div>
                            <p className="font-medium">Privacy Policy</p>
                            <p className="text-sm text-gray-500">View our privacy policy</p>
                        </div>
                    </div>
                    <span className="text-gray-400"><CaretRight className="text-[#282828]"/></span>
                </div>
            </div>
        </div>
    );
}
