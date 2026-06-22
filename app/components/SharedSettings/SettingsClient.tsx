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
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

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
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const step = searchParams.toString().split("=")[0];

  const t = useTranslations("Settings");

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

  const handleLanguageChange = async (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    setIsLangModalOpen(false);
    router.refresh();
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
      <div className="p-2 space-y-6 max-md:p-0 max-md:space-y-0 animate-pulse min-h-screen  max-md:bg-[#F4F5F6] w-full">
        <div className="flex justify-between items-center max-md:items-start max-md:p-4">
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex justify-start items-center gap-2">
              <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
              <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
            </div>
            <div className="h-4 w-56 bg-gray-200 rounded-md max-md:hidden"></div>
          </div>
          <div className="w-[32%] h-[70px] bg-gray-200 rounded-xl max-md:hidden"></div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 space-y-6 max-md:bg-transparent max-md:shadow-none max-md:p-4 max-md:space-y-5 w-full">
          {[1, 2, 3, 4, 5, 6, 7].map((item, index) => (
            <div key={item} className="w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-3 items-center min-w-0">
                  <div className="p-2 w-10 h-10 shrink-0 rounded-full bg-gray-200"></div>
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="h-4 w-40 bg-gray-200 rounded-md max-md:w-32"></div>
                    <div className="h-3 w-56 bg-gray-200 rounded-md max-md:hidden"></div>
                  </div>
                </div>
                <div className="w-8 h-4 bg-gray-200 rounded-md shrink-0"></div>
              </div>
              {index !== 6 && (
                <hr className="text-[#CECECE] mt-6 border-gray-100 max-md:hidden" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-2 space-y-6 pb-7 max-md:p-0 max-md:space-y-0 min-h-screen w-full">
        <div className="flex justify-between max-md:p-4 max-md:pb-2">
          <div className="text-xl font-semibold flex flex-col">
            <div className="flex justify-start items-center gap-2 max-md:text-[22px]">
              ⚙️
              <span className="text-[#282828]">{t("Settings")}</span>
            </div>
            <p className="text-gray-500 text-sm max-md:hidden">
              {t("Manage your account and preferences")}
            </p>
          </div>
          <div className="w-[32%] max-md:hidden">
            <CourseScheduleCard isVisibile={CardIsVisible ? true : false} />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 space-y-6 max-md:bg-transparent max-md:shadow-none max-md:p-4 max-md:space-y-5 w-full">
          <Link href={`${pathname}?current-password`} className="block w-full">
            <div className="flex items-center justify-between w-full cursor-pointer">
              <div className="flex gap-3 items-center md:items-start min-w-0">
                <div className="p-2 shrink-0 rounded-full bg-[#43C17A26]">
                  <Key size={22} weight="fill" className="text-[#43C17A]" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#282828] max-md:text-[15px] truncate">
                    {t("Change Password")}
                  </p>
                  <p className="text-sm text-gray-500 max-md:hidden truncate">
                    {t("Update your account password")}
                  </p>
                </div>
              </div>
              <span className="text-gray-400 shrink-0 ml-2">
                <CaretRight className="text-[#282828]" />
              </span>
            </div>
          </Link>

          <hr className="text-[#CECECE] max-md:hidden" />

          <div className="flex items-center justify-between w-full">
            <div className="flex gap-3 items-center md:items-start min-w-0">
              <div className="p-2 shrink-0 rounded-full bg-[#43C17A26]">
                <Envelope weight="fill" size={22} className="text-[#43C17A]" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[#282828] max-md:text-[15px] truncate">
                  {t("Email Alerts")}
                </p>
                <p className="text-sm text-gray-500 max-md:hidden truncate">
                  {t("Receive important updates via email")}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
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

          <hr className="text-[#CECECE] max-md:hidden" />

          <div className="flex items-center justify-between w-full">
            <div className="flex gap-3 items-center md:items-start min-w-0">
              <div className="p-2 shrink-0 rounded-full bg-[#43C17A26]">
                <BellSimple
                  weight="fill"
                  size={22}
                  className="text-[#43C17A]"
                />
              </div>
              <div className="min-w-0 pr-2">
                <p className="font-medium text-[#282828] max-md:text-[15px] leading-tight">
                  {t("Assignment / Event / Class Reminders")}
                </p>
                <p className="text-sm text-gray-500 max-md:hidden truncate mt-0.5">
                  {t("Manage notification preferences")}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-2">
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

          <hr className="text-[#CECECE] max-md:hidden" />

          <div className="flex items-center justify-between max-md:items-start w-full max-md:flex-col">
            <div className="flex gap-3 items-start w-full min-w-0">
              <div className="p-2 shrink-0 rounded-full bg-[#43C17A26]">
                <TextT weight="bold" size={22} className="text-[#43C17A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#282828] max-md:text-[15px] max-md:mt-0.5 truncate">
                  {t("Font Size")}
                </p>
                <p className="text-sm text-gray-500 max-md:hidden truncate">
                  {t("Adjust text size for optimum readability")}
                </p>

                {/* MOBILE SLIDER */}
                <div className="md:hidden flex items-center gap-3 w-48 mt-3">
                  <span className="text-base text-[#282828] font-medium">
                    A
                  </span>
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
                    className="w-full h-1 cursor-pointer accent-[#16284F]"
                  />
                  <span className="text-xs text-[#282828]">A</span>
                </div>
              </div>
            </div>

            {/* DESKTOP SLIDER */}
            <div className="hidden md:flex items-center gap-3 w-40 shrink-0">
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

          <hr className="text-[#CECECE] max-md:hidden" />

          <div
            className="relative flex items-center justify-between w-full cursor-pointer group"
            onClick={() => setIsLangModalOpen(true)}
          >
            <div className="flex gap-3 items-center md:items-start min-w-0">
              <div className="p-2 shrink-0 rounded-full bg-[#43C17A26] group-hover:bg-[#43C17A]/30 transition-colors">
                <Globe weight="fill" size={22} className="text-[#43C17A]" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[#282828] max-md:text-[15px] truncate">
                  {t("Language Preferences")}
                </p>
                <p className="text-sm text-gray-500 max-md:hidden truncate">
                  {t("Choose your preferred language")}
                </p>
              </div>
            </div>
            <span className="text-gray-400 shrink-0 ml-2">
              <CaretRight className="text-[#282828]" />
            </span>
          </div>

          <hr className="text-[#CECECE] max-md:hidden" />

          <Link href={`${pathname}?linked-accounts`} className="block w-full">
            <div className="flex items-center justify-between w-full cursor-pointer">
              <div className="flex gap-3 items-center md:items-start min-w-0">
                <div className="p-2 shrink-0 rounded-full bg-[#43C17A26]">
                  <UserCircle
                    weight="fill"
                    size={22}
                    className="text-[#43C17A]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#282828] max-md:text-[15px] truncate">
                    {t("Manage Linked Accounts")}
                  </p>
                  <p className="text-sm text-gray-500 max-md:hidden truncate">
                    {t("Connect or disconnect third-party accounts")}
                  </p>
                </div>
              </div>
              <span className="text-gray-400 shrink-0 ml-2">
                <CaretRight className="text-[#282828]" />
              </span>
            </div>
          </Link>

          <hr className="text-[#CECECE] max-md:hidden" />

          <Link href={`${pathname}?2fa`} className="block w-full">
            <div className="relative flex items-center justify-between w-full cursor-pointer">
              <div className="hidden md:block">
                <WipOverlay
                  isExtraSmall={true}
                  style={{ height: "95px", marginTop: "-25px" }}
                  borderRadius="rounded-sm"
                />
              </div>
              <div className="md:hidden absolute inset-0 z-10 w-full h-[40px] -mt-1">
                <WipOverlay
                  isExtraSmall={true}
                  style={{ height: "100%", width: "100%" }}
                  borderRadius="rounded-md"
                />
              </div>

              <div className="flex gap-3 items-center md:items-start min-w-0">
                <div className="p-2 shrink-0 rounded-full bg-[#43C17A26]">
                  <LockKey weight="fill" size={22} className="text-[#43C17A]" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#282828] max-md:text-[15px] truncate">
                    {t("Two-Step Verification")}
                  </p>
                  <p className="text-sm text-gray-500 max-md:hidden truncate">
                    {t("Add an extra layer of security")}
                  </p>
                </div>
              </div>
              <span className="text-gray-400 shrink-0 ml-2">
                <CaretRight className="text-[#282828]" />
              </span>
            </div>
          </Link>

          <hr className="text-[#CECECE] max-md:hidden" />

          <Link href={`${pathname}?privacy-policy`} className="block w-full">
            <div className="flex items-center justify-between w-full cursor-pointer">
              <div className="flex gap-3 items-center md:items-start min-w-0">
                <div className="p-2 shrink-0 rounded-full bg-[#43C17A26]">
                  <ShieldCheck
                    weight="fill"
                    size={22}
                    className="text-[#43C17A]"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#282828] max-md:text-[15px] truncate">
                    {t("Privacy Policy")}
                  </p>
                  <p className="text-sm text-gray-500 max-md:hidden truncate">
                    {t("View our privacy policy")}
                  </p>
                </div>
              </div>
              <span className="text-gray-400 shrink-0 ml-2">
                <CaretRight className="text-[#282828]" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {isLangModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl flex flex-col animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold text-[#282828] mb-4">
              {t("Select Language")}
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleLanguageChange("en")}
                className="p-3 rounded-lg border border-[#CECECE] hover:bg-[#43C17A26] hover:border-[#43C17A] cursor-pointer text-left transition-colors font-medium text-[#282828]"
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange("hi")}
                className="p-3 rounded-lg border border-[#CECECE] hover:bg-[#43C17A26] hover:border-[#43C17A] cursor-pointer text-left transition-colors font-medium text-[#282828]"
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => handleLanguageChange("te")}
                className="p-3 rounded-lg border border-[#CECECE] hover:bg-[#43C17A26] hover:border-[#43C17A] cursor-pointer text-left transition-colors font-medium text-[#282828]"
              >
                తెలుగు (Telugu)
              </button>
              <button
                onClick={() => handleLanguageChange("ur")}
                className="p-3 rounded-lg border border-[#CECECE] hover:bg-[#43C17A26] hover:border-[#43C17A] cursor-pointer text-left transition-colors font-medium text-[#282828]"
              >
                اردو (Urdu)
              </button>
            </div>

            <button
              onClick={() => setIsLangModalOpen(false)}
              className="mt-5 w-full p-2 text-gray-500 hover:text-[#282828] text-center font-medium cursor-pointer transition-colors"
            >
              {t("Cancel")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
