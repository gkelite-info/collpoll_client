import { supabase } from "@/lib/supabaseClient";

export type FetchRoomsParams = {
  collegeId: number;
  search?: string;
  limit?: number;
  page?: number;
};

export type CollegeRoom = {
  collegeRoomId: number;
  collegeId: number;
  roomNo: string;
  roomType: string;
  building: string | null;
  floor: string | null;
  capacity: number | null;
  isActive: boolean;
};

export async function fetchCollegeRooms({
  collegeId,
  search = "",
  limit = 10,
  page = 1,
}: FetchRoomsParams): Promise<{ data: CollegeRoom[]; hasMore: boolean }> {
  if (!collegeId) {
    return { data: [], hasMore: false };
  }

  const offset = (page - 1) * limit;
  const fromIndex = offset;
  const toIndex = offset + limit;

  let query = supabase
    .from("college_rooms")
    .select("collegeRoomId, collegeId, roomNo, roomType, building, floor, capacity, isActive")
    .eq("collegeId", collegeId)
    .eq("isActive", true)
    .is("deletedAt", null)
    .neq("roomType", "gate");

  if (search.trim()) {
    query = query.ilike("roomNo", `%${search.trim()}%`);
  }

  query = query.order("roomNo", { ascending: true });
  query = query.range(fromIndex, toIndex);

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  const hasMore = (data?.length || 0) > limit;
  const resultData = hasMore ? data.slice(0, limit) : (data || []);

  return {
    data: resultData as CollegeRoom[],
    hasMore,
  };
}
