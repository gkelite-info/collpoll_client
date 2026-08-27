import AssignmentsLeft from "./left";
import AssignmentsRight from "./right";


export default function Assignments() {
    return (
        <>
            <div className="flex items-stretch justify-between">
                <AssignmentsLeft />
                <AssignmentsRight />
            </div>
        </>
    )
}
