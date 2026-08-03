// Create a valid, minimal PDF with extractable text content
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build PDF content streams
const textLines = [
  "EMPLOYMENT CONTRACT",
  "",
  "Party A: Beijing Technology Co., Ltd.",
  "Party B: John Smith",
  "",
  "Article 1 - Job Responsibilities",
  "Party B agrees to serve as Senior Software Engineer.",
  "",
  "Article 2 - Work Location",
  "Work location: Haidian District, Beijing, China.",
  "",
  "Article 3 - Contract Term",
  "Duration: 3 years from January 1, 2026 to December 31, 2028.",
  "",
  "Article 4 - Compensation",
  "Monthly salary: RMB 30,000, paid by Party A to Party B.",
  "",
  "Article 5 - Breach of Contract",
  "If Party B terminates early, Party B shall compensate Party A",
  "for the full remaining salary of the contract period.",
  "If contract cannot be performed due to Party A, Party A bears no liability.",
  "",
  "Article 6 - Confidentiality",
  "Party B bears permanent confidentiality obligations after termination.",
  "",
  "Article 7 - Dispute Resolution",
  "Disputes shall be under jurisdiction of court where Party A is located.",
  "",
  "Article 8 - Intellectual Property",
  "All work products created by Party B belong to Party A.",
];

// Build PDF content stream (postscript-like)
const contentParts = ["BT", "/F1 10 Tf", "50 750 Td"];
for (const line of textLines) {
  const escaped = line
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
  contentParts.push(`(${escaped}) Tj T*`);
}
contentParts.push("ET");
const contentStream = contentParts.join("\n");

// Build PDF objects
const objects = [
  "%PDF-1.4",
  `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj`,
  `2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj`,
  `3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj`,
  `4 0 obj<</Length ${contentStream.length}>>stream`,
  contentStream,
  `endstream`,
  `endobj`,
];

// Calculate exact byte positions for xref table
const NEWLINE = "\n";
let pos = 0;
const offsets = [0]; // offset[0] is always 0 (free entry)
for (const obj of objects) {
  offsets.push(pos);
  pos += obj.length + NEWLINE.length;
}

// Build xref table
const totalObjects = offsets.length; // including free entry 0
const xrefLines = [`0 ${totalObjects}`];
xrefLines.push("0000000000 65535 f ");
for (let i = 1; i < totalObjects; i++) {
  xrefLines.push(String(offsets[i]).padStart(10, "0") + " 00000 n ");
}

// Build complete PDF
const pdf = [
  ...objects,
  "xref",
  ...xrefLines,
  `trailer<</Size ${totalObjects}/Root 1 0 R>>`,
  "startxref",
  String(pos),
  "%%EOF",
].join(NEWLINE);

const outPath = path.join(__dirname, "test-contract.pdf");
fs.writeFileSync(outPath, pdf);
console.log(`PDF created: ${outPath} (${pdf.length} bytes)`);

// Verify with pdf-parse
import { createRequire } from "module";
const req = createRequire(import.meta.url);
const pdfParse = req("pdf-parse");
const buf2 = fs.readFileSync(outPath);
const result = await pdfParse(buf2);
console.log(`Pages: ${result.numpages}`);
console.log(`Text length: ${result.text.length}`);
console.log(`Text preview:\n${result.text.slice(0, 500)}`);
