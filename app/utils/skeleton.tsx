"use client";

import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export default function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200";

  const variants = {
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  const styles: React.CSSProperties = {
    width: width,
    height: height,
    ...style,
  };

  return <div className={classes} style={styles} {...props} />;
}
