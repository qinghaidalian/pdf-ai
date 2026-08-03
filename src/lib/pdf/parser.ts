export interface ParseResult {
  text: string;
  pageCount: number;
  info: Record<string, unknown>;
}

export async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  // Dynamic import works in both Node.js ESM and Next.js bundled output
  const pdfParseModule = await import("pdf-parse");
  // pdf-parse v1.x: default export is the parse function
  const pdfParse = (pdfParseModule as any).default || pdfParseModule;

  const data = await pdfParse(buffer);

  return {
    text: data.text || "",
    pageCount: data.numpages || 0,
    info: data.info || {},
  };
}
