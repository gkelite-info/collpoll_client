import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
}

export const Avatar = ({ src, alt, size = 56 }: AvatarProps) => {
  const [error, setError] = useState(false);

  const isValid = src && !error && (
    src.startsWith("http") ||
    src.startsWith("data:") ||
    src.startsWith("blob:")
  );

  if (!isValid) {
    return (
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center text-gray-400"
        style={{ width: size, height: size }}
      >
        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-full overflow-hidden border border-gray-200 flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        // width={size}
        // height={size}
        sizes={`${size}px`}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
};