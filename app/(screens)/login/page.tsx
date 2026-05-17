"use client";

import { useState, useEffect, useRef } from "react";
import { loginUser } from "@/lib/helpers/loginUser";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  EnvelopeSimple,
  Eye,
  EyeSlash,
  GraduationCap,
  Info,
  Lock,
  SpinnerGap,
  ArrowLeft,
  ArrowRight,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useUser } from "@/app/utils/context/UserContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { userId, role, refreshUserContext } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showMobileLogin, setShowMobileLogin] = useState(false);
  const router = useRouter()

  useEffect(() => {
    if (userId || role) {
      const roleRouteMap: Record<string, string> = {
        admin: "/admin",
        student: "/stu_dashboard",
        parent: "/parent",
        faculty: "/faculty",
        superadmin: "/super-admin",
        finance: "/finance",
        collegeadmin: "/college-admin",
        collegehr: "/hr",
        placementofficer: "/placement",
      };

      const redirectPath = roleRouteMap[role?.toLowerCase() || ""] || "/login";

      if (redirectPath !== "/login") {
        window.history.replaceState(null, "", redirectPath);
        router.replace(redirectPath);
        return
      }
    }
  }, [userId, role, router]);

  type Slide = {
    heading: string;
    para: string;
    image: string;
  };

  const slides: Slide[] = [
    {
      heading: "Managing Campus Excellence and Operations",
      para: "Oversee students, faculty, academics, and daily campus activities — all in one place.",
      image: "/loginslide1.png",
    },
    {
      heading: "Managing Operations and User Activities",
      para: "Handle day-to-day tasks, manage users, and ensure smooth system operations — all in one place.",
      image: "/loginslide2.png",
    },
    {
      heading: "Handling Faculty and Staff Operations",
      para: "Track attendance, manage records, and streamline HR processes with ease.",
      image: "/loginslide3.png",
    },
    {
      heading: "Managing Financial Operations and Transparency",
      para: "Oversee budgets, track expenses, and manage financial records — all in one place.",
      image: "/loginslide4.png",
    },
    {
      heading: "Handling Financial Transactions and Operations",
      para: "Manage fee collections, track payments, and maintain financial records — all in one place.",
      image: "/loginslide5.png",
    },
    {
      heading: "Driving Student Placements and Success",
      para: "Manage job opportunities, campus drives, and student career growth efficiently.",
      image: "/loginslide6.png",
    },
    {
      heading: "Empowering Teaching and Student Success",
      para: "Manage classes, track student progress, and deliver quality education — all in one place.",
      image: "/loginslide7.png",
    },
    {
      heading: "Managing Learning and Academic Progress",
      para: "Track attendance, assignments, and academic performance — all in one place.",
      image: "/loginslide8.png",
    },
    {
      heading: "Staying Connected to Your Child’s Academic Journey",
      para: "Track attendance, monitor performance, and stay updated — all in one place",
      image: "/loginslide9.png",
    },
    {
      heading: "Managing Student Well-Being Activities",
      para: "Track issues, handle requests, and ensure student support with ease.",
      image: "/loginslide10.png",
    },
  ];

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
      }, 2500);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, slides.length]);

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

      const role = res.user.role?.toLowerCase().trim();
      const roleRouteMap: Record<string, string> = {
        admin: "/admin",
        student: "/stu_dashboard",
        parent: "/parent",
        faculty: "/faculty",
        superadmin: "/super-admin",
        finance: "/finance",
        financemanager: "/finance-manager",
        "finance-manager": "/finance-manager",
        "finance manager": "/finance-manager",
        collegeadmin: "/college-admin",
        collegehr: "/hr",
        placementofficer: "/placement",
        wellbeingexecutive: "/wellbeing-executive",
        "wellbeing executive": "/wellbeing-executive",
        wellbeingmanager: "/wellbeing-manager",
        "wellbeing manager": "/wellbeing-manager",
      };

      const redirectPath = roleRouteMap[role] || "/login";

      toast.success("Login successful!");
      await refreshUserContext();
      router.refresh();
      router.replace(redirectPath);
    } catch (error) {
      console.error("Login Error:", error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    // <div className="w-full h-[100dvh] flex overflow-hidden relative">
    <div className="fixed inset-0 w-full flex overflow-hidden">
      {/* <div className="w-[35%] h-screen sticky top-0 bg-linear-to-b from-[#6AE18B] to-[#B7F3CB] flex flex-col items-center py-6 overflow-hidden"> */}

      <div
        className={`absolute lg:landscape:relative xl:relative z-10 lg:landscape:z-auto xl:z-auto w-full lg:landscape:w-[35%] xl:w-[35%] h-full bg-linear-to-b from-[#6AE18B] to-[#B7F3CB] flex flex-col items-center pt-6 pb-4 overflow-hidden transition-transform duration-500 ease-in-out ${showMobileLogin ? "-translate-x-full lg:landscape:translate-x-0 xl:translate-x-0" : "translate-x-0"}`}
      >
        <div className="w-full z-20 px-8 flex flex-col items-center text-center shrink-0">
          <div className="flex flex-col items-center">
            <Image
              src="/login-logo.png"
              height={85}
              width={85}
              alt=""
              unoptimized={true}
              className="rounded-full object-contain bg-transparent"
            />
            <h1 className="text-gray-700 text-[11px] font-bold tracking-wide mt-1">
              Powered by GK Elite-Info
            </h1>
          </div>

          <div className="mt-5 w-full overflow-hidden min-h-[95px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-[19px] leading-tight font-bold text-[#1B4D3E]">
                  {slides[current].heading}
                </h2>
                <p className="text-[#1F3D2F] text-[13.5px] mt-2 w-full opacity-90">
                  {slides[current].para}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="relative w-full flex-1 min-h-[250px] mt-4 mb-4 overflow-hidden flex items-center justify-center"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {slides.map((slide, idx) => {
            let position = "hidden";
            if (idx === current) position = "center";
            else if (idx === (current - 1 + slides.length) % slides.length)
              position = "left";
            else if (idx === (current + 1) % slides.length) position = "right";

            const opacityMap: Record<string, number> = {
              center: 1,
              left: 0,
              right: 0,
              hidden: 0,
            };

            const transformMap: Record<string, string> = {
              center: "translate(-50%, -50%) rotate(0deg) scale(1)",
              right: "translate(-20%, -30%) rotate(25deg) scale(0.85)",
              left: "translate(-80%, -30%) rotate(-25deg) scale(0.85)",
              hidden: "translate(-50%, -20%) rotate(0deg) scale(0.75)",
            };

            const opacity = opacityMap[position];
            const transformValue = transformMap[position];

            return (
              <div
                key={idx}
                className="absolute mt-33 md:mt-65 xl:mt-33 left-1/2 top-1/2 w-[90%] sm:w-[85%] md:w-[75%] max-w-[360px] sm:max-w-[500px] md:max-w-[560px] xl:max-w-[500px] 2xl:max-w-[560px] transition-all duration-900 ease-in-out origin-center pointer-events-none"
                style={{
                  top: "0px",
                  transform: transformValue,
                  opacity,
                  zIndex: position === "center" ? 10 : 0,
                }}
              >
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
                  <img
                    src={encodeURI(slide.image)}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover rounded-[14px]"
                    loading="lazy"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex gap-3 z-20 shrink-0 mt-1 mb-0 flex-wrap justify-center px-4"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i
                  ? "w-10 bg-[#1A5D3C]"
                  : "w-3 bg-white/60 border border-white/40"
              }`}
            />
          ))}
        </div>

        <div className="mt-auto pt-6 pb-3 lg:landscape:hidden xl:hidden w-full px-8 sm:px-16 md:px-24 z-20 shrink-0">
          <button
            onClick={() => setShowMobileLogin(true)}
            className="group relative w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-[16px] font-bold tracking-wide text-white bg-[#16284F] max-w-xs mx-auto hover:from-[#13382c] hover:to-[#1B4D3E] shadow-[0_8px_20px_-6px_rgba(27,77,62,0.5)] hover:shadow-[0_12px_24px_-8px_rgba(27,77,62,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Proceed to Login
              <ArrowRight
                size={20}
                weight="bold"
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      <div
        className={`absolute lg:landscape:relative xl:relative z-10 lg:landscape:z-auto xl:z-auto w-full lg:landscape:w-[65%] xl:w-[65%] h-full flex justify-center items-center transition-transform duration-500 ease-in-out ${showMobileLogin ? "translate-x-0" : "translate-x-full lg:landscape:translate-x-0 xl:translate-x-0"}`}
        style={{
          backgroundImage: "url('/loginpagebg.webp')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 lg:landscape:hidden xl:hidden z-20">
          <button
            onClick={() => setShowMobileLogin(false)}
            className="group flex items-center gap-1.5 sm:gap-2 text-white/90 hover:text-white transition-all bg-black/20 hover:bg-black/40 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.2)] hover:-translate-x-1"
          >
            <ArrowLeft
              size={16}
              weight="bold"
              className="group-hover:-translate-x-0.5 transition-transform sm:w-[18px] sm:h-[18px]"
            />
            <span className="font-semibold text-[12px] sm:text-[13.5px] tracking-wide">
              Back to slides
            </span>
          </button>
        </div>

        <div
          className="relative z-10 w-[90%] sm:w-[80%] lg:w-[480px] xl:w-[520px] px-5 py-6 sm:px-10 sm:py-10 max-h-[85dvh] sm:max-h-[95dvh] mt-12 sm:mt-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(8px) saturate(140%)",
            WebkitBackdropFilter: "blur(8px) saturate(140%)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
              <GraduationCap size={26} className="text-white" />
            </div>
          </div>

          <h1 className="text-[20px] md:text-[22px] font-semibold text-white text-center tracking-tight drop-shadow-md">
            Login to Your Account
          </h1>
          <p className="text-[13px] text-white/80 text-center mt-1 mb-6 drop-shadow-sm">
            Please enter your credentials to proceed.
          </p>

          <style>{`
            input:-webkit-autofill,
            input:-webkit-autofill:hover, 
            input:-webkit-autofill:focus, 
            input:-webkit-autofill:active {
              -webkit-text-fill-color: white !important;
              transition: background-color 5000s ease-in-out 0s !important;
              background-color: transparent !important;
            }
          `}</style>

          <div className="mt-2">
            <label className="block text-[13px] font-semibold text-white mb-1.5 tracking-wide uppercase drop-shadow-md">
              Email
            </label>
            <div className="relative">
              <EnvelopeSimple
                size={17}
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
                className="w-full h-12 pl-11 pr-4 text-[14px] text-white placeholder:text-white/60 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-[13px] font-semibold text-white mb-1.5 tracking-wide uppercase drop-shadow-md">
              Password
            </label>
            <div className="relative">
              <Lock
                size={17}
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
                className="w-full h-12 pl-11 pr-12 text-[14px] text-white placeholder:text-white/60 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:bg-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none cursor-pointer transition-colors"
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* <div className="flex items-start justify-between mt-4 gap-4">
            <div className="flex items-center gap-1.5">
              <Info size={15} className="shrink-0 text-amber-300 mt-[2px]" />
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
          </div> */}

          <div className="flex flex-col-reverse sm:flex-row items-end sm:items-start justify-between mt-4 gap-3 sm:gap-4">
            <div className="flex items-start gap-1.5 w-full sm:w-auto">
              <Info size={15} className="shrink-0 text-amber-300 mt-[2px]" />
              <p className="text-[11.5px] text-white/70 leading-snug">
                New account? Verify your email before logging in. Check inbox or
                spam.
              </p>
            </div>

            <Link
              href="/forgot-password"
              className="text-[12.5px] text-white hover:text-white/80 cursor-pointer whitespace-nowrap shrink-0 font-medium underline underline-offset-2 transition-colors self-end sm:self-auto pb-1 sm:pb-0"
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
                  <SpinnerGap size={18} className="animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
