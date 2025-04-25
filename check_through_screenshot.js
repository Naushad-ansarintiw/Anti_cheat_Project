

import {exec} from 'child_process';
import notifier from 'node-notifier';



// // Method 1: Detect screenshot processes
// function checkScreenshotProcess() {
//   exec('ps aux | grep -E "gnome-screenshot|scrot|shutter"', (err, stdout) => {
//     if (stdout.includes('gnome-screenshot') || stdout.includes('scrot')) {
//       triggerAlert('Screenshot process detected!');
//     }
//   });
// }

// Method 2: Check clipboard for images
function checkClipboard() {
  exec('xclip -selection clipboard -t TARGETS -o', (err, stdout) => {
    if (stdout.includes('image/png')) {
      triggerAlert('Screenshot detected in clipboard!');
    }
  });
}

function triggerAlert(message) {
  notifier.notify({
    title: 'Screenshot Warning',
    message: message,
    sound: true
  });
  console.log(`[ALERT] ${message}`);
}

// Run checks every 2 seconds
setInterval(() => {
//   checkScreenshotProcess();
  checkClipboard();
}, 2000);

console.log('Screenshot detector running...');