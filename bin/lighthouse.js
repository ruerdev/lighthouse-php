import {ray} from "node-ray";

(async () => {
    // Dynamically import ES Modules
    const chromeLauncher = await import('chrome-launcher');
    const lighthouse = await import('lighthouse');

    // Use a different name for "arguments" to avoid conflicts
    const inputArgs = JSON.parse(process.argv.slice(2));
    const requestedUrl = inputArgs[0];

    // Launch Chrome using chromeLauncher (note that we use chromeLauncher.launch)
    const chrome = await chromeLauncher.launch(inputArgs[1]);
    ray('chromePort', chrome.port);
    // console.log(`Chrome launched on port: ${chrome.port}`);

    const lighthouseOptions = {
        logLevel: 'info',
        port: chrome.port,  // Use dynamically assigned port
    };

    const lighthouseConfig = inputArgs[2];
    const timeoutInMs = inputArgs[3];

    // Set a kill timer to ensure Chrome doesn't hang indefinitely
    const killTimer = setTimeout(() => {
        // console.log("Killing Chrome due to timeout...");
        chrome.kill();
    }, timeoutInMs);

    try {
        // Run Lighthouse
        const runnerResult = await lighthouse.default(
            requestedUrl,
            lighthouseOptions,
            lighthouseConfig
        );
        process.stdout.write(JSON.stringify(runnerResult));
    } catch (err) {
        // console.error("Lighthouse failed:", err);
    } finally {
        clearTimeout(killTimer);
        // console.log("Killing Chrome after audit...");
        await chrome.kill();
    }
})();
