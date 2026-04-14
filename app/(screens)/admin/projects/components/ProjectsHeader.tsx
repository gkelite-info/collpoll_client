"use client";

interface ProjectsHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ProjectsHeader({
  title = "Projects Overview",
  subtitle = "View project activity across all branches.",
}: ProjectsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-[#282828] font-semibold text-2xl mb-1">
        {title}
      </h1>

      <p
        className="text-[#282828] text-sm">
        {subtitle}
      </p>
    </div>
  );
}
