import WellbeingExecutiveRight from "../components/WellbeingExecutiveRight";
import WellbeingLeavesLeft from "./left";

export default function LeaveRequests() {
    return (
        <main className="flex flex-col lg:flex-row w-full min-h-screen pb-5">
            <div className="w-[100%] lg:w-[68%]">
                <WellbeingLeavesLeft enableTaggedView />
            </div>
            <WellbeingExecutiveRight />
        </main>
    );
}
