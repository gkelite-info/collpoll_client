import { Avatar } from "@/app/utils/Avatar";

export default function ExecutiveAvatar({
  src,
  alt,
  size = 44,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return <Avatar src={src || null} alt={alt} size={size} />;
}
