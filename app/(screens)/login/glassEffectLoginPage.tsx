"use client";

import { useState, useEffect } from "react";
import { loginUser } from "@/lib/helpers/loginUser";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [current, setCurrent] = useState(0);

  type Slide = {
    heading: string;
    para: string;
    image: string;
  };

  const slides: Slide[] = [
    {
      heading: "Welcome to Tekton Campus",
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
    {
      heading: "Leading Campus Operations Efficiently",
      para: "Oversee academic activities, departments, and student management across the institution.",
      image: "/home.png",
    },
    {
      heading: "Managing Institutional Finances with Precision",
      para: "Handle fee structures, payments, financial records, and reports seamlessly.",
      image: "/Group 0021 (6).png",
    },
    {
      heading: "Shaping Student Careers and Opportunities",
      para: "Coordinate placement drives, track student progress, and connect with top recruiters.",
      image: "/Placement Home.png",
    },
    {
      heading: "Building Strong Teams for Better Education",
      para: "Manage recruitment, staff records, payroll, and employee performance efficiently.",
      image: "/HR home.png",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const validate = () => {
    if (!email.trim()) {
      toast.error("Email is required!");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password.trim()) {
      toast.error("Password is required!");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const res = await loginUser(email, password);

      if (!res.success || !res.user) {
        toast.error(res.error || "Login failed");
        setLoading(false);
        return;
      }

      const role = res.user.role?.toLowerCase();
      const roleRouteMap: Record<string, string> = {
        admin: "/admin",
        student: "/stu_dashboard",
        parent: "/parent",
        faculty: "/faculty",
        superadmin: "/super-admin",
        finance: "/finance",
        collegeadmin: "/college-admin",
        collegehr: "/hr",
      };

      const redirectPath = roleRouteMap[role] || "/login";

      toast.success("Login successful!");
      window.location.href = redirectPath;
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const radius = 240;

  return (
    <div className="w-full h-full flex">
      <div className="w-[35%] h-screen sticky top-0 bg-linear-to-b from-[#6AE18B] to-[#B7F3CB] flex flex-col items-center p-8 overflow-hidden">
        <div className="flex flex-col gap-2 items-center justify-center">
          <Image
            src='https://png.pngtree.com/png-vector/20230306/ourmid/pngtree-scool-college-logo-victor-vector-png-image_6634445.png'
            height={90}
            width={90}
            alt=""
            className="rounded-full bg-transparent"
          />
          <h1 className="text-white">Powered by Gk-Elite</h1>
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-[#1B4D3E] text-center mb-1 transition-opacity duration-700">
            {slides[current].heading}
          </h2>
          <p className="text-[#1F3D2F] text-center text-sm mb-6 w-full transition-opacity">
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
              className={`absolute bottom-0 left-1/2 w-[65%] h-[45%] flex items-center justify-center transition-all duration-700 ease-in-out origin-bottom pointer-events-none ${positionStyles[position]}`}
              style={{
                transform: `translateX(-50%) rotate(${position === "left" ? -40 : position === "right" ? 40 : 0
                  }deg) translateY(-${radius}px)`,
              }}
            >
              <div
                className="absolute w-[480px] h-[450px] opacity-80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1.5 z-[-1] transition-all duration-700 ease-in-out"
                style={{
                  transform: `translate(0%, 25%) rotate(${position === "left" ? -40 : position === "right" ? 40 : 0
                    }deg)`,
                }}
              />
              <div className="relative w-[480px] h-[350px] mt-35 rounded-xl flex items-center justify-center">
                <img
                  src={encodeURI(slide.image)}
                  alt={`Slide ${idx + 1}`}
                  className="w-[450px] h-[300px] object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          );
        })}

        <div className="flex gap-4 mt-8 absolute z-20 bottom-10">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${current === i
                ? "w-18 bg-[#1A5D3C]"
                : "w-5 bg-white/60 border border-white/40"
                }`}
            />
          ))}
        </div>
      </div>

      <div
        className="w-[65%] h-screen flex justify-center items-center relative"
        style={{
          backgroundImage:
            "url(https://thumbs.dreamstime.com/b/hall-building-college-sunrise-63035568.jpg)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

        <div
          className="relative z-10 w-[520px]"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
            padding: "40px 44px",
          }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <Icon icon="mdi:school-outline" width={26} className="text-white" />
            </div>
          </div>

          <h1 className="text-[22px] font-semibold text-white text-center tracking-tight drop-shadow-md">
            Login to Your Account
          </h1>
          <p className="text-[13px] text-white/80 text-center mt-1 mb-6 drop-shadow-sm">
            Please enter your credentials to proceed.
          </p>

          <div className="mt-2">
            <label className="block text-[13px] font-semibold text-white mb-1.5 tracking-wide uppercase drop-shadow-md">
              Email
            </label>
            <div className="relative">
              <Icon
                icon="mdi:email-outline"
                width={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
              />
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
                className="w-full h-12 pl-11 pr-4 text-[14px] text-white placeholder:text-white/60 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-[13px] font-semibold text-white mb-1.5 tracking-wide uppercase drop-shadow-md">
              Password
            </label>
            <div className="relative">
              <Icon
                icon="mdi:lock-outline"
                width={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleLogin();
                  }
                }}
                className="w-full h-12 pl-11 pr-12 text-[14px] text-white placeholder:text-white/60 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none cursor-pointer transition-colors"
              >
                <Icon
                  icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  width={20}
                />
              </button>
            </div>
          </div>

          <div className="flex items-start justify-between mt-4 gap-4">
            <div className="flex items-center gap-1.5">
              <Icon
                icon="mdi:information-outline"
                width={15}
                className="shrink-0 text-amber-300 mt-[2px]"
              />
              <p className="text-[11.5px] text-white/70 leading-snug">
                New account? Verify your email before logging in. Check inbox or spam.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="text-[12.5px] text-white hover:text-white/80 cursor-pointer whitespace-nowrap shrink-0 font-medium underline underline-offset-2 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          <div
            className="my-6"
            style={{
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)",
            }}
          />

          <div className="flex justify-center">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="relative w-full h-[48px] flex items-center justify-center rounded-[10px] text-[15px] font-semibold tracking-wide text-white bg-white/10 border border-white/30 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-[0.98] transition-all duration-300 cursor-pointer overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon icon="mdi:loading" width={18} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}