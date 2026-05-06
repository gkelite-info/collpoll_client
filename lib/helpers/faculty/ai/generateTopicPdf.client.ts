"use client";

import jsPDF from "jspdf";

import { type TopicNotes } from "@/lib/helpers/faculty/ai/Generatetopicnotes";

const PAGE = {
  width: 210,
  height: 297,
  margin: 16,
  bottom: 18,
};

const TARGET_TEXTBOOK_PAGES = 16;
const MAX_TEXTBOOK_PAGES = 16;

const COLORS = {
  ink: [31, 41, 55] as const,
  muted: [91, 103, 119] as const,
  green: [67, 193, 122] as const,
  greenDark: [6, 95, 70] as const,
  greenSoft: [236, 253, 245] as const,
  blue: [37, 99, 235] as const,
  blueSoft: [239, 246, 255] as const,
  amber: [217, 119, 6] as const,
  amberSoft: [255, 251, 235] as const,
  rose: [225, 29, 72] as const,
  line: [209, 213, 219] as const,
  tableHead: [17, 94, 89] as const,
};

const CHART_COLORS = [
  COLORS.green,
  COLORS.blue,
  COLORS.amber,
  COLORS.rose,
  COLORS.tableHead,
] as const;

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._ -]/g, "").trim().replace(/\s+/g, " ");
}

function setTextColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFillColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDrawColor(doc: jsPDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function safeText(value: unknown, fallback = "") {
  return String(value ?? fallback).replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
}

function rgb(color: readonly [number, number, number]) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 8,
) {
  const previousAlign = ctx.textAlign;
  const words = safeText(text).split(/\s+/).filter(Boolean);
  let line = "";
  let currentY = y;
  let lineCount = 0;
  ctx.textAlign = "left";

  for (const word of words) {
    const nextLine = `${line} ${word}`.trim();
    if (ctx.measureText(nextLine).width > maxWidth && line) {
      lineCount += 1;
      if (lineCount >= maxLines) {
        ctx.fillText(`${line.replace(/[.,;:]$/, "")}...`, x, currentY);
        ctx.textAlign = previousAlign;
        return currentY + lineHeight;
      }

      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
      continue;
    }

    line = nextLine;
  }

  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  ctx.textAlign = previousAlign;
  return currentY;
}

function compactTitle(value: string, maxLength = 34) {
  const text = safeText(value, "Topic");
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
}

function drawAtom(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 5;

  for (let orbit = 0; orbit < 3; orbit += 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((Math.PI / 3) * orbit);
    ctx.beginPath();
    ctx.ellipse(0, 0, 116, 42, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = "#fb7185";
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Nucleus", cx, cy + 6);

  const electrons = [
    [cx + 112, cy],
    [cx - 58, cy - 60],
    [cx - 48, cy + 66],
  ];
  electrons.forEach(([x, y]) => {
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.textAlign = "left";
}

function drawEnergyLevels(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 5;
  ctx.font = "700 16px Arial";
  ctx.fillStyle = "#334155";

  for (let index = 0; index < 5; index += 1) {
    const y = cy + 80 - index * 36;
    ctx.beginPath();
    ctx.moveTo(cx - 120, y);
    ctx.lineTo(cx + 120, y);
    ctx.stroke();
    ctx.fillText(`n=${index + 1}`, cx + 135, y + 5);
  }

  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 58, cy + 78);
  ctx.lineTo(cx - 58, cy - 62);
  ctx.stroke();
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(cx - 58, cy - 72);
  ctx.lineTo(cx - 68, cy - 52);
  ctx.lineTo(cx - 48, cy - 52);
  ctx.closePath();
  ctx.fill();
}

function drawBohrShellDiagram(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const radii = [34, 62, 90, 118];

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 4;
  radii.forEach((radius, index) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 14px Arial";
    ctx.fillText(["K", "L", "M", "N"][index], cx + radius + 14, cy + 5);
  });

  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(cx, cy, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText("+", cx, cy + 8);

  const electrons = [
    [cx + 34, cy],
    [cx - 40, cy - 47],
    [cx + 64, cy + 64],
    [cx - 94, cy + 72],
  ];
  electrons.forEach(([x, y]) => {
    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.textAlign = "left";
}

function drawHydrogenSpectrumDiagram(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const levelData = [
    [cy + 104, "n=1", "-13.6 eV"],
    [cy + 48, "n=2", "-3.4 eV"],
    [cy + 12, "n=3", "-1.5 eV"],
    [cy - 16, "n=4", "-0.85 eV"],
    [cy - 40, "n=5", "-0.54 eV"],
    [cy - 62, "n=infinity", "0 eV"],
  ] as const;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 170, cy - 90);
  ctx.lineTo(cx - 170, cy + 120);
  ctx.stroke();
  ctx.fillStyle = "#334155";
  ctx.font = "700 13px Arial";
  ctx.save();
  ctx.translate(cx - 194, cy + 22);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Energy", 0, 0);
  ctx.restore();

  levelData.forEach(([y, label, ev]) => {
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 140, y);
    ctx.lineTo(cx + 132, y);
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px Arial";
    ctx.fillText(label, cx + 144, y + 4);
    ctx.font = "600 12px Arial";
    ctx.fillText(ev, cx - 238, y + 4);
  });

  const transitions = [
    [cx - 70, cy - 40, cy + 48, "#2563eb", "Balmer"],
    [cx - 20, cy - 62, cy + 104, "#ef4444", "Lyman"],
    [cx + 36, cy - 16, cy + 48, "#d97706", ""],
    [cx + 92, cy + 12, cy + 104, "#16a34a", ""],
  ] as const;

  transitions.forEach(([x, y1, y2, color, label]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2 - 12);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y2);
    ctx.lineTo(x - 9, y2 - 16);
    ctx.lineTo(x + 9, y2 - 16);
    ctx.closePath();
    ctx.fill();
    if (label) {
      ctx.font = "700 12px Arial";
      ctx.fillText(label, x + 10, (y1 + y2) / 2);
    }
  });
}

function drawAufbauDiagram(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const orbitals = [
    ["1s", cx - 120, cy + 88],
    ["2s", cx - 120, cy + 48],
    ["2p", cx - 52, cy + 48],
    ["3s", cx - 120, cy + 8],
    ["3p", cx - 52, cy + 8],
    ["3d", cx + 18, cy + 8],
    ["4s", cx - 120, cy - 32],
    ["4p", cx - 52, cy - 32],
    ["4d", cx + 18, cy - 32],
    ["4f", cx + 88, cy - 32],
  ] as const;

  orbitals.forEach(([label, x, y]) => {
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 24, y);
    ctx.lineTo(x + 24, y);
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px Arial";
    ctx.fillText(label, x - 10, y - 10);
  });

  const arrows = [
    [cx - 150, cy + 72, cx - 76, cy + 20],
    [cx - 150, cy + 32, cx - 4, cy - 20],
    [cx - 82, cy + 32, cx + 68, cy - 20],
    [cx - 150, cy - 8, cx + 136, cy - 58],
  ] as const;

  arrows.forEach(([x1, y1, x2, y2]) => {
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(x2, y2, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "#475569";
  ctx.font = "700 13px Arial";
  ctx.fillText("Diagonal filling order", cx - 146, cy - 82);
}

function drawReactionEnergyProfile(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 162, cy + 104);
  ctx.lineTo(cx + 168, cy + 104);
  ctx.moveTo(cx - 150, cy + 116);
  ctx.lineTo(cx - 150, cy - 116);
  ctx.stroke();

  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - 126, cy + 42);
  ctx.bezierCurveTo(cx - 52, cy + 38, cx - 36, cy - 96, cx + 22, cy - 84);
  ctx.bezierCurveTo(cx + 78, cy - 72, cx + 74, cy + 52, cx + 134, cy + 58);
  ctx.stroke();

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 7]);
  ctx.beginPath();
  ctx.moveTo(cx - 126, cy + 42);
  ctx.lineTo(cx + 126, cy + 42);
  ctx.moveTo(cx + 126, cy + 58);
  ctx.lineTo(cx + 126, cy + 42);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 14px Arial";
  ctx.fillText("Reactants", cx - 136, cy + 28);
  ctx.fillText("Products", cx + 86, cy + 82);
  ctx.fillText("Activation energy", cx - 38, cy - 104);
  ctx.fillText("Reaction progress", cx - 20, cy + 132);
  ctx.save();
  ctx.translate(cx - 180, cy + 6);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Energy", 0, 0);
  ctx.restore();
}

function drawMolecularOrbitalDiagram(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const leftX = cx - 145;
  const midX = cx;
  const rightX = cx + 145;
  const levels = [
    [cy + 88, "AO", "1s / 2p"],
    [cy + 34, "Bonding MO", "sigma / pi"],
    [cy - 34, "Antibonding MO", "sigma* / pi*"],
    [cy - 88, "AO", "1s / 2p"],
  ] as const;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(leftX, cy + 110);
  ctx.lineTo(leftX, cy - 110);
  ctx.moveTo(midX, cy + 126);
  ctx.lineTo(midX, cy - 126);
  ctx.moveTo(rightX, cy + 110);
  ctx.lineTo(rightX, cy - 110);
  ctx.stroke();

  ctx.font = "700 14px Arial";
  ctx.textAlign = "center";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("Atom A", leftX, cy + 138);
  ctx.fillText("Molecule", midX, cy + 154);
  ctx.fillText("Atom B", rightX, cy + 138);

  levels.forEach(([y, label, sub], index) => {
    const color = index === 1 ? "#22c55e" : index === 2 ? "#ef4444" : "#2563eb";
    const x = index === 0 ? leftX : index === 3 ? rightX : midX;
    const width = index === 1 || index === 2 ? 118 : 78;
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y);
    ctx.lineTo(x + width / 2, y);
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px Arial";
    ctx.fillText(label, x, y - 13);
    ctx.font = "600 12px Arial";
    ctx.fillText(sub, x, y + 20);
  });

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 3;
  [
    [leftX + 40, cy + 88, midX - 58, cy + 34],
    [rightX - 40, cy + 88, midX + 58, cy + 34],
    [leftX + 40, cy - 88, midX - 58, cy - 34],
    [rightX - 40, cy - 88, midX + 58, cy - 34],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  ctx.fillStyle = "#475569";
  ctx.font = "600 13px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Energy increases upward", cx - 186, cy - 132);
}

function drawWaterPollution(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = "#bfdbfe";
  ctx.fillRect(cx - 145, cy + 38, 290, 64);
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 4;
  for (let wave = 0; wave < 4; wave += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - 135, cy + 58 + wave * 12);
    for (let step = 0; step < 6; step += 1) {
      ctx.quadraticCurveTo(
        cx - 105 + step * 50,
        cy + 48 + wave * 12,
        cx - 85 + step * 50,
        cy + 58 + wave * 12,
      );
    }
    ctx.stroke();
  }

  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(cx - 130, cy - 70, 78, 86);
  ctx.fillStyle = "#475569";
  ctx.fillRect(cx - 115, cy - 112, 20, 42);
  ctx.fillRect(cx - 82, cy - 98, 18, 28);
  ctx.fillStyle = "#64748b";
  ctx.fillRect(cx - 52, cy - 2, 86, 20);
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(cx + 74, cy + 60, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#16a34a";
  ctx.beginPath();
  ctx.arc(cx + 118, cy + 58, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawGalvanicCell(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.fillStyle = "#dbeafe";
  ctx.roundRect(cx - 185, cy - 44, 126, 142, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#dcfce7";
  ctx.roundRect(cx + 59, cy - 44, 126, 142, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#64748b";
  ctx.fillRect(cx - 135, cy - 94, 18, 158);
  ctx.fillRect(cx + 110, cy - 94, 18, 158);

  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx - 122, cy - 88);
  ctx.bezierCurveTo(cx - 86, cy - 145, cx + 86, cy - 145, cx + 122, cy - 88);
  ctx.stroke();

  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 116, cy - 112);
  ctx.lineTo(cx + 104, cy - 112);
  ctx.stroke();
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.moveTo(cx + 118, cy - 112);
  ctx.lineTo(cx + 96, cy - 124);
  ctx.lineTo(cx + 96, cy - 100);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f8fafc";
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 3;
  ctx.roundRect(cx - 34, cy - 150, 68, 42, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 16px Arial";
  ctx.textAlign = "center";
  ctx.fillText("V", cx, cy - 124);
  ctx.fillText("Anode", cx - 126, cy + 122);
  ctx.fillText("Cathode", cx + 122, cy + 122);
  ctx.font = "600 13px Arial";
  ctx.fillText("Oxidation", cx - 126, cy + 143);
  ctx.fillText("Reduction", cx + 122, cy + 143);
  ctx.fillText("Salt bridge", cx, cy - 154);
  ctx.fillText("electron flow", cx, cy - 88);
  ctx.textAlign = "left";
}

function drawElectrochemicalPotential(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const levels = [
    [cy - 90, "Strong oxidizing agents", "#ef4444"],
    [cy - 28, "Standard electrode potential", "#2563eb"],
    [cy + 34, "Reference: SHE 0.00 V", "#0f766e"],
    [cy + 96, "Strong reducing agents", "#d97706"],
  ] as const;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 150, cy - 126);
  ctx.lineTo(cx - 150, cy + 126);
  ctx.stroke();

  levels.forEach(([y, label, color]) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 150, y);
    ctx.lineTo(cx + 150, y);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx - 150, y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 14px Arial";
    wrapCanvasText(ctx, label, cx - 128, y + 5, 258, 16, 2);
  });

  ctx.fillStyle = "#475569";
  ctx.font = "600 13px Arial";
  ctx.fillText("More positive E degree", cx - 145, cy - 146);
  ctx.fillText("More negative E degree", cx - 145, cy + 154);
}

function getImageLabels(notes: TopicNotes) {
  const fromImage = notes.imageExamples?.flatMap((image) => image.labels ?? []) ?? [];
  const fromVisual = notes.visuals?.flatMap((visual) => visual.labels ?? []) ?? [];
  const fromTerms = notes.keyTerms?.map((term) => term.term) ?? [];

  return [...fromImage, ...fromVisual, ...fromTerms]
    .map((label) => safeText(label).trim())
    .filter((label) => !isGenericDiagramLabel(label))
    .filter(Boolean)
    .slice(0, 7);
}

function isGenericDiagramLabel(label: string) {
  return /^(concept|process|application|diagram|example|advantage|limitation|revision|key point|summary|main part|working area|use case|structure|function|result|parts|working)$/i.test(
    label.trim(),
  );
}

function drawGenericConcept(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  title: string,
  labels: string[] = [],
) {
  const nodeLabels = labels.length
    ? labels.slice(0, 5)
    : ["Definition", "Working", "Example", "Application", "Terms"];
  const nodes = [
    [cx, cy - 86, nodeLabels[0]],
    [cx + 126, cy - 10, nodeLabels[1] ?? "Working"],
    [cx + 74, cy + 94, nodeLabels[2] ?? "Example"],
    [cx - 74, cy + 94, nodeLabels[3] ?? "Application"],
    [cx - 126, cy - 10, nodeLabels[4] ?? "Terms"],
  ] as const;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 4;
  nodes.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  ctx.fillStyle = "#065f46";
  ctx.beginPath();
  ctx.arc(cx, cy, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 15px Arial";
  ctx.textAlign = "center";
  wrapCanvasText(ctx, compactTitle(title, 28), cx - 38, cy - 15, 76, 16, 3);

  nodes.forEach(([x, y, label], index) => {
    ctx.fillStyle = rgb(CHART_COLORS[index % CHART_COLORS.length]);
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 12px Arial";
    ctx.textAlign = "center";
    wrapCanvasText(ctx, compactTitle(label, 16), x - 28, y - 2, 56, 13, 2);
  });
  ctx.textAlign = "left";
}

type DynamicDiagramIntent =
  | "flow"
  | "system"
  | "electrical-layout"
  | "loss-flow"
  | "comparison"
  | "cycle"
  | "graph"
  | "layers"
  | "concept";

function getDynamicLabels(labels: string[], fallbackTitle: string) {
  const cleaned = labels
    .map((label) => compactTitle(label, 24))
    .filter((label) => !isGenericDiagramLabel(label))
    .filter(Boolean);

  if (cleaned.length >= 3) {
    return cleaned.slice(0, 6);
  }

  const titleWords = safeText(fallbackTitle)
    .split(/\s+/)
    .filter((word) => word.length > 3 && !/diagram|visual|view|topic|model/i.test(word))
    .slice(0, 4);

  return [...cleaned, ...titleWords, "Principle", "Components", "Output"].slice(0, 5);
}

function chooseFallbackIntent(
  intent: DynamicDiagramIntent,
  variant: "hero" | "concept" | "process" | "structure" | "application",
  labels: string[],
): DynamicDiagramIntent {
  if (intent !== "concept") {
    return intent;
  }

  if (labels.length >= 5) {
    return variant === "process" ? "flow" : "system";
  }

  if (variant === "process") {
    return "flow";
  }

  if (variant === "structure") {
    return "system";
  }

  if (variant === "application") {
    return "comparison";
  }

  return "system";
}

function inferDynamicDiagramIntent(
  signature: string,
  variant: "hero" | "concept" | "process" | "structure" | "application",
): DynamicDiagramIntent {
  if (/pv|solar|inverter|grid|electrical connection|module|string|array|dc|ac/i.test(signature)) {
    if (/loss|irradiance|temperature|performance ratio|energy production|yield|efficiency|forecast|actual/i.test(signature)) {
      return /graph|ratio|forecast|actual|versus|vs/i.test(signature) ? "graph" : "loss-flow";
    }

    if (/layout|system|array|inverter|grid|connection|mounting|component|block/i.test(signature)) {
      return "electrical-layout";
    }
  }

  if (/graph|curve|plot|trend|versus|vs|axis|profile|forecast|prediction|variation|relationship/i.test(signature)) {
    return "graph";
  }

  if (/compare|comparison|difference|advantages|limitations|pros|cons/i.test(signature)) {
    return "comparison";
  }

  if (/cycle|loop|feedback|closed loop|recycle|iteration|lifecycle/i.test(signature)) {
    return "cycle";
  }

  if (/layer|stack|level|hierarchy|architecture|protocol|model/i.test(signature)) {
    return "layers";
  }

  if (
    variant === "process" ||
    /process|workflow|flow|steps|sequence|method|algorithm|calculation|pipeline|mechanism/i.test(signature)
  ) {
    return "flow";
  }

  if (
    variant === "structure" ||
    /structure|layout|apparatus|setup|circuit|system|components|parts|block diagram|architecture/i.test(signature)
  ) {
    return "system";
  }

  return "concept";
}

function drawDynamicFlow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  const nodes = labels.slice(0, 5);
  const startX = cx - 184;
  const gap = nodes.length > 3 ? 92 : 128;

  nodes.forEach((label, index) => {
    const x = startX + index * gap;
    const y = index % 2 === 0 ? cy - 32 : cy + 42;

    if (index > 0) {
      const prevX = startX + (index - 1) * gap;
      const prevY = (index - 1) % 2 === 0 ? cy - 32 : cy + 42;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(prevX + 52, prevY);
      ctx.lineTo(x - 58, y);
      ctx.stroke();
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(x - 58, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = index % 2 === 0 ? "#eef6ff" : "#ecfdf5";
    ctx.strokeStyle = rgb(CHART_COLORS[index % CHART_COLORS.length]);
    ctx.lineWidth = 4;
    ctx.roundRect(x - 52, y - 28, 104, 56, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px Arial";
    wrapCanvasText(ctx, label, x - 42, y - 7, 84, 13, 3);
  });

  ctx.textAlign = "left";
}

function drawDynamicSystem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  const centerLabel = labels[0] ?? "System";
  const outerLabels = labels.slice(1, 6);
  const positions = [
    [cx - 132, cy - 78],
    [cx + 132, cy - 78],
    [cx - 138, cy + 72],
    [cx + 138, cy + 72],
    [cx, cy + 104],
  ] as const;

  ctx.fillStyle = "#ecfdf5";
  ctx.strokeStyle = "#065f46";
  ctx.lineWidth = 5;
  ctx.roundRect(cx - 62, cy - 34, 124, 68, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#065f46";
  ctx.font = "700 14px Arial";
  wrapCanvasText(ctx, centerLabel, cx - 48, cy - 8, 96, 15, 3);

  outerLabels.forEach((label, index) => {
    const [x, y] = positions[index];
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.fillStyle = index % 2 === 0 ? "#dbeafe" : "#dcfce7";
    ctx.strokeStyle = rgb(CHART_COLORS[index % CHART_COLORS.length]);
    ctx.lineWidth = 4;
    ctx.roundRect(x - 56, y - 25, 112, 50, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px Arial";
    wrapCanvasText(ctx, label, x - 44, y - 7, 88, 13, 3);
  });

  ctx.textAlign = "left";
}

function drawDynamicComparison(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  const leftItems = labels.filter((_, index) => index % 2 === 0).slice(0, 3);
  const rightItems = labels.filter((_, index) => index % 2 === 1).slice(0, 3);

  [
    [cx - 126, "Case A", leftItems, "#dbeafe", "#2563eb"],
    [cx + 126, "Case B", rightItems, "#dcfce7", "#0f766e"],
  ].forEach(([x, title, items, fill, stroke]) => {
    ctx.fillStyle = fill as string;
    ctx.strokeStyle = stroke as string;
    ctx.lineWidth = 4;
    ctx.roundRect((x as number) - 90, cy - 106, 180, 212, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(title as string, x as number, cy - 76);
    ctx.font = "700 12px Arial";
    (items as string[]).forEach((item, index) => {
      wrapCanvasText(ctx, item, (x as number) - 66, cy - 38 + index * 48, 132, 14, 3);
    });
  });

  ctx.textAlign = "left";
}

function drawDynamicCycle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  const nodes = labels.slice(0, 5);
  const radius = 104;

  nodes.forEach((label, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / nodes.length;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const nextAngle = -Math.PI / 2 + (Math.PI * 2 * (index + 1)) / nodes.length;
    const nextX = cx + Math.cos(nextAngle) * radius;
    const nextY = cy + Math.sin(nextAngle) * radius;

    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, nextX, nextY);
    ctx.stroke();

    ctx.fillStyle = index % 2 === 0 ? "#eef6ff" : "#ecfdf5";
    ctx.strokeStyle = rgb(CHART_COLORS[index % CHART_COLORS.length]);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 11px Arial";
    wrapCanvasText(ctx, label, x - 25, y - 6, 50, 12, 3);
  });

  ctx.textAlign = "left";
}

function drawDynamicGraph(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 166, cy + 104);
  ctx.lineTo(cx + 166, cy + 104);
  ctx.moveTo(cx - 150, cy + 116);
  ctx.lineTo(cx - 150, cy - 112);
  ctx.stroke();

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx - 132, cy + 76);
  ctx.bezierCurveTo(cx - 66, cy - 30, cx + 28, cy - 62, cx + 136, cy - 84);
  ctx.stroke();

  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(cx - 132, cy + 58);
  ctx.bezierCurveTo(cx - 42, cy + 10, cx + 34, cy + 2, cx + 136, cy - 26);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 13px Arial";
  ctx.fillText(labels[0] ?? "Input variable", cx - 146, cy + 134);
  ctx.save();
  ctx.translate(cx - 184, cy + 34);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(labels[1] ?? "Output", 0, 0);
  ctx.restore();
  ctx.fillText(labels[2] ?? "Trend", cx + 58, cy - 74);
  ctx.fillText(labels[3] ?? "Reference", cx + 58, cy - 16);
}

function drawDynamicLayers(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  const layers = labels.slice(0, 5);
  const top = cy - 116;

  layers.forEach((label, index) => {
    const width = 310 - index * 34;
    const x = cx - width / 2;
    const y = top + index * 48;
    ctx.fillStyle = index % 2 === 0 ? "#dbeafe" : "#dcfce7";
    ctx.strokeStyle = rgb(CHART_COLORS[index % CHART_COLORS.length]);
    ctx.lineWidth = 4;
    ctx.roundRect(x, y, width, 36, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, y + 23);
  });

  ctx.textAlign = "left";
}

function drawElectricalLayout(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  const labelSet = getDynamicLabels(labels, "PV system layout");
  const pvLabel = labelSet.find((label) => /pv|panel|module|array|string|solar/i.test(label)) ?? "PV array";
  const inverterLabel = labelSet.find((label) => /inverter|converter|dc|ac/i.test(label)) ?? "Inverter";
  const outputLabel = labelSet.find((label) => /grid|load|meter|output|ac/i.test(label)) ?? "Grid / load";
  const supportLabel = labelSet.find((label) => /mount|tracking|structure|connection|protection/i.test(label)) ?? "Protection";
  const monitorLabel = labelSet.find((label) => /monitor|data|sensor|meter|control/i.test(label)) ?? "Monitoring";

  const blocks = [
    [cx - 150, cy - 42, pvLabel, "#dbeafe", "#2563eb"],
    [cx, cy - 42, inverterLabel, "#ecfdf5", "#0f766e"],
    [cx + 150, cy - 42, outputLabel, "#fff7ed", "#d97706"],
    [cx - 72, cy + 84, supportLabel, "#fef2f2", "#e11d48"],
    [cx + 92, cy + 84, monitorLabel, "#f8fafc", "#64748b"],
  ] as const;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 4;
  [
    [cx - 90, cy - 42, cx - 60, cy - 42],
    [cx + 60, cy - 42, cx + 90, cy - 42],
    [cx, cy - 10, cx + 78, cy + 52],
    [cx - 150, cy - 8, cx - 72, cy + 52],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  blocks.forEach(([x, y, label, fill, stroke]) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.roundRect(x - 56, y - 30, 112, 60, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px Arial";
    wrapCanvasText(ctx, label, x - 44, y - 7, 88, 13, 3);
  });

  ctx.fillStyle = "#475569";
  ctx.font = "700 12px Arial";
  ctx.fillText("DC", cx - 82, cy - 56);
  ctx.fillText("AC", cx + 72, cy - 56);
}

function drawLossFlowDiagram(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  labels: string[],
) {
  const labelSet = getDynamicLabels(labels, "loss flow");
  const inputLabel = labelSet.find((label) => /irradiance|input|solar|weather/i.test(label)) ?? "Irradiance";
  const tempLabel = labelSet.find((label) => /temperature|thermal|heat/i.test(label)) ?? "Temperature";
  const lossLabel = labelSet.find((label) => /loss|soiling|shading|mismatch/i.test(label)) ?? "Losses";
  const modelLabel = labelSet.find((label) => /model|performance|ratio|efficiency/i.test(label)) ?? "PV model";
  const outputLabel = labelSet.find((label) => /yield|energy|production|output/i.test(label)) ?? "Energy output";

  const nodes = [
    [cx - 156, cy - 68, inputLabel, "#dbeafe", "#2563eb"],
    [cx - 16, cy - 68, tempLabel, "#fff7ed", "#d97706"],
    [cx + 124, cy - 68, lossLabel, "#fef2f2", "#e11d48"],
    [cx - 72, cy + 66, modelLabel, "#ecfdf5", "#0f766e"],
    [cx + 100, cy + 66, outputLabel, "#f8fafc", "#64748b"],
  ] as const;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 4;
  [
    [cx - 100, cy - 68, cx - 72, cy + 36],
    [cx - 16, cy - 38, cx - 72, cy + 36],
    [cx + 124, cy - 38, cx - 72, cy + 36],
    [cx - 16, cy + 66, cx + 44, cy + 66],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  nodes.forEach(([x, y, label, fill, stroke]) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.roundRect(x - 58, y - 28, 116, 56, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px Arial";
    wrapCanvasText(ctx, label, x - 46, y - 7, 92, 13, 3);
  });
}

function drawSolarCellIVCurve(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const left = cx - 172;
  const bottom = cy + 110;
  const right = cx + 166;
  const top = cy - 120;
  const mppX = cx + 18;
  const mppY = cy - 36;

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  ctx.strokeStyle = "#0f766e";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(left, cy - 72);
  ctx.bezierCurveTo(cx - 86, cy - 78, cx - 24, cy - 70, mppX, mppY);
  ctx.bezierCurveTo(cx + 68, cy + 6, cx + 116, cy + 74, right - 18, bottom);
  ctx.stroke();

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left, bottom);
  ctx.bezierCurveTo(cx - 66, cy + 84, cx + 4, cy + 16, mppX, mppY);
  ctx.bezierCurveTo(cx + 38, cy - 66, cx + 104, cy - 20, right - 10, cy + 88);
  ctx.stroke();

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 7]);
  ctx.strokeRect(left, mppY, mppX - left, bottom - mppY);
  ctx.beginPath();
  ctx.moveTo(mppX, mppY);
  ctx.lineTo(mppX, bottom);
  ctx.moveTo(left, mppY);
  ctx.lineTo(mppX, mppY);
  ctx.stroke();
  ctx.setLineDash([]);

  [
    [left, cy - 72, "Isc", "#0f766e"],
    [right - 18, bottom, "Voc", "#0f766e"],
    [mppX, bottom, "Vmp", "#f59e0b"],
    [left, mppY, "Imp", "#f59e0b"],
    [mppX, mppY, "MPP", "#ef4444"],
  ].forEach(([x, y, label, color]) => {
    ctx.fillStyle = color as string;
    ctx.beginPath();
    ctx.arc(x as number, y as number, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px Arial";
    ctx.fillText(label as string, (x as number) + 10, (y as number) - 8);
  });

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 13px Arial";
  ctx.fillText("Voltage (V)", cx + 62, bottom + 28);
  ctx.save();
  ctx.translate(left - 30, cy - 44);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Current (A)", 0, 0);
  ctx.restore();
  ctx.fillStyle = "#2563eb";
  ctx.fillText("P-V", cx + 114, cy + 82);
  ctx.fillStyle = "#0f766e";
  ctx.fillText("I-V", cx + 96, cy - 78);
}

function drawSolarCellTestSetup(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const nodes = [
    [cx - 150, cy - 84, "Solar simulator", "#fef9c3", "#ca8a04"],
    [cx - 28, cy - 6, "Solar cell", "#dcfce7", "#0f766e"],
    [cx + 132, cy - 6, "I-V tracer", "#dbeafe", "#2563eb"],
    [cx + 132, cy + 96, "Data acquisition", "#f8fafc", "#64748b"],
    [cx - 112, cy + 94, "Temperature control", "#fff7ed", "#d97706"],
  ] as const;

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 4;
  [
    [cx - 92, cy - 62, cx - 50, cy - 20],
    [cx + 30, cy - 6, cx + 72, cy - 6],
    [cx + 132, cy + 24, cx + 132, cy + 66],
    [cx - 78, cy + 76, cx - 30, cy + 22],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });

  nodes.forEach(([x, y, label, fill, stroke]) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.roundRect(x - 58, y - 30, 116, 60, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 12px Arial";
    wrapCanvasText(ctx, label, x - 46, y - 8, 92, 13, 3);
  });

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 3;
  for (let index = 0; index < 5; index += 1) {
    ctx.beginPath();
    ctx.moveTo(cx - 104 + index * 10, cy - 54);
    ctx.lineTo(cx - 54 + index * 10, cy - 18);
    ctx.stroke();
  }
}

function drawSolarCellEquivalentCircuit(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 170, cy - 82);
  ctx.lineTo(cx + 132, cy - 82);
  ctx.lineTo(cx + 132, cy + 90);
  ctx.lineTo(cx - 170, cy + 90);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = "#0f766e";
  ctx.beginPath();
  ctx.arc(cx - 116, cy + 4, 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 116, cy + 22);
  ctx.lineTo(cx - 116, cy - 22);
  ctx.moveTo(cx - 116, cy - 22);
  ctx.lineTo(cx - 126, cy - 8);
  ctx.moveTo(cx - 116, cy - 22);
  ctx.lineTo(cx - 106, cy - 8);
  ctx.stroke();

  ctx.strokeStyle = "#2563eb";
  ctx.beginPath();
  ctx.moveTo(cx - 42, cy + 44);
  ctx.lineTo(cx - 42, cy - 44);
  ctx.lineTo(cx + 18, cy);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 24, cy - 44);
  ctx.lineTo(cx + 24, cy + 44);
  ctx.stroke();

  ctx.strokeStyle = "#e11d48";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx + 42, cy - 82);
  for (let index = 0; index < 5; index += 1) {
    const x = cx + 50 + index * 12;
    ctx.lineTo(x, index % 2 === 0 ? cy - 98 : cy - 66);
  }
  ctx.lineTo(cx + 114, cy - 82);
  ctx.stroke();

  ctx.strokeStyle = "#d97706";
  ctx.beginPath();
  ctx.moveTo(cx + 62, cy - 38);
  for (let index = 0; index < 5; index += 1) {
    const y = cy - 28 + index * 14;
    ctx.lineTo(index % 2 === 0 ? cx + 46 : cx + 78, y);
  }
  ctx.lineTo(cx + 62, cy + 48);
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 12px Arial";
  ctx.fillText("Photocurrent", cx - 160, cy + 48);
  ctx.fillText("Diode", cx - 34, cy + 66);
  ctx.fillText("Rs", cx + 72, cy - 110);
  ctx.fillText("Rsh", cx + 84, cy + 10);
  ctx.fillText("Load", cx + 144, cy + 12);
}

function drawDynamicDiagram(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  intent: DynamicDiagramIntent,
  labels: string[],
  title: string,
) {
  const diagramLabels = getDynamicLabels(labels, title);

  if (intent === "flow") {
    drawDynamicFlow(ctx, cx, cy, diagramLabels);
  } else if (intent === "system") {
    drawDynamicSystem(ctx, cx, cy, diagramLabels);
  } else if (intent === "electrical-layout") {
    drawElectricalLayout(ctx, cx, cy, diagramLabels);
  } else if (intent === "loss-flow") {
    drawLossFlowDiagram(ctx, cx, cy, diagramLabels);
  } else if (intent === "comparison") {
    drawDynamicComparison(ctx, cx, cy, diagramLabels);
  } else if (intent === "cycle") {
    drawDynamicCycle(ctx, cx, cy, diagramLabels);
  } else if (intent === "graph") {
    drawDynamicGraph(ctx, cx, cy, diagramLabels);
  } else if (intent === "layers") {
    drawDynamicLayers(ctx, cx, cy, diagramLabels);
  } else {
    drawGenericConcept(ctx, cx, cy, title, diagramLabels);
  }
}

function createTopicImage(
  notes: TopicNotes,
  variant: "hero" | "concept" | "process" | "structure" | "application",
  imageExampleIndex = -1,
) {
  if (typeof document === "undefined") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 980;
  canvas.height = 430;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const title = safeText(notes.topicTitle, "Selected Topic");
  const imageExample = imageExampleIndex >= 0 ? notes.imageExamples?.[imageExampleIndex] : undefined;
  const imageTitle = safeText(imageExample?.title);
  const imageDescription = safeText(imageExample?.description);
  const imageLabels = imageExample?.labels?.map((label) => safeText(label)).filter(Boolean) ?? [];
  const visualTitle =
    imageTitle ||
    (variant === "hero"
      ? title
      : variant === "concept"
        ? `${title} Visual Model`
        : variant === "process"
          ? `${title} Process View`
          : variant === "structure"
            ? `${title} Structure Diagram`
            : `${title} Application View`);
  const topicSignature = `${notes.subject} ${notes.unit} ${title} ${imageTitle} ${imageLabels.join(" ")}`.toLowerCase();
  const gradient = ctx.createLinearGradient(0, 0, 980, 430);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.62, "#f8fafc");
  gradient.addColorStop(1, variant === "process" ? "#eef6ff" : "#ecfdf5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 980, 430);

  const headerColor =
    variant === "process" || variant === "structure" ? "#2563eb" : "#065f46";
  ctx.fillStyle = headerColor;
  ctx.fillRect(0, 0, 980, 10);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 10, 980, 68);
  ctx.fillStyle = "#0f172a";
  ctx.font = visualTitle.length > 58 ? "700 22px Arial" : "700 27px Arial";
  wrapCanvasText(ctx, visualTitle, 34, 40, 900, 26, 2);

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 4;
  ctx.roundRect(34, 84, 448, 292, 18);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(15, 23, 42, 0.04)";
  ctx.roundRect(44, 94, 428, 272, 14);
  ctx.fill();

  if (/bohr|shell|nucleus|atomic energy|principal quantum|orbit/i.test(topicSignature)) {
    drawBohrShellDiagram(ctx, 258, 226);
  } else if (/hydrogen|spectrum|balmer|lyman|paschen|emission|absorption|transition/i.test(topicSignature)) {
    drawHydrogenSpectrumDiagram(ctx, 258, 226);
  } else if (/aufbau|orbital|subshell|electron configuration|2p|3d|4s/i.test(topicSignature)) {
    drawAufbauDiagram(ctx, 258, 226);
  } else if (/reaction coordinate|activation|reactants|products|exothermic|endothermic|energy profile/i.test(topicSignature)) {
    drawReactionEnergyProfile(ctx, 258, 226);
  } else if (/solar|photovoltaic|\bpv\b/i.test(topicSignature) && /i-v curve|current-voltage|isc|voc|vmp|imp|fill factor|p-v curve|maximum power/i.test(topicSignature)) {
    drawSolarCellIVCurve(ctx, 258, 226);
  } else if (/solar|photovoltaic|\bpv\b/i.test(topicSignature) && /simulator|curve tracer|i-v tracer|data acquisition|light source/i.test(topicSignature)) {
    drawSolarCellTestSetup(ctx, 258, 226);
  } else if (/solar|photovoltaic|\bpv\b/i.test(topicSignature) && /equivalent circuit|photocurrent|series resistance|shunt resistance|\brs\b|\brsh\b|diode/i.test(topicSignature)) {
    drawSolarCellEquivalentCircuit(ctx, 258, 226);
  } else if (/\bgalvanic\b|\belectrochemical cell\b|\bvoltaic cell\b|\bcell potential\b|\belectrode\b|\banode\b|\bcathode\b|\bsalt bridge\b/i.test(topicSignature)) {
    if (/potential|series|emf|standard/i.test(topicSignature) && variant !== "hero") {
      drawElectrochemicalPotential(ctx, 258, 226);
    } else {
      drawGalvanicCell(ctx, 258, 222);
    }
  } else if (/electrochem|redox|oxidation|reduction/i.test(topicSignature)) {
    if (variant === "process") {
      drawElectrochemicalPotential(ctx, 258, 226);
    } else {
      drawGalvanicCell(ctx, 258, 222);
    }
  } else if (/molecular orbital|mot|bonding orbital|antibonding|energy calculation/i.test(topicSignature)) {
    drawMolecularOrbitalDiagram(ctx, 258, 226);
  } else if (/quantum|molecular|energy level|spectrum/i.test(topicSignature)) {
    drawEnergyLevels(ctx, 248, 226);
  } else if (/\batom\b|\batomic\b|nucleus|proton|neutron|bohr shell/i.test(topicSignature)) {
    drawAtom(ctx, 258, 230);
  } else if (/water|pollution|environment|river|source/i.test(topicSignature)) {
    drawWaterPollution(ctx, 258, 214);
  } else {
    const dynamicLabels = imageLabels.length ? imageLabels : getImageLabels(notes);
    const dynamicIntent = chooseFallbackIntent(
      inferDynamicDiagramIntent(topicSignature, variant),
      variant,
      dynamicLabels,
    );

    drawDynamicDiagram(
      ctx,
      258,
      226,
      dynamicIntent,
      dynamicLabels,
      visualTitle,
    );
  }

  const points =
    variant === "application"
      ? [
          notes.applications?.[0],
          notes.applications?.[1],
          notes.realWorldExample,
        ]
      : variant === "process"
        ? [
            notes.sections?.find((section) => /work|process|step/i.test(section.heading))
              ?.content,
            notes.keyPoints?.[0],
            notes.keyPoints?.[1],
          ]
        : [imageDescription || notes.introduction, imageLabels[0] || notes.keyPoints?.[0], imageLabels[1] || notes.applications?.[0]];

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 21px Arial";
  ctx.fillText("Figure Notes", 532, 116);
  ctx.font = "500 17px Arial";
  ctx.fillStyle = "#475569";

  let textY = 154;
  points.filter(Boolean).slice(0, 3).forEach((point, index) => {
    ctx.fillStyle = rgb(CHART_COLORS[index % CHART_COLORS.length]);
    ctx.beginPath();
    ctx.arc(540, textY - 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#475569";
    textY = wrapCanvasText(ctx, safeText(point), 558, textY, 360, 20, 3) + 14;
  });

  return canvas.toDataURL("image/jpeg", 0.82);
}

type LoadedRealTopicImage = {
  dataUrl: string;
  format: "JPEG" | "PNG";
  title: string;
  sourceName: string;
  sourceUrl: string;
  license?: string;
  attribution?: string;
};

function getImageFormat(mime: string | undefined, dataUrl: string): LoadedRealTopicImage["format"] {
  const signature = `${mime ?? ""} ${dataUrl.slice(0, 40)}`.toLowerCase();

  if (signature.includes("png")) {
    return "PNG";
  }

  return "JPEG";
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}

async function loadRealTopicImages(notes: TopicNotes): Promise<LoadedRealTopicImage[]> {
  const candidates = notes.realTopicImages?.slice(0, 3) ?? [];
  const loaded: LoadedRealTopicImage[] = [];

  for (const image of candidates) {
    try {
      const response = await fetch(image.thumbnailUrl || image.imageUrl, {
        mode: "cors",
      });

      if (!response.ok) {
        continue;
      }

      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);
      loaded.push({
        dataUrl,
        format: getImageFormat(image.mime || blob.type, dataUrl),
        title: image.title,
        sourceName: image.sourceName,
        sourceUrl: image.sourceUrl,
        license: image.license,
        attribution: image.attribution,
      });
    } catch (error) {
      console.warn("[buildTopicPdfFile] Wikimedia image skipped", {
        title: image.title,
        error,
      });
    }
  }

  return loaded;
}

function addImageAttribution(
  doc: jsPDF,
  image: LoadedRealTopicImage,
  x: number,
  y: number,
  width: number,
) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  setTextColor(doc, COLORS.muted);
  const text = [
    image.title,
    image.sourceName,
    image.license,
    image.attribution,
  ].filter(Boolean).join(" | ");
  doc.text(safeText(text), x, y, { maxWidth: width });
}

function addRealTopicImage(
  doc: jsPDF,
  image: LoadedRealTopicImage | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  if (!image) {
    return false;
  }

  try {
    doc.addImage(image.dataUrl, image.format, x, y, width, height);
    addImageAttribution(doc, image, x, y + height + 4, width);
    return true;
  } catch (error) {
    console.warn("[buildTopicPdfFile] Failed to add Wikimedia image", {
      title: image.title,
      error,
    });
    return false;
  }
}

function addTopicImage(
  doc: jsPDF,
  notes: TopicNotes,
  variant: "hero" | "concept" | "process" | "structure" | "application",
  x: number,
  y: number,
  width: number,
  height: number,
  imageExampleIndex = -1,
  realImage?: LoadedRealTopicImage,
) {
  if (addRealTopicImage(doc, realImage, x, y, width, height)) {
    return true;
  }

  const image = createTopicImage(notes, variant, imageExampleIndex);

  if (!image) {
    return false;
  }

  doc.addImage(image, "JPEG", x, y, width, height);
  return true;
}

function ensureSpace(doc: jsPDF, y: number, neededHeight: number) {
  if (y + neededHeight <= PAGE.height - PAGE.bottom) {
    return y;
  }

  doc.addPage();
  return PAGE.margin + 4;
}

function addFooter(doc: jsPDF, topicTitle: string) {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    setDrawColor(doc, COLORS.line);
    doc.setLineWidth(0.2);
    doc.line(PAGE.margin, 282, PAGE.width - PAGE.margin, 282);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, COLORS.muted);
    doc.text(safeText(topicTitle), PAGE.margin, 288, { maxWidth: 130 });
    doc.text(`Page ${page} of ${pageCount}`, PAGE.width - PAGE.margin, 288, {
      align: "right",
    });
  }
}

function addHeader(doc: jsPDF, notes: TopicNotes, unitNumber: number) {
  setFillColor(doc, COLORS.green);
  doc.rect(0, 0, PAGE.width, 42, "F");
  setFillColor(doc, COLORS.greenDark);
  doc.rect(0, 0, 8, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(21);
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(safeText(notes.topicTitle), 160);
  doc.text(titleLines.slice(0, 2), PAGE.margin, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Unit ${unitNumber}: ${safeText(notes.unit)}`, PAGE.margin, 34);

  setFillColor(doc, COLORS.greenSoft);
  doc.roundedRect(PAGE.margin, 50, 178, 24, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setTextColor(doc, COLORS.greenDark);
  doc.text("SUBJECT", 22, 59);
  doc.text("BRANCH", 88, 59);
  doc.text("EDUCATION", 142, 59);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setTextColor(doc, COLORS.ink);
  doc.text(safeText(notes.subject, "Subject"), 22, 67, { maxWidth: 58 });
  doc.text(safeText(notes.branch, "Branch"), 88, 67, { maxWidth: 46 });
  doc.text(safeText(notes.educationType, "Education"), 142, 67, {
    maxWidth: 42,
  });

  return 84;
}

function addSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
  color: readonly [number, number, number] = COLORS.greenDark,
) {
  y = ensureSpace(doc, y, 14);
  setFillColor(doc, color);
  doc.roundedRect(PAGE.margin, y, 4, 8, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setTextColor(doc, color);
  doc.text(safeText(title), PAGE.margin + 8, y + 6.5);
  return y + 12;
}

function addParagraph(
  doc: jsPDF,
  text: string,
  y: number,
  options?: {
    left?: number;
    width?: number;
    fontSize?: number;
    lineHeight?: number;
    color?: readonly [number, number, number];
    bold?: boolean;
  },
) {
  const left = options?.left ?? PAGE.margin;
  const width = options?.width ?? PAGE.width - PAGE.margin * 2;
  const fontSize = options?.fontSize ?? 10.5;
  const lineHeight = options?.lineHeight ?? 5.5;

  doc.setFont("helvetica", options?.bold ? "bold" : "normal");
  doc.setFontSize(fontSize);
  setTextColor(doc, options?.color ?? COLORS.ink);

  const lines = doc.splitTextToSize(safeText(text), width);

  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight + 2);
    doc.text(line, left, y);
    y += lineHeight;
  }

  return y;
}

function addBulletList(
  doc: jsPDF,
  items: string[] | undefined,
  y: number,
  options?: {
    color?: readonly [number, number, number];
    columns?: number;
  },
) {
  if (!items?.length) {
    return y;
  }

  const columns = options?.columns ?? 1;
  const gap = 8;
  const columnWidth =
    (PAGE.width - PAGE.margin * 2 - gap * (columns - 1)) / columns;

  for (let index = 0; index < items.length; index += columns) {
    const rowItems = items.slice(index, index + columns);
    const rowHeights = rowItems.map((item) => {
      const lines = doc.splitTextToSize(safeText(item), columnWidth - 6);
      return Math.max(9, lines.length * 4.8 + 3);
    });
    const rowHeight = Math.max(...rowHeights);

    y = ensureSpace(doc, y, rowHeight + 2);

    for (let column = 0; column < rowItems.length; column += 1) {
      const left = PAGE.margin + column * (columnWidth + gap);

      setFillColor(doc, options?.color ?? COLORS.green);
      doc.circle(left + 2, y - 1.4, 1.2, "F");
      addParagraph(doc, rowItems[column], y, {
        left: left + 6,
        width: columnWidth - 6,
        fontSize: 9.5,
        lineHeight: 4.8,
      });
    }

    y += rowHeight;
  }

  return y + 1;
}

function addCallout(
  doc: jsPDF,
  title: string,
  body: string,
  y: number,
  fill: readonly [number, number, number],
  accent: readonly [number, number, number],
) {
  const lines = doc.splitTextToSize(safeText(body), 154);
  const height = Math.max(24, 14 + lines.length * 5);
  y = ensureSpace(doc, y, height + 5);

  setFillColor(doc, fill);
  doc.roundedRect(PAGE.margin, y, 178, height, 2, 2, "F");
  setFillColor(doc, accent);
  doc.roundedRect(PAGE.margin, y, 5, height, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  setTextColor(doc, accent);
  doc.text(safeText(title), PAGE.margin + 10, y + 8);
  addParagraph(doc, body, y + 15, {
    left: PAGE.margin + 10,
    width: 158,
    fontSize: 9.5,
    lineHeight: 5,
  });

  return y + height + 7;
}

function addCodeBlock(doc: jsPDF, label: string, code: string, y: number) {
  const codeLines = safeText(code)
    .split("\n")
    .flatMap((line) => doc.splitTextToSize(line || " ", 156));
  const height = Math.min(70, 18 + codeLines.length * 4.4);
  y = ensureSpace(doc, y, height + 6);

  setFillColor(doc, [17, 24, 39]);
  doc.roundedRect(PAGE.margin, y, 178, height, 2, 2, "F");
  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.setTextColor(187, 247, 208);
  doc.text(safeText(label, "Example"), PAGE.margin + 8, y + 8);

  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(243, 244, 246);
  let codeY = y + 15;

  for (const line of codeLines.slice(0, 12)) {
    doc.text(line, PAGE.margin + 8, codeY);
    codeY += 4.4;
  }

  return y + height + 7;
}

function addComplexityTable(doc: jsPDF, notes: TopicNotes, y: number) {
  if (!notes.complexityTable?.length) {
    return y;
  }

  y = addSectionTitle(doc, "Complexity Snapshot", y, COLORS.tableHead);

  const headers = ["Algorithm", "Best", "Average", "Worst", "Space"];
  const widths = [58, 28, 32, 28, 28];
  const rowHeight = 9;
  y = ensureSpace(doc, y, rowHeight * (notes.complexityTable.length + 2));

  setFillColor(doc, COLORS.tableHead);
  doc.rect(PAGE.margin, y, 178, rowHeight, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);

  let x = PAGE.margin + 2;
  headers.forEach((header, index) => {
    doc.text(header, x, y + 6);
    x += widths[index];
  });
  y += rowHeight;

  notes.complexityTable.slice(0, 6).forEach((row, rowIndex) => {
    setFillColor(doc, rowIndex % 2 === 0 ? [248, 250, 252] : [255, 255, 255]);
    doc.rect(PAGE.margin, y, 178, rowHeight, "F");
    setDrawColor(doc, COLORS.line);
    doc.rect(PAGE.margin, y, 178, rowHeight);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColor(doc, COLORS.ink);

    const values = [
      row.algorithm,
      row.best,
      row.average,
      row.worst,
      row.space,
    ];
    x = PAGE.margin + 2;
    values.forEach((value, index) => {
      doc.text(safeText(value), x, y + 6, { maxWidth: widths[index] - 4 });
      x += widths[index];
    });
    y += rowHeight;
  });

  return y + 6;
}

function addWorkedExamples(doc: jsPDF, notes: TopicNotes, y: number) {
  if (!notes.workedExamples?.length) {
    return y;
  }

  y = addSectionTitle(doc, "Worked Examples", y, COLORS.amber);

  notes.workedExamples.slice(0, 2).forEach((example, index) => {
    y = ensureSpace(doc, y, 40);
    setFillColor(doc, COLORS.amberSoft);
    doc.roundedRect(PAGE.margin, y, 178, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setTextColor(doc, COLORS.amber);
    doc.text(`${index + 1}. ${safeText(example.title)}`, PAGE.margin + 6, y + 7);
    y += 15;
    y = addParagraph(doc, `Problem: ${example.problem}`, y, {
      fontSize: 9.5,
      lineHeight: 5,
      bold: true,
    });
    y = addParagraph(doc, `Solution: ${example.solution}`, y + 1, {
      fontSize: 9.5,
      lineHeight: 5,
    });
    y += 4;
  });

  return y;
}

function addPageTitle(
  doc: jsPDF,
  title: string,
  subtitle: string,
  color: readonly [number, number, number] = COLORS.greenDark,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setTextColor(doc, COLORS.ink);
  doc.text(safeText(title), PAGE.margin, 18, { maxWidth: 126 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setTextColor(doc, COLORS.muted);
  doc.text(safeText(subtitle), PAGE.width - PAGE.margin, 15, {
    align: "right",
    maxWidth: 70,
  });
  setDrawColor(doc, color);
  doc.setLineWidth(0.8);
  doc.line(PAGE.margin, 25, PAGE.width - PAGE.margin, 25);

  return 39;
}

function addCoverPage(
  doc: jsPDF,
  notes: TopicNotes,
  unitNumber: number,
) {
  setFillColor(doc, COLORS.greenSoft);
  doc.rect(0, 0, PAGE.width, PAGE.height, "F");
  setFillColor(doc, COLORS.greenDark);
  doc.rect(0, 0, PAGE.width, 82, "F");
  setFillColor(doc, COLORS.green);
  doc.rect(0, 82, PAGE.width, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("AI ACADEMICS TOPIC NOTES", PAGE.margin, 24);

  doc.setFontSize(26);
  doc.text(doc.splitTextToSize(safeText(notes.topicTitle), 174), PAGE.margin, 50);

  setFillColor(doc, [255, 255, 255]);
  doc.roundedRect(PAGE.margin, 112, 178, 82, 3, 3, "F");
  setDrawColor(doc, COLORS.line);
  doc.roundedRect(PAGE.margin, 112, 178, 82, 3, 3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColor(doc, COLORS.greenDark);
  doc.text("Topic Profile", PAGE.margin + 10, 129);

  const rows = [
    ["Subject", notes.subject],
    ["Unit", `Unit ${unitNumber}: ${notes.unit}`],
    ["Branch", notes.branch],
    ["Education Type", notes.educationType],
    ["Pages", "10 to 16 page detailed study PDF"],
  ];

  let y = 143;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setTextColor(doc, COLORS.muted);
    doc.text(label.toUpperCase(), PAGE.margin + 10, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    setTextColor(doc, COLORS.ink);
    doc.text(safeText(value), PAGE.margin + 58, y, { maxWidth: 108 });
    y += 11;
  });
}

function addContentsPage(doc: jsPDF, notes: TopicNotes) {
  doc.addPage();
  let y = addPageTitle(doc, "Contents", notes.topicTitle, COLORS.tableHead);
  const contents = [
    "Topic profile and introduction",
    "Detailed explanation",
    "Core concepts",
    "Working method",
    "Types and variations",
    "Advantages and limitations",
    "Worked examples",
    "Key points and applications",
    "Key terms",
    "Topic visual and exam guide",
    "Practice sets",
    "Exam revision sheet",
  ];

  y = addSectionTitle(doc, "Chapter Roadmap", y, COLORS.tableHead);
  contents.forEach((item, index) => {
    y = ensureSpace(doc, y, 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTextColor(doc, COLORS.greenDark);
    doc.text(String(index + 1).padStart(2, "0"), PAGE.margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setTextColor(doc, COLORS.ink);
    doc.text(item, PAGE.margin + 18, y, { maxWidth: 145 });
    y += 11;
  });

  y = addSectionTitle(doc, "Learning Objectives", y + 4, COLORS.blue);
  addBulletList(
    doc,
    [
      `Define and explain ${notes.topicTitle} clearly.`,
      "Write structured exam answers with examples.",
      "Use diagrams, key terms, and applications confidently.",
      "Revise important points before classroom assessment.",
    ],
    y,
    { color: COLORS.blue },
  );
}

function addDeepDivePage(doc: jsPDF, notes: TopicNotes, pageIndex: number) {
  doc.addPage();
  let y = addPageTitle(doc, `Detailed Study ${pageIndex}`, notes.topicTitle, COLORS.greenDark);
  const sections = notes.sections?.length ? notes.sections : [];
  const section = sections[(pageIndex - 1) % Math.max(1, sections.length)];

  y = addSectionTitle(doc, section?.heading ?? "Concept Development", y);
  y = addParagraph(
    doc,
    section?.content ??
      `${notes.topicTitle} should be studied by connecting definition, purpose, working, examples, and applications. This helps students write complete answers and avoid memorizing isolated points.`,
    y,
  );
  y = addBulletList(
    doc,
    section?.bulletPoints?.length
      ? section.bulletPoints
      : notes.keyPoints?.slice(0, 5),
    y,
    { columns: 1 },
  );

  y = addSectionTitle(doc, "Exam Explanation", y + 4, COLORS.blue);
  y = addParagraph(
    doc,
    `For exam writing, ${notes.topicTitle} should be explained with exact terms from the unit. Start with the core meaning, then write the governing principle or relationship, then explain how the important quantities or parts are connected. Add a relevant example, formula, diagram, or application depending on the question type.`,
    y,
  );

  y = addSectionTitle(doc, "Exam Writing Pattern", y + 4, COLORS.amber);
  addBulletList(
    doc,
    [
      "Begin with a direct definition.",
      "Explain the core idea in a short paragraph.",
      "Add a diagram, table, or flow if useful.",
      "Include two or three key points.",
      "End with applications, limitations, or a summary line.",
    ],
    y,
    { color: COLORS.amber },
  );
}

function addQuestionSetPage(doc: jsPDF, notes: TopicNotes, setNumber: number) {
  doc.addPage();
  let y = addPageTitle(doc, `Practice Set ${setNumber}`, notes.topicTitle, setNumber % 2 === 0 ? COLORS.blue : COLORS.greenDark);
  const focusItems = [
    ...(notes.keyTerms?.map((term) => term.term) ?? []),
    ...(notes.keyPoints ?? []),
    ...(notes.applications ?? []),
  ].filter(Boolean);

  const questions = Array.from({ length: 10 }, (_, index) => {
    const focus =
      focusItems[(index + setNumber * 3) % Math.max(1, focusItems.length)] ??
      notes.topicTitle;

    if (index % 3 === 0) {
      return `Explain ${focus} with reference to ${notes.topicTitle}.`;
    }

    if (index % 3 === 1) {
      return `Write short notes on ${focus} and give one example.`;
    }

    return `How does ${focus} help in understanding ${notes.topicTitle}?`;
  });

  y = addSectionTitle(doc, "Short Answer Questions", y, COLORS.blue);
  y = addBulletList(doc, questions.slice(0, 5), y, { color: COLORS.blue });
  y = addSectionTitle(doc, "Long Answer Questions", y + 4, COLORS.amber);
  y = addBulletList(doc, questions.slice(5), y, { color: COLORS.amber });
  y = addSectionTitle(doc, "Answer Hints", y + 4, COLORS.greenDark);
  addBulletList(
    doc,
    [
      "Use definition, explanation, diagram, example, and conclusion.",
      "Underline key terms while writing long answers.",
      "Keep diagrams simple and well labeled.",
      "Connect every answer back to the selected topic.",
    ],
    y,
  );
}

function addRevisionPage(doc: jsPDF, notes: TopicNotes) {
  doc.addPage();
  let y = addPageTitle(doc, "Quick Revision Sheet", notes.topicTitle, COLORS.rose);
  y = addSectionTitle(doc, "Must Remember", y, COLORS.rose);
  y = addBulletList(doc, notes.keyPoints?.slice(0, 8), y, {
    color: COLORS.rose,
    columns: 2,
  });
  y = addSectionTitle(doc, "Important Terms", y + 4, COLORS.greenDark);
  addBulletList(
    doc,
    notes.keyTerms?.slice(0, 8).map((term) => `${term.term}: ${term.definition}`),
    y,
  );
}

function addTextbookExpansionPages(
  doc: jsPDF,
  notes: TopicNotes,
) {
  let deepDivePage = 1;
  while (doc.getNumberOfPages() < 12) {
    addDeepDivePage(doc, notes, deepDivePage);
    deepDivePage += 1;
  }

  let practiceSet = 1;
  while (doc.getNumberOfPages() < TARGET_TEXTBOOK_PAGES - 1) {
    addQuestionSetPage(doc, notes, practiceSet);
    practiceSet += 1;
  }

  if (doc.getNumberOfPages() < TARGET_TEXTBOOK_PAGES) {
    addRevisionPage(doc, notes);
  }
}

function capPdfPageCount(doc: jsPDF) {
  while (doc.getNumberOfPages() > MAX_TEXTBOOK_PAGES) {
    doc.deletePage(doc.getNumberOfPages());
  }
}

function addKeyTerms(doc: jsPDF, notes: TopicNotes, y: number) {
  if (!notes.keyTerms?.length) {
    return y;
  }

  y = addSectionTitle(doc, "Key Terms", y, COLORS.rose);

  notes.keyTerms.slice(0, 5).forEach((keyTerm) => {
    y = ensureSpace(doc, y, 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setTextColor(doc, COLORS.rose);
    doc.text(safeText(keyTerm.term), PAGE.margin, y);
    y = addParagraph(doc, keyTerm.definition, y + 5, {
      left: PAGE.margin + 5,
      width: 172,
      fontSize: 9,
      lineHeight: 4.8,
    });
    y += 2;
  });

  return y;
}

export async function buildTopicPdfFile(params: {
  notes: TopicNotes;
  unitNumber: number;
}): Promise<File> {
  const { notes, unitNumber } = params;
  const realImages = await loadRealTopicImages(notes);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  addCoverPage(doc, notes, unitNumber);
  addContentsPage(doc, notes);
  doc.addPage();

  let y = addHeader(doc, notes, unitNumber);

  y = addCallout(
    doc,
    "In Brief",
    notes.introduction,
    y,
    COLORS.greenSoft,
    COLORS.greenDark,
  );

  y = addSectionTitle(doc, "Detailed Explanation", y);
  y = addParagraph(doc, notes.explanation, y);
  y += 4;

  y = ensureSpace(doc, y, 86);
  if (addTopicImage(doc, notes, "structure", PAGE.margin, y, 178, 78, -1, realImages[0])) {
    y += 88;
  }

  for (const section of (notes.sections ?? []).slice(0, 5)) {
    y = addSectionTitle(doc, section.heading, y);
    y = addParagraph(doc, section.content, y);
    y = addBulletList(doc, section.bulletPoints, y, { columns: 2 });

    if (section.codeExample) {
      y = addCodeBlock(
        doc,
        section.codeExample.label,
        section.codeExample.code,
        y,
      );
    }
  }

  y = addComplexityTable(doc, notes, y);
  y = addWorkedExamples(doc, notes, y);

  y = addSectionTitle(doc, "Key Points", y, COLORS.blue);
  y = addBulletList(doc, notes.keyPoints?.slice(0, 8), y, {
    color: COLORS.blue,
    columns: 2,
  });

  y = addSectionTitle(doc, "Advantages", y);
  y = addBulletList(doc, notes.advantages?.slice(0, 6), y, { columns: 2 });

  y = addSectionTitle(doc, "Applications", y, COLORS.amber);
  y = addBulletList(doc, notes.applications?.slice(0, 6), y, {
    color: COLORS.amber,
    columns: 2,
  });

  if (notes.realWorldExample) {
    y = addCallout(
      doc,
      "Real World Example",
      notes.realWorldExample,
      y,
      COLORS.blueSoft,
      COLORS.blue,
    );
  }

  y = addKeyTerms(doc, notes, y);

  if (notes.summary) {
    addCallout(doc, "Summary", notes.summary, y, COLORS.amberSoft, COLORS.amber);
  }

  addTextbookExpansionPages(doc, notes);
  capPdfPageCount(doc);
  addFooter(doc, notes.topicTitle);

  const fileName = sanitizeFileName(notes.topicTitle || "topic-notes");
  const blob = doc.output("blob");

  return new File([blob], `${fileName}.pdf`, {
    type: "application/pdf",
  });
}
