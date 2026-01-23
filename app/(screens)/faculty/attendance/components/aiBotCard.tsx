function AiBotCard({ response }: { response: string }) {
  return (
    <div className="flex flex-col bg-gradient-to-br from-[#FBF5FD] to-[#CBB1FF] h-full px-4 rounded-2xl justify-center items-center">
      <div>
        <img src="/bot.png" className="h-28 ml-4 mb-3" />
      </div>
      <p className="text-[#251655] text-center px-1">{response}</p>
    </div>
  );
}

export default AiBotCard;
