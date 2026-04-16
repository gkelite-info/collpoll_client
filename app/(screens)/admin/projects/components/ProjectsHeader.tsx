"use client";

import { CaretLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";

interface ProjectsHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  onBackClick?: () => void;
}

export default function ProjectsHeader({
  title = "Projects Overview",
  subtitle = "View project activity across all branches.",
  showBack = false,
  backTo,
  onBackClick,
}: ProjectsHeaderProps) {
  const router = useRouter();

  const handleBackAction = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backTo) {
      router.push(backTo);
    } else {
      router.back();
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        {showBack && (
          <CaretLeft
            size={22}
            weight="bold"
            className="text-[#282828] cursor-pointer hover:opacity-70"
            onClick={handleBackAction}
          />
        )}

        <h1 className="text-[#282828] font-semibold text-2xl">
          {title}
        </h1>
      </div>

      <p className="text-[#282828] text-sm">
        {subtitle}
      </p>
    </div>
  );
}