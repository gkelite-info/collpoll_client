"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Trash, XCircle, WarningCircle } from "@phosphor-icons/react";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  title?: string;
  confirmText?: string;
  loadingText?: string;
  name?: string;
  itemName?: string;
  customDescription?: React.ReactNode;
  actionType?: "accept" | "reject" | "remove" | null;
}

export default function ConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
  isDeleting = false,
  title = "Delete",
  confirmText = "Yes, Delete",
  loadingText = "Processing...",
  name = "event",
  itemName,
  customDescription,
  actionType = "remove"
}: Props) {
  const isAccept = actionType === "accept";
  const isRemove = actionType === "remove";
  const isReject = actionType === "reject";
  const isDefault = !isAccept && !isRemove && !isReject;

  const IconComponent = isAccept ? CheckCircle : isRemove ? Trash : isReject ? XCircle : WarningCircle;

  // Modern Top-Banner Theming for ALL actions
  const theme = isAccept
    ? {
        banner: "bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600",
        icon: "text-emerald-500",
        btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25",
        lightGlow: "bg-emerald-400/20",
      }
    : isRemove
      ? {
          banner: "bg-gradient-to-br from-rose-400 via-red-500 to-rose-600",
          icon: "text-rose-500",
          btn: "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25",
          lightGlow: "bg-rose-400/20",
        }
      : isReject
        ? {
            banner: "bg-gradient-to-br from-indigo-400 via-violet-500 to-indigo-600",
            icon: "text-indigo-500",
            btn: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/25",
            lightGlow: "bg-indigo-400/20",
          }
        : {
            // Default Neutral/Primary theme (Used for EOD Finalization, etc.)
            banner: "bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600",
            icon: "text-emerald-500",
            btn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25",
            lightGlow: "bg-emerald-400/20",
          };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Subtle Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={!isDeleting ? onCancel : undefined}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.4 }}
            className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            {/* Top Banner Section */}
            <div className={`relative h-32 ${theme.banner} flex items-center justify-center`}>
              {/* Animated overlay pattern for futuristic feel */}
              <motion.div 
                animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-200 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" 
              />
              {/* Soft glow inside banner */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              {/* Floating Icon positioned on the edge */}
              <motion.div 
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1, bounce: 0.6 }}
                className="absolute -bottom-10 w-20 h-20 bg-white rounded-full p-1 shadow-xl flex items-center justify-center z-10"
              >
                <div className={`w-full h-full rounded-full flex items-center justify-center ${theme.lightGlow}`}>
                  <IconComponent size={36} weight="fill" className={theme.icon} />
                </div>
              </motion.div>
            </div>

            {/* Content Section */}
            <div className="pt-16 pb-8 px-8 flex flex-col items-center text-center bg-white relative z-0">
              <motion.h3 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-[22px] font-bold text-slate-900 tracking-tight mb-2"
              >
                {title} <span className="opacity-80">{name}?</span>
              </motion.h3>

              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-[15px] text-slate-500 mb-8 leading-relaxed font-medium"
              >
                {customDescription ? (
                  customDescription
                ) : actionType === "accept" ? (
                  <>
                    Confirm approval for <span className="font-bold text-slate-800">{name}</span>. They will be officially added to your active members list.
                  </>
                ) : actionType === "reject" ? (
                  <>
                    Confirm decline for <span className="font-bold text-slate-800">{name}</span>. This will clear them from your pending queue.
                  </>
                ) : (
                  <>
                    Are you sure you want to {title.toLowerCase()} <span className="font-bold text-slate-800">{name}</span>?
                    {actionType === "remove" && " This action is permanent and cannot be undone."}
                  </>
                )}
              </motion.p>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-[15px] text-slate-700 font-semibold bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className={`flex-1 flex relative items-center justify-center px-4 py-3 text-[15px] font-bold text-white rounded-2xl transition-all duration-300 disabled:opacity-70 cursor-pointer shadow-lg overflow-hidden group ${theme.btn}`}
                >
                  {isDeleting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{loadingText}</span>
                    </div>
                  ) : (
                    <span className="relative z-10 tracking-wide">{confirmText}</span>
                  )}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}