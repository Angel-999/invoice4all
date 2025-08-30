export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Document, renderToStream } from "@react-pdf/renderer";
import React from "react";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { fakeInvoice } from "./fakePayLoad";

// Factoriza la lógica en una función utilitaria
async function renderInvoicePdf(payload) {
  const stream = await renderToStream(
    <Document>
      <InvoiceDocument payload={payload} />
    </Document>
  );

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${payload.id || "dev"}.pdf`,
      "Access-Control-Allow-Origin": "*", // ✅ Allow all origins
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    payload = fakeInvoice;
  }
  return renderInvoicePdf(payload);
}

// GET simplemente usa el fake payload
export async function GET() {
  return renderInvoicePdf(fakeInvoice);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*", // ✅ Allow all origins
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}