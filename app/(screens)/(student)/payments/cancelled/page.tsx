"use client";

import { motion } from "framer-motion";
import { XCircle, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl border border-gray-100 rounded-2xl p-10 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <XCircle size={72} weight="fill" className="text-red-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-800 mb-2"
        >
          Payment Cancelled
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-6"
        >
          Your transaction was cancelled. No amount was charged.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-black text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            <ArrowLeft size={18} weight="bold" />
            Try Again
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
