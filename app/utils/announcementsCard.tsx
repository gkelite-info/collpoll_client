type AnnounceCard = {
  image: string;
  imgHeight: string;
  title: string;
  professor: string;
  time: string;
  cardBg: string;
  imageBg: string;
};

type AnnouncementsCardProps = {
  announceCard: AnnounceCard[];
};

export default function AnnouncementsCard({
  announceCard,
}: AnnouncementsCardProps) {
  return (
    <div className="bg-white rounded-md flex flex-col mt-5 p-2 shadow-md h-full">
      <h4 className="text-[#282828] font-semibold mb-3 ml-1">Announcements</h4>

      <div className="flex flex-col gap-2 overflow-y-auto">
        {announceCard.map((card, index) => (
          <div
            key={index}
            className={`h-[75px] flex items-center rounded-lg p-2 gap-1`}
            style={{ backgroundColor: card.cardBg || "#E8F8EF" }}
          >
            <div
              className="h-[58px] w-[58px] rounded-md flex items-center justify-center"
              style={{ backgroundColor: card.imageBg || "#D3F1E0" }}
            >
              <img
                src={card.image || "/default.jpg"}
                alt={card.title}
                className={card.imgHeight}
              />
            </div>

            <div className="h-full w-[78%] rounded-md flex flex-col">
              <div className="h-[70%] px-1 overflow-y-auto">
                <p style={{ fontSize: 13, fontWeight: 600, color: "#282828" }}>
                  {card.title}
                </p>
              </div>
              <div className="h-[30%] flex items-center justify-between px-1">
                <p style={{ fontSize: 11, color: "#454545" }}>
                  {card.professor}
                </p>
                <p style={{ fontSize: 11, color: "#454545" }}>{card.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
