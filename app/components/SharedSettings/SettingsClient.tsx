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
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import DoneStep from "./components/doneStep";
import ResetPassword from "./components/resetPassword";
import CurrentPassword from "./components/verifyPassword";

import LinkedAccounts, { LinkedAccount } from "./components/linkedAccounts";

import TwoStepVerification, {
  mockVerificationData,
  VerificationMethod,
} from "./components/twoStepVerification";

import TrustedDevicesListUI, {
  mockDeviceData,
  TrustedDevice,
} from "./components/trustedDevices";

import { useFont } from "@/app/utils/FontProvider";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/lib/helpers/settings/preferencesAPI";
import PrivacyPolicy from "./components/PrivacyPolicy";
import WipOverlay from "@/app/utils/WipOverlay";

interface settingsProps {
  CardIsVisible?: boolean;
}

export default function SettingsClient({ CardIsVisible }: settingsProps) {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const step = searchParams.toString().split("=")[0];

  const { scale, setScale } = useFont();
  const { userId } = useUser();

  const MIN = 85;
  const MAX = 115;
  const invertedValue = MAX + MIN - scale;

  useEffect(() => {
    async function loadPreferences() {
      if (!userId) return;

      const prefs = await getUserPreferences(userId);

      if (prefs) {
        setEmailAlerts(prefs.email_alerts);
        setReminders(
          prefs.assignment_reminders ||
            prefs.event_reminders ||
            prefs.class_reminders,
        );
        if (prefs.font_scale) setScale(prefs.font_scale);
      }
      setIsLoadingPrefs(false);
    }
    loadPreferences();
  }, [userId, setScale]);

  useEffect(() => {
    const saved = localStorage.getItem("fontScale");
    if (saved) setScale(Number(saved));
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${scale}%`;
    localStorage.setItem("fontScale", String(scale));
  }, [scale]);

  const handleToggleEmailAlerts = async () => {
    const newValue = !emailAlerts;
    setEmailAlerts(newValue);

    if (userId) {
      await updateUserPreferences(userId, { email_alerts: newValue });
    }
  };

  const handleToggleReminders = async () => {
    const newValue = !reminders;
    setReminders(newValue);

    if (userId) {
      await updateUserPreferences(userId, {
        assignment_reminders: newValue,
        event_reminders: newValue,
        class_reminders: newValue,
      });
    }
  };

  const [verificationMethods, setVerificationMethods] =
    useState<VerificationMethod[]>(mockVerificationData);
  const handleToggleOrNavigate2FA = (methodId: string) => {
    setVerificationMethods((prevMethods) =>
      prevMethods.map((method) =>
        method.id === methodId && method.status === "toggle"
          ? { ...method, enabled: !method.enabled }
          : method,
      ),
    );
  };

  const [devices, setDevices] = useState<TrustedDevice[]>(mockDeviceData);
  const handleRemoveDevice = (deviceId: string) => {
    setDevices((prevDevices) =>
      prevDevices.filter((device) => device.id !== deviceId),
    );
  };

  if (step === "current-password") return <CurrentPassword />;
  if (step === "reset") return <ResetPassword />;
  if (step === "done") return <DoneStep />;
  if (step === "linked-accounts") return <LinkedAccounts />;
  if (step === "privacy-policy") return <PrivacyPolicy />;
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

  if (isLoadingPrefs) {
    return (
      <div className="p-2 space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex justify-start items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
              <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
            </div>
            <div className="h-4 w-56 bg-gray-200 rounded-md"></div>
          </div>
          <div className="w-[32%] h-[70px] bg-gray-200 rounded-xl"></div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 space-y-6">
          {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
            <div key={item}>
              <div className="flex items-center justify-between">
                <div className="flex gap-3 items-start">
                  <div className="p-2 w-10 h-10 rounded-full bg-gray-200"></div>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
                    <div className="h-3 w-56 bg-gray-200 rounded-md"></div>
                  </div>
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded-md"></div>
              </div>
              {index !== 6 && (
                <hr className="text-[#CECECE] mt-6 border-gray-100" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-2 space-y-6 pb-4">
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
            <CourseScheduleCard isVisibile={CardIsVisible ? true : false} />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 space-y-6">
          <Link href={`${pathname}?current-password`} className="block">
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
                checked={emailAlerts}
                onChange={handleToggleEmailAlerts}
                disabled={isLoadingPrefs}
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
                <BellSimple
                  weight="fill"
                  size={22}
                  className="text-[#43C17A]"
                />
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
                checked={reminders}
                onChange={handleToggleReminders}
                disabled={isLoadingPrefs}
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
                min={MIN}
                max={MAX}
                step={5}
                value={invertedValue}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setScale(MAX + MIN - val);
                }}
                aria-label="Adjust font size"
                className="w-full h-1 cursor-pointer"
              />

              <span className="text-sm text-[#282828]">A</span>
            </div>
          </div>

          <hr className="text-[#CECECE]" />

          <div className="relative flex items-center justify-between">
            <WipOverlay
              isExtraSmall={true}
              style={{ height: "95px", marginTop: "-25px" }}
              borderRadius="rounded-sm"
            />
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-full bg-[#43C17A26]">
                <Globe weight="fill" size={22} className="text-[#43C17A]" />
              </div>
              <div>
                <p className="font-medium text-[#282828]">
                  Language Preferences
                </p>
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

          <Link href={`${pathname}?linked-accounts`} className="block">
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

          <Link href={`${pathname}?2fa`} className="block">
            <div className="relative flex items-center justify-between">
              <WipOverlay
                isExtraSmall={true}
                style={{ height: "95px", marginTop: "-25px" }}
                borderRadius="rounded-sm"
              />
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

          <Link href={`${pathname}?privacy-policy`} className="block">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-start">
                <div className="p-2 rounded-full bg-[#43C17A26]">
                  <ShieldCheck
                    weight="fill"
                    size={22}
                    className="text-[#43C17A]"
                  />
                </div>
                <div>
                  <p className="font-medium text-[#282828]">Privacy Policy</p>
                  <p className="text-sm text-gray-500">
                    View our privacy policy
                  </p>
                </div>
              </div>
              <span className="text-gray-400">
                <CaretRight className="text-[#282828]" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
