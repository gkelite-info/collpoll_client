"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function PaymentSuccessfulPage() {
  useEffect(() => {
    // Fire multiple bursts for celebration effect
    const duration = 2500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
      });

      confetti({
        particleCount: 6,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="bg-white shadow-xl border border-gray-100 rounded-2xl p-10 max-w-md w-full text-center relative"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
          className="flex justify-center mb-4"
        >
          <CheckCircle size={80} weight="fill" className="text-emerald-500" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-800 mb-2"
        >
          Payment Successful 🎉
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-6"
        >
          Your fee payment has been completed successfully.
        </motion.p>

        {/* Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            <ArrowLeft size={18} weight="bold" />
            Back to Payments
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
