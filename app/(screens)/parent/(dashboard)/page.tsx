import ParentLeft from "./left";
import ParentRight from "./right";

export default function ParentDashboard() {
    return (
        <>
            <div className="bg-red-00 flex justify-between h-auto pb-5 py-2">
                <ParentLeft />
                <ParentRight />
            </div>
        </>
    )
}