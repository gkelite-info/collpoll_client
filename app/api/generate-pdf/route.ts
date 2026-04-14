// import { NextResponse } from "next/server";
// import puppeteer from "puppeteer";

// export const runtime = "nodejs";

// export async function POST(req: Request) {
//   try {
//     const { html } = await req.json();

//     console.log("Launching browser...");

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--disable-gpu",
//       ],
//     });

//     console.log("Browser launched, opening page...");

//     const page = await browser.newPage();

//     // catch any page-level errors
//     page.on("error", (err) => console.error("Page error:", err));
//     page.on("pageerror", (err) => console.error("Page JS error:", err));

//     await page.setContent(html, {
//       waitUntil: "domcontentloaded",  // ← CHANGED: was "networkidle0" which times out on external fonts/resources
//       timeout: 60000,                 // ← CHANGED: increased from 30000 to 60000
//     });

//     console.log("Content set, waiting for styles...");

//     // ← ADD: wait for all external resources (fonts, images) to finish loading
//     await page.evaluate(() => new Promise<void>((resolve) => {
//       if (document.readyState === "complete") return resolve();
//       window.addEventListener("load", () => resolve());
//     }));

//     await page.waitForFunction(() => document.fonts.ready);
//     await new Promise((resolve) => setTimeout(resolve, 500));

//     console.log("Generating PDF...");

//     const pdf = await page.pdf({
//       format: "A4",
//       printBackground: true,
//       margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
//       timeout: 60000,                 // ← ADD: explicit timeout for pdf generation itself
//     });

//     await browser.close();

//     console.log("PDF generated successfully, size:", pdf.length);

//     const pdfBuffer = Buffer.from(pdf);

//     return new NextResponse(pdfBuffer, {
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": "attachment; filename=Resume.pdf",
//       },
//     });
//   } catch (error) {
//     console.error("PDF generation error:", error);
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : "PDF generation failed" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { html } = await req.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content required" },
        { status: 400 }
      );
    }

    const isDev = process.env.NODE_ENV === "development";

    let browser;

    if (isDev) {
      // local → use full puppeteer (auto chromium)
      const puppeteer = (await import("puppeteer")).default;

      browser = await puppeteer.launch({
        headless: true,
      });

    } else {
      // production → use serverless chromium
      const puppeteer = (await import("puppeteer-core")).default;
      const chromium = (await import("@sparticuz/chromium")).default;

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    }

    const page = await browser.newPage();

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        if (document.readyState === "complete") resolve();
        else window.addEventListener("load", () => resolve());
      });
    });

    await page.waitForFunction(() => document.fonts.ready);

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0mm",
        bottom: "0mm",
        left: "0mm",
        right: "0mm",
      },
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          "attachment; filename=Resume.pdf",
      },
    });

  } catch (error) {
    console.error("PDF error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "PDF generation failed",
      },
      { status: 500 }
    );
  }
}