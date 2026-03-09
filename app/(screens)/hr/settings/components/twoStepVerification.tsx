import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChatTeardropText,
  EnvelopeSimple,
  Key,
  Monitor,
  CaretRight,
  IconProps,
} from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export interface VerificationMethod {
  id: string;
  name: string;
  icon: React.ComponentType<IconProps>;
  status: "toggle" | "navigate";
  enabled: boolean;
}

interface TwoStepVerificationProps {
  verificationMethods: VerificationMethod[];
  onToggleOrNavigate: (id: string) => void;
}

export const mockVerificationData: VerificationMethod[] = [
  {
    id: "sms",
    name: "SMS Verification",
    icon: ChatTeardropText,
    status: "toggle",
    enabled: true,
  },
  {
    id: "email",
    name: "Email Verification",
    icon: EnvelopeSimple,
    status: "toggle",
    enabled: true,
  },
  {
    id: "authenticator",
    name: "Authenticator App",
    icon: Key,
    status: "toggle",
    enabled: true,
  },
  {
    id: "devices",
    name: "Trusted Devices List",
    icon: Monitor,
    status: "navigate",
    enabled: false,
  },
];

interface VerificationRowProps {
  method: VerificationMethod;

  onToggleOrNavigate: (id: string) => void;
}

const VerificationRow: React.FC<VerificationRowProps> = ({
  method,
  onToggleOrNavigate,
}) => {
  const router = useRouter();
  const Icon = method.icon;
  const accentColor = "text-green-500 bg-green-50";

  const handleAction = () => {
    if (method.status === "toggle") {
      onToggleOrNavigate(method.id);
    } else if (method.status === "navigate" && method.id === "devices") {
      router.push("/settings?trusted-devices");
    }
  };

  const ActionElement: React.FC = () => {
    if (method.status === "toggle") {
      return (
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={method.enabled}
            onChange={() => onToggleOrNavigate(method.id)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
        </label>
      );
    } else if (method.status === "navigate") {
      return (
        <button
          onClick={handleAction}
          className="text-gray-400 p-1"
          aria-label={`Go to ${method.name} settings`}
        >
          <CaretRight size={24} weight="bold" />
        </button>
      );
    }
    return null;
  };

  return (
    <div
      className={`flex items-center justify-between p-4 border-2 rounded-xl  mb-4 ${
        method.status === "navigate"
          ? "cursor-pointer hover:bg-gray-50 transition"
          : ""
      }`}
      onClick={method.status === "navigate" ? handleAction : undefined}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full text-xl ${accentColor}`}>
          <Icon weight="bold" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-800">{method.name}</h3>
        </div>
      </div>

      <ActionElement />
    </div>
  );
};

const TwoStepVerification: React.FC<TwoStepVerificationProps> = ({
  verificationMethods,
  onToggleOrNavigate,
}) => {
  return (
    <div className="p-6 space-y-6 sm:p-8">
      <div className="flex justify-between">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center gap-2">
            <span className="text-[#282828]">Two-Step Verification</span>
          </div>
          <p className="text-gray-500 text-sm">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className="w-[32%]">
          <CourseScheduleCard />
        </div>
      </div>
      <div>
        <div className="mt-8 bg-white p-6 rounded-xl">
          {verificationMethods.map((method) => (
            <VerificationRow
              key={method.id}
              method={method}
              onToggleOrNavigate={onToggleOrNavigate}
            />
          ))}
          <div className="mt-6 text-center text-sm text-gray-500">
            We recommend enabling at least one verification method.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoStepVerification;
