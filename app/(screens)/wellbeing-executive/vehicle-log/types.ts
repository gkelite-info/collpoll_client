export type VehicleLogStatus = "Exited" | "Inside Campus" | "Pending Exit";

export type VehicleLogEntry = {
  vehicleNumber: string;
  vehicleType: "Car" | "Bike" | "Bus" | "Other";
  ownerName: string;
  purpose: string;
  watchman: string;
  entryDate: string;
  entryTime: string;
  exitDate: string | null;
  exitTime: string | null;
  totalDuration: string | null;
  photo: string | null;
  status: VehicleLogStatus;
};
