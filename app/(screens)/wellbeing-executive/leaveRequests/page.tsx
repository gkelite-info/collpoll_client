import WellbeingExecutiveRight from "../components/WellbeingExecutiveRight";
import WellbeingLeavesLeft from "./left";

export default function LeaveRequests() {
    return (
        <div className="flex items-start justify-between h-full w-full">
            <div className="w-[100%] lg:w-[68%]">
                <WellbeingLeavesLeft />
            </div>
            <WellbeingExecutiveRight />
        </div>
    );
}