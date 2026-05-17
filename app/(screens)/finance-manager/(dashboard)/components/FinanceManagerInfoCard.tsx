"use client";

import Image from "next/image";

type FinanceManagerInfoCardProps = {
  fullName?: string | null;
  todayCollection?: number;
  image?: string;
};

export default function FinanceManagerInfoCard({
  fullName,
  todayCollection = 245000,
  image,
}: FinanceManagerInfoCardProps) {
  const bgBanner = "/dashboard-banner-bg.png";

  return (
    <div
      className="w-full relative rounded-2xl h-[170px] shadow-sm"
      style={{
        backgroundImage: `url(${bgBanner})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 flex h-full items-center px-8">
        <div className="bg-blue-00 flex flex-col max-w-[65%] gap-2">
          <p className="text-lg text-[#282828] leading-tight mt-3">
            Welcome Back, {""}
            <span className="text-lg font-semibold text-[#089144] leading-tight">
              {fullName || "Finance Manager"}
            </span>
          </p>

          <p className="text-md text-[#454545] mt-0">
            Here’s a summary of fee collections & student payments
          </p>

          <p className="text-md text-[#454545] mt-0 font-medium">
            Today’s Collections,
            <span className="text-[#089144] font-bold">
              {` ₹${todayCollection.toLocaleString("en-IN")}`}
            </span>
            {" collected so far."}
          </p>
        </div>

        {image && (
          <div className="absolute md:-right-3 lg:right-10 bottom-0 h-[105%] w-[180px]">
            <Image
              src={image}
              alt="Finance manager"
              fill
              className="object-contain object-bottom pointer-events-none"
              priority
            />
          </div>
        )}
      </div>

      <svg
        className="absolute right-0 bottom-0 z-0 h-full w-auto"
        width="186"
        height="170"
        viewBox="0 0 186 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M173.532 0C180.146 0 185.512 5.35094 185.532 11.9644L185.955 154.896C185.98 163.197 179.257 169.94 170.955 169.94H51.5453C46.2115 169.775 40.1483 169.848 34.1023 169.92C7.43518 170.24 -18.9265 170.556 18.8128 150.447C28.6823 144.861 52.2795 137.844 67.7118 154.469C74.142 158.938 101.032 145.673 130.82 112.96C139.793 102.681 157.737 73.8116 157.737 40.5622C156.99 31.1773 155.943 10.7256 157.737 0H171.9H173.532Z"
          fill="#BCE6D0"
        />
      </svg>
    </div>
  );
}
