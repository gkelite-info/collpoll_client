'use client'
import { ReactNode } from "react";

type CardProps = {
    style: string;
    icon: ReactNode;
    value: string | number;
    label: string;
}

export default function CardComponent({ style = 'bg-white', icon, value, label }: CardProps) {
    return (
        <>
            <div className={`h-29 w-44 rounded-lg p-3 ${style} flex flex-col justify-between`}>
                <div className="bg-white w-9 h-8 rounded-sm flex items-center justify-center">
                    {icon}
                </div>
                <p className="text-[#282828] text-lg font-semibold">
                    {value}
                </p>
                <span className="text-[#282828]">
                    {label}
                </span>
            </div>
        </>
    )
}