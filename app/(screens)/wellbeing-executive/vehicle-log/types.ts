export type VehicleLogStatus = "Exited" | "Inside Campus" | "Pending Exit";

export type VehicleLogEntry = {
  vehicleNumber: string;
  vehicleType: "Car" | "Bike";
  watchman: string;
  entryTime: string;
  status: VehicleLogStatus;
};
