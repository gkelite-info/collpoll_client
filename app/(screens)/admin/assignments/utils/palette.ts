export const PALETTES = [
    { text: "#43C17A", color: "#43C17A", bgColor: "#E5F6ED" },
    { text: "#4A90E2", color: "#4A90E2", bgColor: "#EBF3FF" },
    { text: "#F5A623", color: "#F5A623", bgColor: "#FFF4E5" },
    { text: "#9013FE", color: "#9013FE", bgColor: "#F5E8FF" },
    { text: "#E91E63", color: "#E91E63", bgColor: "#FCE4EC" },
    { text: "#009688", color: "#009688", bgColor: "#E0F2F1" },
    { text: "#FF5722", color: "#FF5722", bgColor: "#FBE9E7" },
    { text: "#607D8B", color: "#607D8B", bgColor: "#F0F4F8" },
];

export const getBranchTheme = (name: string = "") => {
    if (!name) return PALETTES[0];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % PALETTES.length;
    return PALETTES[index];
};

export const getCoursePrefix = (deptName: string = "") => {
    const name = deptName.toUpperCase();
    const interGroups = ["MPC", "BIPC", "CEC", "HEC", "MEC"];
    const degreeGroups = ["B.SC", "B.COM", "B.A", "BBA", "BCA"];

    if (interGroups.includes(name)) return "Inter";
    if (degreeGroups.includes(name)) return "Degree";
    return "B.Tech";
};