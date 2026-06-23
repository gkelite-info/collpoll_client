import type { VehicleLogEntry } from "./types";

export const initialVehicleLogs: VehicleLogEntry[] = [
  { vehicleNumber: "TS09AB1234", vehicleType: "Car", watchman: "Ravi Kumar", entryTime: "09:00 AM", status: "Exited" },
  { vehicleNumber: "TS07XY5678", vehicleType: "Bike", watchman: "Mahesh", entryTime: "10:30 AM", status: "Inside Campus" },
  { vehicleNumber: "AP11CD9876", vehicleType: "Bike", watchman: "Ravi Kumar", entryTime: "11:45 AM", status: "Pending Exit" },
  { vehicleNumber: "KA01MG2021", vehicleType: "Bike", watchman: "Mahesh", entryTime: "12:15 PM", status: "Exited" },
];
