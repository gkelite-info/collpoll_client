import Image from "next/image";

function AiBotCard({ response }: { response: string }) {
  return (
    <div className="relative overflow-hidden flex flex-col bg-gradient-to-br from-[#FBF5FD] to-[#CBB1FF] h-full px-4 rounded-2xl justify-center items-center">
      <div>
        <Image
          src="/bot.png"
          alt=""
          width={112}
          height={112}
          className="h-28 w-28 ml-4 mb-3 object-contain"
        />
      </div>
      <p className="text-[#251655] text-center px-1">{response}</p>
    </div>
  );
}

export default AiBotCard;
