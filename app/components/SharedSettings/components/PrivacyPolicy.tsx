import React from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, ShieldCheck } from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

const PrivacyPolicy = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen p-6 ">
      <div className="max-w-5xl mx-auto font-sans">
        {/* Header Section */}
        <div className="flex justify-between">
          <div className="text-xl font-semibold flex flex-col">
            <div className="flex justify-start items-center gap-2">
              <button
                onClick={() => router.back()}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer mr-1"
              >
                <CaretLeft size={24} weight="bold" className="text-[#282828]" />
              </button>
              <span className="text-[#282828]">Privacy Policy</span>
            </div>
            <p className="text-gray-500 text-sm ml-9">
              Last updated: April 2026
            </p>
          </div>
          <div className="w-[32%]">
            <CourseScheduleCard />
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8 bg-white p-8 rounded-xl shadow-sm text-gray-700 space-y-6">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <div className="p-3 rounded-full bg-[#43C17A26]">
              <ShieldCheck weight="fill" size={24} className="text-[#43C17A]" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Tekton Campus Privacy Policy
            </h2>
          </div>

          <section className="space-y-3">
            <h3 className="text-md font-medium text-gray-900">
              1. Information We Collect
            </h3>
            <p className="text-sm leading-relaxed">
              We collect information you provide directly to us when you create
              an account, update your profile, use the interactive features of
              the ERP, or communicate with us. This may include your name, email
              address, student ID, academic records, and contact details.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-md font-medium text-gray-900">
              2. How We Use Your Information
            </h3>
            <p className="text-sm leading-relaxed">
              We use the information we collect to provide, maintain, and
              improve our services. This includes managing your academic
              journey, processing enrollments, sending necessary notifications
              (such as course updates and event reminders), and providing user
              support.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-md font-medium text-gray-900">
              3. Data Security
            </h3>
            <p className="text-sm leading-relaxed">
              We implement appropriate technical and organizational measures
              designed to protect your personal data against accidental or
              unlawful destruction, loss, alteration, and unauthorized
              disclosure or access. We utilize industry-standard encryption and
              secure server hosting.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-md font-medium text-gray-900">
              4. Your Rights
            </h3>
            <p className="text-sm leading-relaxed">
              You have the right to access, update, or delete your personal
              information. You can manage many of these preferences directly
              through this settings dashboard. For data requests that cannot be
              fulfilled via the dashboard, please contact campus administration.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
