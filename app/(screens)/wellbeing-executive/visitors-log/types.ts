export type ReturnStatus = "Returned" | "Pending";

export type VisitorEntry = {
  id: number;
  sportsRoomLogId?: number;
  studentId?: number;
  collegeId?: number;
  collegeEducationId?: number;
  collegeBranchId?: number;
  collegeAcademicYearId?: number;
  collegeSectionsId?: number;
  purposeOfVisit?: string;
  entryDate?: string;
  entryTime?: string;
  exitTime?: string | null;
  equipments?: {
    sportsRoomLogEquipmentId?: number;
    inventoryAssetId: number;
    quantity: number;
    remarks: string | null;
    assetName: string;
    imageUrl: string | null;
  }[];
  initials: string;
  avatarTone: string;
  student: string;
  course: string;
  rollNo: string;
  takenAt: string;
  equipment: string;
  equipmentImageUrl?: string | null;
  quantity: number;
  returnStatus: ReturnStatus;
  returnedAt: string;
};

export type UsageRecord = {
  date: string;
  equipment: string;
  equipmentImageUrl?: string | null;
  quantity: number;
  purpose: string;
  takenAt: string;
  returnedAt: string;
  status: ReturnStatus;
};
