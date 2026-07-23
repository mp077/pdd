exports.config = {
    runner: 'local',
    port: 4723,
    specs: [
        './tests/**/*.js'
    ],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        // Example for Expo APK or local app
        'appium:app': '../android/app/build/outputs/apk/debug/app-debug.apk',
        'appium:autoGrantPermissions': true
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec', ['allure', {
        outputDir: 'reports/allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
    afterTest: async function (test, context, { error, result, duration, passed, retries }) {
        const { updateExcelTestResult } = require('./utils/excel-updater');
        
        if (!passed) {
            const fs = require('fs');
            const path = require('path');
            const screenshot = await browser.takeScreenshot();
            const filename = test.title.replace(/\s+/g, '_') + '_failed.png';
            
            // Ensure screenshots directory exists
            const dir = path.join(__dirname, 'screenshots');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir);
            
            fs.writeFileSync(path.join(dir, filename), screenshot, 'base64');
        }

        const status = passed ? 'Pass' : 'Fail';
        const errMsg = error ? error.message : '';
        await updateExcelTestResult('appium', test.title, status, errMsg);
    }
}
