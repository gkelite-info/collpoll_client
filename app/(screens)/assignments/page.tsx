import AssignmentsLeft from "./left";
import AssignmentsRight from "./right";


export default function Assignments() {
    return (
        <>
            <div className="flex items-start justify-between">
                <AssignmentsLeft />
                <AssignmentsRight />
            </div>
        </>
    )
}