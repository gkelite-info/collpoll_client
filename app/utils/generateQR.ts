import QRCode from "qrcode";

export async function generateQRSVG(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
    width: 128,
  });
}
