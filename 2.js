import psList from "ps-list";
import { networkInterfaces } from "os";
import dns from "node:dns";
import netstat from "node-netstat";

const SUSPICIOUS_PROCESS_NAMES = [
  "interviewcoder",
  "cheatengine",
  "anydesk",
  "teamviewer",
  "chrome remote desktop",
  "ultraviewer",
  "parsec",
];
const SUSPICIOUS_DOMAINS = [
  "openai.com",
  "chatgpt",
  "bard.google.com",
  "poe.com",
];

function triggerAlert(message) {
  console.log(`[ALERT]: ${message}`);
}

async function checkProcessesAndConnections() {
  try {
    const processes = await psList();
    const allConnections = [];

    +netstat(
      {
        filter: {
          state: "ESTABLISHED",
        },
        sync: true,
      },
      (data) => {
        allConnections.push(data);
      }
    );

    setTimeout(() => {
      allConnections.forEach((conn) => {
        const proc = processes.find((p) => p.pid === conn.pid);

        if (!proc) return;

        const procName = (proc.name || "").toLowerCase();

        if (
          SUSPICIOUS_PROCESS_NAMES.some((name) =>
            procName.includes(name.toLowerCase())
          )
        ) {
          triggerAlert(`Suspicious process detected: ${proc.name}`);
        }

        dns.reverse(conn.remote.address, (err, hostnames) => {
          if (err) {
            console.log("err DNS");

            return;
          }
          if (
            hostnames &&
            hostnames.some((hostname) =>
              SUSPICIOUS_DOMAINS.some((domain) =>
                hostname.toLowerCase().includes(domain)
              )
            )
          ) {
            triggerAlert(`Suspicious domain accessed by process: ${proc.name}`);
          }
        });
      });
    }, 1000);
  } catch (error) {
    console.error("Error checking processes and connections:", error);
  }
}

setInterval(checkProcessesAndConnections, 10000);

checkProcessesAndConnections();
