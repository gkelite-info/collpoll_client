"use client";

interface ProjectsHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function ProjectsHeader({
  title = "Projects Overview",
  subtitle = "View project activity across all departments.",
}: ProjectsHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-[#282828] font-semibold text-2xl mb-1">
        {title}
      </h1>

      <p
        className="text-[#282828]"
        style={{
          fontFamily: "Roboto",
          fontWeight: 400,
          fontSize: "18px",
          lineHeight: "100%",
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}
