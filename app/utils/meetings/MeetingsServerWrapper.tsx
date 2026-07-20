import { Suspense } from 'react';
import MeetingsClient from './MeetingsClient';
import MeetingsShimmer from './MeetingsShimmer';
import { dummyMeetings } from './meetingDummyData';

// This acts as our Server Component that will fetch data in the future
async function fetchMeetingsData() {
    // Simulate a network request delay for demonstration of Suspense/Shimmer
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In the future, this would be a DB call using collegeId or user roles
    return dummyMeetings;
}

async function MeetingsServerContent() {
    const initialMeetings = await fetchMeetingsData();
    return <MeetingsClient initialMeetings={initialMeetings} />;
}

export default function MeetingsServerWrapper() {
    return (
        <Suspense fallback={<MeetingsShimmer />}>
            <MeetingsServerContent />
        </Suspense>
    );
}
