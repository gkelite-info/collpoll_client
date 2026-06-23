import type { VehicleLogEntry } from "./types";

export const initialVehicleLogs: VehicleLogEntry[] = [
  { vehicleNumber: "TS09AB1234", vehicleType: "Car", ownerName: "Ravi Kumar", purpose: "Staff", watchman: "Mahesh", entryDate: "18 Jun 2026 (Thursday)", entryTime: "09:00 AM", exitDate: "18 Jun 2026 (Thursday)", exitTime: "05:45 PM", totalDuration: "8h 45m", photo: null, status: "Exited" },
  { vehicleNumber: "TS07XY5678", vehicleType: "Bike", ownerName: "Suresh", purpose: "Official Visit", watchman: "Mahesh", entryDate: "18 Jun 2026 (Thursday)", entryTime: "10:30 AM", exitDate: null, exitTime: null, totalDuration: null, photo: null, status: "Inside Campus" },
  { vehicleNumber: "AP11CD9876", vehicleType: "Bike", ownerName: "Kiran Reddy", purpose: "Visitor", watchman: "Ravi Kumar", entryDate: "18 Jun 2026 (Thursday)", entryTime: "11:45 AM", exitDate: null, exitTime: null, totalDuration: null, photo: null, status: "Pending Exit" },
  { vehicleNumber: "KA01MG2021", vehicleType: "Bike", ownerName: "Anil", purpose: "Delivery", watchman: "Mahesh", entryDate: "18 Jun 2026 (Thursday)", entryTime: "12:15 PM", exitDate: "18 Jun 2026 (Thursday)", exitTime: "04:20 PM", totalDuration: "4h 05m", photo: null, status: "Exited" },
];
