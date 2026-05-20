"use client";

import { CurrencyInr, Money } from "@phosphor-icons/react";
import { Bank } from "@phosphor-icons/react/dist/ssr";
import { FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type FeeDueCardProps = {
  totalFee: string;
  feePaid: string;
};

export default function FeeDueCard({ totalFee, feePaid }: FeeDueCardProps) {
  const router = useRouter();
  const t = useTranslations("Dashboard.parent");

  return (
    <div className="relative overflow-hidden bg-white w-full lg:w-[32%] h-[180px] lg:h-[220px] shadow-md rounded-lg p-2.5 flex flex-col justify-between lg:pb-4">
      <div className="bg-red-00 w-full lg:w-[62%] flex items-center justify-start lg:justify-between gap-2">
        <div className="bg-[#E1F4E8] p-1.5 lg:p-2 rounded-lg shrink-0">
          <Bank
            className="w-4 h-4 lg:w-[22px] lg:h-[22px]"
            weight="fill"
            color="#47CE68"
          />
        </div>
        <h5 className="text-[#282828] text-[13px] lg:text-base font-semibold truncate">
          {t("Fee Due")}
        </h5>
      </div>

      <div className="bg-green-00 mt-2 flex flex-col flex-1 justify-end h-auto gap-2">
        <div className="flex justify-between gap-2 h-full lg:h-auto">
          {/* Total Fee Inner Box */}
          <div className="bg-gradient-to-b from-[#FFEDD9] to-[#FFBB70] h-full lg:h-[90.31px] w-full lg:w-[101.1px] rounded-lg p-2 flex flex-col justify-between flex-1 min-w-0">
            <div className="bg-white rounded-lg h-6 w-6 lg:h-8 lg:w-8 flex items-center justify-center shrink-0 mb-1 lg:mb-0">
              <Money
                className="w-[14px] h-[14px] lg:w-[22px] lg:h-[22px]"
                weight="fill"
                color="#FFBB70"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] lg:text-xs text-white truncate">
                {t("Total Fee")}
              </p>
              <div className="flex items-center -ml-0.5">
                <CurrencyInr
                  className="w-[12px] h-[12px] lg:w-[15px] lg:h-[15px] shrink-0"
                  color="white"
                />
                <span className="text-white font-extrabold text-xs lg:text-sm truncate">
                  {totalFee}
                </span>
              </div>
            </div>
          </div>

          {/* Fee Paid Inner Box */}
          <div className="bg-gradient-to-b from-[#CEE6FF] to-[#61AEFF] h-full lg:h-[90.31px] w-full lg:w-[101.1px] rounded-lg p-2 flex flex-col justify-between flex-1 min-w-0">
            <div className="bg-white rounded-lg h-6 w-6 lg:h-8 lg:w-8 flex items-center justify-center shrink-0 mb-1 lg:mb-0">
              <Money
                className="w-[14px] h-[14px] lg:w-[22px] lg:h-[22px]"
                weight="fill"
                color="#61AEFF"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] lg:text-xs text-white truncate">
                {t("Fee Paid")}
              </p>
              <div className="flex items-center -ml-0.5">
                <CurrencyInr
                  className="w-[12px] h-[12px] lg:w-[15px] lg:h-[15px] shrink-0"
                  color="white"
                />
                <span className="text-white font-extrabold text-xs lg:text-sm truncate">
                  {feePaid}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => router.push(`/parent/payments`)}
          className="bg-[#A2D784] mt-auto lg:mt-2 h-8 lg:h-[42px] rounded-full flex items-center justify-between p-1.5 lg:p-2 cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="bg-red-00 w-[75%] lg:w-[65%] h-full rounded-full flex items-center justify-center lg:justify-end pl-1 lg:pl-0">
            <h5 className="text-white font-semibold text-[11px] lg:text-md uppercase lg:normal-case tracking-wide lg:tracking-normal">
              {t("Pay Now")}
            </h5>
          </div>
          <div className="bg-white rounded-full h-5 w-5 lg:h-8 lg:w-8 flex items-center justify-center shrink-0">
            <FaChevronRight className="w-2.5 h-2.5 lg:w-[14px] lg:h-[14px] text-[#A2D784]" />
          </div>
        </div>
      </div>
    </div>
  );
}
