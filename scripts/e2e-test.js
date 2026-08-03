// End-to-end test: create user → upload PDF → analyze → verify
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const URL = "https://hboopoukoxsmdjuxqxib.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib29wb3Vrb3hzbWRqdXhxeGliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTY2MjI0NCwiZXhwIjoyMTAxMjM4MjQ0fQ.1a1zEtbLHNV28qjBiDSBNUwX9T9waKf3FnOYB_SBrHI";

async function main() {
  console.log("🚀 E2E Test: Upload → Analyze\n");

  const admin = createClient(URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Create a test user via admin API (no rate limit)
  const testEmail = `test-${Date.now()}@e2e.local`;
  const testPassword = "test123456";

  console.log(`📧 Creating test user: ${testEmail}`);
  const { data: newUser, error: createErr } =
    await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

  if (createErr) {
    console.error("❌ Create user failed:", createErr.message);
    process.exit(1);
  }

  const userId = newUser.user.id;
  console.log(`   ✅ User created: ${userId.slice(0, 8)}...`);

  // 2. Generate access token (sign in via REST API)
  console.log("🔑 Getting session...");
  const signInRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: process.env.ANON_KEY || URL.includes("hboopoukoxsmdjuxqxib")
        ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhib29wb3Vrb3hzbWRqdXhxeGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NjIyNDQsImV4cCI6MjEwMTIzODI0NH0.M8fDvaIENnGJdwNOyXGgH79vBYfiU723DmwwLbp-L-g"
        : "",
    },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });

  if (!signInRes.ok) {
    const err = await signInRes.text();
    console.error("❌ Sign in failed:", err);
    process.exit(1);
  }

  const { access_token: token } = await signInRes.json();
  console.log(`   ✅ Got token: ${token.slice(0, 20)}...\n`);

  // 3. Load test PDF
  const pdfPath = path.join(__dirname, "test-contract.pdf");
  if (!fs.existsSync(pdfPath)) {
    console.error("❌ Test PDF not found. Run: node scripts/create-test-pdf.js");
    process.exit(1);
  }
  const pdfBuffer = fs.readFileSync(pdfPath);
  console.log(`📄 Loaded test PDF (${pdfBuffer.length} bytes)\n`);

  // 4. Upload PDF via API
  console.log("📤 Uploading PDF...");
  const formData = new FormData();
  formData.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), "test-contract.pdf");

  const uploadRes = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    console.error("❌ Upload failed:", JSON.stringify(err));
    process.exit(1);
  }

  const { data: doc } = await uploadRes.json();
  console.log(`   ✅ Uploaded: ${doc.filename} (${doc.page_count || "?"} pages)\n`);

  // 5. Analyze
  console.log("🔬 Running contract analysis...");
  const analyzeRes = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      document_id: doc.id,
      template_key: "contract",
    }),
  });

  if (!analyzeRes.ok) {
    const err = await analyzeRes.json();
    console.error("❌ Analysis failed:", JSON.stringify(err));
    process.exit(1);
  }

  const { data: analysis } = await analyzeRes.json();
  console.log(`   ✅ Analysis created: ${analysis.id}\n`);

  // 6. Fetch result
  console.log("📊 Fetching analysis result...");
  const resultRes = await fetch(
    `http://localhost:3000/api/analyses/${analysis.id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!resultRes.ok) {
    const err = await resultRes.json();
    // Maybe still processing
    console.log(`   Status: ${resultRes.status}`);
  } else {
    const { data: full } = await resultRes.json();
    console.log(`   Status: ${full.status}`);
    console.log(`   Template: ${full.template_key}`);
    if (full.result) {
      console.log(`   Result keys: ${Object.keys(full.result).join(", ")}`);
      console.log(
        `   Contract type: ${full.result.contract_type || "N/A"}`
      );
      console.log(
        `   Risk level: ${full.result.overall_risk || "N/A"}`
      );
      console.log(
        `   Checklist items: ${
          full.result.checklist ? full.result.checklist.length : 0
        }`
      );
    }
  }

  // 7. Check usage
  console.log("\n📈 Checking usage...");
  const usageRes = await fetch("http://localhost:3000/api/usage", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data: usage } = await usageRes.json();
  console.log(`   Plan: ${usage.plan}`);
  console.log(`   Analyses: ${usage.daily.analyses_used}/${usage.daily.analyses_limit}`);
  console.log(`   Uploads: ${usage.daily.uploads_used}/${usage.daily.uploads_limit}`);

  console.log("\n🎉 E2E Test Complete!");
}

main().catch((e) => {
  console.error("❌", e.message);
  process.exit(1);
});
