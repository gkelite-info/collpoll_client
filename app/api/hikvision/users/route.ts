
import { NextResponse } from "next/server";
import DigestFetch from "digest-fetch";

export async function POST() {
    const host = "http://192.168.31.170";
    const username = "admin";
    const password = "7093256562shiva";

    const url = `${host}/ISAPI/AccessControl/UserInfo/Search?format=json`;

    const body = JSON.stringify({
        UserInfoSearchCond: {
            searchID: "1",
            searchResultPosition: 0,
            maxResults: 50,
        },
    });

    try {
        const client = new DigestFetch(username, password);

        const response = await client.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: body,
        });

        const text = await response.text();
        console.log("Raw response from device:", text);

        let result;
        try {
            result = JSON.parse(text);
        } catch {
            return NextResponse.json(
                { error: "Device returned non-JSON response", raw: text },
                { status: 500 }
            );
        }

        console.log("Parsed result:", JSON.stringify(result, null, 2));

        if (result?.ResponseStatus || result?.statusCode) {
            return NextResponse.json({
                error: "Device rejected the request",
                statusCode: result?.statusCode || result?.ResponseStatus?.statusCode,
                statusString: result?.statusString || result?.ResponseStatus?.statusString,
                subStatusCode: result?.subStatusCode || result?.ResponseStatus?.subStatusCode,
            }, { status: 500 });
        }

        const search = result?.UserInfoSearch;

        if (!search) {
            return NextResponse.json(
                { error: "Unexpected response structure", raw: result },
                { status: 500 }
            );
        }

        let users = search?.UserInfo ?? [];
        if (!Array.isArray(users)) {
            users = [users];
        }

        const formattedData = {
            UserInfoSearch: {
                totalMatches: parseInt(search?.totalMatches || "0"),
                numOfMatches: parseInt(search?.numOfMatches || "0"),
                UserInfo: users.map((u: any) => ({
                    employeeNo: u?.employeeNo || "",
                    name: u?.name || "",
                    userType: u?.userType || "",
                    Valid: u?.Valid
                        ? {
                            enable: u.Valid.enable === true || u.Valid.enable === "true",
                            beginTime: u.Valid.beginTime || "",
                            endTime: u.Valid.endTime || "",
                        }
                        : undefined,
                })),
            },
        };

        return NextResponse.json(formattedData);

    } catch (err: any) {
        console.error("Connection error:", err);
        return NextResponse.json(
            { error: "Connection failed", detail: err.message },
            { status: 502 }
        );
    }
}

// export async function POST() {
//     const host = process.env.HIKVISION_HOST;
//     const username = process.env.HIKVISION_USERNAME;
//     const password = process.env.HIKVISION_PASSWORD;

//     if (!host || !username || !password) {
//         return NextResponse.json(
//             { error: "Missing Hikvision credentials in environment variables." },
//             { status: 500 }
//         );
//     }

//     const url = `${host}/ISAPI/AccessControl/UserInfo/Search?format=json`;

//     const body = {
//         UserInfoSearchCond: {
//             searchID: "1",
//             searchResultPosition: 0,
//             maxResults: 100,
//         },
//     };

//     try {
//         // DigestFetch handles the Digest Auth challenge-response automatically
//         const client = new DigestFetch(username, password);

//         const response = await client.fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 Accept: "application/json",
//             },
//             body: JSON.stringify(body),
//         });

//         if (!response.ok) {
//             const errorText = await response.text();
//             return NextResponse.json(
//                 { error: `Hikvision API error: ${response.status}`, detail: errorText },
//                 { status: response.status }
//             );
//         }

//         const data = await response.json();
//         return NextResponse.json(data);
//     } catch (err) {
//         console.error("Failed to reach Hikvision device:", err);
//         return NextResponse.json(
//             { error: "Failed to connect to Hikvision device." },
//             { status: 502 }
//         );
//     }
// }


export async function GET() {
    const url = "http://192.168.31.170/ISAPI/AccessControl/UserInfo/Search?format=json";
    const username = "admin";
    const password = "7093256562shiva";

    const res = await fetch(url, {
        headers: {
            'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
        }
    });

    const data = await res.json();
    return NextResponse.json(data);
}