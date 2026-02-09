import TableComponent from "@/app/utils/table/table";
import Filters from "./filters";

export default function Left() {
    const columns = [
        { title: "S.No", key: "serial" },
        { title: "Student ID", key: "studentId" },
        { title: "Name", key: "name" },
        { title: "Branch", key: "branch" },
        { title: "Year", key: "year" },
        { title: "Section", key: "section" },
        { title: "Total Fee", key: "totalFee" }
    ];

    const tableData = [
        {
            serial: "1",
            studentId: "1",
            name: "Vamshi",
            branch: "EEE",
            year: "1st Year",
            section: "A",
            totalFee: "40000"
        },
        {
            serial: "2",
            studentId: "2",
            name: "Ananya",
            branch: "CSE",
            year: "2nd Year",
            section: "B",
            totalFee: "55000"
        },
        {
            serial: "3",
            studentId: "3",
            name: "Rahul",
            branch: "MECH",
            year: "3rd Year",
            section: "A",
            totalFee: "60000"
        },
        {
            serial: "4",
            studentId: "4",
            name: "Sneha",
            branch: "ECE",
            year: "1st Year",
            section: "C",
            totalFee: "45000"
        }

    ];

    return (
        <>
            <div className="w-[68%] p-2 flex flex-col">
                <div className="mb-4">
                    <h1 className="text-[#282828] font-bold text-2xl mb-1">Payments Management</h1>
                    <p className="text-[#282828]">
                        View and manage student fee payments across departments and batches.
                    </p>
                </div>
                <Filters />
                <div className="lg:mt-5">
                    <TableComponent
                        columns={columns}
                        tableData={tableData}
                    />
                </div>
            </div>
        </>
    )
}