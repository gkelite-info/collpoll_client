import type { EquipmentFormState, EquipmentItem, EquipmentStatus } from "./types";

function equipmentImage(label: string, background: string, accent: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="18" fill="${background}"/>
      <circle cx="76" cy="20" r="18" fill="${accent}" opacity=".35"/>
      <rect x="16" y="50" width="64" height="18" rx="9" fill="${accent}" opacity=".8"/>
      <text x="48" y="43" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="800" fill="white">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const defaultItems: EquipmentItem[] = [
  { id: "SP001", name: "Cricket Bat (SG Club)", category: "Sports", totalQty: 6, available: 0, lastUpdated: "15 May 2025", image: equipmentImage("BAT", "#1F2937", "#D6A354") },
  { id: "SP021", name: "Football (Nivia)", category: "Sports", totalQty: 30, available: 12, lastUpdated: "15 May 2025", image: equipmentImage("BALL", "#7C2D12", "#F97316") },
  { id: "SP022", name: "Basketball (Nivia)", category: "Sports", totalQty: 15, available: 3, lastUpdated: "15 May 2025", image: equipmentImage("HOOP", "#9A3412", "#FB923C") },
  { id: "SP023", name: "Volleyball (Cosco)", category: "Sports", totalQty: 12, available: 8, lastUpdated: "15 May 2025", image: equipmentImage("VB", "#1E3A8A", "#FBBF24") },
  { id: "SP024", name: "Badminton Racket (Yonex)", category: "Sports", totalQty: 20, available: 7, lastUpdated: "15 May 2025", image: equipmentImage("RKT", "#334155", "#CBD5E1") },
  { id: "SP025", name: "Yoga Mat (ProFit)", category: "Sports", totalQty: 25, available: 18, lastUpdated: "15 May 2025", image: equipmentImage("MAT", "#0F766E", "#67E8F9") },
  { id: "SP026", name: "Dumbbell Set (5kg)", category: "Sports", totalQty: 10, available: 1, lastUpdated: "15 May 2025", image: equipmentImage("5KG", "#111827", "#94A3B8") },
];

export const safetyItems: EquipmentItem[] = [
  { id: "SP0012", name: "Walkie Talkie (Motorola)", category: "Safety and Security", totalQty: 6, available: 0, lastUpdated: "15 May 2025", image: equipmentImage("WT", "#1F2937", "#D6A354") },
  { id: "SP0021", name: "Metal Detector", category: "Safety and Security", totalQty: 30, available: 12, lastUpdated: "15 May 2025", image: equipmentImage("MD", "#7C2D12", "#F97316") },
  { id: "SP0022", name: "Reflective Safety Jackets", category: "Safety and Security", totalQty: 15, available: 3, lastUpdated: "15 May 2025", image: equipmentImage("JKT", "#9A3412", "#FB923C") },
  { id: "SP0023", name: "Flashlights", category: "Safety and Security", totalQty: 12, available: 8, lastUpdated: "15 May 2025", image: equipmentImage("LGT", "#1E3A8A", "#FBBF24") },
  { id: "SP0024", name: "Security Barricades", category: "Safety and Security", totalQty: 20, available: 7, lastUpdated: "15 May 2025", image: equipmentImage("BAR", "#334155", "#CBD5E1") },
  { id: "SP0025", name: "Body Camera", category: "Safety and Security", totalQty: 10, available: 6, lastUpdated: "15 May 2025", image: equipmentImage("CAM", "#0F766E", "#67E8F9") },
  { id: "SP0026", name: "Emergency First Aid Kit", category: "Safety and Security", totalQty: 8, available: 2, lastUpdated: "15 May 2025", image: equipmentImage("AID", "#991B1B", "#FCA5A5") },
];

export const administrationItems: EquipmentItem[] = [
  { id: "AD0012", name: "Printers", category: "Administration", totalQty: 6, available: 0, lastUpdated: "15 May 2025", image: equipmentImage("PRN", "#1F2937", "#94A3B8") },
  { id: "AD0021", name: "Desktop Computers", category: "Administration", totalQty: 30, available: 12, lastUpdated: "15 May 2025", image: equipmentImage("PC", "#1E3A8A", "#60A5FA") },
  { id: "AD0022", name: "Document Scanners", category: "Administration", totalQty: 15, available: 3, lastUpdated: "15 May 2025", image: equipmentImage("SCN", "#334155", "#CBD5E1") },
  { id: "AD0023", name: "Office Projectors", category: "Administration", totalQty: 12, available: 8, lastUpdated: "15 May 2025", image: equipmentImage("PRJ", "#7C2D12", "#FB923C") },
  { id: "AD0024", name: "Biometric Devices", category: "Administration", totalQty: 20, available: 7, lastUpdated: "15 May 2025", image: equipmentImage("BIO", "#0F766E", "#5EEAD4") },
  { id: "AD0025", name: "UPS Systems", category: "Administration", totalQty: 25, available: 18, lastUpdated: "15 May 2025", image: equipmentImage("UPS", "#312E81", "#A5B4FC") },
  { id: "AD0026", name: "Public Address Systems", category: "Administration", totalQty: 10, available: 1, lastUpdated: "15 May 2025", image: equipmentImage("PA", "#111827", "#FBBF24") },
];

export const emptyForm: EquipmentFormState = {
  name: "",
  quantity: "",
  available: "",
  image: null,
}; 

export const normalizeCategoryName = (categoryName: string | null | undefined) =>
  categoryName?.toLowerCase().replace(/[^a-z]/g, "") ?? "";

export const getStatus = (
  item: Pick<EquipmentItem, "available" | "totalQty">,
): EquipmentStatus => {
  if (item.available <= 0) return "Out of Stock";
  if (item.available <= Math.max(2, Math.ceil(item.totalQty * 0.25))) return "Low Stock";
  return "In Stock";
};

export const statusClasses: Record<EquipmentStatus, string> = {
  "In Stock": "text-[#009B55]",
  "Low Stock": "text-[#F97316]",
  "Out of Stock": "text-[#FF2A2A]",
};
