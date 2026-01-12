"use client"
import { motion } from "framer-motion";

import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { upsertUser, upsertAdminEntry } from "@/lib/helpers/upsertUser";
import { supabase } from "@/lib/supabaseClient";
import { InputField } from "../components/reusableComponents";
import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminForm = {
  fullName: string;
  email: string;
  countryCode: string;
  mobile: string;
  collegeId: string;
  collegeCode: string;
  password: string;
  confirmPassword: string;
  gender: "Male" | "Female" | "";
};

const initialFormState: AdminForm = {
  fullName: "",
  email: "",
  countryCode: "+91",
  mobile: "",
  collegeId: "",
  collegeCode: "",
  password: "",
  confirmPassword: "",
  gender: "",
};

export default function AdminRegistration() {
  const [form, setForm] = useState<AdminForm>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isCollegeCodeManual, setIsCollegeCodeManual] = useState(false);
  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const router = useRouter()

  const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const normalizedEmail = form.email.toLowerCase();

  const toPascalCase = (value: string) =>
    value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const checkSuperAdminAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      toast.error("User not authenticated. Please login.");
      router.push('/login')
      return null;
    }

    const { data: userData, error: roleError } = await supabase
      .from("users")
      .select("role, userId")
      .eq("auth_id", user.id)
      .single();

    if (roleError || !userData) {
      toast.error("Unable to verify user role");
      return null;
    }

    if (userData.role !== "SuperAdmin") {
      toast.error("Access denied. SuperAdmin only.");
      return null;
    }

    return {
      authUser: user,
      userId: userData.userId,
    };
  };

  const validateCollegeCode = async (collegeId: string, collegeCode: string,) => {
    const { data, error } = await supabase
      .from("colleges")
      .select("collegePublicId, collegeCode")
      .eq("collegePublicId", collegeId.trim())
      .eq("collegeCode", collegeCode.trim())
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  };



  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const superAdmin = await checkSuperAdminAuth();
      if (!superAdmin) return;
      if (!form.fullName.trim()) return toast.error("Full Name is required");
      if (!form.email.trim()) return toast.error("Email Address is required");

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail))
        return toast.error("Enter a valid email address");

      if (!form.countryCode.trim())
        return toast.error("Country code is required");

      if (!/^\+\d{1,4}$/.test(form.countryCode))
        return toast.error("Enter a valid country code (e.g. +91)");

      if (!form.mobile.trim()) return toast.error("Mobile number is required");
      if (form.mobile.length !== 10)
        return toast.error("Mobile number must be 10 digits");

      if (!form.collegeId.trim())
        return toast.error("College ID is required");

      if (!form.collegeCode.trim())
        return toast.error("College Code is required");

      if (!form.gender) {
        return toast.error("Please select gender");
      }

      if (!form.password)
        return toast.error("Password is required");

      if (!PASSWORD_REGEX.test(form.password)) {
        return toast.error(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
        );
      }

      if (form.password !== form.confirmPassword)
        return toast.error("Passwords do not match");

      const fullMobileNumber = `${form.countryCode}${form.mobile}`;

      const isValidCollege = await validateCollegeCode(form.collegeId, form.collegeCode);

      if (!isValidCollege) {
        toast.error("College ID and College Code do not match.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: "https://collpoll-client.vercel.app/login",
        },
      });
      if (error) throw error;

      const authUser = data.user;

      if (!authUser) {
        throw new Error("Auth user not created");
      }

      const userResult = await upsertUser({
        auth_id: authUser.id,
        fullName: toPascalCase(form.fullName),
        email: form.email.toLowerCase(),
        mobile: fullMobileNumber,
        collegePublicId: form.collegeId.trim().toUpperCase(),
        collegeCode: form.collegeCode.trim().toUpperCase(),
        role: "Admin",
        gender: form.gender,
      });

      if (!userResult.success || !userResult.data) {
        toast.error(userResult.error || "Failed to create admin");
        return;
      }

      const adminResult = await upsertAdminEntry({
        userId: userResult.data.userId,
        fullName: userResult.data.fullName,
        email: userResult.data.email,
        mobile: userResult.data.mobile,
        gender: form.gender,
        collegePublicId: form.collegeId.trim().toUpperCase(),
        collegeCode: form.collegeCode.trim().toUpperCase(),
        createdBy: superAdmin.userId,
      });

      if (!adminResult.success) {
        toast.error("User created, but admin creation failed");
        return;
      }

      toast.success("Admin registered successfully");
      setForm(initialFormState);
      setIsCollegeCodeManual(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.log("error checking admin create", error)
      toast.error(error.message || "Failed to create admin");
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-5"
    >
      <InputField
        label="Full Name"
        name="fullName"
        placeholder='e.g., "Admin Mallareddy"'
        value={form.fullName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (/^[A-Za-z\s]*$/.test(value)) {
            handleChange("fullName", toPascalCase(value));
          }
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Email Address"
          name="email"
          placeholder='e.g., "admin.mallareddy@gmail.com"'
          value={form.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/\s/g, "");
            handleChange("email", value.toLowerCase());
          }}
        />

        <div className="flex flex-col">
          <label className="text-[#333] font-semibold text-[15px] mb-1.5">
            Mobile
          </label>
          <div className="flex gap-2">
            <input
              name="countryCode"
              placeholder="+91"
              value={form.countryCode}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\+?\d{0,4}$/.test(value)) {
                  handleChange("countryCode", value);
                }
              }}
              maxLength={5}
              className="border outline-none border-gray-300 rounded-lg w-16 text-center text-sm text-gray-500 bg-gray-50 focus:outline-none focus:border-[#49C77F]"
            />
            <input
              placeholder="Enter mobile number"
              value={form.mobile}
              onChange={(e) =>
                handleChange("mobile", e.target.value.replace(/\D/g, ""))
              }
              maxLength={10}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#49C77F]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="College ID"
          placeholder='e.g., "MRCE001"'
          value={form.collegeId}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("collegeId", e.target.value.toUpperCase())}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.toUpperCase();
            handleChange("collegeId", value);

            if (!isCollegeCodeManual) {
              const extractedCode = value.match(/^[A-Z]+/)?.[0] || "";
              handleChange("collegeCode", extractedCode);
            }
          }}
        />
        <InputField
          label="College Code"
          placeholder='e.g., "MRCE"'
          value={form.collegeCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (/^[A-Za-z]{0,5}$/.test(value)) {
              setIsCollegeCodeManual(true);
              handleChange("collegeCode", value.toUpperCase());
            }
          }}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-[#333] font-semibold text-[15px] mb-2">
          Gender
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={form.gender === "Male"}
              onChange={() => handleChange("gender", "Male")}
            />
            <span className="text-[#333]">Male</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={form.gender === "Female"}
              onChange={() => handleChange("gender", "Female")}
            />
            <span className="text-[#333]">Female</span>
          </label>
        </div>
      </div>


      <div>
        <h4 className="text-[#333] font-bold text-base mb-3">
          Security Setup
        </h4>

        <div className="grid lg:grid-cols-2 gap-4">

          <InputField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={form.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("password", e.target.value)
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-700 cursor-pointer"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            }
            className="mb-4"
          />

          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter password..."
            value={form.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("confirmPassword", e.target.value)
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="hover:text-gray-700 cursor-pointer"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            }
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="my-6 cursor-pointer bg-[#49C77F] text-white h-[42px] w-[30%] rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all"
          >
            {isLoading ? 'Registering…' : 'Register'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

