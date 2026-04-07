"use client";
import { useEffect, useState } from "react";

interface AcsEvent {
    employeeNoString: string;
    name?: string;
    time: string;
    eventType?: string;
    cardNo?: string;
    doorNo?: number;
    minor?: number;
    major?: number;
    verifyNo?: number;
}

interface EventsResponse {
    AcsEvent: {
        searchID: string;
        totalMatches: number;
        responseStatusStrg: "OK" | "MORE" | "NO MATCH";
        numOfMatches: number;
        InfoList: AcsEvent[];
    };
}

function formatTime(isoString: string) {
    return new Date(isoString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function formatDate(isoString: string) {
    return new Date(isoString).toLocaleDateString("en-IN");
}

function getEventLabel(ev: AcsEvent) {
    if (ev.major === 5) {
        switch (ev.minor) {
            case 1:
                return "Door Closed";
            case 2:
                return "Door Opened";
            case 3:
                return "Door Forced Open";
            case 4:
                return "Door Held Open";
            case 5:
                return "Authentication Success";
            case 6:
                return "Authentication Failed";
            case 7:
                return "Door Locked";
            case 8:
                return "Door Unlocked";
            case 75:
                return ev.verifyNo === 4
                    ? "Authenticated via Face"
                    : "Authenticated";
            default:
                return `Access Event (${ev.minor})`;
        }
    }

    if (ev.major === 0 && ev.minor === 0) {
        return "Remote: Login";
    }

    return `Unknown (${ev.major}-${ev.minor})`;
}


export default function AttendanceLogs() {
    const [events, setEvents] = useState<AcsEvent[]>([]);
    const [totalMatches, setTotalMatches] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 50;

    const [startTime, setStartTime] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.toISOString().slice(0, 16);
    });
    const [endTime, setEndTime] = useState(() =>
        new Date().toISOString().slice(0, 16)
    );

    async function fetchEvents(position = 0) {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/hikvision/users/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    startTime: new Date(startTime).toISOString().slice(0, 19),
                    endTime: new Date(endTime).toISOString().slice(0, 19),
                    maxResults: PAGE_SIZE,
                    searchResultPosition: position,
                }),
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data: EventsResponse = await res.json();
            const acsEvent = data?.AcsEvent;

            if (!acsEvent) throw new Error("Unexpected response shape");

            setEvents(acsEvent.InfoList ?? []);
            setTotalMatches(acsEvent.totalMatches ?? 0);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEvents(page * PAGE_SIZE);
    }, [page]);

    const totalPages = Math.ceil(totalMatches / PAGE_SIZE);

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4 text-black">Attendance Logs</h2>

            <div className="flex flex-wrap gap-4 mb-4 items-end">
                <div>
                    <label className="block text-sm font-medium mb-1 text-black">From</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="border rounded px-2 py-1 text-sm text-black"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-black">To</label>
                    <input
                        type="datetime-local"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="border rounded px-2 py-1 text-sm text-black"
                    />
                </div>
                <button
                    onClick={() => { setPage(0); fetchEvents(0); }}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 cursor-pointer"
                >
                    Search
                </button>
            </div>

            {loading && <p className="text-gray-500">Loading events...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading && !error && (
                <>
                    <p className="text-sm text-gray-600 mb-2">
                        Showing {events.length} of {totalMatches} total events
                    </p>

                    {events.length === 0 ? (
                        <p className="text-gray-500">No events found for this period.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse text-black">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="border px-3 py-2">Employee ID</th>
                                        <th className="border px-3 py-2">Name</th>
                                        <th className="border px-3 py-2">Date</th>
                                        <th className="border px-3 py-2">Time</th>
                                        <th className="border px-3 py-2">Event</th>
                                        <th className="border px-3 py-2">Door</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((ev, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="border px-3 py-2">{ev.employeeNoString}</td>
                                            <td className="border px-3 py-2">{ev.name ?? "—"}</td>
                                            <td className="border px-3 py-2">{formatDate(ev.time)}</td>
                                            <td className="border px-3 py-2">{formatTime(ev.time)}</td>
                                            <td className="border px-3 py-2">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-medium ${getEventLabel(ev).includes("Authenticated")
                                                            ? "bg-green-100 text-green-700"
                                                            : getEventLabel(ev).includes("Unlocked")
                                                                ? "bg-blue-100 text-blue-700"
                                                                : getEventLabel(ev).includes("Locked")
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                        }`}
                                                >
                                                    {getEventLabel(ev)}
                                                </span>
                                            </td>
                                            <td className="border px-3 py-2">{ev.doorNo ?? "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex gap-2 mt-4 items-center text-black">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <span className="text-sm">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="px-3 py-1 border rounded text-sm disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}