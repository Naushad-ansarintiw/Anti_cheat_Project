import { exec } from "child_process";
import notifier from "node-notifier";
import fs from "fs";
import path from "path";
import os from "os";

const SUSPICIOUS = {
  PROCESS_NAMES: ["interviewcoder", "cheat", "anydesk", "teamviewer", "remote"],
  WINDOW_TITLES: ["interview coder", "cheat sheet", "hidden window"],
  FILE_NAMES: ["interviewcoder.exe", "cheatengine.exe"],
  KEYWORDS: ["stack overflow", "leetcode", "gfg ide", "codeforces"],
};

const CHECK_INTERVAL = 5000;

function triggerAlert(message) {
  notifier.notify({
    title: "CHEATING DETECTED!",
    message: message,
    sound: true,
    timeout: 10,
  });
  console.log(`[ALERT] ${new Date().toLocaleString()}: ${message}`);
}

function detectProcesses() {
  exec(
    "wmic process get Name,CommandLine",
    { maxBuffer: 1024 * 1024 * 10 },
    (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("Process fetch error:", error || stderr);
        return;
      }
      const lines = stdout.split("\n").slice(1);
      lines.forEach((line) => {
        const lowerLine = line.toLowerCase();
        SUSPICIOUS.PROCESS_NAMES.forEach((badName) => {
          if (lowerLine.includes(badName)) {
            triggerAlert(`Suspicious process detected: ${line.trim()}`);
          }
        });
      });
    }
  );
}

function detectWindows() {
  exec(
    `powershell "gps | where { $_.MainWindowTitle } | select MainWindowTitle"`,
    { maxBuffer: 1024 * 1024 * 10 },
    (error, stdout, stderr) => {
      if (error || stderr) {
        console.error("Window title fetch error:", error || stderr);
        return;
      }
      const titles = stdout
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);

      titles.forEach((title) => {
        const lowerTitle = title.toLowerCase();

        SUSPICIOUS.WINDOW_TITLES.forEach((badTitle) => {
          if (lowerTitle.includes(badTitle)) {
            triggerAlert(`Suspicious window detected: ${title}`);
          }
        });
        SUSPICIOUS.KEYWORDS.forEach((keyword) => {
          if (lowerTitle.includes(keyword)) {
            triggerAlert(`Suspicious keyword detected: ${title}`);
          }
        });
      });
    }
  );
}

function detectFiles() {
  const tempPaths = [
    os.tmpdir(),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Temp"),
    "C:\\Windows\\Temp",
  ].filter(Boolean);

  tempPaths.forEach((folder) => {
    SUSPICIOUS.FILE_NAMES.forEach((file) => {
      const fullPath = path.join(folder, file);
      if (fs.existsSync(fullPath)) {
        triggerAlert(`Suspicious file found: ${fullPath}`);
      }
    });
  });
}

console.log("Monitoring Started...");

setInterval(() => {
  detectProcesses();
  detectWindows();
  detectFiles();
}, CHECK_INTERVAL);
