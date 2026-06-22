import { Package } from "@phosphor-icons/react";

export function EquipmentThumb({ image, name }: { image: string | null; name: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#EEF3F8] text-[#94A3B8]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <Package size={20} weight="fill" />
      )}
    </span>
  );
}
