import puppeteer from "puppeteer";
import { buildTopicHtml } from "./Generatetopichtml";
import { TopicNotes } from "./Generatetopicnotes";


/**
 * Renders topic notes to a PDF Buffer using Puppeteer.
 * The HTML is built locally — no network call needed.
 *
 * Install: npm install puppeteer
 */
export async function generateTopicPdf(notes: TopicNotes): Promise<Buffer> {
  const html = buildTopicHtml(notes);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",   // important in server/Docker envs
    ],
  });

  try {
    const page = await browser.newPage();

    // Set content and wait for all fonts / layout to settle
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Emit PDF as a Buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,       // required for colored backgrounds
      margin: {
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
      displayHeaderFooter: false,  // we draw our own header/footer in HTML
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}