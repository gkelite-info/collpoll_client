import PlacementCard from "./PlacementCard";
import type { PlacementCompany } from "@/app/(screens)/placement/placements/components/mockData";

type PlacementListProps = {
    placements: PlacementCompany[];
    isLoading: boolean;
    cycle: string;
    onPlacementClick?: (placement: PlacementCompany) => void;
};

function getClosingText(endDate?: string) {
    if (!endDate) return "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const closingDate = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(closingDate.getTime())) return "";

    const dayDiff = Math.ceil(
        (closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (dayDiff < 0) return "Closed";
    if (dayDiff === 0) return "Closes today";
    if (dayDiff === 1) return "Closes in 1 day";

    return `Closes in ${dayDiff} days`;
}

function PlacementCardShimmer() {
    return (
        <div className="flex h-66.5 w-full flex-col overflow-hidden rounded-xl bg-white px-[25px] py-[23px]">
            <div className="flex items-start justify-between">
                <div className="flex min-w-0 gap-4">
                    <div className="h-16 w-28 shrink-0 animate-pulse rounded-lg bg-gray-200" />

                    <div className="min-w-0 space-y-3">
                        <div className="h-5 w-52 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />

                        <div className="flex gap-2 overflow-hidden">
                            {[0, 1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="h-6 w-24 shrink-0 animate-pulse rounded-full bg-gray-100"
                                />
                            ))}
                        </div>

                        <div className="space-y-2 pt-1">
                            <div className="h-3 w-[520px] max-w-full animate-pulse rounded bg-gray-100" />
                            <div className="h-3 w-[420px] max-w-full animate-pulse rounded bg-gray-100" />
                        </div>

                        <div className="flex gap-3 pt-2 overflow-hidden">
                            {[0, 1, 2, 3].map((item) => (
                                <div
                                    key={item}
                                    className="h-7 w-28 shrink-0 animate-pulse rounded-full bg-gray-100"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-8 w-24 shrink-0 animate-pulse rounded-lg bg-gray-100" />
            </div>
        </div>
    );
}

function PlacementListShimmer() {
    return (
        <div className="flex flex-col gap-4">
            {[0, 1, 2].map((item) => (
                <PlacementCardShimmer key={item} />
            ))}
        </div>
    );
}

export default function PlacementList({
    placements,
    isLoading,
    cycle,
    onPlacementClick,
}: PlacementListProps) {
    if (isLoading) {
        return <PlacementListShimmer />;
    }

    if (placements.length === 0) {
        return (
            <p className="py-16 text-center text-sm text-gray-500">
                No placement drives found{cycle ? ` for ${cycle}` : ""}.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {placements.map((placement) => (
                <PlacementCard
                    key={placement.id}
                    logo={placement.logo}
                    company={placement.name}
                    role={placement.role}
                    skills={placement.skills}
                    description={placement.description}
                    tags={placement.tags}
                    status={placement.isExpired ? "Completed" : "Open"}
                    closingText={getClosingText(placement.endDate)}
                    onClick={() => onPlacementClick?.(placement)}
                />
            ))}
        </div>
    );
}
