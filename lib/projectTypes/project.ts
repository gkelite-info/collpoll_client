export type ProjectCardProps = {
    title: string;
    description: string;
    duration: string;
    techStack: string;
    mentors: { name: string; image: string }[];
    teamMembers: { name: string; image: string }[];
    marks: number;
    fileUrls: string[];
};