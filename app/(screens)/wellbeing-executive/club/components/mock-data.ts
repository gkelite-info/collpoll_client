export const clubInfo = {
    name: "Wellbeing & Mindful Club",
    logo: "/clubimage6.png",
    president: {
        name: "Alice Johnson",
        role: "President",
        avatar: "https://i.pravatar.cc/150?u=alice",
    },
    vicePresident: {
        name: "Bob Smith",
        role: "Vice President",
        avatar: "https://i.pravatar.cc/150?u=bob",
    },
    responsibleFaculty: {
        name: "Dr. Sarah Adams",
        role: "Responsible Faculty",
        avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    mentors: [
        {
            name: "Charlie Brown",
            id: "M1",
            avatar: "https://i.pravatar.cc/150?u=charlie",
        },
        {
            name: "Diana Prince",
            id: "M2",
            avatar: "https://i.pravatar.cc/150?u=diana",
        },
    ],
};

export const requestsData = Array.from({ length: 15 }).map((_, i) => ({
    id: `req-${i}`,
    name: `Student ${i + 1}`,
    studentId: `STU${1000 + i}`,
    avatar: `https://i.pravatar.cc/150?u=${i + 10}`,
    details: `B.Tech - ${i % 4 + 1}st Year • Requested ${i + 1} hours ago`,
    status: i % 3 === 0 ? "accepted" : i % 3 === 1 ? "pending" : "rejected",
}));

export const announcementsData = Array.from({ length: 6 }).map((_, i) => ({
    announcementId: i,
    createdAt: new Date(Date.now() - i * 3600000 * 24).toISOString(),
    authorRole: i % 2 === 0 ? "Responsible Faculty" : "President",
    message: i === 0
        ? "Mental Health Awareness workshop is scheduled for tomorrow at 10 AM. All members are requested to join."
        : "Yoga session this Saturday at 6 AM. Don't forget your yoga mats!",
    authorFacultyId: i % 2 === 0 ? 1 : null,
    authorStudent: i % 2 !== 0 ? { users: { fullName: "Alice Johnson", user_profile: { profileUrl: "https://i.pravatar.cc/150?u=alice" } } } : null,
    authorFaculty: i % 2 === 0 ? { users: { fullName: "Dr. Sarah Adams", user_profile: { profileUrl: "https://i.pravatar.cc/150?u=sarah" } } } : null,
}));
