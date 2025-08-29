// app/api/invoice/route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req) {
  const data = await req.json();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  // Inject invoice HTML (styled with Tailwind)
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
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${data.invoiceNumber}.pdf`,
    },
  });
}
