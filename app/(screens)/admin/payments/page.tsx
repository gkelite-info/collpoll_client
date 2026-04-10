import { notFound } from "next/navigation";
import Left from "./left";
import Right from "./right";

const PAYMENTS_ENABLED = false;

export default function Payments() {
    if (!PAYMENTS_ENABLED) {
        notFound();
    }
    return (
        <>
            <div className="bg-red-00 flex items-start justify-start pb-5">
                <Left />
                <Right />
            </div>
        </>
    )
}