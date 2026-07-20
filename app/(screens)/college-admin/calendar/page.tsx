import CalendarTabsClient from './CalendarTabsClient';
import MeetingsServerWrapper from '@/app/utils/meetings/MeetingsServerWrapper';

// Define the expected searchParams prop type for Next.js App Router Server Components
interface CalendarPageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function CalendarPage(props: CalendarPageProps) {
    const searchParams = await props.searchParams;
    return (
        <CalendarTabsClient>
            <MeetingsServerWrapper />
        </CalendarTabsClient>
    );
}