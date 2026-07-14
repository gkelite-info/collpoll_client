"use client"
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { upsertUser } from "@/lib/helpers/upsertUser";
import { supabase } from "@/lib/supabaseClient";
import { InputField } from "../components/reusableComponents";
import { useEffect, useState } from "react";
import { saveCollegeAdmin } from "@/lib/helpers/collegeAdmin/collegeAdmin";
import { CollegeDropdownSelect } from "../components/CollegeDropdownSelect";
import { useUser } from "@/app/utils/context/UserContext";

type AdminForm = {
  fullName: string;
  email: string;
  countryCode: string;
  mobile: string;
  collegeId: string;
  role: string;
  // collegeCode: string;
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
  // collegeCode: "",
  password: "",
  confirmPassword: "",
  gender: "",
  role: "CollegeAdmin",
};

export default function AdminRegistration({ activeTab }: { activeTab: string }) {
  const [form, setForm] = useState<AdminForm>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { loading, role } = useUser();

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const normalizedEmail = form.email.toLowerCase();

  const toPascalCase = (value: string) =>
    value
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  const checkSuperAdminAuth = async () => {
    const sessionPromise = supabase.auth.getSession();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth Check Timed Out")), 30000)
    );

    try {
      const { data: { session }, error }: any = await Promise.race([sessionPromise, timeoutPromise]);

      if (error || !session?.user) {
        console.error("Auth session missing or error:", error);
        return null;
      }

      const { data: userData, error: roleError } = await supabase
        .from("users")
        .select("role, userId")
        .eq("auth_id", session.user.id)
        .single();

      if (roleError || userData?.role !== "SuperAdmin") {
        toast.error("Access denied. SuperAdmin only.");
        return null;
      }

      return { authUser: session.user, userId: userData.userId };
    } catch (e: any) {
      console.error("Auth Error:", e.message);
      toast.error(e.message || "Authentication failed");
      return null;
    }
  };

  // College fetch logic has been moved to CollegeDropdownSelect component

  const validateCollegeId = async (collegeId: string) => {
    const { data, error } = await supabase
      .from("colleges")
      .select("collegeId, collegeCode")
      .eq("collegeId", Number(collegeId))
      .single();

    if (error || !data) {
      setIsLoading(false);
      return { success: false };
    }

    return {
      success: true,
      collegeId: data.collegeId,
      collegeCode: data.collegeCode,
    };
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    try {
      const superAdmin = await checkSuperAdminAuth();
      if (!superAdmin) {
        setIsLoading(false);
        return;
      }

      if (!form.fullName.trim()) {
        toast.error("Full name is required");
        setIsLoading(false);
        return;
      }
      if (!form.email.trim()) {
        toast.error("Email address is required");
        setIsLoading(false);
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        toast.error("Invalid email format");
        setIsLoading(false);
        return
      }

      if (!form.mobile.trim()) {
        toast.error("Mobile number is required");
        setIsLoading(false);
        return;
      }

      if (!form.collegeId) {
        toast.error("Please select college");
        setIsLoading(false);
        return;
      }

      if (!form.gender) {
        toast.error("Please select gender");
        setIsLoading(false);
        return;
      }

      if (!form.password) {
        toast.error("Password is required");
        setIsLoading(false);
        return;
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(form.password)) {
        toast.error(
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
        );
        setIsLoading(false);
        return;
      }

      if (!form.confirmPassword) {
        toast.error("Confirm password is required");
        setIsLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        toast.error("Passwords do not match");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const collegeValidation = await validateCollegeId(form.collegeId);
      if (!collegeValidation.success) throw new Error("Invalid College ID");

      const actualCollegeId = collegeValidation.collegeId;
      const cCode = collegeValidation.collegeCode || "";
      const redirectUrl = cCode.toUpperCase() === "GKELITE" || !cCode
        ? "https://tektoncampus.com/login"
        : `https://${cCode.toLowerCase()}.tektoncampus.com/login`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Auth user not created");

      setIsLoading(true);

      const userResult = await upsertUser({
        auth_id: data.user.id,
        fullName: toPascalCase(form.fullName),
        email: form.email.toLowerCase(),
        mobile: `${form.countryCode}${form.mobile}`,
        collegeId: actualCollegeId,
        role: "CollegeAdmin",
        gender: form.gender as "Male" | "Female",
      });

      if (!userResult.success || !userResult.data) {
        throw new Error(userResult.error || "Failed to create admin record");
      }

      const collegeAdminResult = await saveCollegeAdmin({
        userId: userResult.data.userId,
        collegeId: actualCollegeId,
      });

      if (!collegeAdminResult.success) throw new Error("Admin linked failed");

      toast.success("Admin registered successfully");
      setForm(initialFormState);

    } catch (e: any) {
      console.error(e);

      let message = "Something went wrong. Please try again.";

      if (e?.message) {
        const errMsg = e.message.toLowerCase();

        if (errMsg.includes("email")) {
          message = "This email is already registered.";
        } else if (errMsg.includes("mobile")) {
          message = "This mobile number is already in use.";
        } else if (errMsg.includes("duplicate")) {
          message = "User already exists with provided details.";
        }
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
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
        required={true}
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
          label="Email address"
          name="email"
          required={true}
          placeholder='e.g., "admin.mallareddy@gmail.com"'
          value={form.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.replace(/\s/g, "");
            handleChange("email", value.toLowerCase());
          }}
        />

        <div className="flex flex-col">
          <label className="text-[#333] font-semibold text-[15px] mb-1.5">
            Mobile <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              name="countryCode"
              placeholder="+91"
              value={form.countryCode ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
              value={form.mobile ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleChange("mobile", e.target.value.replace(/\D/g, ""))
              }
              maxLength={10}
              className="border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#49C77F]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <CollegeDropdownSelect 
            value={form.collegeId} 
            onChange={(val) => handleChange("collegeId", val)} 
          />
        <div className="flex flex-col">
          <label className="text-[#333] font-semibold text-[15px] mb-1.5">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-100 text-gray-600 cursor-not-allowed">
            College Admin
          </div>
        </div>

        {/* <InputField
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
        /> */}
      </div>

      <div className="flex flex-col">
        <label className="text-[#333] font-semibold text-[15px] mb-2">
          Gender <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={form.gender === "Male"}
              onChange={() => handleChange("gender", "Male")}
              className="focus:outline-none"
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
              className="focus:outline-none"
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
            placeholder="Enter password..."
            value={form.password}
            required={true}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("password", e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-700 cursor-pointer focus:outline-none"
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
            label="Confirm password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Re-enter password..."
            value={form.confirmPassword}
            required={true}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleChange("confirmPassword", e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="hover:text-gray-700 cursor-pointer focus:outline-none"
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
            className="my-6 cursor-pointer bg-[#49C77F] text-white h-[42px] w-[30%] rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

