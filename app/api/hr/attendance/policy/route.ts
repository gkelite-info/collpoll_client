import { NextRequest, NextResponse } from "next/server";
import { upsertStaffPolicy } from "@/lib/helpers/Hr/attendance/staffPolicyAPI";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { collegeId, userId, ...policyData } = body;

        if (!collegeId || !userId) {
            return NextResponse.json({ success: false, error: "Missing collegeId or userId" }, { status: 400 });
        }

        const result = await upsertStaffPolicy(collegeId, userId, policyData);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (e: any) {
        console.error("Policy API error:", e);
        return NextResponse.json({ success: false, error: "Unable to process policy request. Please try again." }, { status: 500 });
    }
}
