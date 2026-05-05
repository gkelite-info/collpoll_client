"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BellSimple } from "@phosphor-icons/react";
import { useUser } from "@/app/utils/context/UserContext";
import {
  getUserNotifications,
  markNotificationRead,
} from "@/lib/helpers/notifications/notificationAPI";
import { useTranslations } from "next-intl";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function NotificationsModal({ isOpen, onClose }: Props) {
  const { userId } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Notifications"); // Initialize hook

  useEffect(() => {
    async function loadNotifications() {
      if (!isOpen || !userId) return;
      setIsLoading(true);
      const data = await getUserNotifications(userId);
      setNotifications(data);
      setIsLoading(false);
    }
    loadNotifications();
  }, [isOpen, userId]);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notif.notificationId
            ? { ...n, isRead: true }
            : n,
        ),
      );

      await markNotificationRead(notif.notificationId);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[3px]"
      />

      <div className="fixed md:bottom-10 md:right-10 lg:bottom-10 lg:right-10 z-[1000] top-12 md:top-15 lg:top-20 translate-x-6 w-[328px] lg:w-[400px] bg-white rounded-md border border-[#E5E7EB] shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <BellSimple size={25} weight="fill" color="#43C17A" />
            <h2 className="text-[16px] font-semibold text-[#282828]">
              {t("Notifications")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
          >
            <X size={18} className="text-[#6B7280]" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
          {isLoading ? (
            <div className="p-5 text-center text-sm text-gray-500">
              {t("Loading notifications")}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-5 text-center text-sm text-gray-500">
              {t("No notifications")}
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.notificationId}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${notif.isRead ? "bg-white hover:bg-gray-50" : "bg-green-50 hover:bg-green-100 border border-green-100"}`}
              >
                <div className="flex justify-between items-start">
                  <h3
                    className={`text-sm ${notif.isRead ? "text-gray-800 font-medium" : "text-green-900 font-semibold"}`}
                  >
                    {notif.title}
                  </h3>
                  <span className="text-[10px] text-gray-500 shrink-0 mt-0.5">
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 ${notif.isRead ? "text-gray-500" : "text-gray-700"}`}
                >
                  {notif.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </Portal>
  );
}
