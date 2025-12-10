"use client";

import { useEffect, useRef } from "react";

type presentPercentageProps = {
  presentPercentage: number;
};
export const AttendanceSummaryCard = ({
  presentPercentage,
}: presentPercentageProps) => {
  // Explicitly type the ref as HTMLCanvasElement
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Configuration
  const size = 300; // Full width of the canvas
  const height = size / 2 + 30; // Height is half width + padding
  const strokeWidth = 35; // Thickness of the gauge

  // Colors
  const presentColorStart = "#A1D683"; // Dark Green (Start of Gradient)
  const presentColorEnd = "#4ABF08"; // Light Green (End of Gradient)
  const absentColor = "#d3f7cd"; // Light Pale Green

  const textColorPrimary = "#1f2937"; // Gray-800
  const textColorSecondary = "#4b5563"; // Gray-600

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;

    // SAFETY: Reset transform to identity before scaling again to prevent
    // infinite "zoom" on re-renders in strict mode
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    canvas.width = size * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    canvas.style.width = `${size}px`;
    canvas.style.height = `${height}px`;

    // 1. Setup dimensions
    const centerX = size / 2;
    const centerY = size / 2 + 15; // Move center down; semi-circle sits on bottom
    const radius = (size - strokeWidth) / 2;

    ctx.clearRect(0, 0, size, height);

    // 2. Calculate Angles
    // Canvas: 0 = Right, PI = Left.
    // We draw Clockwise (false) from PI (Left) to 2*PI (Right) -> Top Half
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const totalSpan = Math.PI;

    // Calculate Split Point
    const absentFraction = (100 - presentPercentage) / 100; // 0.15
    const splitAngle = startAngle + absentFraction * totalSpan;

    // 3. Draw Arcs
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "butt"; // Flat ends for seamless joint in the middle

    // --- A: Absent Segment (Left) ---
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, splitAngle, false);
    ctx.strokeStyle = absentColor;
    ctx.stroke();

    // --- B: Present Segment (Right) with Gradient ---

    // Calculate coordinates for the gradient vector (Start of segment -> End of segment)
    const splitX = centerX + radius * Math.cos(splitAngle);
    const splitY = centerY + radius * Math.sin(splitAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    // Create Gradient from Split Point to End Point
    const gradient = ctx.createLinearGradient(splitX, splitY, endX, endY);
    gradient.addColorStop(0, presentColorStart); // #4ABF08
    gradient.addColorStop(1, presentColorEnd); // #A1D683

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, splitAngle, endAngle, false);
    ctx.strokeStyle = gradient;
    ctx.stroke();

    // 4. Draw Rounded Caps (Outer Ends Only)
    const capRadius = strokeWidth / 2;

    // Cap 1: Left Tip (Start of Gauge)
    // Matches the "Absent" color
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);

    ctx.beginPath();
    ctx.arc(startX, startY, capRadius, 0, 2 * Math.PI);
    ctx.fillStyle = absentColor;
    ctx.fill();

    // Cap 2: Right Tip (End of Gauge)
    // Matches the "Present" gradient end color
    // We use endX/endY calculated above
    ctx.beginPath();
    ctx.arc(endX, endY, capRadius, 0, 2 * Math.PI);
    ctx.fillStyle = presentColorEnd;
    ctx.fill();

    // 5. Draw Text Overlay
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 31px sans-serif";
    ctx.fillStyle = textColorPrimary;
    ctx.fillText(`${presentPercentage}%`, centerX, centerY - 50);

    ctx.font = "600 31px sans-serif";
    ctx.fillStyle = textColorSecondary;
    ctx.fillText("Attendance", centerX, centerY - 5);
  }, []); // Run once on mount

  return (
    <>
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900 self-start ">
        Attendance Summary
      </h2>

      {/* Canvas Wrapper */}
      <div className="relative flex justify-center w-full">
        <canvas ref={canvasRef} />
      </div>

      {/* Legend */}
      <div className="flex justify-center items-center gap-8 mt-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: absentColor }}
          ></span>
          <span className="text-gray-600 font-medium text-lg">Absent</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              background: `linear-gradient(to right, ${presentColorStart}, ${presentColorEnd})`,
            }}
          ></span>
          <span className="text-gray-600 font-medium text-lg">Present</span>
        </div>
      </div>
    </>
  );
};
