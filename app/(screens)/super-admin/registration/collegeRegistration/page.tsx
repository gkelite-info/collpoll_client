"use client";
import { useState, useRef, useEffect } from "react";
import { InputField } from "../components/reusableComponents";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { createCollege } from "@/lib/helpers/admin/createCollege";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const INITIAL_FORM_STATE = {
  collegeName: "",
  collegeCode: "",
  email: "",
  countryCode: "+91",
  phone: "",
  country: "",
  state: "",
  city: "",
  zip: "",
  address: "",
  educationType: [] as string[],
};

export default function CollegeRegistration() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [educationList, setEducationList] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();

  const formatAddress = (value: string) => {
    if (!value) return value;

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const formatted = formatAddress(value);

    setFormData((prev) => ({
      ...prev,
      address: formatted,
    }));
  };

  const validateLocationInput = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z\s]/g, "");
    return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const validateZipByCountry = (value: string, country: string) => {
    let cleaned = value.trim();

    switch (country.toLowerCase()) {
      case "india":
        cleaned = cleaned.replace(/\D/g, "").slice(0, 6);
        break;

      case "united states":
      case "usa":
        const digits = value.replace(/\D/g, "").slice(0, 9);

        if (digits.length > 5) {
          cleaned = `${digits.slice(0, 5)}-${digits.slice(5)}`;
        } else {
          cleaned = digits;
        }
        break;

      case "canada":
      case "united kingdom":
        cleaned = cleaned.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase();
        break;

      default:
        cleaned = cleaned.replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 10);
    }

    return cleaned;
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    const formatted = validateZipByCountry(value, formData.country);

    setFormData((prev) => ({
      ...prev,
      zip: formatted,
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const formattedValue = validateLocationInput(value);

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "countryCode") {
      const formatted = value.replace(/[^\+0-9]/g, "");
      if (formatted.length > 4) return;
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    if (name === "phone") {
      const formatted = value.replace(/\D/g, "");
      if (formatted.length > 10) return;
      setFormData({ ...formData, [name]: formatted });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const fetchEducations = async () => {
      const { data, error } = await supabase
        .from("educations")
        .select("educationCode")
        .eq("is_deleted", false);

      if (!error && data) {
        setEducationList(data);
      } else {
        toast.error("Failed to load education types");
      }
    };

    fetchEducations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`${file.name} selected`);
    }
  };

  const checkSuperAdminAuth = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      toast.error("User not authenticated. Please login.");
      router.push("/login");
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


  const handleSave = async () => {
    const { collegeName, email, phone, country, state, zip, countryCode } = formData;

    const countryLower = formData.country.toLowerCase();

    if (!collegeName.trim()) return toast.error("College Name is required");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return toast.error("Enter a valid email address");
    if (!countryCode.startsWith("+") || countryCode.length < 2)
      return toast.error("Invalid Country Code");
    if (!/^\d{10}$/.test(phone))
      return toast.error("Phone must be exactly 10 digits");
    if (!country.trim()) return toast.error("Please enter a Country");
    if (!state.trim()) return toast.error("Please enter a State");
    if (!formData.city.trim()) return toast.error("Please enter a City");

    if (countryLower === "india") {
      if (!/^[1-9][0-9]{5}$/.test(formData.zip)) {
        return toast.error("Enter a valid 6-digit Indian Pincode");
      }
    } else if (countryLower === "united states" || countryLower === "usa") {
      if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
        return toast.error("Enter a valid US ZIP code");
      }
    } else {
      if (!formData.zip.trim()) {
        return toast.error("Zip/Postal code is required");
      }
    }

    if (!formData.address.trim()) return toast.error("Address cannot be empty");
    if (!selectedFile) return toast.error("Please upload a verification proof");
    if (formData.educationType.length === 0)
      return toast.error("Select at least one Education Type");

    const loadingToast = toast.loading("Saving college details...");

    try {
      setUploading(true);

      const superAdmin = await checkSuperAdminAuth();

      if (!superAdmin) {
        toast.dismiss(loadingToast);
        setUploading(false);
        return;
      }

      await createCollege({
        collegeName: formData.collegeName,
        collegeEmail: formData.email,
        collegeCode: formData.collegeCode,
        address: formData.address,
        countryCode: formData.countryCode,
        phoneNumber: formData.phone,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.zip,
        educationTypes: formData.educationType,
        createdBy: superAdmin.userId,
      },
        selectedFile,
      );

      toast.dismiss(loadingToast);
      toast.success("College registered successfully!");
      setFormData(INITIAL_FORM_STATE);
      setSelectedFile(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      
      console.error("FULL ERROR:", error);

      let message = "Something went wrong. Please try again.";

      const errMsg = error?.message?.toLowerCase() || "";

      if (errMsg.includes("collegecode")) {
        message = "This college code already exists. Please use a different code.";
      } else if (errMsg.includes("collegeemail") || errMsg.includes("email")) {
        message = "This email is already registered.";
      } else if (errMsg.includes("mobile") || errMsg.includes("phone")) {
        message = "This mobile number is already in use.";
      } else if (errMsg.includes("duplicate")) {
        message = "Duplicate entry detected. Please check your details.";
      }

      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="space-y-5"
    >
      <Toaster position="top-right" />

      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.png,.jpg,.jpeg"
      />

      <div className="grid xl:grid-cols-2 gap-3">
        <InputField
          label="College Name"
          name="collegeName"
          value={formData.collegeName}
          onChange={handleChange}
          placeholder="Enter the full official name of the institution."
        />
        <InputField
          label="College Code"
          name="collegeCode"
          value={formData.collegeCode.toUpperCase()}
          onChange={handleChange}
          placeholder="eg:- MRIT"
          uppercase={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="College Email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder='e.g., "admin@stjosephs.edu"'
        />
        <div className="flex flex-col">
          <label className="text-[#333] font-semibold text-[15px] mb-1.5">
            Mobile
          </label>
          <div className="flex gap-2">
            <input
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              placeholder="+91"
              maxLength={5}
              onWheel={(e) => e.currentTarget.blur()}
              className="border border-gray-300 rounded-lg w-16 text-center text-sm text-gray-600 focus:outline-none focus:border-[#49C77F]"
            />
            <input
              name="phone"
              type="number"
              value={formData.phone}
              onChange={handleChange}
              placeholder="901763XXXX"
              maxLength={10}
              onWheel={(e) => e.currentTarget.blur()}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-600  text-sm w-full focus:outline-none focus:border-[#49C77F]"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[#333] font-bold text-base mb-3">
          Verification details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#333] font-semibold text-[14px]">
              Proof
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#16284F] text-white px-6 py-2 rounded-md text-sm cursor-pointer flex-shrink-0 transition-all"
              >
                Upload file
              </button>

              <div
                className={`border border-dashed ${selectedFile
                  ? "border-[#49C77F] text-[#49C77F]"
                  : "border-gray-300 text-gray-500"
                  } rounded-lg flex-1 flex items-center px-4 text-xs`}
              >
                {selectedFile
                  ? `Ready: ${selectedFile.name}`
                  : "Upload government/board affiliation proof"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#333] font-semibold text-[14px]">
              Education Type
            </label>

            <div className="relative" ref={dropdownRef}>
              <div
                className="border border-gray-300 rounded-lg px-4 py-2 min-h-[42px] flex items-center justify-between cursor-pointer focus-within:border-[#49C77F]"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <div className="flex flex-wrap gap-2 items-center">
                  {formData.educationType.length === 0 && (
                    <span className="text-sm text-gray-400">
                      Select Education Type
                    </span>
                  )}

                  {formData.educationType.map((type) => (
                    <div
                      key={type}
                      className="flex items-center gap-2 bg-[#E6F7EF] text-[#43C17A] px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {type}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({
                            ...prev,
                            educationType: prev.educationType.filter(
                              (v) => v !== type,
                            ),
                          }));
                        }}
                        className="cursor-pointer"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>

                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {showDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto">
                  {educationList.map((edu: { educationCode: string }) => (
                    <div
                      key={edu.educationCode}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          educationType: prev.educationType.includes(
                            edu.educationCode,
                          )
                            ? prev.educationType.filter(
                              (v) => v !== edu.educationCode,
                            )
                            : [...prev.educationType, edu.educationCode],
                        }));
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center transition-all
    ${formData.educationType.includes(edu.educationCode)
                          ? "bg-[#E6F7EF] text-[#43C17A] font-medium"
                          : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      <span>{edu.educationCode}</span>

                      {formData.educationType.includes(edu.educationCode) && (
                        <span className="text-[#43C17A] text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[#333] font-bold text-base mb-3">
          Location details
        </h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <InputField
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleLocationChange}
            placeholder="Enter Country"
          />
          <InputField
            label="State"
            name="state"
            value={formData.state}
            onChange={handleLocationChange}
            placeholder="Enter State"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <InputField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleLocationChange}
            placeholder='e.g., "Hyderabad"'
          />
          <InputField
            label="Zip / Pincode"
            name="zip"
            value={formData.zip}
            onChange={handleZipChange}
            placeholder='e.g., "500081"'
          />
        </div>

        <div className="flex items-end gap-4">
          <InputField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleAddressChange}
            placeholder='e.g., "Hyderabad"'
            className="flex-[3]"
          />
          <button
            onClick={handleSave}
            disabled={uploading}
            className="flex-[2.75] bg-[#49C77F] cursor-pointer text-white h-[42px] px-6 rounded-lg font-bold text-lg shadow-md hover:bg-[#3fb070] transition-all disabled:opacity-50"
          >
            {uploading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
