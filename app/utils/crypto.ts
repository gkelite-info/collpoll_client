const SALT = "project_v1";

export const encodeId = (id: string | number): string => {
    const strId = String(id);
    const str = `${SALT}_${strId}`;
    return btoa(str).replace(/=/g, "");
};

export const decodeId = (encoded: string): string | null => {
    try {
        let base64 = encoded;
        while (base64.length % 4 !== 0) {
            base64 += "=";
        }

        const decoded = atob(base64);
        const parts = decoded.split("_");

        const id = parts[parts.length - 1];
        const salt = parts.slice(0, -1).join("_");

        if (salt !== "project_v1") return null;
        return id;
    } catch (e) {
        return null;
    }
};