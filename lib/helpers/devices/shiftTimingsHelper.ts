import { adminSupabase } from "@/lib/helpers/devices/scanIngestionHelper";

interface CollegeTiming {
    isOpen: boolean;
    openAt: string | null;
    closeAt: string | null;
    lunchFrom: string | null;
    lunchTo: string | null;
    breaks: { startTime: string; endTime: string }[];
}

// In-memory cache: Map<collegeId_dayOfWeek, { data, expiresAt }>
const timingsCache = new Map<string, { data: CollegeTiming | null; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 mins

export const parseTimeToMins = (timeStr: string | null): number => {
    if (!timeStr) return 0;
    
    // Check if 24hr format (e.g. "14:30" or "09:15")
    if (!timeStr.includes("AM") && !timeStr.includes("PM") && timeStr.includes(":")) {
        const [h, m] = timeStr.split(":").map(Number);
        return (h * 60) + (m || 0);
    }
    
    // Check if 12hr format
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    
    return h * 60 + m;
};

export const getShiftTimings = async (collegeId: number, dateString: string): Promise<CollegeTiming | null> => {
    try {
        const dateObj = new Date(dateString);
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayOfWeek = days[dateObj.getDay()];
        
        const cacheKey = `${collegeId}_${dayOfWeek}`;
        const now = Date.now();
        
        const cached = timingsCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            return cached.data;
        }

        const { data, error } = await adminSupabase
            .from("college_timings")
            .select(`
                isOpen, openAt, closeAt, lunchFrom, lunchTo,
                collegeTimingId
            `)
            .eq("collegeId", collegeId)
            .eq("dayOfWeek", dayOfWeek)
            .eq("is_deleted", false)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            timingsCache.set(cacheKey, { data: null, expiresAt: now + CACHE_TTL_MS });
            return null;
        }

        let breaks: { startTime: string; endTime: string }[] = [];
        
        if (data.collegeTimingId) {
            const { data: breakData, error: breakErr } = await adminSupabase
                .from("college_break_timings")
                .select("startTime, endTime")
                .eq("collegeTimingId", data.collegeTimingId)
                .eq("is_deleted", false);
                
            if (!breakErr && breakData) {
                breaks = breakData;
            }
        }
        
        // Include lunch as a break if configured
        if (data.lunchFrom && data.lunchTo) {
            breaks.push({ startTime: data.lunchFrom, endTime: data.lunchTo });
        }

        const timingData: CollegeTiming = {
            isOpen: data.isOpen,
            openAt: data.openAt,
            closeAt: data.closeAt,
            lunchFrom: data.lunchFrom,
            lunchTo: data.lunchTo,
            breaks,
        };

        timingsCache.set(cacheKey, { data: timingData, expiresAt: now + CACHE_TTL_MS });
        
        return timingData;
    } catch (e) {
        console.error("Error fetching shift timings:", e);
        return null;
    }
};

export const calculateEffectiveShiftMinutes = (timing: CollegeTiming): number => {
    if (!timing || !timing.isOpen || !timing.openAt || !timing.closeAt) {
        return 0;
    }
    
    const openMins = parseTimeToMins(timing.openAt);
    const closeMins = parseTimeToMins(timing.closeAt);
    
    let grossMins = closeMins - openMins;
    if (grossMins < 0) {
        // Cross-midnight shift (e.g. 22:00 to 06:00)
        grossMins += (24 * 60);
    }
    
    let totalBreakMins = 0;
    if (timing.breaks && timing.breaks.length > 0) {
        for (const b of timing.breaks) {
            const bStart = parseTimeToMins(b.startTime);
            const bEnd = parseTimeToMins(b.endTime);
            let bDuration = bEnd - bStart;
            if (bDuration < 0) bDuration += (24 * 60);
            totalBreakMins += bDuration;
        }
    }
    
    return Math.max(0, grossMins - totalBreakMins);
};
