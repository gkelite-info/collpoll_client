import Image from "next/image";

export function AiBotCard({ response }: { response: string }) {
  return (
    <div className="relative overflow-hidden flex items-center bg-gradient-to-r from-[#E5D4FF] to-[#D5BFFF] p-4 md:p-5 rounded-2xl shadow-sm w-full h-full min-h-[100px] border border-[#D5BFFF]/30">
      <div className="shrink-0 mr-3 md:mr-4">
        <Image
          src="/bot.png"
          alt="AI Bot"
          width={60}
          height={60}
          className="h-12 w-12 md:h-[60px] md:w-[60px] object-contain"
        />
      </div>
      <p className="text-[#321F64] font-medium text-[13px] md:text-[15px] leading-relaxed line-clamp-3 md:line-clamp-none overflow-hidden">
        {response}
      </p>
    </div>
  );
}

export default AiBotCard;
