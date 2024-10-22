const chromeLauncher = require('chrome-launcher');

(async () => {
    // Ensure Lighthouse is imported first
    const lighthouse = await import('lighthouse');

    // Parse arguments (as before)
    const arguments = JSON.parse(process.argv.slice(2));
    const requestedUrl = arguments[0];

    // Launch Chrome and ensure it is fully ready before proceeding
    const chrome = await chromeLauncher.launch(arguments[1]);
    console.log(`Chrome launched on port: ${chrome.port}`);

    const lighthouseOptions = {
        logLevel: 'info',
        port: chrome.port,  // Ensure we are using the port Chrome is bound to
    };

    const lighthouseConfig = arguments[2];
    const timeoutInMs = arguments[3];

    // Set a kill timer to ensure Chrome is killed if it takes too long
    const killTimer = setTimeout(() => {
        console.log("Killing Chrome due to timeout...");
        chrome.kill();
    }, timeoutInMs);

    try {
        // Run Lighthouse after ensuring Chrome is launched
        const runnerResult = await lighthouse.default(
            requestedUrl,
            lighthouseOptions,
            lighthouseConfig,
        );

        // Write the Lighthouse result to stdout
        process.stdout.write(JSON.stringify(runnerResult));
    } catch (err) {
        console.error("Lighthouse failed:", err);
    } finally {
        // Ensure that the kill timer is cleared and Chrome is properly killed
        clearTimeout(killTimer);
        console.log("Killing Chrome after audit...");
        await chrome.kill();
    }
})();
