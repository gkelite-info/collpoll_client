import { Laptop, DeviceMobile, Desktop } from "@phosphor-icons/react";

export interface DeviceData {
  id: string;
  name: string;
  type: "mobile" | "laptop" | "desktop";
  browser: string;
  lastActivity: string;
  location: string;
  isTrusted: boolean;
}

export const DeviceCard = ({
  data,
  onRemove,
}: {
  data: DeviceData;
  onRemove: (id: string) => void;
}) => {
  const Icon =
    data.type === "mobile"
      ? DeviceMobile
      : data.type === "laptop"
      ? Laptop
      : Desktop;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <Icon size={24} weight="fill" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">{data.name}</h3>
          </div>
          <span className="px-3 py-1 bg-yellow-50 text-yellow-500 text-xs font-bold rounded-full">
            {data.browser}
          </span>
        </div>

        <div className="space-y-3 text-sm text-gray-500 mb-8 ml-1">
          <p>
            Last Activity :{" "}
            <span className="text-gray-600">{data.lastActivity}</span>
          </p>
          <p>
            Location (Approx) :{" "}
            <span className="text-gray-600">{data.location}</span>
          </p>
          <p>
            Status :{" "}
            <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-medium rounded ml-1">
              Trusted
            </span>
          </p>
        </div>
      </div>

      <button
        onClick={() => onRemove(data.id)}
        className="w-full py-3 bg-[#1e293b] text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
      >
        Remove Device
      </button>
    </div>
  );
};
