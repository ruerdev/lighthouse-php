(async () => {
    try {
        const chromeLauncher = await import('chrome-launcher');
        const lighthouse = await import('lighthouse');

        const inputArgs = JSON.parse(process.argv.slice(2));
        const requestedUrl = inputArgs[0];

        const chrome = await chromeLauncher.launch(inputArgs[1]);

        const lighthouseOptions = {
            logLevel: 'info',
            port: chrome.port,
        };

        const lighthouseConfig = inputArgs[2];
        const timeoutInMs = inputArgs[3];

        const killTimer = setTimeout(() => {
            chrome.kill();
        }, timeoutInMs);

        let runnerResult;

        try {
            runnerResult = await lighthouse.default(
                requestedUrl,
                lighthouseOptions,
                lighthouseConfig
            );
        } catch (err) {
            runnerResult = {
                error: err.message,
            };
        } finally {
            clearTimeout(killTimer);
            await chrome.kill();
        }

        process.stdout.write(JSON.stringify(runnerResult));
    } catch (error) {
        const errorResult = {
            error: "Unexpected error in script: " + error.message,
        };
        process.stdout.write(JSON.stringify(errorResult));
    }
})();
