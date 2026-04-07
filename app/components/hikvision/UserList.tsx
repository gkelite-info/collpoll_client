"use client";

import { useEffect, useState } from "react";

type UserInfo = {
    employeeNo: string;
    name: string;
    userType: string;
    Valid?: {
        enable: boolean;
        beginTime: string;
        endTime: string;
    };
};

type ApiResponse = {
    UserInfoSearch?: {
        searchID: string;
        responseStatusStrg: string;
        numOfMatches: number;
        totalMatches: number;
        UserInfo?: UserInfo[];
    };
    // Hikvision error fields
    errorMsg?: string;
    statusString?: string;
};

export default function UserList() {
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        
        async function fetchUsers() {
            try {
                const res = await fetch("/api/hikvision/users", {
                    method: "POST",
                });

                const result: ApiResponse = await res.json();
                console.log("Data from local API:", result);

                if (!res.ok) {
                    throw new Error(result.errorMsg || result.statusString || "Failed to fetch");
                }

                setData(result);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    if (loading) return <p>Loading users...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

    const users = data?.UserInfoSearch?.UserInfo ?? [];
    const total = data?.UserInfoSearch?.totalMatches ?? 0;

    console.log("What is users ramu", users);
    console.log("What is total ramu", total);
    
    
    return (
        <div style={{ padding: "20px" }}>
            <h2 className="text-black">Hikvision Users ({total} total)</h2>
            {users.length === 0 ? (
                <p className="text-black">No users found or search returned empty.</p>
            ) : (
                <table border={1} cellPadding={8} style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", color:"black" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f4f4f4" }}>
                            <th>Employee No</th>
                            <th>Name</th>
                            <th>User Type</th>
                            <th>Valid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.employeeNo}>
                                <td>{user.employeeNo}</td>
                                <td>{user.name}</td>
                                <td>{user.userType}</td>
                                <td>{user.Valid?.enable ? "✅ Yes" : "❌ No"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}