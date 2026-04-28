"use client";

import jsPDF from "jspdf";

import { type TopicNotes } from "@/lib/helpers/faculty/ai/Generatetopicnotes";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._ -]/g, "").trim().replace(/\s+/g, " ");
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  y: number,
  options?: {
    fontSize?: number;
    lineHeight?: number;
    left?: number;
    maxWidth?: number;
    isBold?: boolean;
  },
) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = options?.left ?? 16;
  const maxWidth = options?.maxWidth ?? 178;
  const fontSize = options?.fontSize ?? 11;
  const lineHeight = options?.lineHeight ?? 6;

  doc.setFont("helvetica", options?.isBold ? "bold" : "normal");
  doc.setFontSize(fontSize);

  const lines = doc.splitTextToSize(text, maxWidth);

  for (const line of lines) {
    if (y > pageHeight - 16) {
      doc.addPage();
      y = 16;
    }

    doc.text(line, left, y);
    y += lineHeight;
  }

  return y;
}

export async function buildTopicPdfFile(params: {
  notes: TopicNotes;
  unitNumber: number;
}): Promise<File> {
  const { notes, unitNumber } = params;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(notes.topicTitle, 16, y);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(85, 85, 85);
  doc.text(`Subject: ${notes.subject}`, 16, y);
  y += 5;
  doc.text(`Unit ${unitNumber}: ${notes.unit}`, 16, y);
  y += 5;
  doc.text(`Branch: ${notes.branch}`, 16, y);
  y += 5;
  doc.text(`Education Type: ${notes.educationType}`, 16, y);
  y += 8;
  doc.setTextColor(0, 0, 0);

  y = addWrappedText(doc, "Introduction", y, {
    fontSize: 13,
    lineHeight: 7,
    isBold: true,
  });
  y = addWrappedText(doc, notes.introduction, y, {
    fontSize: 11,
    lineHeight: 6,
  });
  y += 2;

  y = addWrappedText(doc, "Detailed Explanation", y, {
    fontSize: 13,
    lineHeight: 7,
    isBold: true,
  });
  y = addWrappedText(doc, notes.explanation, y, {
    fontSize: 11,
    lineHeight: 6,
  });
  y += 2;

  for (const section of notes.sections) {
    y = addWrappedText(doc, section.heading, y, {
      fontSize: 13,
      lineHeight: 7,
      isBold: true,
    });
    y = addWrappedText(doc, section.content, y, {
      fontSize: 11,
      lineHeight: 6,
    });

    if (section.bulletPoints?.length) {
      for (const bullet of section.bulletPoints) {
        y = addWrappedText(doc, `- ${bullet}`, y, {
          fontSize: 10,
          lineHeight: 5.5,
          left: 20,
          maxWidth: 170,
        });
      }
    }

    if (section.codeExample) {
      y = addWrappedText(doc, section.codeExample.label, y, {
        fontSize: 11,
        lineHeight: 6,
        isBold: true,
      });

      const codeLines = section.codeExample.code.split("\n");
      for (const line of codeLines) {
        y = addWrappedText(doc, line, y, {
          fontSize: 9,
          lineHeight: 5,
          left: 20,
          maxWidth: 170,
        });
      }
    }

    y += 2;
  }

  const listSections = [
    { heading: "Key Points", items: notes.keyPoints },
    { heading: "Advantages", items: notes.advantages },
    { heading: "Applications", items: notes.applications },
  ];

  for (const section of listSections) {
    if (!section.items?.length) {
      continue;
    }

    y = addWrappedText(doc, section.heading, y, {
      fontSize: 13,
      lineHeight: 7,
      isBold: true,
    });

    for (const item of section.items) {
      y = addWrappedText(doc, `- ${item}`, y, {
        fontSize: 10,
        lineHeight: 5.5,
        left: 20,
        maxWidth: 170,
      });
    }

    y += 2;
  }

  if (notes.realWorldExample) {
    y = addWrappedText(doc, "Real World Example", y, {
      fontSize: 13,
      lineHeight: 7,
      isBold: true,
    });
    y = addWrappedText(doc, notes.realWorldExample, y, {
      fontSize: 11,
      lineHeight: 6,
    });
    y += 2;
  }

  if (notes.keyTerms?.length) {
    y = addWrappedText(doc, "Key Terms", y, {
      fontSize: 13,
      lineHeight: 7,
      isBold: true,
    });

    for (const keyTerm of notes.keyTerms) {
      y = addWrappedText(doc, `${keyTerm.term}: ${keyTerm.definition}`, y, {
        fontSize: 10,
        lineHeight: 5.5,
        left: 20,
        maxWidth: 170,
      });
    }

    y += 2;
  }

  if (notes.summary) {
    y = addWrappedText(doc, "Summary", y, {
      fontSize: 13,
      lineHeight: 7,
      isBold: true,
    });
    addWrappedText(doc, notes.summary, y, {
      fontSize: 11,
      lineHeight: 6,
    });
  }

  const fileName = sanitizeFileName(notes.topicTitle || "topic-notes");
  const blob = doc.output("blob");

  return new File([blob], `${fileName}.pdf`, {
    type: "application/pdf",
  });
}
