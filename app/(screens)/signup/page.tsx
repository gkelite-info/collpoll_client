"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react";
import { upsertUser } from "@/lib/helpers/upsertUser";
import { supabase } from "@/lib/supabaseClient";

export default function Signup() {
  const router = useRouter();

  const [formData, setFormData] = useState<{
    fullName: string;
    email: string;
    mobile: string;
    role: string;
    collegeId: number | null;
    password: string;
    confirmPassword: string;
  }>({
    fullName: "",
    email: "",
    mobile: "",
    role: "",
    collegeId: null,
    password: "",
    confirmPassword: "",
  });


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");


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
  }, [slides.length]);


  const nameRegex = /^([A-Z][a-z]+)(\s[A-Z][a-z]+)*$/;
  const emailRegex = /^[a-z0-9]+(\.[a-z0-9]+)*@[a-z0-9]+\.[a-z]{2,}$/;
  const mobileRegex = /^[0-9]{10}$/;
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

  const sanitizeEmail = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9@.]/g, "");

  const sanitizeDigits = (value: string) =>
    value.replace(/\D/g, "").slice(0, 10);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;

    if (id === "fullname") {
      let clean = value.replace(/[^A-Za-z ]/g, "");
      clean = clean.replace(/\s+/g, " ");
      clean = clean.replace(/\b\w/g, (t) => t.toUpperCase());
      clean = clean.trimStart();
      setFormData((prev) => ({ ...prev, fullname: clean }));
      return;
    }

    if (id === "email") {
      setFormData((prev) => ({ ...prev, email: sanitizeEmail(value) }));
      return;
    }

    if (id === "mobile") {
      setFormData((prev) => ({ ...prev, mobile: sanitizeDigits(value) }));
      return;
    }

    if (id === "collegeId") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({
        ...prev,
        collegeId: numericValue === "" ? null : Number(numericValue),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [id]: value }));
  };



  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, password: value }));

    if (!passwordRegex.test(value)) {
      setPasswordError(
        "Password must include uppercase, lowercase, number and special character."
      );
    } else {
      setPasswordError("");
    }
  };



  const handleSignup = async () => {

    try {
      if (!formData.fullName)
        return toast.error("Fullname is required!");

      if (!formData.email) return toast.error("Email is required!");

      if (!formData.mobile) return toast.error("Mobile number is required!");

      if ((formData.mobile.length < 10)) return toast.error("Mobile number should be 10!");

      if (!formData.role) return toast.error("Role is required!");

      if (formData.collegeId === null)
        return toast.error("College ID is required!");

      if (!Number.isInteger(formData.collegeId))
        return toast.error("College ID must be a valid number!");

      if (!formData.password) return toast.error("Password is required!");

      if (!formData.confirmPassword)
        return toast.error("Confirm Password is required!");

      if (!nameRegex.test(formData.fullName))
        return toast.error("Full Name must be title case alphabets only!");

      if (!emailRegex.test(formData.email))
        return toast.error(
          "Email must contain only lowercase letters, numbers, dots and a valid domain"
        );

      if (!mobileRegex.test(formData.mobile))
        return toast.error("Mobile number must be exactly 10 digits!");

      if (!passwordRegex.test(formData.password))
        return toast.error(
          "Password must include uppercase, lowercase, number and special character"
        );
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match!");
      }

    } catch (error) {
      toast.error("Failed to save");
    }

    setLoading(true);

    const { confirmPassword, ...payload } = formData;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: "https://collpoll-client.vercel.app/login",
        },
      });
      if (error) throw error;

      const authUser = data.user;

      if (!authUser) {
        throw new Error("Auth user not created");
      }

      const res = await upsertUser({
        auth_id: authUser.id,
        fullName: formData.fullName,
        email: formData.email,
        mobile: formData.mobile,
        collegeId: formData.collegeId,
        role: formData.role,
      });

      if (!res.success) throw new Error(res.error);

      setFormData({
        fullName: "",
        email: "",
        mobile: "",
        collegeId: null,
        role: "",
        password: "",
        confirmPassword: ""
      })
      toast.success("Please verify your email!");
      router.push("/login");
    } catch (err: any) {
      console.log("catch error", err);
      toast.error(err.message || "Failed to save");
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

      <div className="w-[750px] h-screen bg-[#EEEEEE] px-6 py-4 overflow-y-auto relative z-20 flex items-center justify-center">
        <div className="w-[550px] h-[550px] text-lg justify-between items-center px-4 py-2">
          <h1 className="text-[20px] font-semibold text-[#16284F] text-center py-2">
            User Registration
          </h1>
          <p className="text-[13px] text-[#414141] text-center mt-1 mb-3">
            Fill in your details to complete registration.
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <div className="col-span-2">
              <label className="block text-[13px] text-[#414141] mb-1">
                Fullname <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter Fullname"
                className="w-full h-[44px] border border-[#DCDCDC] rounded px-4 text-[14px] text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#414141] mb-1">
                Email <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                className="w-full h-[44px] border border-[#DCDCDC] rounded px-4 text-[14px] text-[#000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#414141] mb-1">
                Mobile <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter Mobile Number"
                className="w-full h-[44px] border border-[#DCDCDC] rounded px-4 text-[14px] text-[#000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[13px] text-[#414141] mb-1">
                Role <span className="text-red-500 text-lg">*</span>
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-[44px] border border-[#DCDCDC] rounded px-4 text-[14px] text-[#000] focus:outline-none"
              >
                <option value="">Select Role</option>
                <option value="SuperAdmin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Parent">Parent</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] text-[#414141] mb-1">
                CollegeId <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                id="collegeId"
                type="text"
                inputMode="numeric"
                value={formData.collegeId ?? ""}
                onChange={handleChange}
                placeholder="Enter Your collegeId"
                className="w-full h-[44px] border border-[#DCDCDC] rounded px-4 text-[14px] text-[#000] focus:outline-none"
                onWheel={(e) => e.currentTarget.blur()}
              />
            </div>

            <div className="w-full">
              <label className="block text-[13px] text-[#414141] mb-1">
                Password <span className="text-red-500 text-lg">*</span>
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password || ""}
                  onChange={handlePasswordChange}
                  placeholder="Enter Password"
                  className="w-full h-[44px] border border-[#DCDCDC] rounded px-4 pr-12
             text-[14px] text-[#000]
             placeholder:text-gray-400 focus:outline-none"
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
            </div>
            <div className="w-full">
              <label className="block text-[13px] text-[#414141] mb-1">
                Confirm Password <span className="text-red-500 text-lg">*</span>
              </label>

              <div className="relative w-full">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword || ""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSignup();
                    }
                  }}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm Password"
                  className="w-full h-[44px] border border-[#DCDCDC] rounded px-4 pr-12
                 text-[14px] text-[#000]
                 placeholder:text-gray-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <Icon
                    icon={
                      showConfirmPassword
                        ? "mdi:eye-off-outline"
                        : "mdi:eye-outline"
                    }
                    width={20}
                  />
                </button>
              </div>
            </div>

          </div>
          <div className="w-full flex flex-col items-center mt-5">
            <button
              onClick={handleSignup}
              className="w-[200px] h-[50px] bg-[#16284F] text-white text-[15px] font-semibold rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Register"}
            </button>
          </div>
          <p className="text-[14px] text-[#414141] mt-4 text-center">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/login")}
              className="text-[#0A8E2E] cursor-pointer underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
