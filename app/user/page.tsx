import AttendanceLogs from "../components/hikvision/AttendanceLogs";
import UserList from "../components/hikvision/UserList";

export default function Page() {
    return (
        <>
            <UserList />
            <AttendanceLogs />
        </>
    )
}