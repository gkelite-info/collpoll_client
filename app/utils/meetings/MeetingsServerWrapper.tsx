"use client";

import MeetingsClient from './MeetingsClient';
import MeetingsShimmer from './MeetingsShimmer';
import { useUser } from "@/app/utils/context/UserContext";
import { useMeetingsMonthly } from './hooks/useMeetingsQuery';
import { useState } from 'react';

interface WrapperProps {
    isReadOnly?: boolean;
}

export default function MeetingsServerWrapper({ isReadOnly }: WrapperProps) {
    const { collegeId, userId, role } = useUser();
    
    // We fetch current month initially, MeetingsClient handles month navigation
    // but the initial state needs to be passed down or handled here.
    // For simplicity, we can let MeetingsClient do the fetching since it owns the `currentDate` state.
    // So this wrapper just renders MeetingsClient and passes the props.

    return <MeetingsClient isReadOnly={isReadOnly} />;
}
