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

        try {
            const runnerResult = await lighthouse.default(
                requestedUrl,
                lighthouseOptions,
                lighthouseConfig
            );

            process.stdout.write(JSON.stringify(runnerResult));
        } catch (err) {
            const errorRunnerResult = {
                error: err.message,
            };

            process.stdout.write(JSON.stringify(errorRunnerResult));
        } finally {
            clearTimeout(killTimer);
            await chrome.kill();
        }
    } catch (error) {
        const errorResult = {
            error: "Unexpected error in script: " + error.message,
        };
        process.stdout.write(JSON.stringify(errorResult));
    }
})();
