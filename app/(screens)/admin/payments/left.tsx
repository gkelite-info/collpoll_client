'use client'
import Link from "next/link";
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
            studentId: (
                <Link
                    href="/admin/payments/1"
                    className="text-blue-600 hover:underline"
                >
                    1
                </Link >
            ),
            name: "Vamshi",
            branch: "EEE",
            year: "1st Year",
            section: "A",
            totalFee: "40000"
        },
        {
            serial: "2",
            studentId: (
                <Link
                    href="/admin/payments/2"
                    className="text-blue-600 hover:underline"
                >
                    2
                </Link>
            ),
            name: "Ananya",
            branch: "CSE",
            year: "2nd Year",
            section: "B",
            totalFee: "55000"
        },
        {
            serial: "3",
            studentId: (
                <Link
                    href="/admin/payments/3"
                    className="text-blue-600 hover:underline"
                >
                    3
                </Link>
            ),
            name: "Rahul",
            branch: "MECH",
            year: "3rd Year",
            section: "A",
            totalFee: "60000"
        },
        {
            serial: "4",
            studentId: (
                <Link
                    href="/admin/payments/4"
                    className="text-blue-600 hover:underline"
                >
                    4
                </Link>
            ),
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
                    <p className="text-[#282828] text-md">
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