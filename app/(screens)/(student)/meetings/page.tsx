import MeetingsServerWrapper from '@/app/utils/meetings/MeetingsServerWrapper';

export default function StudentMeetings() {
    return (
        <div className="w-full p-2 min-h-[calc(100vh-64px)] bg-gray-50/30">
            <MeetingsServerWrapper isReadOnly={true} />
        </div>
    );
}