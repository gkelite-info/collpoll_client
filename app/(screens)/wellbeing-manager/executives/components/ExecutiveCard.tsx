"use client";

import Image from "next/image";

export type ExecutiveCardProps = {
  name: string;
  email: string;
  category: string;
  image: string;
};

export default function ExecutiveCard({
  name,
  email,
  category,
  image,
}: ExecutiveCardProps) {
  return (
    <article className="flex min-h-[220px] flex-col items-center justify-center rounded-[8px] bg-white px-5 py-6 text-center shadow-[0_1px_12px_rgba(15,23,42,0.05)] sm:min-h-[190px] lg:min-h-[176px] xl:min-h-[196px]">
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-black/5 sm:h-[70px] sm:w-[70px] lg:h-[64px] lg:w-[64px] xl:h-[72px] xl:w-[72px]">
        <Image
          src={image}
          alt={name}
          fill
          sizes="72px"
          className="!h-full !w-full object-cover"
        />
      </div>
      <div className="mt-4 flex w-full min-w-0 flex-col items-center gap-1.5">
        <h2 className="max-w-full truncate text-[18px] font-bold leading-[1.25] text-[#282828] sm:text-[17px] lg:text-[16px] xl:text-[18px]">
          {name}
        </h2>
        <p className="max-w-full truncate text-[14px] font-medium leading-[1.35] text-[#5E5E5E] sm:text-[14px]">
          {email}
        </p>
      </div>
      <span className="mt-3 max-w-full shrink-0 truncate rounded-full bg-[#16284F] px-4 py-1.5 text-[12px] font-bold leading-none text-white">
        {category}
      </span>
    </article>
  );
}
