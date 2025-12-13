import React from "react";
import { Monitor, IconProps, Phone } from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

export interface TrustedDevice {
  id: string;
  name: string;

  icon: React.ComponentType<IconProps>;
  lastActivity: string;
  location: string;
  status: "Trusted" | "Untrusted" | "Current Session";
  browser: string;
}

interface TrustedDevicesListProps {
  devices: TrustedDevice[];
  onRemoveDevice: (deviceId: string) => void;
}

export const mockDeviceData: TrustedDevice[] = [
  {
    id: "samsung-a52",
    name: "Samsung Galaxy A52",
    icon: Phone,
    lastActivity: "Yesterday at 5:30 PM",
    location: "Telangana , Hyderabad",
    status: "Trusted",
    browser: "Chrome",
  },
  {
    id: "lenovo-laptop",
    name: "Lenovo Laptop",
    icon: Monitor,
    lastActivity: "Yesterday at 2:00 AM",
    location: "Telangana , Hyderabad",
    status: "Trusted",
    browser: "Safari",
  },
  {
    id: "oneplus-9",
    name: "OnePlus 9",
    icon: Phone,
    lastActivity: "Yesterday at 8:30 PM",
    location: "Telangana , Hyderabad",
    status: "Trusted",
    browser: "Safari",
  },
  {
    id: "iphone-15",
    name: "iPhone 15",
    icon: Phone,
    lastActivity: "Yesterday at 11:24 AM",
    location: "Telangana , Hyderabad",
    status: "Trusted",
    browser: "Chrome",
  },
];

interface DeviceCardProps {
  device: TrustedDevice;
  onRemove: (deviceId: string) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onRemove }) => {
  const Icon = device.icon;
  const accentColor = "text-green-500 bg-green-50";

  return (
    <div className="rounded-xl p-5 border-2 flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full text-xl ${accentColor}`}>
            <Icon weight="bold" />
          </div>

          <h3 className="text-lg font-semibold text-gray-800">{device.name}</h3>
        </div>

        <span className="py-0.5 px-2.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
          {device.browser}
        </span>
      </div>

      <div className="text-sm space-y-2 text-gray-600">
        <p>
          <span className="font-medium text-gray-500">Last Activity : </span>
          {device.lastActivity}
        </p>
        <p>
          <span className="font-medium text-gray-500">
            Location ( Approx) :{" "}
          </span>
          {device.location}
        </p>
        <p>
          <span className="font-medium text-gray-500">Status : </span>
          <span className="py-0.5 px-2 text-xs font-semibold text-green-700 bg-green-100 rounded-lg">
            {device.status}
          </span>
        </p>
      </div>

      <button
        onClick={() => onRemove(device.id)}
        className="mt-4 w-full py-2.5 px-4 bg-[#16284F] text-white font-medium rounded-lg hover:bg-red-700 transition duration-150 shadow-lg"
      >
        Remove Device
      </button>
    </div>
  );
};

const TrustedDevicesList: React.FC<TrustedDevicesListProps> = ({
  devices,
  onRemoveDevice,
}) => {
  return (
    <div className="min-h-screen p-6 sm:p-8">
      <div className="max-w-5xl mx-auto font-sans">
        <div className="flex justify-between">
          <div className="text-xl font-semibold flex flex-col">
            <div className="flex justify-start items-center gap-2">
              <span className="text-[#282828]">Trusted Devices List</span>
            </div>
            <p className="text-gray-500 text-sm">
              View and manage devices that have access to your account.
            </p>
          </div>
          <div className="w-[32%]">
            <CourseScheduleCard />
          </div>
        </div>
        <div></div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 bg-white p-6 rounded-xl gap-6">
          {devices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              onRemove={onRemoveDevice}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedDevicesList;
