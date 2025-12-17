"use client";

import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import {
  BellSimple,
  CaretRight,
  Envelope,
  Globe,
  Key,
  LockKey,
  ShieldCheck,
  TextT,
  UserCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import DoneStep from "./components/doneStep";
import ResetPassword from "./components/resetPassword";
import CurrentPassword from "./components/verifyPassword";

import LinkedAccounts, {
  LinkedAccount,
  mockAccountData,
} from "./components/linkedAccounts";

import TwoStepVerification, {
  mockVerificationData,
  VerificationMethod,
} from "./components/twoStepVerification";

import TrustedDevicesListUI, {
  mockDeviceData,
  TrustedDevice,
} from "./components/trustedDevices";

export default function StudentSettings() {
  const searchParams = useSearchParams();

  const step = searchParams.toString().split("=")[0];

  const [linkedAccounts, setLinkedAccounts] =
    useState<LinkedAccount[]>(mockAccountData);
  const handleToggleLinkedAccount = (accountId: string) => {
    setLinkedAccounts((prevAccounts) =>
      prevAccounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              connected: !account.connected,
              description: !account.connected
                ? "Connected to your account"
                : "Not Connected",
            }
          : account
      )
    );
  };

  const [verificationMethods, setVerificationMethods] =
    useState<VerificationMethod[]>(mockVerificationData);
  const handleToggleOrNavigate2FA = (methodId: string) => {
    setVerificationMethods((prevMethods) =>
      prevMethods.map((method) =>
        method.id === methodId && method.status === "toggle"
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const [devices, setDevices] = useState<TrustedDevice[]>(mockDeviceData);
  const handleRemoveDevice = (deviceId: string) => {
    setDevices((prevDevices) =>
      prevDevices.filter((device) => device.id !== deviceId)
    );
    console.log(`Device ID ${deviceId} removed.`);
  };

  if (step === "current-password") return <CurrentPassword />;
  if (step === "reset") return <ResetPassword />;
  if (step === "done") return <DoneStep />;

  if (step === "linked-accounts")
    return (
      <LinkedAccounts
        accounts={linkedAccounts}
        onToggle={handleToggleLinkedAccount}
      />
    );

  if (step === "2fa")
    return (
      <TwoStepVerification
        verificationMethods={verificationMethods}
        onToggleOrNavigate={handleToggleOrNavigate2FA}
      />
    );

  if (step === "trusted-devices")
    return (
      <TrustedDevicesListUI
        devices={devices}
        onRemoveDevice={handleRemoveDevice}
      />
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center gap-2">
            ⚙️
            <span className="text-[#282828]">Settings</span>
          </div>
          <p className="text-gray-500 text-sm">
            Manage your account and preferences
          </p>
        </div>
        <div className="w-[32%]">
          <CourseScheduleCard />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl p-4 space-y-6">
        <Link href="/settings?current-password" className="block">
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-full bg-[#43C17A26]">
                <Key size={22} weight="fill" className="text-[#43C17A]" />
              </div>
              <div>
                <p className="font-medium text-[#282828]">Change Password</p>
                <p className="text-sm text-gray-500">
                  Update your account password
                </p>
              </div>
            </div>
            <span className="text-gray-400">
              <CaretRight className="text-[#282828]" />
            </span>
          </div>
        </Link>

        <hr className="text-[#CECECE]" />

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-[#43C17A26]">
              <Envelope weight="fill" size={22} className="text-[#43C17A]" />
            </div>
            <div>
              <p className="font-medium text-[#282828]">Email Alerts</p>
              <p className="text-sm text-gray-500">
                Receive important updates via email
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              aria-label="Toggle email alerts"
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#16284F] rounded-full transition"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </div>

        <hr className="text-[#CECECE]" />

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-[#43C17A26]">
              <BellSimple weight="fill" size={22} className="text-[#43C17A]" />
            </div>
            <div>
              <p className="font-medium text-[#282828]">
                Assignment / Event / Class Reminders
              </p>
              <p className="text-sm text-gray-500">
                Manage notification preferences
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              aria-label="Toggle reminders"
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-checked:bg-[#16284F] rounded-full transition"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
          </label>
        </div>

        <hr className="text-[#CECECE]" />

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-[#43C17A26]">
              <TextT weight="bold" size={22} className="text-[#43C17A]" />
            </div>
            <div>
              <p className="font-medium text-[#282828]">Font Size</p>
              <p className="text-sm text-gray-500">
                Adjust text size for optimum readability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-40">
            <span className="text-2xl text-[#282828] font-medium">A</span>
            <input
              type="range"
              aria-label="Adjust font size"
              className="w-full h-1"
            />
            <span className="text-sm text-[#282828]">A</span>
          </div>
        </div>

        <hr className="text-[#CECECE]" />

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-[#43C17A26]">
              <Globe weight="fill" size={22} className="text-[#43C17A]" />
            </div>
            <div>
              <p className="font-medium text-[#282828]">Language Preferences</p>
              <p className="text-sm text-gray-500">
                Choose your preferred language
              </p>
            </div>
          </div>
          <span className="text-gray-400">
            <CaretRight className="text-[#282828]" />
          </span>
        </div>

        <hr className="text-[#CECECE]" />

        <Link href="/settings?linked-accounts" className="block">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-full bg-[#43C17A26]">
                <UserCircle
                  weight="fill"
                  size={22}
                  className="text-[#43C17A]"
                />
              </div>
              <div>
                <p className="font-medium text-[#282828]">
                  Manage Linked Accounts
                </p>
                <p className="text-sm text-gray-500">
                  Connect or disconnect third-party accounts
                </p>
              </div>
            </div>
            <span className="text-gray-400">
              <CaretRight className="text-[#282828]" />
            </span>
          </div>
        </Link>

        <hr className="text-[#CECECE]" />

        <Link href="/settings?2fa" className="block">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-full bg-[#43C17A26]">
                <LockKey weight="fill" size={22} className="text-[#43C17A]" />
              </div>
              <div>
                <p className="font-medium text-[#282828]">
                  Two-Step Verification
                </p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security
                </p>
              </div>
            </div>
            <span className="text-gray-400">
              <CaretRight className="text-[#282828]" />
            </span>
          </div>
        </Link>

        <hr className="text-[#CECECE]" />

        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-start">
            <div className="p-2 rounded-full bg-[#43C17A26]">
              <ShieldCheck weight="fill" size={22} className="text-[#43C17A]" />
            </div>
            <div>
              <p className="font-medium text-[#282828]">Privacy Policy</p>
              <p className="text-sm text-gray-500">View our privacy policy</p>
            </div>
          </div>
          <span className="text-gray-400">
            <CaretRight className="text-[#282828]" />
          </span>
        </div>
      </div>
    </div>
  );
}
