"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/helpers/loginUser";
import toast from "react-hot-toast";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { debugTokens, checkAccessTokenValidity, testRefreshToken, testProtectedQuery } from "@/lib/helpers/authTokens";


export default function LoginPage() {
  const router = useRouter();

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

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
      );
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
        return;
      }

      toast.success("Login successful!");

      const role = res.user.role?.toLowerCase();

      const roleRouteMap: Record<string, string> = {
        admin: "/admin",
        parent: "/parent",
        faculty: "/faculty",
        student: "/stu_dashboard",
      };

      const redirectPath = roleRouteMap[role] || "/login";
      router.replace(redirectPath);
    } catch {
      toast.error("Something went wrong");
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

      <div className="w-[55%] h-screen flex justify-center items-center bg-[#F5F6F8]">
        <div className="w-[560px] bg-white rounded-[8px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8">
          <h1 className="text-[20px] font-semibold text-[#16284F] text-center">
            Login to Your Account
          </h1>

          <p className="text-[13px] text-[#414141] text-center mt-1 mb-3">
            Please enter your credentials to proceed.
          </p>

          <div className="mt-6">
            <label className="block text-[13px] text-[#414141] mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your registered email"
              className="w-full mt-1 h-11 px-4 rounded-md border border-[#DCDCDC]
                   text-[14px] text-black focus:outline-none  placeholder:text-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <label className="block text-[13px] text-[#414141] mb-1">
              Password
            </label>

            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="w-full h-11 px-4 pr-12 rounded-md border border-[#DCDCDC]
                     text-[14px] focus:outline-none text-black placeholder:text-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
              >
                <Icon
                  icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  width={20}
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-[13px] text-[#16284F] mt-2 w-full text-right cursor-pointer underline"
            >
              Forgot Password?
            </button>

          </div>

          <div className="w-full flex justify-center mt-8">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-[200px] h-[50px] bg-[#16284F] text-white rounded text-[15px] font-medium"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </div>

          {/* <p className="text-center mt-4 text-[14px] text-[#444]">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#0A8E2E] cursor-pointer"
            >
              Register Now
            </Link>
          </p> */}

        </div>
      </div>
    </div>
  );
}
