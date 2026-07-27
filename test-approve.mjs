// Test script for pengawas approve flow
async function test() {
  const BASE = "http://localhost:3000";

  // Step 1: Login as pengawas
  console.log("=== STEP 1: Login as pengawas ===");
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "pengawas@ayam.com", password: "123456" }),
  });
  const loginData = await loginRes.json();
  console.log("Login result:", loginData);

  // Get cookies from response
  const setCookies = loginRes.headers.getSetCookie();
  console.log("Set-Cookie headers:", setCookies);
  const cookieHeader = setCookies.map(c => c.split(";")[0]).join("; ");
  console.log("Cookie header:", cookieHeader);

  // Step 2: Get requests
  console.log("\n=== STEP 2: Fetch requests ===");
  const reqRes = await fetch(`${BASE}/api/request`, {
    headers: { Cookie: cookieHeader },
  });
  const reqData = await reqRes.json();
  console.log("Requests count:", reqData.requests?.length);

  // Find a PENDING request
  const pendingReq = reqData.requests?.find(r => r.status === "PENDING");
  if (!pendingReq) {
    console.log("No PENDING requests found. Creating one first as pegawai...");

    // Login as pegawai to create a request
    const pegawaiLogin = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "pegawai@ayam.com", password: "123456" }),
    });
    const pegawaiCookies = pegawaiLogin.headers.getSetCookie().map(c => c.split(";")[0]).join("; ");

    const createRes = await fetch(`${BASE}/api/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: pegawaiCookies },
      body: JSON.stringify({ bahanId: "seed-ayam", bahanNama: "Ayam", jumlah: 10, catatan: "Test request" }),
    });
    const createData = await createRes.json();
    console.log("Created request:", createData);

    if (createData.success) {
      // Now try to approve it as pengawas
      console.log("\n=== STEP 3: Approve as pengawas ===");
      const approveRes = await fetch(`${BASE}/api/request?id=${createData.request.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookieHeader },
        body: JSON.stringify({ status: "APPROVED", jumlah: 5, respon: "Disetujui 5 saja" }),
      });
      console.log("Approve response status:", approveRes.status);
      const approveData = await approveRes.json();
      console.log("Approve result:", JSON.stringify(approveData, null, 2));
    }
  } else {
    console.log("Found PENDING request:", pendingReq.id, pendingReq.bahanNama);

    // Step 3: Try to approve it
    console.log("\n=== STEP 3: Approve as pengawas ===");
    const approveRes = await fetch(`${BASE}/api/request?id=${pendingReq.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify({ status: "APPROVED", jumlah: 5, respon: "Disetujui 5 saja" }),
    });
    console.log("Approve response status:", approveRes.status);
    const approveData = await approveRes.json();
    console.log("Approve result:", JSON.stringify(approveData, null, 2));
  }
}

test().catch(e => console.error("Test error:", e));
