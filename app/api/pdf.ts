// pages/api/pdf.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { MyDocument } from "@/components/MyDocument";
import { renderToStream } from "@react-pdf/renderer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const stream = await renderToStream(<MyDocument />);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=document.pdf");

    stream.pipe(res); // Pipe the PDF stream directly to the response
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating PDF");
  }
}
