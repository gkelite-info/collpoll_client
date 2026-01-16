import { useState, useRef } from "react";
import { InputField } from "./reusableComponents";
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
};

export const CollegeRegistration = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
    const { collegeName, email, phone, country, state, zip, countryCode } =
      formData;

    try {
      setUploading(true);

      const superAdmin = await checkSuperAdminAuth();
      if (!superAdmin) return;

      if (!collegeName.trim()) return toast.error("College Name is required");
      if (!/^\S+@\S+\.\S+$/.test(email))
        return toast.error("Enter a valid email address");
      if (!countryCode.startsWith("+") || countryCode.length < 2)
        return toast.error("Invalid Country Code");
      if (!/^\d{10}$/.test(phone))
        return toast.error("Phone must be exactly 10 digits");
      if (!country.trim()) return toast.error("Please enter a Country");
      if (!state.trim()) return toast.error("Please enter a State");
      if (!/^\d{5,6}$/.test(zip))
        return toast.error("Enter a valid Zip/Pincode");
      if (!formData.address.trim())
        return toast.error("Address cannot be empty");

      if (!selectedFile)
        return toast.error("Please upload a verification proof");

      const loadingToast = toast.loading("Saving college details...");

      const college = await createCollege(
        {
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
        },
        selectedFile
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
      toast.error(error.message || "Failed to register college");
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
            Phone
          </label>
          <div className="flex gap-2">
            <input
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              placeholder="+91"
              className="border border-gray-300 rounded-lg w-16 text-center text-sm text-gray-600 focus:outline-none focus:border-[#49C77F]"
            />
            <input
              name="phone"
              type="number"
              value={formData.phone}
              onChange={handleChange}
              placeholder="9017632946"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-gray-600  text-sm w-full focus:outline-none focus:border-[#49C77F]"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[#333] font-bold text-base mb-3">
          Verification Details
        </h4>
        <div className="flex flex-col gap-1.5">
          <label className="text-[#333] font-semibold text-[14px]">Proof</label>
          <div className="flex gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#16284F] text-white px-12 py-2 rounded-md text-sm cursor-pointer flex-shrink-0 hover:bg-[#103271] transition-all"
            >
              Upload File
            </button>
            <div
              className={`border border-dashed ${
                selectedFile
                  ? "border-[#49C77F] text-[#49C77F]"
                  : "border-gray-300 text-gray-500"
              } rounded-lg flex-1 flex items-center px-4 text-xs`}
            >
              {selectedFile
                ? `Ready: ${selectedFile.name}`
                : "Upload any government/board affiliation proof (PDF, PNG, JPG)"}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[#333] font-bold text-base mb-3">
          Location Details
        </h4>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <InputField
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Enter Country"
          />
          <InputField
            label="State"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter State"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <InputField
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder='e.g., "Chennai"'
          />
          <InputField
            label="Zip / Pincode"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder='e.g., "600040"'
          />
        </div>

        <div className="flex items-end gap-4">
          <InputField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder='e.g., "Chennai"'
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
};
