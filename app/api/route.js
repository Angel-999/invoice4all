// app/api/invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function POST(req) {
  try {
    const data = await req.json();

    // Launch headless Chromium (works on Vercel)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Inject your HTML + Tailwind
    await page.setContent(`
      <html>
        <head>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body class="p-10">
          <h1 class="text-2xl font-bold">Invoice #${data.invoiceNumber}</h1>
          <p>Customer: ${data.customerName}</p>
          <p>Total: $${data.total}</p>
        </body>
      </html>
    `);

    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${data.invoiceNumber}.pdf`,
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate invoice PDF", details: err.message },
      { status: 500 }
    );
  }
}
