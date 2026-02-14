import FileIcon from "./fileIcon";

type Props = {
  name: string;
  type: string;
  sizeLabel: string;
  date: string;
};

export default function RecentFileCard({ name, type, sizeLabel, date }: Props) {
  return (
    <div className="flex items-center min-w-[220px] rounded-md bg-[#EBEBEB] p-3 gap-2">
      <div className="aspect-square">
        <div className=" flex p-2 items-center justify-center rounded-full bg-[#43C17A14] text-[#43C17A]">
          <FileIcon type={type} />
        </div>
      </div>

      <div className="flex-1 w-[78%]">
        <p className="text-sm font-semibold text-[#0F172A] overflow-x-scroll">
          {name}
        </p>
        <div className="mt-2 flex items-center text-xs text-[#94A3B8] overflow-x-hidden">
          <span>{date}</span>
          <span className="mx-1">·</span>
          <span>{sizeLabel}</span>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
