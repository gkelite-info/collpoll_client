export const clubInfo = {
    name: "All Stars Sports Club",
    president: { name: "Rohith Sharma", role: "President" },
    vicePresident: { name: "Ayan Reddy", role: "Vice President" },
    mentors: [
        { name: "Ananya", id: "1" },
        { name: "Arav", id: "2" },
        { name: "Sharmila", id: "3" },
        { name: "Poojith", id: "4" },
    ]
};

export const requestsData = Array.from({ length: 8 }).map((_, i) => ({
    id: `req-${i}`,
    name: "Ananya Sharma",
    details: "CSE - 2nd Year • Requested 1 hour ago",
    status: i % 3 === 0 ? "accepted" : "pending",
}));

export const announcementsData = Array.from({ length: 6 }).map((_, i) => ({
    id: `ann-${i}`,
    time: "11:05",
    author: "Rohith Sharma",
    role: "President",
    avatar: `https://i.pravatar.cc/150?u=${i + 20}`,
    message:
        i === 0
            ? "Practice session scheduled today at 5 PM on the main ground. Please report 10 minutes early for warm-up."
            : "Inter-college football match this Saturday at 4 PM. Selected players must report by 3 PM without fail.",
}));