import Image from "next/image";

export default function ExecutiveAvatar({
  src,
  alt,
  size = 44,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <span
      className="relative block shrink-0 overflow-hidden rounded-full bg-gray-100"
      style={{ height: size, width: size }}
    >
      <Image
        src={src}
        alt={alt}
        height={size}
        width={size}
        className="object-cover"
      />
    </span>
  );
}
