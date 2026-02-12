"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
// Create an array of colors matching the image
const colors = [
  "#FFC107",
  "#FF5722",
  "#4CAF50",
  "#2196F3",
  "#9C27B0",
  "#E91E63",
];

// Helper function for random numbers
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Individual Confetti Piece (Ribbon or Particle)
const ConfettiPiece = ({ i }: { i: number }) => {
  const isRibbon = Math.random() < 0.35; // 35% chance of being a ribbon
  const color = colors[Math.floor(random(0, colors.length))];
  const left = random(0, 100); // Start position horizontally %
  const duration = random(2.5, 4); // Duration of fall
  const delay = random(0, 0.4); // Initial delay

  if (isRibbon) {
    // S-shaped Ribbon
    return (
      <motion.svg
        className="absolute pointer-events-none"
        style={{ left: `${left}%`, top: "-15%" }}
        width="40"
        height="80"
        viewBox="0 0 40 80"
        fill="none"
        initial={{ y: 0, opacity: 0 }}
        animate={{
          y: [0, 500], // Fall down out of view
          x: random(-100, 100), // Drift left/right
          rotate: random(-180, 180), // Spin
          opacity: [1, 1, 0], // Fade out at the very end
        }}
        transition={{ duration, delay, ease: "easeOut" }}
      >
        <path
          d="M20 5 C 20 5, 5 25, 20 45 C 35 65, 20 75, 20 75"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </motion.svg>
    );
  } else {
    // Small rectangular particle
    const size = random(6, 10);
    return (
      <motion.div
        className="absolute pointer-events-none rounded-[1px]"
        style={{
          backgroundColor: color,
          width: size,
          height: size,
          left: `${left}%`,
          top: "-10%",
        }}
        initial={{ y: 0, rotate: 0 }}
        animate={{
          y: 600, // Fall further down
          x: random(-150, 150),
          rotate: random(360, 1080), // Fast spin
          scale: [1, random(0.6, 0.8)],
          opacity: [1, 1, 0],
        }}
        transition={{ duration, delay, ease: "easeOut" }}
      />
    );
  }
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: {
    amount: string;
    payerName: string;
    newPending: string;
  };
}

export const PaymentSuccessModal = ({ isOpen, onClose, data }: Props) => {
  const pieces = Array.from({ length: 80 }, (_, i) => i);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative bg-white rounded-2xl p-8 w-full max-w-[400px] text-center shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            <div className="absolute inset-0 pointer-events-none">
              {pieces.map((i) => (
                <ConfettiPiece key={i} i={i} />
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors z-20"
            >
              <X weight="bold" size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center">
              <motion.div
                className="w-20 h-20 bg-[#34D399] rounded-full flex items-center justify-center mb-5 shadow-lg shadow-green-500/20"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 200,
                  delay: 0.1,
                }}
              >
                <CheckIcon className="w-10 h-10 text-white drop-shadow-sm" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
                  Payment Recorded Successfull
                </h2>
                <p className="text-gray-700 text-base font-medium mb-1.5">
                  <span className="text-[#34D399] font-extrabold">
                    ₹{data.amount}
                  </span>{" "}
                  received from {data.payerName}
                </p>
                <p className="text-gray-500 text-sm font-medium">
                  New pending amount{" "}
                  <span className="text-gray-900 font-bold">
                    ₹{data.newPending}
                  </span>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
