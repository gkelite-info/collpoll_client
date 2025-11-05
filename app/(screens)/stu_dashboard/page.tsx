import StuDashLeft from "./left"
import StuDashRight from "./right"



export default function StuDashboard() {
    return (
        <>
            <div className="flex items-start justify-start">
                <StuDashLeft />
                <StuDashRight />
            </div>
        </>
    )
}