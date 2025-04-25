const { exec } = require("child_process");
const dns = require("dns");
const notifier = require("node-notifier");
const fs = require("fs");
const path = require("path");
const os = require("os");

// List of AI services and suspicious IPs
const SUSPICIOUS_AI_DOMAINS = [
  "api.openai.com",
  "api.anthropic.com",
  "api.deepseek.com",
  "api.llama.ai",
];

const SUSPICIOUS_IPS = [
  "172.66.0.243", // Cloudflare IP (OpenAI)
  "160.79.104.10", // Cloudflare IP (Anthropic)
  "104.18.27.90", // Cloudflare IP (Deepseek)
  "104.198.79.154", // Cloudflare IP (Llama)
];

// Alert Function
function triggerAlert(message) {
  notifier.notify({
    title: "Cheating Detected!",
    message: message,
    sound: true,
    timeout: 10,
  });
  console.log(`[ALERT] ${new Date().toLocaleString()}: ${message}`);
}

// DNS Lookup for AI domains
function checkDNSForAI() {
  SUSPICIOUS_AI_DOMAINS.forEach((domain) => {
    dns.lookup(domain, (err, address) => {
      if (err) {
        console.error(`Error with DNS lookup for ${domain}: ${err}`);
      } else {
        console.log(`DNS lookup for ${domain}: ${address}`);
        console.log(address);
        if (SUSPICIOUS_IPS.includes(address)) {
          triggerAlert(
            `Suspicious DNS lookup detected for ${domain} with IP ${address}`
          );
        }
      }
    });
  });
}

// Monitor suspicious processes (including API calls from known AI providers)
function detectProcesses() {
  exec(
    "wmic process get Name,CommandLine",
    { maxBuffer: 1024 * 1024 * 10 },
    (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("Process fetch error:", error || stderr);
        return;
      }
      const lines = stdout.split("\n").slice(1); // Skip header
      lines.forEach((line) => {
        const lowerLine = line.toLowerCase();
        SUSPICIOUS_AI_DOMAINS.forEach((badName) => {
          if (lowerLine.includes(badName)) {
            triggerAlert(`Suspicious process detected: ${line.trim()}`);
          }
        });
      });
    }
  );
}

// Start Monitoring
console.log(" Monitoring Started...");

// Monitor every 5 seconds
setInterval(() => {
  checkDNSForAI(); // DNS check for AI domains
}, 5000);
