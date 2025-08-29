// /pages/api/invoice.ts
import type { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Example data (this can come from DB, req.body, etc.)
  const invoiceData = {
    invoiceNumber: "INV-2025-001",
    date: "2025-08-29",
    dueDate: "2025-09-15",
    company: {
      name: "Cashy Inc.",
      address: "123 Market St, San Diego, CA",
      phone: "+1 (555) 555-5555",
      logoUrl: null, // add base64 or remote image if needed
    },
    customer: {
      name: "Three Stars Transport Inc.",
      address: "456 Truck Ave, Laredo, TX",
    },
    items: [
      { description: "Freight Load #1234", quantity: 1, unitPrice: 1500 },
      { description: "Fuel Surcharge", quantity: 1, unitPrice: 200 },
    ],
  };

  // Set response headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${invoiceData.invoiceNumber}.pdf`);

  // Create PDF stream
  const doc = new PDFDocument({ margin: 50 });

  // Pipe PDF into response
  doc.pipe(res);

  // ---------- HEADER ----------
  if (invoiceData.company.logoUrl) {
    doc.image(invoiceData.company.logoUrl, 50, 45, { width: 100 });
  }
  doc
    .fontSize(20)
    .text(invoiceData.company.name, 50, 50)
    .fontSize(10)
    .text(invoiceData.company.address, 50, 80)
    .text(invoiceData.company.phone, 50, 95);

  // ---------- CUSTOMER INFO ----------
  doc
    .fontSize(12)
    .text(`Invoice #: ${invoiceData.invoiceNumber}`, 400, 50)
    .text(`Date: ${invoiceData.date}`, 400, 65)
    .text(`Due: ${invoiceData.dueDate}`, 400, 80);

  doc
    .moveDown()
    .text(`Bill To:`, 50, 150)
    .fontSize(12)
    .text(invoiceData.customer.name, 50, 165)
    .text(invoiceData.customer.address, 50, 180);

  // ---------- TABLE ----------
  const tableTop = 220;
  let position = tableTop;

  doc.font("Helvetica-Bold").text("Description", 50, position);
  doc.text("Qty", 300, position);
  doc.text("Unit Price", 350, position);
  doc.text("Total", 450, position);
  doc.moveDown();
  doc.font("Helvetica");

  let total = 0;
  invoiceData.items.forEach((item, i) => {
    const itemTotal = item.quantity * item.unitPrice;
    total += itemTotal;
    position += 25;
    doc.text(item.description, 50, position);
    doc.text(item.quantity.toString(), 300, position);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 350, position);
    doc.text(`$${itemTotal.toFixed(2)}`, 450, position);
  });

  // ---------- TOTAL ----------
  position += 40;
  doc.font("Helvetica-Bold").text("Total:", 350, position);
  doc.text(`$${total.toFixed(2)}`, 450, position);

  // End PDF
  doc.end();
}
