import {
  FilePdf,
  FilePpt,
  FileZip,
  FileDoc,
  FileText,
  File,
} from "@phosphor-icons/react";

type Props = {
  type: string;
  size?: number;
};

export default function FileIcon({ type, size = 26 }: Props) {
  switch (type) {
    case "PDF":
      return <FilePdf size={size} />;
    case "PPTX":
      return <FilePpt size={size} />;
    case "ZIP":
      return <FileZip size={size} />;
    case "DOCX":
      return <FileDoc size={size} />;
    case "PNG":
    case "TXT":
      return <FileText size={size} />;
    default:
      return <File size={size} />;
  }
}
