export type EnrollStep = "search" | "select-device" | "enroll";
export type EnrollCredType = "FaceTemplate" | "Card" | "Fingerprint";

export type UserSearchResult = {
  userId: number;
  fullName: string;
  email: string;
  mobile: string;
  role: string;
};
