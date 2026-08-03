// Test: free user contract=OK, paper=blocked
import fs from "fs";
import path from "path";

const URL = "https://hboopoukoxsmdjuxqxib.supabase.co";
const ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib29wb3Vrb3hzbWRqdXhxeGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjIyNDQsImV4cCI6MjEwMTIzODI0NH0.M8fDvaIENnGJdwNOyXGgH79vBYfiU723DmwwLbp-L-g";
const SERVICE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib29wb3Vrb3hzbWRqdXhxeGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY2MjI0NCwiZXhwIjoyMTAxMjM4MjQ0fQ.1a1zEtbLHNV28qjBiDSBNUwX9T9waKf3FnOYB_SBrHI";

async function main() {
  // Create test user
  const email = `perm-test-${Date.now()}@e2e.local`;
  console.log(`Creating user: ${email}`);

  // Admin create
  const adminRes = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SERVICE, Authorization: `Bearer ${SERVICE}` },
    body: JSON.stringify({ email, password: "test123456", email_confirm: true }),
  });
  if (!adminRes.ok) {
    console.error("Create user failed:", await adminRes.text());
    return;
  }

  // Sign in
  const signinRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON },
    body: JSON.stringify({ email, password: "test123456" }),
  });
  const { access_token: token } = await signinRes.json();
  console.log("✅ Signed in");

  // Upload a PDF first
  const pdfPath = path.join(import.meta.dirname, "test-contract.pdf");
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(pdfPath)], { type: "application/pdf" }), "test.pdf");
  const uploadRes = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const { data: doc } = await uploadRes.json();
  console.log(`✅ Uploaded: ${doc.id.slice(0, 8)}...`);

  // Test 1: contract (free template → should work)
  const res1 = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ document_id: doc.id, template_key: "contract" }),
  });
  console.log(`\n📋 Contract (free, should 201): ${res1.status}`);

  // Test 2: paper (Pro template → should 403)
  const res2 = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ document_id: doc.id, template_key: "paper" }),
  });
  const err2 = await res2.json();
  console.log(`📄 Paper (free, should 403): ${res2.status} — ${err2.error}: ${err2.message}`);

  console.log("\n✅ Permission test complete!");
}
main().catch(e => console.error(e));
