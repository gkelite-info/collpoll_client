"use client"
import { motion } from "framer-motion";

import toast from "react-hot-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { upsertUser } from "@/lib/helpers/upsertUser";
import { supabase } from "@/lib/supabaseClient";
import { InputField } from "../components/reusableComponents";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveCollegeAdmin } from "@/lib/helpers/collegeAdmin/collegeAdmin";

type AdminForm = {
  fullName: string;
  email: string;
  countryCode: string;
  mobile: string;
  collegeId: string;
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

  const validateCollegeId = async (collegeId: string) => {
    const { data, error } = await supabase
      .from("colleges")
      .select("collegeId")
      .eq("collegeId", Number(collegeId))
      .single();

    if (error || !data) {
      return { success: false };
    }

    return {
      success: true,
      collegeId: data.collegeId,
    };
  };


  const handleSubmit = async () => {
    console.log("🚀 Submit clicked");
    setIsLoading(true);

    try {
      console.log("🔍 Checking SuperAdmin auth...");
      const superAdmin = await checkSuperAdminAuth();
      console.log("SuperAdmin result:", superAdmin);

      if (!superAdmin) {
        console.log("❌ SuperAdmin validation failed");
        return;
      }

      console.log("🔍 Validating Full Name...");
      if (!form.fullName.trim()) {
        console.log("❌ Full Name missing");
        return toast.error("Full Name is required");
      }

      console.log("🔍 Validating Email...");
      if (!form.email.trim()) {
        console.log("❌ Email missing");
        return toast.error("Email Address is required");
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        console.log("❌ Invalid email format:", normalizedEmail);
        return toast.error("Enter a valid email address");
      }

      console.log("🔍 Validating Country Code...");
      if (!form.countryCode.trim()) {
        console.log("❌ Country code missing");
        return toast.error("Country code is required");
      }

      if (!/^\+\d{1,4}$/.test(form.countryCode)) {
        console.log("❌ Invalid country code:", form.countryCode);
        return toast.error("Enter a valid country code (e.g. +91)");
      }

      console.log("🔍 Validating Mobile...");
      if (!form.mobile.trim()) {
        console.log("❌ Mobile missing");
        return toast.error("Mobile number is required");
      }

      if (form.mobile.length !== 10) {
        console.log("❌ Mobile length invalid:", form.mobile);
        return toast.error("Mobile number must be 10 digits");
      }

      console.log("🔍 Validating College ID...");
      if (!form.collegeId.trim()) {
        console.log("❌ College ID missing");
        return toast.error("College ID is required");
      }

      // console.log("🔍 Validating College Code...");
      // if (!form.collegeCode.trim()) {
      //   console.log("❌ College Code missing");
      //   return toast.error("College Code is required");
      // }

      console.log("🔍 Validating Gender...");
      if (!form.gender) {
        console.log("❌ Gender not selected");
        return toast.error("Please select gender");
      }

      console.log("🔍 Validating Password...");
      if (!form.password) {
        console.log("❌ Password missing");
        return toast.error("Password is required");
      }

      if (!PASSWORD_REGEX.test(form.password)) {
        console.log("❌ Password regex failed");
        return toast.error(
          "Password must include uppercase, lowercase, number, special character"
        );
      }

      if (form.password !== form.confirmPassword) {
        console.log("❌ Password mismatch");
        return toast.error("Passwords do not match");
      }

      console.log("🔍 Validating College from DB...");
      const collegeValidation = await validateCollegeId(
        form.collegeId
      );


      console.log("College validation result:", collegeValidation);

      if (!collegeValidation.success) {
        console.log("❌ College validation failed");
        toast.error("College ID and College Code do not match.");
        return;
      }

      const actualCollegeId = collegeValidation.collegeId;
      console.log("✅ Actual College ID:", actualCollegeId);

      console.log("🔍 Creating Supabase Auth user...");
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: "https://collpoll-client.vercel.app/login",
        },
      });

      if (error) {
        console.log("❌ Supabase Auth error:", error);
        throw error;
      }

      console.log("Auth user created:", data.user);

      if (!data.user) {
        console.log("❌ Auth user is null");
        throw new Error("Auth user not created");
      }

      console.log("🔍 Inserting into users table...");
      const userResult = await upsertUser({
        auth_id: data.user.id,
        fullName: toPascalCase(form.fullName),
        email: form.email.toLowerCase(),
        mobile: `${form.countryCode}${form.mobile}`,
        collegeId: actualCollegeId,
        // collegeCode: form.collegeCode.trim().toUpperCase(),
        role: "Admin",
        gender: form.gender,
      });

      console.log("User insert result:", userResult);

      if (!userResult.success || !userResult.data) {
        console.log("❌ Users table insert failed");
        toast.error(userResult.error || "Failed to create admin");
        return;
      }

      console.log("🔍 Inserting into college_admin...");
      const collegeAdminResult = await saveCollegeAdmin({
        userId: userResult.data.userId,
        collegeId: actualCollegeId,
      });

      console.log("College admin result:", collegeAdminResult);

      if (!collegeAdminResult.success) {
        console.log("❌ college_admin insert failed");
        toast.error("User created, but college admin creation failed");
        return;
      }

      console.log("🎉 SUCCESS: Admin registered");
      toast.success("Admin registered successfully");

      setForm(initialFormState);
      setIsCollegeCodeManual(false);
      setShowPassword(false);
      setShowConfirmPassword(false);

    } catch (error: any) {
      console.log("🔥 CATCH BLOCK ERROR:", error);
      toast.error(error.message || "Failed to create admin");
    } finally {
      console.log("🧹 Resetting loading state");
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
        <InputField
          label="College ID"
          placeholder='e.g., "Enter your college ID"'
          value={form.collegeId}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("collegeId", e.target.value.toUpperCase())}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.toUpperCase();
            handleChange("collegeId", value);

            // if (!isCollegeCodeManual) {
            //   const extractedCode = value.match(/^[A-Z]+/)?.[0] || "";
            //   handleChange("collegeCode", extractedCode);
            // }
          }}
        />
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

