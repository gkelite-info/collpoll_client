"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { resetPassword } from "@/lib/helpers/resetPassword";

export default function ForgotPassword() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    // Email regex (same pattern style as your signup page)
    const emailRegex = /^[a-z0-9._]+@[a-z0-9]+\.[a-z]+$/;

    type Slide = {
        heading: string;
        para: string;
        image: string;
    };

    const slides: Slide[] = [
        {
            heading: "Welcome to GK Elite",
            para: "Your trusted partner in digital solutions.",
            image: "/Group 2774.png",
        },
        {
            heading: "Secure & Modern",
            para: "Cutting-edge tools for your workflow.",
            image: "/Group 2774 (1).png",
        },
        {
            heading: "Grow Faster",
            para: "Boost your productivity with us.",
            image: "/Group 2774 (2).png",
        },
        {
            heading: "Future Ready",
            para: "Designed for performance and reliability.",
            image: "/Group 2774 (3).png",
        },
    ];

    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);


    const sanitizeEmail = (value: string) =>
        value.toLowerCase().replace(/[^a-z0-9@._-]/g, "");

    const handleSubmit = async () => {
        if (!email) return toast.error("Email is required!");
        if (!emailRegex.test(email))
            return toast.error("Enter a valid lowercase email!");

        setLoading(true);

        try {
            const res = await resetPassword(email);

            if (!res.success) {
                toast.error(res.error);
                return;
            }

            toast.success("Reset password link sent to your email!");
            setLoading(true);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const radius = 240;

    return (
        <div className="w-full h-full flex">
            <div className="w-[45%] h-screen sticky top-0 bg-linear-to-b from-[#6AE18B] to-[#B7F3CB] flex flex-col justify-between items-center p-8 overflow-hidden">
                <div>
                    <h2
                        className={`text-xl font-semibold text-[#1B4D3E] text-center mb-1 transition-opacity duration-700`}
                    >
                        {slides[current].heading}
                    </h2>

                    <p className="text-[#1F3D2F] text-center text-sm mb-6 w-full transition-opacity ">
                        {slides[current].para}
                    </p>
                </div>

                {slides.map((slide, idx) => {
                    let position = "hidden";

                    if (idx === current) position = "center";
                    else if (idx === (current - 1 + slides.length) % slides.length)
                        position = "left";
                    else if (idx === (current + 1) % slides.length) position = "right";

                    const positionStyles: any = {
                        center: "rotate-0 opacity-100 z-0",
                        left: "-rotate-[40deg] opacity-0 z-10",
                        right: "rotate-[40deg] opacity-0 z-10",
                        hidden: "opacity-0 pointer-events-none",
                    };

                    return (
                        <div
                            key={idx}
                            className={`
    absolute bottom-0 left-1/2
    w-[65%] h-[45%]
    flex items-center justify-center
    transition-all duration-700 ease-in-out
    origin-bottom
    pointer-events-none    
    ${positionStyles[position]}
      `}
                            style={{
                                transform: `
          translateX(-50%)
          rotate(${position === "left" ? -40 : position === "right" ? 40 : 0
                                    }deg)
          translateY(-${radius}px)
        `,
                            }}

                        >
                            <div
                                className={`
    absolute w-[250px] h-[250px] rounded-full bg-[#43C17A] opacity-80
    top-1/2 left-1/2 
    -translate-x-1/2 -translate-y-1/2 mt-1.5
    z-[-1] border
    transition-all duration-700 ease-in-out
  `}
                                style={{
                                    transform: `
      translate(0%, 25%)
      rotate(${position === "left" ? -40 : position === "right" ? 40 : 0}deg)
    `,
                                }}
                            ></div>


                            {/* <div className="absolute bottom-[-40%] w-[346px] h-[346px] bg-[#43C17A] rounded-full opacity-35"></div> */}

                            {/* <div className="absolute top-[15%] w-[75%] h-[95px]  rounded-3xl"></div> */}

                            <div className="relative w-full h-full p-4 mt-35 bg-transparent rounded-xl overflow-hidden">
                                <img
                                    src={slide.image}
                                    className=" inset-0 w-full h-full object-cover pointer-events-none"
                                />
                            </div>
                        </div>
                    );
                })}

                <div className="flex gap-4 mt-8 relative z-20">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${current === i
                                ? "w-24 bg-[#1A5D3C]"
                                : "w-20 bg-white/60 border border-white/40"
                                }`}
                        ></div>
                    ))}
                </div>
            </div>


            <div className="w-[55%] h-screen bg-[#EEEEEE] flex items-center justify-center">
                <div className="w-[600px] bg-white rounded-lg shadow px-6 py-8">

                    <h1 className="text-[18px] font-semibold text-[#16284F] text-center">
                        Forgot Your Password?
                    </h1>

                    <p className="text-[13px] text-[#6B7280] text-center mt-2 mb-6">
                        Don’t worry! Enter your registered email address to reset your password.
                    </p>

                    <div className="mb-6">
                        <label
                            htmlFor="email"
                            className="block text-[13px] text-[#414141] mb-1"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                            placeholder="Enter your registered email"
                            className="
      w-full h-[42px]
      border border-[#DCDCDC]
      rounded px-4
      text-[14px] text-[#000]
      placeholder:text-[#9CA3AF]
    "
                        />
                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`
    w-[200px] h-[50px]
    bg-[#16284F]
    text-white text-[15px]
    font-medium
    rounded
    cursor-pointer
    ${loading ? "opacity-60 cursor-not-allowed" : ""}
  `}
                        >
                            {loading ? "Please wait..." : "Proceed"}
                        </button>

                    </div>
                    <div className="flex justify-center">
                        <button
                            onClick={() => router.push("/login")}
                            className="text-[13px] text-[#0A8E2E] text-center mt-5 cursor-pointer underline"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
