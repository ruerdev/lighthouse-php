import chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

(async () => {
    const inputArgs = JSON.parse(process.argv.slice(2));  // Renamed to inputArgs
    const requestedUrl = inputArgs[0];

    // Launch Chrome and ensure it is fully ready before proceeding
    const chrome = await chromeLauncher.launch(inputArgs[1]);
    console.log(`Chrome launched on port: ${chrome.port}`);

    const lighthouseOptions = {
        logLevel: 'info',
        port: chrome.port,
    };

    const lighthouseConfig = inputArgs[2];
    const timeoutInMs = inputArgs[3];

    // Set a kill timer and log when Chrome is killed
    const killTimer = setTimeout(() => {
        console.log("Killing Chrome due to timeout...");
        chrome.kill();
    }, timeoutInMs);

    try {
        // Run Lighthouse
        const runnerResult = await lighthouse.default(
            requestedUrl,
            lighthouseOptions,
            lighthouseConfig,
        );
        process.stdout.write(JSON.stringify(runnerResult));
    } catch (err) {
        console.error("Lighthouse failed:", err);
    } finally {
        clearTimeout(killTimer);
        console.log("Killing Chrome after audit...");
        await chrome.kill();
    }
})();
