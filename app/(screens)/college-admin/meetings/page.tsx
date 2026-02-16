"use client";

import { Suspense } from "react";
import MeetingsClient from "./MeetingsClient";


export default function Page() {
  return (
    <Suspense fallback="Loading...">
      <MeetingsClient />
    </Suspense>
  );
}
