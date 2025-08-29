import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req) {
  const data = await req.json();

  // Example payload structure:
  // {
  //   id: "12345",
  //   customer: "ACME Logistics",
  //   date: "2025-08-28",
  //   items: [{ desc: "Line Haul", amount: "$1,000" }, { desc: "Fuel", amount: "$250" }],
  //   total: "$1,250"
  // }

  const html = `
    <html>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body>
        <div class="p-12 font-sans">
          <h1 class="text-4xl font-bold mb-6">Invoice #${data.id}</h1>
          <p><strong>Customer:</strong> ${data.customer}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <table class="w-full mt-6 border-collapse border">
            <thead>
              <tr class="bg-gray-100">
                <th class="border px-4 py-2">Description</th>
                <th class="border px-4 py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.items
                .map(
                  (item) => `
                  <tr>
                    <td class="border px-4 py-2">${item.desc}</td>
                    <td class="border px-4 py-2">${item.amount}</td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <h2 class="text-right text-2xl font-bold mt-6">Total: ${data.total}</h2>
        </div>
      </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${data.id}.pdf`,
    },
  });
}
