import { exec } from "child_process";
import notifier from "node-notifier";

function checkScreenshotProcess() {
  exec('ps aux | grep -E "gnome-screenshot|scrot|shutter"', (err, stdout) => {
    if (stdout.includes("gnome-screenshot") || stdout.includes("scrot")) {
      triggerAlert("Screenshot process detected!");
    }
  });
}

function clearClipboardWindows() {
  const clearCommand = `
    Add-Type -AssemblyName System.Windows.Forms;
    [System.Windows.Forms.Clipboard]::Clear()
  `;
  exec(
    `powershell -STA -Command "${clearCommand
      .replace(/\n/g, "")
      .replace(/"/g, '\\"')}"`
  );
}

function checkClipboardForImageWindows() {
  const powershellCommand = `
  Add-Type -AssemblyName System.Windows.Forms;
  if ([System.Windows.Forms.Clipboard]::ContainsImage()) {
    Write-Output "image"
  }
  `;

  exec(
    `powershell -STA -Command "${powershellCommand
      .replace(/\n/g, "")
      .replace(/"/g, '\\"')}"`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("Error:", err);
      }
      if (stderr) {
        console.error("Stderr:", stderr);
      }

      console.log("STDOUT:", stdout);

      if (stdout.toLowerCase().includes("image")) {
        triggerAlert("Screenshot detected in clipboard!");
      }
    }
  );
}

function triggerAlert(message) {
  notifier.notify({
    title: "Screenshot Warning",
    message: message,
    sound: true,
  });
  console.log(`[ALERT] ${message}`);
}

// Run checks every 2 seconds
setInterval(() => {
  checkScreenshotProcess();
  // checkClipboard();
  // checkClipboardForImageWindows();
  // checkClipboardForImageWindows();
}, 2000);

console.log("Screenshot detector running...");
