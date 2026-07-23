import type { Options } from '@wdio/types';
import path from 'path';

export const config: Options.Testrunner = {
    runner: 'local',
    port: 4723,
    autoCompileOpts: {
        autoCompile: true,
        tsNodeOpts: {
            project: './tsconfig.json',
            transpileOnly: true,
            compilerOptions: {
                module: "CommonJS"
            }
        }
    },
    specs: [
        './tests/e2e/specs/**/*.ts'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        // Optional: specify the device name. We leave it generic to pick up any running emulator or device
        'appium:deviceName': 'emulator-5554',
        // Since we are using React Native/Expo, we need to launch the Expo app or a built APK
        // For local development with Expo, you can either build an APK or run within the Expo Go app.
        // Assuming we have a built APK or we can use the app package if installed
        'appium:appPackage': 'com.dentpulseai', // Replace with your actual package name if different
        'appium:appActivity': '.MainActivity',
        'appium:noReset': true,
        'appium:fullReset': false
    }],
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
};
