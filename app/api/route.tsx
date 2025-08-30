export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { Document, renderToStream } from "@react-pdf/renderer";
import React from "react";
import { InvoiceDocument } from "@/components/InvoiceDocument";
import { fakeInvoice } from "./fakePayLoad";

// Factoriza la lógica en una función utilitaria
async function renderInvoicePdf(payload: any) {
  const stream = await renderToStream(
    <Document>
      <InvoiceDocument payload={payload} />
    </Document>
  );

  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=invoice-${payload.id || "dev"}.pdf`,
    },
  });
}

export async function POST(req: Request) {
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