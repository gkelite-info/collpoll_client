"use client";
import { Suspense } from "react";
import ProfileClient from "./Profile";

export default function Profile(){
    return(
        <Suspense fallback={<div className="p-4">Loading...</div>}>
            <ProfileClient/>
        </Suspense>
    )
}