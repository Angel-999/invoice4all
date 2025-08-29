import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";

export async function GET(req: NextRequest) {
  const invoiceData = {
    invoiceNumber: "INV-2025-001",
    date: "2025-08-29",
    dueDate: "2025-09-15",
    company: { name: "Cashy Inc.", address: "123 Market St, San Diego, CA", phone: "+1 (555) 555-5555" },
    customer: { name: "Three Stars Transport Inc.", address: "456 Truck Ave, Laredo, TX" },
    items: [
      { description: "Freight Load #1234", quantity: 1, unitPrice: 1500 },
      { description: "Fuel Surcharge", quantity: 1, unitPrice: 200 },
    ],
  };

  // ✅ Wrap PDFKit generation in a Promise that resolves when 'end' fires
  const buffer: Buffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err) => reject(err));

    // HEADER
    doc.fontSize(20).text(invoiceData.company.name, 50, 50);
    doc.fontSize(10).text(invoiceData.company.address, 50, 80);
    doc.text(invoiceData.company.phone, 50, 95);

    // CUSTOMER INFO
    doc.fontSize(12)
      .text(`Invoice #: ${invoiceData.invoiceNumber}`, 400, 50)
      .text(`Date: ${invoiceData.date}`, 400, 65)
      .text(`Due: ${invoiceData.dueDate}`, 400, 80);

    doc.moveDown().text(`Bill To:`, 50, 150)
      .fontSize(12)
      .text(invoiceData.customer.name, 50, 165)
      .text(invoiceData.customer.address, 50, 180);

    // TABLE
    let position = 220;
    doc.font("Helvetica-Bold").text("Description", 50, position);
    doc.text("Qty", 300, position);
    doc.text("Unit Price", 350, position);
    doc.text("Total", 450, position);
    doc.font("Helvetica");

    let total = 0;
    invoiceData.items.forEach((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      total += itemTotal;
      position += 25;
      doc.text(item.description, 50, position);
      doc.text(item.quantity.toString(), 300, position);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 350, position);
      doc.text(`$${itemTotal.toFixed(2)}`, 450, position);
    });

    // TOTAL
    position += 40;
    doc.font("Helvetica-Bold").text("Total:", 350, position);
    doc.text(`$${total.toFixed(2)}`, 450, position);

    doc.end();
  });

  // ✅ Return as Response with correct headers
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=${invoiceData.invoiceNumber}.pdf`,
    },
  });
}
