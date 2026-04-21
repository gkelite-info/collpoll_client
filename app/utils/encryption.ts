import Sqids from 'sqids';

const sqids = new Sqids({
    minLength: 10,
});

export const encryptId = (id: string | number): string => {
    if (!id) return "";
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    
    if (isNaN(numericId)) return "";
    return sqids.encode([numericId]);
};

export const decryptId = (encryptedId: string): string | null => {
    if (!encryptedId) return null;
    try {
        const decoded = sqids.decode(encryptedId);
        if (decoded.length === 0) return null;
        return decoded[0].toString();
    } catch (error) {
        console.error("Invalid encrypted ID format", error);
        return null;
    }
};