import { supabase } from "@/lib/supabaseClient";
import { Meeting } from "@/app/utils/meetings/meetingTypes";

export async function fetchMeetingsByMonth(
  collegeId: number,
  startDate: string,
  endDate: string,
  options?: {
    participantUserId?: number;
    parentUserId?: number;
  }
): Promise<Meeting[]> {
  let query = supabase
    .from("college_meetings")
    .select(`
      *,
      users:createdBy(
        fullName,
        user_profile(profileUrl)
      ),
      college_meeting_participants(
        userId,
        role,
        users(
          fullName,
          user_profile(profileUrl)
        )
      )
    `)
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .gte("date", startDate)
    .lte("date", endDate);

  const { data, error } = await query;

  if (error) {
    console.error("fetchMeetingsByMonth error:", error);
    throw error;
  }

  let filteredData = data || [];

  if (options?.participantUserId) {
    filteredData = filteredData.filter((m: any) => 
      m.createdBy === options.participantUserId || 
      (m.college_meeting_participants || []).some((p: any) => p.userId === options.participantUserId)
    );
  } else if (options?.parentUserId) {
    // Parent logic: filter meetings where any participant is a child of this parent
    // The hook will resolve the child user IDs and pass them as participantUserId, 
    // OR we fetch here. For simplicity, assume the hook resolves parent's child userIds.
  }

  const meetingsResult = filteredData.map((m: any) => {
    const participants = m.college_meeting_participants || [];
    const attendees = participants.map((p: any) => p.users?.fullName || "Unknown");

    return {
      id: m.collegeMeetingId.toString(),
      title: m.title,
      date: m.date,
      startTime: m.fromTime,
      endTime: m.toTime,
      organizer: m.organizer || m.users?.fullName || "Unknown",
      type: m.type ? (m.type.charAt(0).toUpperCase() + m.type.slice(1).toLowerCase()) : "Internal",
      agenda: m.agenda || m.description || "",
      attendees,
      meetingLink: m.meetingLink,
      platform: m.platform === 'googlemeet' ? 'Google Meet' : (m.platform === 'zoom' ? 'Zoom Meeting' : (m.platform === 'others' ? 'Others' : m.platform)),
      zoomId: m.zoomId,
      zoomPassword: m.zoomPassword,
      collegeId: m.collegeId,
      userId: m.createdBy,
      createdBy: m.createdBy,
      participantDetails: participants.map((p: any) => {
        const pProfile = p.users?.user_profile;
        const pProfileUrl = Array.isArray(pProfile)
          ? pProfile[0]?.profileUrl
          : pProfile?.profileUrl;
        return {
          userId: p.userId,
          name: p.users?.fullName || "Unknown",
          role: p.role,
          avatar: pProfileUrl || null,
        };
      })
    };
  });

  let facultyClasses: Meeting[] = [];

  // If a participantUserId is provided, check if they are a faculty and fetch their classes
  if (options?.participantUserId) {
    const { data: facultyData } = await supabase
      .from("faculty")
      .select("facultyId, users(fullName, user_profile(profileUrl))")
      .eq("userId", options.participantUserId)
      .single();

    if (facultyData) {
      const usersData = Array.isArray(facultyData.users) ? facultyData.users[0] : facultyData.users;
      const facultyName = (usersData as any)?.fullName || "Faculty";
      const pProfile = (usersData as any)?.user_profile;
      const facultyAvatar = Array.isArray(pProfile) ? pProfile[0]?.profileUrl : pProfile?.profileUrl;

      // Fetch single events
      const { data: eventsData } = await supabase
        .from("calendar_event")
        .select(`
          calendarEventId, date, fromTime, toTime, type,
          college_subjects (subjectName)
        `)
        .eq("facultyId", facultyData.facultyId)
        .gte("date", startDate)
        .lte("date", endDate)
        .in("type", ["class", "meeting", "exam"])
        .is("deletedAt", null)
        .eq("is_deleted", false);

      // Fetch bulk events
      const { data: bulkData } = await supabase
        .from("bulk_calendar_events")
        .select(`
          bulkCalendarEventId, fromDate, toDate, fromTime, toTime, type,
          college_subjects (subjectName)
        `)
        .eq("facultyId", facultyData.facultyId)
        .lte("fromDate", endDate)
        .gte("toDate", startDate)
        .in("type", ["class", "meeting", "exam"])
        .is("deletedAt", null)
        .or("is_deleted.eq.false,is_deleted.is.null");

      if (eventsData) {
        for (const e of eventsData as any[]) {
          facultyClasses.push({
            id: `ce_${e.calendarEventId}`,
            title: Array.isArray(e.college_subjects) ? e.college_subjects[0]?.subjectName : e.college_subjects?.subjectName || "Class",
            date: e.date,
            startTime: e.fromTime,
            endTime: e.toTime,
            organizer: facultyName,
            type: e.type ? (e.type.charAt(0).toUpperCase() + e.type.slice(1)) : "Class", 
            agenda: "",
            attendees: [],
            organizerAvatar: facultyAvatar,
            userId: options.participantUserId,
            collegeId: collegeId,
          });
        }
      }

      if (bulkData) {
        for (const b of bulkData as any[]) {
          const bStart = new Date(Math.max(new Date(b.fromDate).getTime(), new Date(startDate).getTime()));
          const bEnd = new Date(Math.min(new Date(b.toDate).getTime(), new Date(endDate).getTime()));

          for (let d = new Date(bStart); d <= bEnd; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) continue; // Skip Sunday
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            
            facultyClasses.push({
              id: `bce_${b.bulkCalendarEventId}_${dateStr}`,
              title: Array.isArray(b.college_subjects) ? b.college_subjects[0]?.subjectName : b.college_subjects?.subjectName || "Class",
              date: dateStr,
              startTime: b.fromTime,
              endTime: b.toTime,
              organizer: facultyName,
              type: b.type ? (b.type.charAt(0).toUpperCase() + b.type.slice(1)) : "Class",
              agenda: "",
              attendees: [],
              organizerAvatar: facultyAvatar,
              userId: options.participantUserId,
              collegeId: collegeId,
            });
          }
        }
      }
    } else {
      // Check if student
      const { data: studentHistory } = await supabase
        .from("student_academic_history")
        .select("collegeSectionsId, students!inner(userId, users(fullName, user_profile(profileUrl)))")
        .eq("students.userId", options.participantUserId)
        .eq("isCurrent", true)
        .is("deletedAt", null)
        .single();
      
      if (studentHistory && studentHistory.collegeSectionsId) {
        const studentInfo = Array.isArray(studentHistory.students) ? studentHistory.students[0] : studentHistory.students;
        const usersData = studentInfo?.users as any;
        const studentName = Array.isArray(usersData) ? usersData[0]?.fullName : usersData?.fullName || "Student";
        const pProfile = Array.isArray(usersData) ? usersData[0]?.user_profile : usersData?.user_profile;
        const studentAvatar = Array.isArray(pProfile) ? pProfile[0]?.profileUrl : pProfile?.profileUrl;
        
        // Fetch single events
        const { data: eventsData } = await supabase
          .from("calendar_event_section")
          .select(`
            calendar_event!inner(
              calendarEventId, date, fromTime, toTime, type,
              college_subjects(subjectName),
              faculty(fullName)
            )
          `)
          .eq("collegeSectionId", studentHistory.collegeSectionsId)
          .gte("calendar_event.date", startDate)
          .lte("calendar_event.date", endDate)
          .in("calendar_event.type", ["class", "meeting", "exam"])
          .is("calendar_event.deletedAt", null)
          .eq("calendar_event.is_deleted", false);
          
        if (eventsData) {
          for (const ev of eventsData as any[]) {
            const e = Array.isArray(ev.calendar_event) ? ev.calendar_event[0] : ev.calendar_event;
            if (!e) continue;
            
            const facultyName = Array.isArray(e.faculty) ? e.faculty[0]?.fullName : e.faculty?.fullName;
            
            facultyClasses.push({
              id: `ce_${e.calendarEventId}`,
              title: Array.isArray(e.college_subjects) ? e.college_subjects[0]?.subjectName : e.college_subjects?.subjectName || "Class",
              date: e.date,
              startTime: e.fromTime,
              endTime: e.toTime,
              organizer: facultyName || studentName,
              type: e.type ? (e.type.charAt(0).toUpperCase() + e.type.slice(1)) : "Class", 
              agenda: "",
              attendees: [],
              organizerAvatar: studentAvatar,
              userId: options.participantUserId,
              collegeId: collegeId,
            });
          }
        }
        
        // Fetch bulk events
        const { data: bulkData } = await supabase
          .from("bulk_calendar_event_sections")
          .select(`
            bulk_calendar_events!inner(
              bulkCalendarEventId, fromDate, toDate, fromTime, toTime, type,
              college_subjects(subjectName),
              faculty(fullName)
            )
          `)
          .eq("collegeSectionId", studentHistory.collegeSectionsId)
          .lte("bulk_calendar_events.fromDate", endDate)
          .gte("bulk_calendar_events.toDate", startDate)
          .in("bulk_calendar_events.type", ["class", "meeting", "exam"])
          .is("bulk_calendar_events.deletedAt", null)
          .or("is_deleted.eq.false,is_deleted.is.null", { foreignTable: 'bulk_calendar_events' });
          
        if (bulkData) {
          for (const bv of bulkData as any[]) {
            const b = Array.isArray(bv.bulk_calendar_events) ? bv.bulk_calendar_events[0] : bv.bulk_calendar_events;
            if (!b) continue;
            
            const facultyName = Array.isArray(b.faculty) ? b.faculty[0]?.fullName : b.faculty?.fullName;
            const bStart = new Date(Math.max(new Date(b.fromDate).getTime(), new Date(startDate).getTime()));
            const bEnd = new Date(Math.min(new Date(b.toDate).getTime(), new Date(endDate).getTime()));

            for (let d = new Date(bStart); d <= bEnd; d.setDate(d.getDate() + 1)) {
              if (d.getDay() === 0) continue;
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              
              facultyClasses.push({
                id: `bce_${b.bulkCalendarEventId}_${dateStr}`,
                title: Array.isArray(b.college_subjects) ? b.college_subjects[0]?.subjectName : b.college_subjects?.subjectName || "Class",
                date: dateStr,
                startTime: b.fromTime,
                endTime: b.toTime,
                organizer: facultyName || studentName,
                type: b.type ? (b.type.charAt(0).toUpperCase() + b.type.slice(1)) : "Class",
                agenda: "",
                attendees: [],
                organizerAvatar: studentAvatar,
                userId: options.participantUserId,
                collegeId: collegeId,
              });
            }
          }
        }
      }
    }
  }

  return [...meetingsResult, ...facultyClasses];
}
